import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowRightLeft, Pencil, RefreshCw } from "lucide-react";
import { Panel, EmptyState } from "@/components/nexus/primitives";
import { ResultCount, SearchInput, Toolbar } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { TransferStockDialog } from "@/components/inventory/transfer-stock-dialog";
import { AddStockDialog } from "@/components/inventory/add-stock-dialog";
import { EditStockDialog } from "@/components/inventory/edit-stock-dialog";
import { fetchBackendProductStock, fetchBackendWarehouses } from "@/lib/api-client";
import { money, num } from "@/lib/format";
import type { ProductStockInfo, Warehouse } from "@/lib/types";

function isOutOnStorefront(r: ProductStockInfo): boolean {
  return (r.wooStock ?? 0) <= 0;
}

export function ProductStockView() {
  const [rows, setRows] = useState<ProductStockInfo[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [transfer, setTransfer] = useState({
    open: false,
    fromId: "",
    toId: "",
    productId: "",
  });
  const [addStock, setAddStock] = useState({ open: false, productId: "" });
  const [edit, setEdit] = useState({
    open: false,
    productId: "",
    warehouseId: "",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBackendProductStock()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          toast.error("Could not load stock by warehouse.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    fetchBackendWarehouses()
      .then((data) => !cancelled && setWarehouses(data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const selling = useMemo(() => warehouses.find((w) => w.type === "selling"), [warehouses]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(needle) || r.sku.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const outCount = useMemo(() => rows.filter(isOutOnStorefront).length, [rows]);

  const openTransfer = (r: ProductStockInfo, fromId?: string) => {
    const top = fromId ?? r.warehouses[0]?.warehouseId ?? "";
    setTransfer({ open: true, fromId: top, toId: selling?.id ?? "", productId: r.productId });
  };

  const columns: Column<ProductStockInfo>[] = [
    {
      key: "image",
      header: "",
      className: "w-14",
      cell: (r) => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40 p-1">
          {r.image ? (
            <img src={r.image} alt={r.name} className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-muted-foreground/50">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Product",
      cell: (r) => <span className="font-medium text-foreground">{r.name}</span>,
      sortValue: (r) => r.name,
      className: "min-w-[14rem]",
    },
    {
      key: "sku",
      header: "SKU",
      cell: (r) => <span className="mono text-xs text-muted-foreground">{r.sku}</span>,
      sortValue: (r) => r.sku,
    },
    {
      key: "wooStock",
      header: "WooCommerce",
      align: "right",
      cell: (r) => (
        <span className="mono tabular-nums text-foreground">{num(r.wooStock ?? 0)}</span>
      ),
      sortValue: (r) => r.wooStock ?? 0,
    },
    {
      key: "totalPhysical",
      header: "Total Physical",
      align: "right",
      cell: (r) => <span className="mono tabular-nums">{num(r.totalPhysical)}</span>,
      sortValue: (r) => r.totalPhysical,
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      cell: (r) => (
        <span className="mono tabular-nums text-foreground">
          {r.totalValue ? money(r.totalValue) : "—"}
        </span>
      ),
      sortValue: (r) => r.totalValue ?? 0,
    },
    {
      key: "warehouses",
      header: "Warehouse Availability",
      cell: (r) => {
        const outOnStore = isOutOnStorefront(r);
        return (
          <div className="min-w-[10rem] space-y-1">
            {r.warehouses.length === 0 ? (
              <span className="text-xs text-subtle">No physical stock</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {r.warehouses.slice(0, 3).map((w) => (
                  <span
                    key={w.warehouseId}
                    className="mono inline-flex items-center gap-1 rounded border border-border bg-elevated px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
                  >
                    {w.name} <span className="text-foreground">{num(w.quantity)}</span>
                  </span>
                ))}
                {r.warehouses.length > 3 && (
                  <span className="text-[10.5px] text-subtle">+{r.warehouses.length - 3}</span>
                )}
              </div>
            )}
            {outOnStore && r.totalPhysical > 0 && (
              <button
                type="button"
                onClick={() => openTransfer(r)}
                className="flex items-center gap-1 text-left text-[11px] text-warning hover:underline"
              >
                <AlertTriangle className="size-3" />
                Out on storefront — {num(r.totalPhysical)} available, transfer to WooCommerce
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (r) => (
        <StatusBadge
          status={isOutOnStorefront(r) ? "out_of_stock" : "in_stock"}
          label={isOutOnStorefront(r) ? "Out of stock" : "In stock"}
        />
      ),
      sortValue: (r) => (isOutOnStorefront(r) ? 0 : 1),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-52",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2"
            onClick={() => setAddStock({ open: true, productId: r.productId })}
          >
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2"
            onClick={() =>
              setEdit({
                open: true,
                productId: r.productId,
                warehouseId: r.warehouses[0]?.warehouseId ?? "",
              })
            }
            aria-label={`Edit stock for ${r.name}`}
          >
            <Pencil className="size-3.5" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1"
            onClick={() => openTransfer(r)}
            disabled={r.warehouses.length === 0}
          >
            <ArrowRightLeft className="size-3.5" /> Transfer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {outCount > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <AlertTriangle className="size-3.5" />
          {num(outCount)} product{outCount === 1 ? "" : "s"} out of stock on the storefront. Restock
          the WooCommerce warehouse to make them sellable.
        </div>
      )}
      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search name or SKU…" />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
          <ResultCount shown={filtered.length} total={rows.length} noun="products" />
        </Toolbar>
        <DataTable
          rows={filtered.map((r) => ({ ...r, id: r.productId }))}
          columns={columns}
          loading={loading}
          initialSort={{ key: "name", dir: "asc" }}
          pageSize={15}
          empty={
            <EmptyState
              title="No stock data"
              description="Products from WooCommerce will appear here with their warehouse split."
            />
          }
        />
      </Panel>

      <TransferStockDialog
        open={transfer.open}
        onOpenChange={(v) => setTransfer((t) => ({ ...t, open: v }))}
        initialFromId={transfer.fromId}
        initialToId={transfer.toId}
        initialProductId={transfer.productId}
        onDone={() => setReloadKey((k) => k + 1)}
      />

      <AddStockDialog
        open={addStock.open}
        onOpenChange={(v) => setAddStock((s) => ({ ...s, open: v }))}
        initialMode="add"
        initialProductId={addStock.productId}
        onDone={() => setReloadKey((k) => k + 1)}
      />

      <EditStockDialog
        open={edit.open}
        onOpenChange={(v) => setEdit((e) => ({ ...e, open: v }))}
        productId={edit.productId}
        initialWarehouseId={edit.warehouseId}
        warehouses={warehouses}
        onDone={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
