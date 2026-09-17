import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Warehouse as WarehouseIcon } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createBackendWarehouse,
  deleteBackendWarehouse,
  fetchBackendWarehouses,
  updateBackendWarehouse,
} from "@/lib/api-client";
import { num } from "@/lib/format";
import type { Warehouse, WarehouseType } from "@/lib/types";

const WAREHOUSE_TYPES: WarehouseType[] = ["main", "branch", "storage", "service"];

export function WarehousesPage({ openNew }: { openNew?: boolean }) {
  const [rows, setRows] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<WarehouseType>("branch");
  const [manager, setManager] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [status, setStatus] = useState<Warehouse["status"]>("active");
  const [notes, setNotes] = useState("");
  const [deleting, setDeleting] = useState<Warehouse | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchBackendWarehouses()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error("Could not load warehouses.");
      })
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    fetchBackendWarehouses()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error("Could not load warehouses.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (openNew) {
      setEditing(null);
      setName("");
      setCode("");
      setType("branch");
      setManager("");
      setPhone("");
      setAddress("");
      setCapacity("");
      setIsDefault(false);
      setStatus("active");
      setNotes("");
      setDialogOpen(true);
    }
  }, [openNew]);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setCode("");
    setType("branch");
    setManager("");
    setPhone("");
    setAddress("");
    setCapacity("");
    setIsDefault(false);
    setStatus("active");
    setNotes("");
    setDialogOpen(true);
  };

  const openEdit = (w: Warehouse) => {
    setEditing(w);
    setName(w.name);
    setCode(w.code);
    setType(w.type);
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
      default: isDefault,
      status,
    };
    if (manager.trim()) payload.manager = manager.trim();
    if (phone.trim()) payload.phone = phone.trim();
    if (address.trim()) payload.address = address.trim();
    if (capacity.trim()) payload.capacity = Number(capacity.trim());
    if (notes.trim()) payload.notes = notes.trim();

    if (editing) {
      const res = await updateBackendWarehouse(editing.id, payload);
      if (!res) {
        toast.error("Could not update warehouse.");
        return;
      }
      toast.success(`Warehouse "${res.name}" updated.`);
    } else {
      const res = await createBackendWarehouse(payload);
      if (!res) {
        toast.error("Could not create warehouse.");
        return;
      }
      toast.success(`Warehouse "${res.name}" created.`);
    }
    setDialogOpen(false);
    reload();
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }
    const ok = await deleteBackendWarehouse(deleting.id);
    if (!ok) {
      toast.error("Could not delete warehouse.");
      return;
    }
    toast.success(`Warehouse "${deleting.name}" deleted.`);
    setDeleting(null);
    reload();
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
      header: "Name",
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
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{w.id}</p>
        </div>
      ),
      sortValue: (w) => w.name,
    },
    {
      key: "code",
      header: "Code",
      cell: (w) => <span className="mono text-xs text-muted-foreground">{w.code}</span>,
      sortValue: (w) => w.code,
    },
    {
      key: "type",
      header: "Type",
      align: "center",
      cell: (w) => <span className="label-tech">{w.type}</span>,
      sortValue: (w) => w.type,
    },
    {
      key: "manager",
      header: "Manager",
      cell: (w) => {
        const text = w.manager || "—";
        return <span className="truncate text-[13px] text-muted-foreground">{text}</span>;
      },
      sortValue: (w) => w.manager ?? "",
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
      className: "w-24",
      cell: (w) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => openEdit(w)}
            aria-label={`Edit warehouse ${w.name}`}
          >
            <Pencil className="size-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => setDeleting(w)}
                aria-label={`Delete warehouse ${w.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete warehouse?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{w.name}" ({w.code}) will be removed from the warehouse table.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Delete warehouse</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Warehouses"
        description="Branch and storage locations. Custom table in the backend (WooCommerce has no native warehouses)."
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
                placeholder="e.g. Main Branch"
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
                      {t.charAt(0).toUpperCase() + t.slice(1)}
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
                "{deleting.name}" ({deleting.code}) will be removed from the warehouse table.
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
