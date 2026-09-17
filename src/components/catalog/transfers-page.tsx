import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { EmptyState, Panel } from "@/components/nexus/primitives";
import { ResultCount, SearchInput, Toolbar } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createBackendTransfer,
  deleteBackendTransfer,
  fetchBackendProducts,
  fetchBackendTransfers,
  fetchBackendWarehouses,
  updateBackendTransferStatus,
} from "@/lib/api-client";
import { dateTime, num } from "@/lib/format";
import type { Product, StockTransfer, TransferStatus, Warehouse } from "@/lib/types";

export function TransfersPage() {
  const [rows, setRows] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const load = () => {
    setLoading(true);
    fetchBackendTransfers()
      .then(setRows)
      .catch(() => {
        setRows([]);
        toast.error("Could not load transfers.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    fetchBackendWarehouses()
      .then(setWarehouses)
      .catch(() => setWarehouses([]));
    fetchBackendProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const resetForm = () => {
    setFromId("");
    setToId("");
    setProductId("");
    setQuantity("");
    setNotes("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const submit = async () => {
    if (!fromId || !toId) {
      toast.error("Choose a source and destination warehouse.");
      return;
    }
    if (fromId === toId) {
      toast.error("Source and destination must be different warehouses.");
      return;
    }
    if (!productId) {
      toast.error("Choose a product.");
      return;
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }
    const payload = { fromWarehouseId: fromId, toWarehouseId: toId, productId, quantity: qty };
    setSaving(true);
    const res = await createBackendTransfer(
      notes.trim() ? { ...payload, notes: notes.trim() } : payload,
    );
    setSaving(false);
    if (!res) {
      toast.error("Could not create transfer.");
      return;
    }
    toast.success("Transfer created.");
    setOpen(false);
    load();
  };

  const advance = async (t: StockTransfer, status: TransferStatus) => {
    const res = await updateBackendTransferStatus(t.id, status);
    if (!res) {
      toast.error("Could not update transfer.");
      return;
    }
    toast.success(`Transfer ${t.id} ${status}.`);
    load();
  };

  const remove = async (t: StockTransfer) => {
    const ok = await deleteBackendTransfer(t.id);
    if (!ok) {
      toast.error("Could not delete transfer.");
      return;
    }
    toast.success(`Transfer ${t.id} deleted.`);
    load();
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (t) =>
        t.id.toLowerCase().includes(needle) ||
        t.productName.toLowerCase().includes(needle) ||
        t.fromWarehouseName.toLowerCase().includes(needle) ||
        t.toWarehouseName.toLowerCase().includes(needle) ||
        t.status.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? "";

  const columns: Column<StockTransfer>[] = [
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
        <span className="flex items-center gap-1.5 text-xs text-foreground">
          {t.fromWarehouseName || "—"}
          <ArrowRightLeft className="size-3 text-muted-foreground" />
          {t.toWarehouseName || "—"}
        </span>
      ),
      sortValue: (t) => `${t.fromWarehouseName} ${t.toWarehouseName}`,
    },
    {
      key: "product",
      header: "Product",
      cell: (t) => <span className="text-foreground">{t.productName || productName(t.productId)}</span>,
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
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-56",
      cell: (t) => (
        <div className="flex items-center justify-end gap-1">
          {(t.status === "draft" || t.status === "pending") && (
            <Button variant="outline" size="sm" className="h-7" onClick={() => advance(t, "approved")}>
              Approve
            </Button>
          )}
          {t.status === "approved" && (
            <Button variant="outline" size="sm" className="h-7" onClick={() => advance(t, "completed")}>
              Complete
            </Button>
          )}
          {(t.status === "draft" || t.status === "pending" || t.status === "approved") && (
            <Button variant="ghost" size="sm" className="h-7" onClick={() => advance(t, "cancelled")}>
              Cancel
            </Button>
          )}
          {(t.status === "draft" || t.status === "cancelled") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-destructive hover:text-destructive"
              onClick={() => remove(t)}
              aria-label={`Delete transfer ${t.id}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Stock Transfers"
        description="Move stock between warehouses. Completing a transfer updates both warehouses."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> New transfer
          </Button>
        }
      />

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search transfers…" />
          <ResultCount shown={filtered.length} total={rows.length} noun="transfers" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          initialSort={{ key: "createdAt", dir: "desc" }}
          pageSize={15}
          empty={
            <EmptyState
              icon={ArrowRightLeft}
              title="No transfers yet"
              description="Create a transfer to move stock between your warehouses."
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus className="size-4" /> New transfer
                </Button>
              }
            />
          }
        />
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New stock transfer</DialogTitle>
            <DialogDescription>
              Draft transfers don't move stock. Approve then complete to apply it.
            </DialogDescription>
          </DialogHeader>
          <div
            className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
            data-lenis-prevent
          >
            <div className="space-y-1.5">
              <Label htmlFor="tr-from">From warehouse</Label>
              <Select value={fromId} onValueChange={setFromId}>
                <SelectTrigger id="tr-from">
                  <SelectValue placeholder="Source…" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr-to">To warehouse</Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger id="tr-to">
                  <SelectValue placeholder="Destination…" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tr-product">Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger id="tr-product">
                  <SelectValue placeholder="Select a product…" />
                </SelectTrigger>
                <SelectContent>
                  {products.slice(0, 200).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.sku ? ` · ${p.sku}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr-qty">Quantity</Label>
              <Input
                id="tr-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tr-notes">Notes</Label>
              <Textarea
                id="tr-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Creating…" : "Create transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
