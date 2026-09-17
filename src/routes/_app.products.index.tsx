import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import {
  Toolbar,
  SearchInput,
  FilterSelect,
  Segmented,
  ResultCount,
} from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { InlineNumberField } from "@/components/nexus/inline-number-field";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { CategoryFormDialog } from "@/components/products/category-form-dialog";
import { ProductStockView } from "@/components/catalog/product-stock-view";
import { money, num } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

export const Route = createFileRoute("/_app/products/")({
  validateSearch: (search: Record<string, unknown>) => ({
    openNew: search["new"] === "1" || search["new"] === true,
  }),
  head: () => ({
    meta: [
      { title: "Products — DPC POS" },
      { name: "description", content: "Catalog of components, peripherals and prebuilt systems." },
      { property: "og:title", content: "Products — DPC POS" },
      {
        property: "og:description",
        content: "Catalog of components, peripherals and prebuilt systems.",
      },
    ],
  }),
  component: ProductsIndexPage,
});

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";
type Tab = "products" | "categories" | "archived";
type ArchivedView = "products" | "categories";

function stockStatus(
  onHand: number,
  reorderPoint: number,
): "in_stock" | "low_stock" | "out_of_stock" {
  if (onHand === Infinity) return "in_stock"; // Infinite stock is always in stock
  if (onHand <= 0) return "out_of_stock";
  if (onHand <= reorderPoint) return "low_stock";
  return "in_stock";
}

function ProductsIndexPage() {
  const {
    products,
    categories,
    invFor,
    categoryNameOf,
    archiveCategory,
    reactivateCategory,
    reactivateProduct,
    updateProduct,
    updateProductStock,
  } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const { openNew } = Route.useSearch();
  const [tab, setTab] = useState<Tab>("products");
  const [view, setView] = useState<"catalog" | "stock">("catalog");
  const [archivedView, setArchivedView] = useState<ArchivedView>("products");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [dialog, setDialog] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [catDialog, setCatDialog] = useState<{ open: boolean; category?: Category }>({
    open: false,
  });

  useEffect(() => {
    if (openNew) setDialog((d) => ({ ...d, open: true }));
  }, [openNew]);

  const activeCategories = useMemo(
    () => categories.filter((c) => !c.archived).sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );
  const activeProducts = useMemo(() => products.filter((p) => !p.archived), [products]);
  const archivedProducts = useMemo(() => products.filter((p) => p.archived), [products]);
  const archivedCategories = useMemo(() => categories.filter((c) => c.archived), [categories]);
  const brands = useMemo(
    () => Array.from(new Set(activeProducts.map((p) => p.brand))).sort(),
    [activeProducts],
  );

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return activeProducts.filter((p) => {
      if (query) {
        const hay = `${p.name} ${p.sku} ${p.brand}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (category !== "all" && p.categoryId !== category) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (stock !== "all") {
        const inv = invFor(p.id);
        const status = stockStatus(inv?.onHand ?? 0, inv?.reorderPoint ?? 0);
        if (status !== stock) return false;
      }
      return true;
    });
  }, [activeProducts, q, category, brand, stock, invFor]);

  const stats = useMemo(() => {
    let value = 0;
    let low = 0;
    let out = 0;
    for (const p of activeProducts) {
      const inv = invFor(p.id);
      if (!inv) continue;
      // Skip products with cost 0 or infinite stock from catalog value calculation
      if (p.cost > 0 && inv.onHand !== Infinity) {
        value += inv.onHand * p.cost;
      }
      const status = stockStatus(inv.onHand, inv.reorderPoint);
      if (status === "low_stock") low++;
      if (status === "out_of_stock") out++;
    }
    return { total: activeProducts.length, value, low, out };
  }, [activeProducts, invFor]);

  const columns: Column<Product>[] = [
    {
      key: "image",
      header: "",
      cell: (p) => (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40 p-1">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-muted-foreground/50">N/A</span>
          )}
        </div>
      ),
      className: "w-14",
    },
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
      cell: (p) => (
        <span className="text-xs text-muted-foreground">{categoryNameOf(p.categoryId)}</span>
      ),
      sortValue: (p) => categoryNameOf(p.categoryId),
    },
    {
      key: "price",
      header: "Price",
      cell: (p) => (
        <InlineNumberField
          value={p.price}
          step={0.01}
          width="w-24"
          onSave={(next) => updateProduct(p.id, { price: next })}
        />
      ),
      sortValue: (p) => p.price,
      align: "center",
      className: "min-w-[10rem]",
    },
    {
      key: "margin",
      header: "Cost / Margin",
      cell: (p) => {
        const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
        const applyMargin = (m: number) => {
          // Margin is on selling price: margin = (price - cost) / price.
          // Editing the margin % re-derives the price from the cost.
          const clamped = Math.max(0, Math.min(m, 99.9));
          if (p.cost > 0 && clamped <= 99.8) {
            const price = clamped <= 0 ? p.cost : p.cost / (1 - clamped / 100);
            updateProduct(p.id, { price: Math.round(price * 100) / 100 });
          }
        };
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <span className="mono text-[11px] text-subtle">₱</span>
              <InlineNumberField
                value={p.cost}
                step={0.01}
                width="w-24"
                onSave={(next) => updateProduct(p.id, { cost: next })}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="mono text-[11px] text-subtle">%</span>
              <InlineNumberField
                value={Math.round(margin * 10) / 10}
                step={0.1}
                width="w-24"
                onSave={applyMargin}
              />
            </div>
          </div>
        );
      },
      sortValue: (p) => (p.price > 0 ? (p.price - p.cost) / p.price : 0),
      align: "center",
      className: "min-w-[11rem]",
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => {
        const inv = invFor(p.id);
        const status = stockStatus(inv?.onHand ?? 0, inv?.reorderPoint ?? 0);
        return (
          <div className="flex justify-center">
            <StatusBadge status={status} />
          </div>
        );
      },
      sortValue: (p) => {
        const inv = invFor(p.id);
        return stockStatus(inv?.onHand ?? 0, inv?.reorderPoint ?? 0);
      },
      align: "center",
      className: "w-28",
    },
    {
      key: "stock",
      header: "Stock",
      cell: (p) => {
        const inv = invFor(p.id);
        const onHand = inv?.onHand ?? 0;
        if (onHand === Infinity) {
          return <div className="mono text-right tabular-nums">∞</div>;
        }
        return (
          <InlineNumberField
            value={onHand}
            width="w-20"
            onSave={(next) => updateProductStock(p.id, next)}
          />
        );
      },
      sortValue: (p) => invFor(p.id)?.onHand ?? 0,
      align: "center",
      className: "min-w-[10rem]",
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

  const archivedColumns: Column<Product>[] = [
    {
      key: "image",
      header: "",
      cell: (p) => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface opacity-50">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground/50">N/A</span>
          )}
        </div>
      ),
      className: "w-12",
    },
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
      cell: (p) => (
        <span className="text-xs text-muted-foreground">{categoryNameOf(p.categoryId)}</span>
      ),
      sortValue: (p) => categoryNameOf(p.categoryId),
    },
    {
      key: "price",
      header: "Price",
      cell: (p) => (
        <div className="mono text-right tabular-nums text-muted-foreground">{money(p.price)}</div>
      ),
      sortValue: (p) => p.price,
      align: "right",
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

  const categoryCount = (id: string) => products.filter((p) => p.categoryId === id).length;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Products"
        description="Catalog of components, peripherals and prebuilt systems."
        actions={
          tab === "categories" ? (
            <Button size="sm" onClick={() => setCatDialog({ open: true })}>
              New category
            </Button>
          ) : (
            <Button size="sm" onClick={() => setDialog({ open: true })}>
              New product
            </Button>
          )
        }
      />

      {tab !== "categories" && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total SKUs"
            numericValue={stats.total}
            format={(n) => num(Math.round(n))}
            accent="info"
          />
          <StatCard
            label="Catalog value (cost)"
            numericValue={stats.value}
            format={(n) => money(Math.round(n))}
            accent="neutral"
          />
          <StatCard
            label="Low stock"
            numericValue={stats.low}
            format={(n) => num(Math.round(n))}
            accent="warning"
          />
          <StatCard
            label="Out of stock"
            numericValue={stats.out}
            format={(n) => num(Math.round(n))}
            accent="danger"
          />
        </div>
      )}

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "products", label: "Products" },
          { value: "categories", label: "Categories" },
          { value: "archived", label: "Archived" },
        ]}
      />

      {tab === "products" && (
        <div className="space-y-4">
          <Segmented
            value={view}
            onChange={(v) => setView(v as "catalog" | "stock")}
            options={[
              { value: "catalog", label: "Catalog" },
              { value: "stock", label: "Stock by warehouse" },
            ]}
          />
          {view === "catalog" ? (
            <Panel>
              <Toolbar>
                <SearchInput value={q} onChange={setQ} placeholder="Search name, SKU or brand…" />
                <FilterSelect
                  value={category}
                  onChange={setCategory}
                  options={activeCategories.map((c) => ({ value: c.id, label: c.name }))}
                  label="Category"
                />
                <FilterSelect value={brand} onChange={setBrand} options={brands} label="Brand" />
                <FilterSelect
                  value={stock}
                  onChange={(v) => setStock(v as StockFilter)}
                  options={["in_stock", "low_stock", "out_of_stock"]}
                  label="Stock"
                />
                <ResultCount shown={rows.length} total={activeProducts.length} noun="products" />
              </Toolbar>
              <DataTable
                rows={rows.map((p) => ({ ...p }))}
                columns={columns}
                loading={loading}
                onRowClick={(p) =>
                  navigate({ to: "/products/$productId", params: { productId: p.id } })
                }
                empty={
                  <EmptyState
                    title="No products match your filters"
                    description="Try clearing the search or filters, or add a new product."
                    action={
                      <Button size="sm" onClick={() => setDialog({ open: true })}>
                        Add product
                      </Button>
                    }
                  />
                }
              />
            </Panel>
          ) : (
            <ProductStockView />
          )}
        </div>
      )}

      {tab === "categories" && (
        <Panel>
          <Toolbar>
            <ResultCount shown={categories.length} total={categories.length} noun="categories" />
          </Toolbar>
          {categories.length === 0 ? (
            <EmptyState
              title="No categories yet"
              description="Create a category to start organizing your catalog."
              action={
                <Button size="sm" onClick={() => setCatDialog({ open: true })}>
                  New category
                </Button>
              }
            />
          ) : (
            <DataTable<Category>
              rows={categories.map((c) => ({ ...c }))}
              loading={loading}
              columns={[
                {
                  key: "name",
                  header: "Name",
                  cell: (c) => <span className="text-[13px] text-foreground">{c.name}</span>,
                  sortValue: (c) => c.name,
                },
                {
                  key: "products",
                  header: "Products",
                  cell: (c) => (
                    <span className="mono tabular-nums">{num(categoryCount(c.id))}</span>
                  ),
                  sortValue: (c) => categoryCount(c.id),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (c) =>
                    c.archived ? (
                      <StatusBadge status="inactive" label="Archived" />
                    ) : (
                      <StatusBadge status="active" label="Active" />
                    ),
                },
                {
                  key: "actions",
                  header: "",
                  cell: (c) => (
                    <div className="flex items-center justify-end gap-1">
                      {c.archived ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            reactivateCategory(c.id);
                          }}
                        >
                          Reactivate
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCatDialog({ open: true, category: c });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveCategory(c.id);
                            }}
                          >
                            Archive
                          </Button>
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          )}
        </Panel>
      )}

      {tab === "archived" && (
        <div className="space-y-4">
          <Segmented
            value={archivedView}
            onChange={setArchivedView}
            options={[
              { value: "products", label: "Archived products" },
              { value: "categories", label: "Archived categories" },
            ]}
          />

          {archivedView === "products" ? (
            <Panel>
              <Toolbar>
                <ResultCount
                  shown={archivedProducts.length}
                  total={archivedProducts.length}
                  noun="archived products"
                />
              </Toolbar>
              <DataTable
                rows={archivedProducts.map((p) => ({ ...p }))}
                columns={[
                  ...archivedColumns,
                  {
                    key: "reactivate",
                    header: "",
                    cell: (p) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          reactivateProduct(p.id);
                        }}
                      >
                        Reactivate
                      </Button>
                    ),
                  },
                ]}
                loading={loading}
                onRowClick={(p) =>
                  navigate({ to: "/products/$productId", params: { productId: p.id } })
                }
                empty={
                  <EmptyState
                    title="Nothing archived"
                    description="Archived products will appear here."
                  />
                }
              />
            </Panel>
          ) : (
            <Panel>
              <Toolbar>
                <ResultCount
                  shown={archivedCategories.length}
                  total={archivedCategories.length}
                  noun="archived categories"
                />
              </Toolbar>
              <DataTable<Category>
                rows={archivedCategories.map((c) => ({ ...c }))}
                loading={loading}
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    cell: (c) => <span className="text-[13px] text-foreground">{c.name}</span>,
                    sortValue: (c) => c.name,
                  },
                  {
                    key: "products",
                    header: "Products",
                    cell: (c) => (
                      <span className="mono tabular-nums">{num(categoryCount(c.id))}</span>
                    ),
                    sortValue: (c) => categoryCount(c.id),
                  },
                  {
                    key: "archivedAt",
                    header: "Status",
                    cell: () => <StatusBadge status="inactive" label="Archived" />,
                  },
                  {
                    key: "actions",
                    header: "",
                    cell: (c) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            reactivateCategory(c.id);
                          }}
                        >
                          Reactivate
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </Panel>
          )}
        </div>
      )}

      <ProductFormDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        product={dialog.product}
      />
      <CategoryFormDialog
        open={catDialog.open}
        onOpenChange={(v) => setCatDialog((d) => ({ ...d, open: v }))}
        category={catDialog.category}
      />
    </div>
  );
}
