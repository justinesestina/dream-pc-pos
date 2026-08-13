import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { money, num } from "@/lib/format";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/_app/products/")({
  validateSearch: (search: Record<string, unknown>) => ({ openNew: search["new"] === "1" || search["new"] === true }),
  head: () => ({
    meta: [
      { title: "Products — DPC Nexus" },
      { name: "description", content: "Catalog of components, peripherals and prebuilt systems." },
      { property: "og:title", content: "Products — DPC Nexus" },
      { property: "og:description", content: "Catalog of components, peripherals and prebuilt systems." },
    ],
  }),
  component: ProductsIndexPage,
});

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

function stockStatus(onHand: number, reorderPoint: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (onHand <= 0) return "out_of_stock";
  if (onHand <= reorderPoint) return "low_stock";
  return "in_stock";
}

function ProductsIndexPage() {
  const { products, invFor } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const { openNew } = Route.useSearch();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [dialog, setDialog] = useState<{ open: boolean; product?: Product }>({ open: false });

  useEffect(() => {
    if (openNew) setDialog((d) => ({ ...d, open: true }));
  }, [openNew]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (query) {
        const hay = `${p.name} ${p.sku} ${p.brand}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (category !== "all" && p.category !== category) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (stock !== "all") {
        const inv = invFor(p.id);
        const status = stockStatus(inv?.onHand ?? 0, inv?.reorderPoint ?? 0);
        if (status !== stock) return false;
      }
      return true;
    });
  }, [products, q, category, brand, stock, invFor]);

  const stats = useMemo(() => {
    let value = 0;
    let low = 0;
    let out = 0;
    for (const p of products) {
      const inv = invFor(p.id);
      if (!inv) continue;
      value += inv.onHand * p.cost;
      const status = stockStatus(inv.onHand, inv.reorderPoint);
      if (status === "low_stock") low++;
      if (status === "out_of_stock") out++;
    }
    return { total: products.length, value, low, out };
  }, [products, invFor]);

  const columns: Column<Product>[] = [
    {
      key: "sku",
      header: "SKU",
      cell: (p) => <Mono>{p.sku}</Mono>,
      sortValue: (p) => p.sku,
    },
    {
      key: "name",
      header: "Name",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-foreground">{p.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{p.brand}</p>
        </div>
      ),
      sortValue: (p) => p.name,
      className: "min-w-[14rem]",
    },
    {
      key: "category",
      header: "Category",
      cell: (p) => <span className="text-xs text-muted-foreground">{p.category}</span>,
      sortValue: (p) => p.category,
    },
    {
      key: "price",
      header: "Price",
      cell: (p) => <span className="mono tabular-nums">{money(p.price)}</span>,
      sortValue: (p) => p.price,
      align: "right",
    },
    {
      key: "margin",
      header: "Cost / Margin",
      cell: (p) => {
        const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
        return (
          <div className="text-right">
            <p className="mono text-xs tabular-nums text-muted-foreground">{money(p.cost)}</p>
            <p className="mono text-[11px] tabular-nums text-subtle">{margin.toFixed(1)}%</p>
          </div>
        );
      },
      sortValue: (p) => (p.price > 0 ? (p.price - p.cost) / p.price : 0),
      align: "right",
    },
    {
      key: "onhand",
      header: "On hand",
      cell: (p) => {
        const inv = invFor(p.id);
        const onHand = inv?.onHand ?? 0;
        const status = stockStatus(onHand, inv?.reorderPoint ?? 0);
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="mono tabular-nums">{num(onHand)}</span>
            {status !== "in_stock" && <StatusBadge status={status} />}
          </div>
        );
      },
      sortValue: (p) => invFor(p.id)?.onHand ?? 0,
      align: "right",
    },
    {
      key: "location",
      header: "Location",
      cell: (p) => <Mono>{p.location}</Mono>,
    },
    {
      key: "actions",
      header: "",
      cell: (p) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setDialog({ open: true, product: p });
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Products"
        description="Catalog of components, peripherals and prebuilt systems."
        actions={
          <Button size="sm" onClick={() => setDialog({ open: true })}>
            New product
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total SKUs" numericValue={stats.total} format={(n) => num(Math.round(n))} accent="info" />
        <StatCard
          label="Catalog value (cost)"
          numericValue={stats.value}
          format={(n) => money(Math.round(n))}
          accent="neutral"
        />
        <StatCard label="Low stock" numericValue={stats.low} format={(n) => num(Math.round(n))} accent="warning" />
        <StatCard label="Out of stock" numericValue={stats.out} format={(n) => num(Math.round(n))} accent="danger" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search name, SKU or brand…" />
          <FilterSelect value={category} onChange={setCategory} options={categories} label="Category" />
          <FilterSelect value={brand} onChange={setBrand} options={brands} label="Brand" />
          <FilterSelect
            value={stock}
            onChange={(v) => setStock(v as StockFilter)}
            options={["in_stock", "low_stock", "out_of_stock"]}
            label="Stock"
          />
          <ResultCount shown={rows.length} total={products.length} noun="products" />
        </Toolbar>
        <DataTable
          rows={rows.map((p) => ({ ...p }))}
          columns={columns}
          loading={loading}
          onRowClick={(p) => navigate({ to: "/products/$productId", params: { productId: p.id } })}
          empty={
            <EmptyState title="No products match your filters" description="Try clearing the search or filters." />
          }
        />
      </Panel>

      <ProductFormDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        product={dialog.product}
      />
    </div>
  );
}
