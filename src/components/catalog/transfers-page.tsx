import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { EmptyState, Panel } from "@/components/nexus/primitives";
import { ResultCount, SearchInput, Toolbar } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { TransferStockDialog } from "@/components/inventory/transfer-stock-dialog";
import {
  deleteBackendTransfer,
  fetchBackendProducts,
  fetchBackendTransfers,
  getLastApiError,
  updateBackendTransferStatus,
} from "@/lib/api-client";
import { dateTime, num } from "@/lib/format";
import type { Product, StockTransfer, TransferStatus } from "@/lib/types";

export function TransfersPage() {
  const [rows, setRows] = useState<StockTransfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

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
    fetchBackendProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const advance = async (t: StockTransfer, status: TransferStatus) => {
    if (busyId) return;
    setBusyId(t.id);
    const res = await updateBackendTransferStatus(t.id, status, `transfer-${status}:${t.id}`);
    setBusyId(null);
    if (!res) {
      const message = getLastApiError() ?? "Could not update transfer.";
      toast.error("Could not update transfer", { description: message });
      return;
    }
    toast.success(
      status === "completed"
        ? `Transfer ${t.id} completed — stock moved.`
        : `Transfer ${t.id} ${status}.`,
    );
    load();
  };

  const remove = async (t: StockTransfer) => {
    if (busyId) return;
    setBusyId(t.id);
    const ok = await deleteBackendTransfer(t.id);
    setBusyId(null);
    if (!ok) {
      const message = getLastApiError() ?? "Could not delete transfer.";
      toast.error("Could not delete transfer", { description: message });
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
      cell: (t) => (
        <span className="text-foreground">{t.productName || productName(t.productId)}</span>
      ),
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
      className: "w-64",
      cell: (t) => {
        const busy = busyId === t.id;
        const open_ = t.status === "draft" || t.status === "pending" || t.status === "approved";
        return (
          <div className="flex items-center justify-end gap-1">
            {open_ && (
              <Button
                variant="default"
                size="sm"
                className="h-7"
                disabled={busy}
                onClick={() => advance(t, "completed")}
              >
                {busy ? "Working…" : "Approve & complete"}
              </Button>
            )}
            {open_ && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                disabled={busy}
                onClick={() => advance(t, "cancelled")}
              >
                Cancel
              </Button>
            )}
            {(t.status === "draft" || t.status === "cancelled") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                disabled={busy}
                onClick={() => remove(t)}
                aria-label={`Delete transfer ${t.id}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Stock Transfers"
        description="Move stock between warehouses. Completing a transfer updates both warehouses."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
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
                <Button size="sm" onClick={() => setOpen(true)}>
                  <Plus className="size-4" /> New transfer
                </Button>
              }
            />
          }
        />
      </Panel>

      <TransferStockDialog open={open} onOpenChange={setOpen} onDone={load} />
    </div>
  );
}
