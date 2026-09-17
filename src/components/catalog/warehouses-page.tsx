import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Pencil, Plus, Trash2, Warehouse as WarehouseIcon } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { EmptyState, Panel } from "@/components/nexus/primitives";
import { ResultCount, SearchInput, Toolbar } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

import {
  createBackendWarehouse,
  deleteBackendWarehouse,
  fetchBackendWarehouses,
  updateBackendWarehouse,
} from "@/lib/api-client";
import { num } from "@/lib/format";
import type { Warehouse, WarehouseType } from "@/lib/types";

const WAREHOUSE_TYPES: WarehouseType[] = ["selling", "storage", "service", "damaged"];

const TYPE_LABEL: Record<WarehouseType, string> = {
  selling: "Selling",
  storage: "Storage",
  service: "Service",
  damaged: "Damaged",
};

export function WarehousesPage({ openNew }: { openNew?: boolean }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<WarehouseType>("storage");
  const [sync, setSync] = useState(false);
  const [manager, setManager] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [status, setStatus] = useState<Warehouse["status"]>("active");
  const [notes, setNotes] = useState("");
  const [deleting, setDeleting] = useState<Warehouse | null>(null);

  const load = () => {
    setLoading(true);
    fetchBackendWarehouses()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error("Could not load warehouses.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setCode("");
    setType("storage");
    setSync(false);
    setManager("");
    setPhone("");
    setAddress("");
    setCapacity("");
    setIsDefault(false);
    setStatus("active");
    setNotes("");
  };

  useEffect(() => {
    if (openNew) {
      resetForm();
      setDialogOpen(true);
    }
  }, [openNew]);

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (w: Warehouse) => {
    setEditing(w);
    setName(w.name);
    setCode(w.code);
    setType(w.type);
    setSync(w.sync);
    setManager(w.manager ?? "");
    setPhone(w.phone ?? "");
    setAddress(w.address ?? "");
    setCapacity(w.capacity === undefined ? "" : String(w.capacity));
    setIsDefault(w.default);
    setStatus(w.status);
    setNotes(w.notes ?? "");
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Warehouse name is required.");
      return;
    }
    if (!code.trim()) {
      toast.error("Warehouse code is required.");
      return;
    }
    const payload: Partial<Warehouse> = {
      name: name.trim(),
      code: code.trim(),
      type,
      sync,
      default: isDefault,
      status,
    };
    if (manager.trim()) payload.manager = manager.trim();
    if (phone.trim()) payload.phone = phone.trim();
    if (address.trim()) payload.address = address.trim();
    if (capacity.trim()) payload.capacity = Number(capacity.trim());
    if (notes.trim()) payload.notes = notes.trim();

    const res = editing
      ? await updateBackendWarehouse(editing.id, payload)
      : await createBackendWarehouse(payload);
    if (!res) {
      toast.error(editing ? "Could not update warehouse." : "Could not create warehouse.");
      return;
    }
    toast.success(`Warehouse "${res.name}" ${editing ? "updated" : "created"}.`);
    setDialogOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const removed = await deleteBackendWarehouse(deleting.id);
    if (!removed) {
      toast.error("Could not delete warehouse.");
      return;
    }
    toast.success(`Warehouse "${deleting.name}" deleted.`);
    setDeleting(null);
    load();
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (w) =>
        w.name.toLowerCase().includes(needle) ||
        w.code.toLowerCase().includes(needle) ||
        w.type.toLowerCase().includes(needle) ||
        (w.manager ?? "").toLowerCase().includes(needle) ||
        (w.address ?? "").toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns: Column<Warehouse>[] = [
    {
      key: "name",
      header: "Warehouse",
      cell: (w) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {w.name}
            {w.default && (
              <span className="label-tech ml-2 align-middle text-[10px] font-normal normal-case text-info">
                default
              </span>
            )}
          </p>
          <p className="mono mt-0.5 truncate text-[11px] text-muted-foreground">{w.code}</p>
        </div>
      ),
      sortValue: (w) => w.name,
      className: "min-w-[12rem]",
    },
    {
      key: "type",
      header: "Type",
      align: "center",
      cell: (w) => <span className="label-tech">{TYPE_LABEL[w.type]}</span>,
      sortValue: (w) => w.type,
    },
    {
      key: "sync",
      header: "WC Sync",
      align: "center",
      cell: (w) =>
        w.type === "selling" ? (
          w.sync ? (
            <StatusBadge status="active" label="Syncing" />
          ) : (
            <StatusBadge status="inactive" label="Manual" />
          )
        ) : (
          <span className="text-xs text-subtle">—</span>
        ),
      sortValue: (w) => (w.sync ? 1 : 0),
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      cell: (w) => <span className="mono tabular-nums">{num(w.totalProducts ?? 0)}</span>,
      sortValue: (w) => w.totalProducts ?? 0,
    },
    {
      key: "quantity",
      header: "Total Qty",
      align: "right",
      cell: (w) => (
        <span className="mono tabular-nums text-foreground">{num(w.totalQuantity ?? 0)}</span>
      ),
      sortValue: (w) => w.totalQuantity ?? 0,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (w) => (
        <span className="text-xs text-muted-foreground">
          {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
      sortValue: (w) => w.createdAt,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (w) => <StatusBadge status={w.status} />,
      sortValue: (w) => w.status,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-36",
      cell: (w) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2"
            onClick={() =>
              navigate({ to: "/warehouses/$warehouseId", params: { warehouseId: w.id } })
            }
          >
            Manage <ArrowRight className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => openEdit(w)}
            aria-label={`Edit warehouse ${w.name}`}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
            onClick={() => setDeleting(w)}
            aria-label={`Delete warehouse ${w.name}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Warehouses"
        description="Physical inventory locations. Stored in WooCommerce, so they survive restarts."
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" /> New warehouse
          </Button>
        }
      />

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search warehouses…" />
          <ResultCount shown={filtered.length} total={rows.length} noun="warehouses" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          initialSort={{ key: "name", dir: "asc" }}
          empty={
            <EmptyState
              icon={WarehouseIcon}
              title="No warehouses yet"
              description="Add your branches and storage locations to start organizing inventory."
              action={
                <Button size="sm" onClick={openAdd}>
                  <Plus className="size-4" /> New warehouse
                </Button>
              }
            />
          }
        />
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit warehouse" : "New warehouse"}</DialogTitle>
          </DialogHeader>
          <div
            className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
            data-lenis-prevent
          >
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="wh-name">Name</Label>
              <Input
                id="wh-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Warehouse"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-code">Code</Label>
              <Input
                id="wh-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. MAIN"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WarehouseType)}>
                <SelectTrigger id="wh-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-manager">Manager</Label>
              <Input
                id="wh-manager"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="Who runs this location"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-phone">Phone</Label>
              <Input
                id="wh-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contact number"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="wh-address">Address</Label>
              <Input
                id="wh-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-capacity">Capacity (bins/slots)</Label>
              <Input
                id="wh-capacity"
                type="number"
                min={0}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="flex items-end justify-between gap-3 pb-1">
              <div>
                <Label htmlFor="wh-status">Status</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">Visible to the POS</p>
              </div>
              <Select value={status} onValueChange={(v) => setStatus(v as Warehouse["status"])}>
                <SelectTrigger id="wh-status" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className={cn(
                "flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 sm:col-span-2",
                type === "selling" && sync
                  ? "border-info/40 bg-info/5"
                  : "border-border bg-elevated",
              )}
            >
              <div>
                <Label htmlFor="wh-sync" className="text-[13px]">
                  Sync warehouse to WooCommerce
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {type === "selling"
                    ? "Selling warehouse — its quantity drives the storefront stock."
                    : "Only Selling warehouses can push stock to WooCommerce."}
                </p>
              </div>
              <Switch
                id="wh-sync"
                checked={sync}
                disabled={type !== "selling"}
                onCheckedChange={setSync}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-elevated px-3 py-2.5 sm:col-span-2">
              <div>
                <Label htmlFor="wh-default" className="text-[13px]">
                  Default warehouse
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Default receiving location for new stock
                </p>
              </div>
              <Switch id="wh-default" checked={isDefault} onCheckedChange={setIsDefault} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="wh-notes">Notes</Label>
              <Textarea
                id="wh-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes about this location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? "Save changes" : "Create warehouse"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleting && (
        <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete warehouse?</AlertDialogTitle>
              <AlertDialogDescription>
                "{deleting.name}" ({deleting.code}) will be removed. Its stock records stay on the
                products.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete warehouse</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
