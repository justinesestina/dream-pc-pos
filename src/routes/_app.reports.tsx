import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, EmptyState } from "@/components/nexus/primitives";
import { Segmented } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { KeyValueGrid, TotalsRows, DemoNote } from "@/components/nexus/detail";
import { PrintButton } from "@/components/nexus/document";
import { StatCard } from "@/components/nexus/stat-card";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money, num, titleCase } from "@/lib/format";
import type { PaymentMethod, Product } from "@/lib/types";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — DPC Nexus" },
      { name: "description", content: "Sales, margin, inventory turnover and technician output." },
      { property: "og:title", content: "Reports — DPC Nexus" },
      { property: "og:description", content: "Sales, margin, inventory turnover and technician output." },
    ],
  }),
  component: ReportsPage,
});

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

const PIE_COLORS = ["var(--color-info)", "var(--color-success)", "var(--color-warning)", "var(--color-destructive)", "#8884d8", "#82ca9d"];

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

function ReportsPage() {
  const store = useStore();
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const showCosts = can(store.user?.role ?? "owner", "costs");

  const cutoff = useMemo(() => Date.now() - Number(range) * 86400000, [range]);
  const paidOrders = useMemo(
    () => store.orders.filter((o) => o.payment && new Date(o.createdAt).getTime() >= cutoff),
    [store.orders, cutoff],
  );

  const revenueByDay = useMemo(() => {
    const days: { label: string; revenue: number }[] = [];
    const n = Number(range);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const rev = paidOrders
        .filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= d.getTime() && t < next.getTime();
        })
        .reduce((s, o) => s + o.total, 0);
      days.push({ label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }), revenue: rev });
    }
    return days;
  }, [paidOrders, range]);

  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);

  const productCost = (id: string) => store.productById(id)?.cost ?? 0;
  const productCategory = (id: string) => store.productById(id)?.category ?? "Accessories";

  const revenueByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of paidOrders) {
      for (const item of o.items) {
        const cat = productCategory(item.productId);
        map.set(cat, (map.get(cat) ?? 0) + item.qty * item.unitPrice);
      }
    }
    return Array.from(map.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [paidOrders]);

  const productSales = useMemo(() => {
    const map = new Map<string, { productId: string; name: string; sku: string; qty: number; revenue: number; cost: number }>();
    for (const o of paidOrders) {
      for (const item of o.items) {
        const existing = map.get(item.productId) ?? {
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          qty: 0,
          revenue: 0,
          cost: 0,
        };
        existing.qty += item.qty;
        existing.revenue += item.qty * item.unitPrice;
        existing.cost += item.qty * productCost(item.productId);
        map.set(item.productId, existing);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [paidOrders]);

  const totalCost = productSales.reduce((s, p) => s + p.cost, 0);
  const grossMargin = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

  const byPaymentMethod = useMemo(() => {
    const map = new Map<PaymentMethod, { count: number; amount: number }>();
    for (const o of paidOrders) {
      if (!o.payment) continue;
      const existing = map.get(o.payment.method) ?? { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += o.payment.amount;
      map.set(o.payment.method, existing);
    }
    return Array.from(map.entries()).map(([method, v]) => ({ method, ...v }));
  }, [paidOrders]);

  const byCashier = useMemo(() => {
    const map = new Map<string, { orders: number; revenue: number }>();
    for (const o of paidOrders) {
      const existing = map.get(o.cashier) ?? { orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += o.total;
      map.set(o.cashier, existing);
    }
    return Array.from(map.entries())
      .map(([cashier, v]) => ({ cashier, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [paidOrders]);

  const inventoryValuation = useMemo(() => {
    return store.inventory.reduce(
      (acc, i) => {
        const p = store.productById(i.productId);
        if (!p) return acc;
        acc.units += i.onHand;
        acc.costValue += i.onHand * p.cost;
        acc.retailValue += i.onHand * p.price;
        return acc;
      },
      { units: 0, costValue: 0, retailValue: 0 },
    );
  }, [store.inventory]);

  const deadStock = useMemo(() => {
    const soldIds = new Set(productSales.map((p) => p.productId));
    return store.inventory
      .filter((i) => i.onHand > 0 && !soldIds.has(i.productId))
      .map((i) => ({ inv: i, product: store.productById(i.productId) }))
      .filter((x): x is { inv: typeof store.inventory[number]; product: Product } => Boolean(x.product))
      .sort((a, b) => b.inv.onHand * b.product.cost - a.inv.onHand * a.product.cost)
      .slice(0, 8);
  }, [store.inventory, productSales]);

  const serviceStats = useMemo(() => {
    const inRange = store.services.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
    const completed = inRange.filter((s) => s.status === "released");
    const revenue = completed.reduce((s, t) => s + (t.actualCost ?? t.estimatedCost), 0);
    return { total: inRange.length, completed: completed.length, revenue };
  }, [store.services, cutoff]);

  const warrantyStats = useMemo(() => {
    const active = store.warranties.filter((w) => w.status === "active").length;
    const expiring = store.warranties.filter((w) => w.status === "expiring").length;
    const claims = store.claims.filter((c) => new Date(c.createdAt).getTime() >= cutoff).length;
    return { active, expiring, claims, total: store.warranties.length };
  }, [store.warranties, store.claims, cutoff]);

  const stamp = new Date().toISOString().slice(0, 10);
  const exportCSV = () => {
    const products = toCSV(
      showCosts
        ? ["Product", "SKU", "Units sold", "Revenue", "Cost", "Margin", "Margin %"]
        : ["Product", "SKU", "Units sold", "Revenue"],
      productSales.map((p) =>
        showCosts
          ? [p.name, p.sku, p.qty, p.revenue.toFixed(2), p.cost.toFixed(2), (p.revenue - p.cost).toFixed(2), (p.revenue ? ((p.revenue - p.cost) / p.revenue) * 100 : 0).toFixed(1)]
          : [p.name, p.sku, p.qty, p.revenue.toFixed(2)],
      ),
    );
    download(`dpc-nexus-products-${stamp}.csv`, products, "text/csv;charset=utf-8");
  };
  const exportJSON = () => {
    const payload = {
      range: `${range}d`,
      generatedAt: new Date().toISOString(),
      summary: {
        revenue: totalRevenue,
        grossMargin,
        grossMarginPct: marginPct,
        costOfGoods: totalCost,
        avgOrderValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
        paidOrders: paidOrders.length,
      },
      revenueByDay,
      revenueByCategory,
      productSales,
      byPaymentMethod: byPaymentMethod.map((m) => ({ method: m.method, count: m.count, amount: m.amount })),
      byCashier,
      inventoryValuation,
      serviceStats,
      warrantyStats,
    };
    download(`dpc-nexus-report-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  };

  const productColumns: Column<{ id: string; name: string; sku: string; qty: number; revenue: number; cost: number }>[] = [
    { key: "name", header: "Product", cell: (r) => <span className="text-[13px] text-foreground">{r.name}</span> },
    { key: "sku", header: "SKU", cell: (r) => <span className="mono text-xs text-subtle">{r.sku}</span> },
    { key: "qty", header: "Units sold", align: "right", cell: (r) => num(r.qty), sortValue: (r) => r.qty },
    { key: "revenue", header: "Revenue", align: "right", cell: (r) => money(r.revenue), sortValue: (r) => r.revenue },
    ...(showCosts
      ? ([{
          key: "margin",
          header: "Margin",
          align: "right",
          cell: (r) => {
            const m = r.revenue - r.cost;
            const pct = r.revenue > 0 ? (m / r.revenue) * 100 : 0;
            return <span className={pct >= 30 ? "text-success" : pct >= 10 ? "text-warning" : "text-destructive"}>{money(m)} ({pct.toFixed(0)}%)</span>;
          },
          sortValue: (r) => r.revenue - r.cost,
        }] as Column<{ id: string; name: string; sku: string; qty: number; revenue: number; cost: number }>[])
      : []),
  ];

  const cashierColumns: Column<{ id: string; cashier: string; orders: number; revenue: number }>[] = [
    { key: "cashier", header: "Staff", cell: (r) => <span className="text-[13px] text-foreground">{r.cashier}</span> },
    { key: "orders", header: "Orders", align: "right", cell: (r) => num(r.orders), sortValue: (r) => r.orders },
    { key: "revenue", header: "Revenue", align: "right", cell: (r) => money(r.revenue), sortValue: (r) => r.revenue },
    { key: "avg", header: "Avg. ticket", align: "right", cell: (r) => money(r.orders ? r.revenue / r.orders : 0), sortValue: (r) => (r.orders ? r.revenue / r.orders : 0) },
  ];

  const deadStockColumns: Column<{ id: string; name: string; sku: string; onHand: number; cost: number; value: number }>[] = [
    { key: "name", header: "Product", cell: (r) => <span className="text-[13px] text-foreground">{r.name}</span> },
    { key: "sku", header: "SKU", cell: (r) => <span className="mono text-xs text-subtle">{r.sku}</span> },
    { key: "onHand", header: "On hand", align: "right", cell: (r) => num(r.onHand) },
    { key: "value", header: "Cost value tied up", align: "right", cell: (r) => money(r.value), sortValue: (r) => r.value },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Reports"
        description="Sales, margin, inventory turnover and service output — derived live from operational data."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => { exportCSV(); toast.success("CSV report downloaded."); }}>
              <Download className="size-3.5" /> Export CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => { exportJSON(); toast.success("JSON report downloaded."); }}>
              <Download className="size-3.5" /> Export JSON
            </Button>
            <PrintButton label="Print" />
            <Segmented value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r.value, label: r.label }))} />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" numericValue={totalRevenue} format={money} hint={`${paidOrders.length} paid orders`} accent="info" />
        {showCosts && (
          <>
            <StatCard label="Gross margin" numericValue={grossMargin} format={money} hint={`${marginPct.toFixed(1)}% of revenue`} accent="success" />
            <StatCard label="Cost of goods" numericValue={totalCost} format={money} hint="Product cost basis" />
          </>
        )}
        <StatCard label="Avg. order value" numericValue={paidOrders.length ? totalRevenue / paidOrders.length : 0} format={money} hint="Per transaction" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelHeader title="Revenue over time" hint={`Last ${range} days`} />
          <div className="h-[260px] px-2 py-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDay} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-subtle)" }} stroke="var(--color-border)" tickLine={false} interval={Math.floor(revenueByDay.length / 10)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-subtle)" }} stroke="var(--color-border)" tickLine={false} width={54} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => money(v)}
                />
                <Bar dataKey="revenue" fill="var(--color-info)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Revenue by category" hint={`Last ${range} days`} />
          {revenueByCategory.length === 0 ? (
            <EmptyState title="No sales in range" description="Try a wider date range." />
          ) : (
            <div className="h-[260px] px-2 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueByCategory} dataKey="revenue" nameKey="category" innerRadius={48} outerRadius={80} paddingAngle={2}>
                    {revenueByCategory.map((entry, i) => (
                      <Cell key={entry.category} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, n) => [money(v), n]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Top selling products" hint={`Last ${range} days`} />
        <DataTable
          rows={productSales.slice(0, 20).map((p) => ({ id: p.productId, ...p }))}
          columns={productColumns}
          empty={<EmptyState title="No product sales" description="No paid orders in this range." />}
          initialSort={{ key: "revenue", dir: "desc" }}
          pageSize={10}
        />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Sales by payment method" hint={`Last ${range} days`} />
          {byPaymentMethod.length === 0 ? (
            <EmptyState title="No payments in range" />
          ) : (
            <TotalsRows
              className="p-4"
              rows={byPaymentMethod
                .sort((a, b) => b.amount - a.amount)
                .map((m) => ({ label: `${titleCase(m.method)} (${m.count})`, value: money(m.amount) }))}
            />
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Staff / cashier performance" hint={`Last ${range} days`} />
          <DataTable
            rows={byCashier.map((c) => ({ id: c.cashier, ...c }))}
            columns={cashierColumns}
            empty={<EmptyState title="No sales in range" />}
            initialSort={{ key: "revenue", dir: "desc" }}
            pageSize={8}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Inventory valuation" hint="Current stock on hand" />
          <KeyValueGrid
            cols={3}
            items={[
              { label: "Units on hand", value: num(inventoryValuation.units) },
              { label: "Retail value", value: money(inventoryValuation.retailValue) },
              ...(showCosts
                ? [{ label: "Cost value", value: money(inventoryValuation.costValue) }]
                : []),
            ]}
          />
          <div className="px-4 pb-4">
            <p className="label-tech mb-2">Dead stock (no sales in range)</p>
            <DataTable
              rows={deadStock.map(({ inv, product }) => ({
                id: inv.productId,
                name: product.name,
                sku: product.sku,
                onHand: inv.onHand,
                cost: product.cost,
                value: inv.onHand * product.cost,
              }))}
              columns={deadStockColumns}
              empty={<EmptyState title="No dead stock" description="Every SKU with stock has sold in this range." />}
              pageSize={8}
              dense
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Service & warranty stats" hint={`Last ${range} days`} />
          <KeyValueGrid
            cols={2}
            items={[
              { label: "Service tickets", value: num(serviceStats.total) },
              { label: "Completed / released", value: num(serviceStats.completed) },
              { label: "Service revenue", value: money(serviceStats.revenue) },
              { label: "Active warranties", value: num(warrantyStats.active) },
              { label: "Expiring soon", value: num(warrantyStats.expiring) },
              { label: "Claims filed (range)", value: num(warrantyStats.claims) },
            ]}
          />
          <div className="px-4 pb-4">
            <DemoNote>
              Margin and valuation figures use the product cost field seeded in demo data — connect a real
              costing/accounting feed to make these authoritative.
            </DemoNote>
          </div>
        </Panel>
      </div>
    </div>
  );
}
