import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, Segmented, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { AdjustStockDialog } from "@/components/inventory/adjust-stock-dialog";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { num } from "@/lib/format";
import type { InventoryItem } from "@/lib/types";

export const Route = createFileRoute("/_app/inventory/")({
  head: () => ({
    meta: [
      { title: "Inventory — DPC Nexus" },
      { name: "description", content: "Stock on hand, reserved units, reorder points and serials." },
      { property: "og:title", content: "Inventory — DPC Nexus" },
      { property: "og:description", content: "Stock on hand, reserved units, reorder points and serials." },
    ],
  }),
  component: InventoryPage,
});

function stockStatus(onHand: number, reorderPoint: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (onHand <= 0) return "out_of_stock";
  if (onHand <= reorderPoint) return "low_stock";
  return "in_stock";
}

interface Row extends InventoryItem {
  id: string;
}

function InventoryPage() {
  const { inventory, productById, categories } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyReorder, setOnlyReorder] = useState<"all" | "reorder">("all");

  const rows: Row[] = useMemo(
    () => inventory.map((i) => ({ ...i, id: i.productId })),
    [inventory],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const product = productById(r.productId);
      if (query) {
        const hay = `${product?.name ?? ""} ${product?.sku ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (category !== "all" && product?.categoryId !== category) return false;
      if (onlyReorder === "reorder" && r.onHand > r.reorderPoint) return false;
      return true;
    });
  }, [rows, q, category, onlyReorder, productById]);

  const stats = useMemo(() => {
    let onHand = 0;
    let reserved = 0;
    let damaged = 0;
    let below = 0;
    for (const r of rows) {
      onHand += r.onHand;
      reserved += r.reserved;
      damaged += r.damaged;
      if (r.onHand <= r.reorderPoint) below++;
    }
    return { onHand, reserved, damaged, below };
  }, [rows]);

  const columns: Column<Row>[] = [
    {
      key: "sku",
      header: "SKU",
      cell: (r) => <Mono>{productById(r.productId)?.sku ?? "—"}</Mono>,
      sortValue: (r) => productById(r.productId)?.sku ?? "",
    },
    {
      key: "product",
      header: "Product",
      cell: (r) => {
        const p = productById(r.productId);
        return (
          <div className="min-w-0">
            <p className="truncate text-[13px] text-foreground">{p?.name ?? "Unknown product"}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{p?.brand}</p>
          </div>
        );
      },
      sortValue: (r) => productById(r.productId)?.name ?? "",
      className: "min-w-[14rem]",
    },
    {
      key: "onhand",
      header: "On hand",
      cell: (r) => <span className="mono tabular-nums">{num(r.onHand)}</span>,
      sortValue: (r) => r.onHand,
      align: "right",
    },
    {
      key: "reserved",
      header: "Reserved",
      cell: (r) => <span className="mono tabular-nums text-muted-foreground">{num(r.reserved)}</span>,
      sortValue: (r) => r.reserved,
      align: "right",
    },
    {
      key: "available",
      header: "Available",
      cell: (r) => <span className="mono tabular-nums">{num(Math.max(0, r.onHand - r.reserved))}</span>,
      sortValue: (r) => Math.max(0, r.onHand - r.reserved),
      align: "right",
    },
    {
      key: "damaged",
      header: "Damaged",
      cell: (r) => <span className="mono tabular-nums text-muted-foreground">{num(r.damaged)}</span>,
      sortValue: (r) => r.damaged,
      align: "right",
    },
    {
      key: "reorder",
      header: "Reorder pt.",
      cell: (r) => <span className="mono tabular-nums text-subtle">{num(r.reorderPoint)}</span>,
      sortValue: (r) => r.reorderPoint,
      align: "right",
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={stockStatus(r.onHand, r.reorderPoint)} />,
      align: "right",
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <AdjustStockDialog productId={r.productId} productName={productById(r.productId)?.name ?? r.productId} />
      ),
      align: "right",
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Inventory" description="Stock on hand, reserved units, reorder points and serials." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Units on hand" numericValue={stats.onHand} format={(n) => num(Math.round(n))} accent="info" />
        <StatCard label="Reserved" numericValue={stats.reserved} format={(n) => num(Math.round(n))} accent="neutral" />
        <StatCard label="Damaged" numericValue={stats.damaged} format={(n) => num(Math.round(n))} accent="warning" />
        <StatCard label="Below reorder point" numericValue={stats.below} format={(n) => num(Math.round(n))} accent="danger" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search product or SKU…" />
          <FilterSelect
            value={category}
            onChange={setCategory}
            options={categories
              .filter((c) => !c.archived)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => ({ value: c.id, label: c.name }))}
            label="Category"
          />
          <Segmented
            value={onlyReorder}
            onChange={setOnlyReorder}
            options={[
              { value: "all", label: "All" },
              { value: "reorder", label: "Needs reorder" },
            ]}
          />
          <ResultCount shown={filtered.length} total={rows.length} noun="items" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(r) => navigate({ to: "/inventory/$productId", params: { productId: r.productId } })}
          empty={<EmptyState title="No inventory items match" description="Try clearing the search or filter." />}
        />
      </Panel>
    </div>
  );
}
