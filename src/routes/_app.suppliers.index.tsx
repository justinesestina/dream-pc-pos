import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useOps } from "@/lib/ops-store";
import { useSimulatedLoad, useStore } from "@/lib/store";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
import { BrandChips } from "@/components/suppliers/brand-chips";
import { num } from "@/lib/format";
import type { Supplier } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/suppliers/")({
  validateSearch: (search: Record<string, unknown>) => ({
    openNew: search["new"] === "1" || search["new"] === true,
  }),
  head: () => ({
    meta: [
      { title: "Suppliers — DPC POS" },
      { name: "description", content: "Supplier directory, terms and lead times." },
      { property: "og:title", content: "Suppliers — DPC POS" },
      { property: "og:description", content: "Supplier directory, terms and lead times." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SuppliersIndexPage,
});

function SuppliersIndexPage() {
  const { suppliers, purchaseOrders, updateSupplier } = useOps();
  const { products } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const { openNew } = Route.useSearch();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [brand, setBrand] = useState("all");
  const [dialog, setDialog] = useState<{ open: boolean; supplier?: Supplier }>({ open: false });

  useEffect(() => {
    if (openNew) setDialog({ open: true });
  }, [openNew]);

  const brandOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (query) {
        const hay = `${s.name} ${s.contact} ${s.email}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (status !== "all" && s.status !== status) return false;
      if (
        brand !== "all" &&
        !(s.productIds ?? []).some(
          (id) => products.find((product) => product.id === id)?.brand === brand,
        )
      )
        return false;
      return true;
    });
  }, [suppliers, q, status, brand, products]);

  const stats = useMemo(() => {
    const active = suppliers.filter((s) => s.status === "active");
    const avgLead = active.length
      ? Math.round(active.reduce((sum, s) => sum + s.leadTimeDays, 0) / active.length)
      : 0;
    const openPos = purchaseOrders.filter((p) =>
      ["draft", "submitted", "confirmed", "partial"].includes(p.status),
    ).length;
    return {
      active: active.length,
      avgLead,
      brands: brandOptions.length,
      openPos,
    };
  }, [suppliers, purchaseOrders, brandOptions]);

  const columns: Column<Supplier>[] = [
    {
      key: "name",
      header: "Name",
      cell: (r) => <span className="text-foreground">{r.name}</span>,
      sortValue: (r) => r.name,
      className: "min-w-[10rem]",
    },
    { key: "contact", header: "Contact", cell: (r) => r.contact, sortValue: (r) => r.contact },
    {
      key: "reach",
      header: "Email / Phone",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-[13px]">{r.email}</p>
          <p className="mono mt-0.5 text-[11px] text-muted-foreground">{r.phone}</p>
        </div>
      ),
      className: "min-w-[12rem]",
    },
    {
      key: "brands",
      header: "Brands",
      cell: (r) => <BrandChips productIds={r.productIds} products={products} limit={3} />,
      className: "min-w-[10rem]",
    },
    {
      key: "lead",
      header: "Lead time",
      cell: (r) => <span className="mono tabular-nums">{r.leadTimeDays}d</span>,
      sortValue: (r) => r.leadTimeDays,
      align: "right",
    },
    { key: "terms", header: "Terms", cell: (r) => <Mono>{r.terms}</Mono> },
    {
      key: "rating",
      header: "Rating",
      cell: (r) => <span className="mono tabular-nums">{r.rating.toFixed(1)}</span>,
      sortValue: (r) => r.rating,
      align: "right",
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
      align: "right",
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDialog({ open: true, supplier: r });
            }}
          >
            Edit
          </Button>
          {r.status === "active" ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  Deactivate
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate {r.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {r.name} will be hidden from new purchase orders but its history stays intact.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep active</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      updateSupplier(r.id, { status: "inactive" });
                      toast.success(`${r.name} deactivated.`);
                    }}
                  >
                    Deactivate supplier
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                updateSupplier(r.id, { status: "active" });
                toast.success(`${r.name} reactivated.`);
              }}
            >
              Activate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Suppliers"
        description="Supplier directory, terms and lead times."
        actions={
          <Button size="sm" onClick={() => setDialog({ open: true })}>
            New supplier
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active suppliers"
          numericValue={stats.active}
          format={(n) => num(Math.round(n))}
          accent="success"
        />
        <StatCard
          label="Avg. lead time"
          numericValue={stats.avgLead}
          format={(n) => `${Math.round(n)}d`}
          accent="info"
        />
        <StatCard
          label="Brands covered"
          numericValue={stats.brands}
          format={(n) => num(Math.round(n))}
          accent="neutral"
        />
        <StatCard
          label="Open POs"
          numericValue={stats.openPos}
          format={(n) => num(Math.round(n))}
          accent="warning"
        />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search name or contact…" />
          <FilterSelect
            value={status}
            onChange={setStatus}
            label="Status"
            options={["active", "inactive"]}
          />
          <FilterSelect value={brand} onChange={setBrand} label="Brand" options={brandOptions} />
          <ResultCount shown={filtered.length} total={suppliers.length} noun="suppliers" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(r) =>
            navigate({ to: "/suppliers/$supplierId", params: { supplierId: r.id } })
          }
          empty={
            <EmptyState
              title="No suppliers match"
              description="Try clearing the search or filters."
            />
          }
        />
      </Panel>

      <SupplierFormDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        supplier={dialog.supplier}
        availableProducts={products}
      />
    </div>
  );
}
