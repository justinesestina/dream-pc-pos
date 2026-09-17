import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRightLeft,
  MinusCircle,
  Package,
  PackagePlus,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { EmptyState, Panel } from "@/components/nexus/primitives";
import { ResultCount, SearchInput, Segmented, Toolbar } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Section } from "@/components/nexus/detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AddStockDialog } from "@/components/inventory/add-stock-dialog";
import { TransferStockDialog } from "@/components/inventory/transfer-stock-dialog";
import {
  deleteBackendWarehouse,
  fetchBackendWarehouse,
  fetchWarehouseMovements,
  fetchWarehouseStock,
  fetchWarehouseTransfers,
  getLastApiError,
  updateBackendWarehouse,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { dateTime, num } from "@/lib/format";
import type {
  StockMovement,
  StockTransfer,
  Warehouse as WarehouseModel,
  WarehouseStockRow,
  WarehouseType,
} from "@/lib/types";

type Tab = "products" | "movements" | "transfers" | "settings";

type FormErrors = {
  name?: string | undefined;
  code?: string | undefined;
  form?: string | undefined;
};

const invalidClass = "border-destructive focus-visible:ring-destructive";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

const TYPE_LABEL: Record<WarehouseType, string> = {
  selling: "Selling",
  storage: "Storage",
  service: "Service",
  damaged: "Damaged",
};

const MOVEMENT_LABEL: Record<StockMovement["type"], string> = {
  stock_in: "Stock in",
  stock_out: "Stock out",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
  adjustment: "Adjustment",
};

export function WarehouseDetailPage({ warehouseId }: { warehouseId: string }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("products");
  const [warehouse, setWarehouse] = useState<WarehouseModel | null>(null);
  const [stock, setStock] = useState<WarehouseStockRow[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [stockDialog, setStockDialog] = useState<{ open: boolean; mode: "add" | "deduct" }>({
    open: false,
    mode: "add",
  });
  const [saving, setSaving] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState<FormErrors>({});
  const [stockQ, setStockQ] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<WarehouseType>("storage");
  const [sync, setSync] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [status, setStatus] = useState<WarehouseModel["status"]>("active");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBackendWarehouse(warehouseId)
      .then((w) => {
        if (cancelled || !w) return;
        setWarehouse(w);
        setName(w.name);
        setCode(w.code);
        setType(w.type);
        setSync(w.sync);
        setIsDefault(w.default);
        setStatus(w.status);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load warehouse.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    fetchWarehouseStock(warehouseId)
      .then((d) => !cancelled && setStock(d))
      .catch(() => undefined);
    fetchWarehouseMovements(warehouseId)
      .then((d) => !cancelled && setMovements(d))
      .catch(() => undefined);
    fetchWarehouseTransfers(warehouseId)
      .then((d) => !cancelled && setTransfers(d))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [warehouseId, reloadKey]);

  const totals = useMemo(() => {
    const inStock = stock.filter((r) => r.quantity > 0);
    const quantity = stock.reduce((sum, r) => sum + r.quantity, 0);
    return { products: inStock.length, quantity, catalog: stock.length };
  }, [stock]);

  const filteredStock = useMemo(() => {
    const needle = stockQ.trim().toLowerCase();
    return stock.filter((r) => {
      if (inStockOnly && r.quantity <= 0) return false;
      if (!needle) return true;
      return (
        r.name.toLowerCase().includes(needle) ||
        (r.sku ?? "").toLowerCase().includes(needle) ||
        r.productId.toLowerCase().includes(needle)
      );
    });
  }, [stock, stockQ, inStockOnly]);

  const saveSettings = async () => {
    if (!warehouse) return;
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!code.trim()) next.code = "Code is required.";
    setSettingsErrors(next);
    if (Object.keys(next).length > 0) return;
    setSaving(true);
    const res = await updateBackendWarehouse(warehouse.id, {
      name: name.trim(),
      code: code.trim(),
      type,
      sync,
      default: isDefault,
      status,
    });
    setSaving(false);
    if (!res) {
      const message = getLastApiError() ?? "Could not save warehouse.";
      setSettingsErrors({ form: message });
      toast.error("Could not save warehouse", { description: message });
      return;
    }
    toast.success("Warehouse updated.");
    setReloadKey((k) => k + 1);
  };

  const removeWarehouse = async () => {
    if (!warehouse) return;
    const ok = await deleteBackendWarehouse(warehouse.id);
    if (!ok) {
      const message = getLastApiError() ?? "Could not delete warehouse.";
      toast.error("Could not delete warehouse", { description: message });
      return;
    }
    toast.success(`Warehouse "${warehouse.name}" deleted.`);
    navigate({ to: "/warehouses", search: { openNew: false } });
  };

  const stockColumns: Column<WarehouseStockRow>[] = [
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
      key: "product",
      header: "Product",
      cell: (r) => <span className="font-medium text-foreground">{r.name}</span>,
      sortValue: (r) => r.name,
    },
    {
      key: "sku",
      header: "SKU",
      cell: (r) => <span className="mono text-xs text-muted-foreground">{r.sku || "—"}</span>,
      sortValue: (r) => r.sku,
    },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      cell: (r) => <span className="mono tabular-nums">{num(r.quantity)}</span>,
      sortValue: (r) => r.quantity,
    },
    {
      key: "available",
      header: "Available",
      align: "right",
      cell: (r) => (
        <span className="mono tabular-nums text-muted-foreground">{num(r.available)}</span>
      ),
      sortValue: (r) => r.available,
    },
    {
      key: "updatedAt",
      header: "Updated",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.updatedAt ? dateTime(r.updatedAt) : "—"}
        </span>
      ),
      sortValue: (r) => r.updatedAt,
    },
  ];

  const movementColumns: Column<StockMovement>[] = [
    {
      key: "at",
      header: "When",
      cell: (m) => <span className="text-xs text-muted-foreground">{dateTime(m.at)}</span>,
      sortValue: (m) => m.at,
    },
    {
      key: "type",
      header: "Type",
      cell: (m) => <span className="label-tech">{MOVEMENT_LABEL[m.type]}</span>,
      sortValue: (m) => m.type,
    },
    {
      key: "product",
      header: "Product",
      cell: (m) => <span className="text-foreground">{m.productName}</span>,
      sortValue: (m) => m.productName,
    },
    {
      key: "qty",
      header: "Qty",
      align: "right",
      cell: (m) => (
        <span
          className={
            m.qty >= 0 ? "mono tabular-nums text-success" : "mono tabular-nums text-destructive"
          }
        >
          {m.qty >= 0 ? `+${num(m.qty)}` : num(m.qty)}
        </span>
      ),
      sortValue: (m) => m.qty,
    },
    {
      key: "reference",
      header: "Reference",
      cell: (m) => (
        <span className="text-xs text-muted-foreground">{m.reference || m.note || "—"}</span>
      ),
      sortValue: (m) => m.reference ?? "",
    },
    {
      key: "actor",
      header: "By",
      cell: (m) => <span className="text-xs text-muted-foreground">{m.actor || "—"}</span>,
      sortValue: (m) => m.actor,
    },
  ];

  const transferColumns: Column<StockTransfer>[] = [
    {
      key: "createdAt",
      header: "Date",
      cell: (t) => <span className="text-xs text-muted-foreground">{dateTime(t.createdAt)}</span>,
      sortValue: (t) => t.createdAt,
    },
    {
      key: "route",
      header: "Route",
      cell: (t) => (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {t.fromWarehouseName}
          <ArrowRightLeft className="size-3" />
          {t.toWarehouseName}
        </span>
      ),
    },
    {
      key: "product",
      header: "Product",
      cell: (t) => <span className="text-foreground">{t.productName}</span>,
      sortValue: (t) => t.productName,
    },
    {
      key: "quantity",
      header: "Qty",
      align: "right",
      cell: (t) => <span className="mono tabular-nums">{num(t.quantity)}</span>,
      sortValue: (t) => t.quantity,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (t) => <StatusBadge status={t.status} />,
      sortValue: (t) => t.status,
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={warehouse?.name ?? "Warehouse"}
        status={warehouse ? <StatusBadge status={warehouse.status} /> : undefined}
        description={
          warehouse
            ? `${TYPE_LABEL[warehouse.type]} warehouse · ${warehouse.code}${
                warehouse.type === "selling" ? " · WooCommerce storefront" : ""
              }`
            : "Loading warehouse…"
        }
        meta={
          warehouse ? (
            <>
              <span className="label-tech">{num(totals.products)} products</span>
              <span className="label-tech">{num(totals.quantity)} units on hand</span>
              <span className="label-tech">{num(totals.catalog)} in catalog</span>
              {warehouse.type === "selling" && (
                <span className="label-tech">
                  {warehouse.sync ? "Synced to WooCommerce" : "Not synced"}
                </span>
              )}
            </>
          ) : undefined
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/warehouses", search: { openNew: false } })}
            >
              <ArrowLeft className="size-4" /> Warehouses
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStockDialog({ open: true, mode: "add" })}
            >
              <PackagePlus className="size-4" /> Add Stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStockDialog({ open: true, mode: "deduct" })}
            >
              <MinusCircle className="size-4" /> Deduct
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <ArrowRightLeft className="size-4" /> Transfer
            </Button>
          </>
        }
      />

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "products", label: "Products" },
          { value: "movements", label: "Stock Movements" },
          { value: "transfers", label: "Transfer History" },
          { value: "settings", label: "Settings" },
        ]}
      />

      {tab === "products" && (
        <Panel>
          <Toolbar>
            <SearchInput
              value={stockQ}
              onChange={setStockQ}
              placeholder="Search products by name or SKU…"
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} />
              In stock only
            </label>
            <ResultCount shown={filteredStock.length} total={stock.length} noun="products" />
          </Toolbar>
          <DataTable
            rows={filteredStock}
            columns={stockColumns}
            loading={loading}
            initialSort={{ key: "quantity", dir: "desc" }}
            pageSize={25}
            empty={
              <EmptyState
                icon={Package}
                title={stock.length > 0 ? "No matching products" : "No products found"}
                description={
                  stock.length > 0
                    ? "Try a different search, or turn off the in-stock filter."
                    : "Products from WooCommerce will appear here once synced."
                }
                action={
                  <Button size="sm" onClick={() => setStockDialog({ open: true, mode: "add" })}>
                    <PackagePlus className="size-4" /> Add Stock
                  </Button>
                }
              />
            }
          />
        </Panel>
      )}

      {tab === "movements" && (
        <Panel>
          <DataTable
            rows={movements}
            columns={movementColumns}
            loading={loading}
            initialSort={{ key: "at", dir: "desc" }}
            pageSize={15}
            empty={
              <EmptyState
                icon={WarehouseIcon}
                title="No movements yet"
                description="Stock-in, transfers and adjustments will appear here."
              />
            }
          />
        </Panel>
      )}

      {tab === "transfers" && (
        <Panel>
          <DataTable
            rows={transfers}
            columns={transferColumns}
            loading={loading}
            initialSort={{ key: "createdAt", dir: "desc" }}
            empty={
              <EmptyState
                icon={ArrowRightLeft}
                title="No transfers yet"
                description="Transfers into or out of this warehouse will be listed here."
              />
            }
          />
        </Panel>
      )}

      {tab === "settings" && warehouse && (
        <Section
          title="Warehouse settings"
          hint="Physical stock source of truth. Only Selling warehouses with sync on push stock to WooCommerce."
          bodyClassName="p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {settingsErrors.form && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{settingsErrors.form}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="ws-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ws-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSettingsErrors((er) => ({ ...er, name: "", form: "" }));
                }}
                className={cn(settingsErrors.name && invalidClass)}
              />
              <FieldError message={settingsErrors.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws-code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ws-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setSettingsErrors((er) => ({ ...er, code: "", form: "" }));
                }}
                className={cn(settingsErrors.code && invalidClass)}
              />
              <FieldError message={settingsErrors.code} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WarehouseType)}>
                <SelectTrigger id="ws-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABEL) as WarehouseType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws-status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as WarehouseModel["status"])}
              >
                <SelectTrigger id="ws-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-elevated px-3 py-2.5">
              <div>
                <Label htmlFor="ws-sync" className="text-[13px]">
                  Sync warehouse to WooCommerce
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {type === "selling"
                    ? "Its quantity drives the storefront stock."
                    : "Only Selling warehouses can sync."}
                </p>
              </div>
              <Switch
                id="ws-sync"
                checked={sync}
                disabled={type !== "selling"}
                onCheckedChange={setSync}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-elevated px-3 py-2.5">
              <div>
                <Label htmlFor="ws-default" className="text-[13px]">
                  Default warehouse
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Receiving location for new stock
                </p>
              </div>
              <Switch id="ws-default" checked={isDefault} onCheckedChange={setIsDefault} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" /> Delete warehouse
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete warehouse?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{warehouse.name}" will be removed. Stock records stay on the products.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={removeWarehouse}>Delete warehouse</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </Section>
      )}

      <AddStockDialog
        open={stockDialog.open}
        onOpenChange={(v) => setStockDialog((d) => ({ ...d, open: v }))}
        warehouseId={warehouseId}
        initialMode={stockDialog.mode}
        onDone={() => setReloadKey((k) => k + 1)}
      />

      <TransferStockDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        initialFromId={warehouseId}
        onDone={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
