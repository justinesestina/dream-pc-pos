import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { NewPurchaseOrderDialog } from "@/components/purchasing/new-po-dialog";
import { useOps } from "@/lib/ops-store";
import { useSimulatedLoad } from "@/lib/store";
import { money, num, dateShort, daysUntil } from "@/lib/format";
import type { PurchaseOrder, PurchaseStatus } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/purchasing/")({
  head: () => ({
    meta: [
      { title: "Purchasing — DPC POS" },
      { name: "description", content: "Purchase orders, supplier commitments and expected deliveries." },
      { property: "og:title", content: "Purchasing — DPC POS" },
      { property: "og:description", content: "Purchase orders, supplier commitments and expected deliveries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PurchasingIndexPage,
});

const OPEN_STATUSES: PurchaseStatus[] = ["draft", "submitted", "confirmed", "partial"];

function PurchasingIndexPage() {
  const { purchaseOrders, suppliers } = useOps();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [supplier, setSupplier] = useState("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      if (query) {
        const hay = `${po.id} ${po.supplierName}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (status !== "all" && po.status !== status) return false;
      if (supplier !== "all" && po.supplierId !== supplier) return false;
      return true;
    });
  }, [purchaseOrders, q, status, supplier]);

  const stats = useMemo(() => {
    const now = new Date();
    let openCount = 0;
    let valueOnOrder = 0;
    let overdue = 0;
    let receivedThisMonth = 0;
    for (const po of purchaseOrders) {
      if (OPEN_STATUSES.includes(po.status)) {
        openCount++;
        valueOnOrder += po.total;
        if (daysUntil(po.expectedAt) < 0) overdue++;
      }
      if (
        po.status === "received" &&
        po.receivedAt &&
        new Date(po.receivedAt).getMonth() === now.getMonth() &&
        new Date(po.receivedAt).getFullYear() === now.getFullYear()
      ) {
        receivedThisMonth++;
      }
    }
    return { openCount, valueOnOrder, overdue, receivedThisMonth };
  }, [purchaseOrders]);

  const columns: Column<PurchaseOrder>[] = [
    { key: "id", header: "PO ID", cell: (r) => <Mono className="text-foreground">{r.id}</Mono>, sortValue: (r) => r.id },
    { key: "supplier", header: "Supplier", cell: (r) => r.supplierName, sortValue: (r) => r.supplierName, className: "min-w-[10rem]" },
    { key: "created", header: "Created", cell: (r) => <span className="mono text-xs">{dateShort(r.createdAt)}</span>, sortValue: (r) => r.createdAt },
    {
      key: "expected",
      header: "Expected",
      cell: (r) => {
        const overdue = daysUntil(r.expectedAt) < 0 && !["received", "cancelled"].includes(r.status);
        return (
          <span className={overdue ? "mono text-xs text-destructive" : "mono text-xs"}>
            {dateShort(r.expectedAt)}
          </span>
        );
      },
      sortValue: (r) => r.expectedAt,
    },
    {
      key: "lines",
      header: "Lines",
      cell: (r) => <span className="mono tabular-nums">{num(r.lines.length)}</span>,
      sortValue: (r) => r.lines.length,
      align: "right",
    },
    {
      key: "total",
      header: "Total",
      cell: (r) => <span className="mono tabular-nums">{money(r.total)}</span>,
      sortValue: (r) => r.total,
      align: "right",
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, align: "right" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Purchasing"
        description="Purchase orders, supplier commitments and expected deliveries."
        actions={<NewPurchaseOrderDialog />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open POs" numericValue={stats.openCount} format={(n) => num(Math.round(n))} accent="info" />
        <StatCard label="Value on order" numericValue={stats.valueOnOrder} format={(n) => money(Math.round(n))} accent="neutral" />
        <StatCard label="Overdue deliveries" numericValue={stats.overdue} format={(n) => num(Math.round(n))} accent="danger" />
        <StatCard label="Received this month" numericValue={stats.receivedThisMonth} format={(n) => num(Math.round(n))} accent="success" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search PO ID or supplier…" />
          <FilterSelect
            value={status}
            onChange={setStatus}
            label="Status"
            options={["draft", "submitted", "confirmed", "partial", "received", "cancelled"]}
          />
          <FilterSelect
            value={supplier}
            onChange={setSupplier}
            label="Supplier"
            options={suppliers.map((s) => s.id)}
          />
          <ResultCount shown={filtered.length} total={purchaseOrders.length} noun="purchase orders" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(r) => navigate({ to: "/purchasing/$poId", params: { poId: r.id } })}
          empty={<EmptyState title="No purchase orders match" description="Try clearing the search or filters." />}
        />
      </Panel>
    </div>
  );
}
