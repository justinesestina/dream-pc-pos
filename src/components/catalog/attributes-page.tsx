import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { EmptyState, Panel } from "@/components/nexus/primitives";
import { ResultCount, SearchInput, Toolbar } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  createBackendAttribute,
  createBackendAttributeTerm,
  deleteBackendAttribute,
  deleteBackendAttributeTerm,
  fetchBackendAttributeTerms,
  fetchBackendAttributes,
  updateBackendAttribute,
  updateBackendAttributeTerm,
} from "@/lib/api-client";
import { num } from "@/lib/format";
import type { AttributeMeta, AttributeTerm } from "@/lib/types";

const ATTRIBUTE_TYPES = ["text", "color", "select", "button"];

export function AttributesPage() {
  const [rows, setRows] = useState<AttributeMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AttributeMeta | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<(typeof ATTRIBUTE_TYPES)[number]>("select");
  const [deleting, setDeleting] = useState<AttributeMeta | null>(null);
  const [termsFor, setTermsFor] = useState<AttributeMeta | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchBackendAttributes()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error("Could not load attributes.");
      })
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setType("select");
    setDialogOpen(true);
  };

  const openEdit = (a: AttributeMeta) => {
    setEditing(a);
    setName(a.name);
    setSlug(a.slug);
    setType(ATTRIBUTE_TYPES.includes(a.type) ? (a.type as typeof type) : "select");
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Attribute name is required.");
      return;
    }
    if (editing) {
      const res = await updateBackendAttribute(editing.id, { name: name.trim() });
      if (!res) {
        toast.error("Could not update attribute.");
        return;
      }
      toast.success(`Attribute "${res.name}" updated.`);
    } else {
      const payload: Partial<AttributeMeta> = { name: name.trim(), type };
      const trimmedSlug = slug.trim();
      if (trimmedSlug) payload.slug = trimmedSlug;
      const res = await createBackendAttribute(payload);
      if (!res) {
        toast.error("Could not create attribute.");
        return;
      }
      toast.success(`Attribute "${res.name}" created.`);
    }
    setDialogOpen(false);
    reload();
  };

  const confirmedDelete = async () => {
    if (!deleting) {
      return;
    }
    const ok = await deleteBackendAttribute(deleting.id);
    if (!ok) {
      toast.error("Could not delete attribute.");
      return;
    }
    toast.success(`Attribute "${deleting.name}" deleted.`);
    setDeleting(null);
    reload();
  };

  const reload = () => {
    fetchBackendAttributes()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error("Could not load attributes.");
      })
      .finally(() => setLoading(false));
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (a) =>
        a.name.toLowerCase().includes(needle) ||
        a.slug.toLowerCase().includes(needle) ||
        a.type.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns: Column<AttributeMeta>[] = [
    {
      key: "name",
      header: "Name",
      cell: (a) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{a.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">id {a.id}</p>
        </div>
      ),
      sortValue: (a) => a.name,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (a) => <span className="mono text-xs text-muted-foreground">{a.slug || "—"}</span>,
      sortValue: (a) => a.slug,
    },
    {
      key: "type",
      header: "Type",
      align: "center",
      cell: (a) => <span className="label-tech">{a.type}</span>,
      sortValue: (a) => a.type,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-40",
      cell: (a) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-info hover:text-info"
            onClick={() => setTermsFor(a)}
            aria-label={`Manage terms for ${a.name}`}
          >
            <Tags className="size-3.5" /> Terms
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => openEdit(a)}
            aria-label={`Edit attribute ${a.name}`}
          >
            <Pencil className="size-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => setDeleting(a)}
                aria-label={`Delete attribute ${a.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete attribute?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{a.name}" and all of its terms will be removed from WooCommerce.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmedDelete}>Delete attribute</AlertDialogAction>
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
        title="Attributes"
        description="Product attributes (e.g. color, size) and their values, synced with WooCommerce."
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" /> New attribute
          </Button>
        }
      />

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search attributes…" />
          <ResultCount shown={filtered.length} total={rows.length} noun="attributes" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          initialSort={{ key: "name", dir: "asc" }}
          empty={
            <EmptyState
              icon={Tags}
              title="No attributes yet"
              description="Add attributes like color or size, then fill them with values."
              action={
                <Button size="sm" onClick={openAdd}>
                  <Plus className="size-4" /> New attribute
                </Button>
              }
            />
          }
        />
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit attribute" : "New attribute"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="attr-name">Name</Label>
              <Input
                id="attr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Color, Size, Brand…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="attr-slug">Slug</Label>
                <Input
                  id="attr-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated if blank"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="attr-type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                  <SelectTrigger id="attr-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? "Save changes" : "Create attribute"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {termsFor && (
        <TermsDialog
          attribute={termsFor}
          open={Boolean(termsFor)}
          onOpenChange={(v) => !v && setTermsFor(null)}
        />
      )}
    </div>
  );
}

function TermsDialog({
  attribute,
  open,
  onOpenChange,
}: {
  attribute: AttributeMeta;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [terms, setTerms] = useState<AttributeTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTerm, setNewTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleting, setDeleting] = useState<AttributeTerm | null>(null);

  const refresh = () => {
    setLoading(true);
    fetchBackendAttributeTerms(attribute.id)
      .then((data) => setTerms(data))
      .catch(() => {
        setTerms([]);
        toast.error("Could not load terms.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchBackendAttributeTerms(attribute.id)
      .then((data) => setTerms(data))
      .catch(() => {
        setTerms([]);
        toast.error("Could not load terms.");
      })
      .finally(() => setLoading(false));
  }, [open, attribute.id]);

  const addTerm = async () => {
    if (!newTerm.trim()) {
      toast.error("Term name is required.");
      return;
    }
    const res = await createBackendAttributeTerm(attribute.id, { name: newTerm.trim() });
    if (!res) {
      toast.error("Could not add term.");
      return;
    }
    toast.success(`Term "${res.name}" added.`);
    setNewTerm("");
    refresh();
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      return;
    }
    const res = await updateBackendAttributeTerm(attribute.id, editingId, {
      name: editingName.trim(),
    });
    if (!res) {
      toast.error("Could not update term.");
      return;
    }
    toast.success(`Term renamed to "${res.name}".`);
    setEditingId(null);
    setEditingName("");
    refresh();
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }
    const ok = await deleteBackendAttributeTerm(attribute.id, deleting.id);
    if (!ok) {
      toast.error("Could not delete term.");
      return;
    }
    toast.success(`Term "${deleting.name}" deleted.`);
    setDeleting(null);
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms — {attribute.name}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1" data-lenis-prevent>
          <div className="flex items-center gap-2">
            <Input
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder={`Add a term to ${attribute.name}…`}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTerm();
              }}
            />
            <Button size="sm" onClick={addTerm}>
              Add
            </Button>
          </div>
          <div className="divide-y divide-border rounded-md border border-border">
            {loading ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">Loading terms…</p>
            ) : terms.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                No terms yet. Add the first one above.
              </p>
            ) : (
              terms.map((t) => (
                <div key={t.id} className="flex items-center gap-2 px-3 py-2">
                  {editingId === t.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditingName("");
                          }
                        }}
                        className="h-8"
                      />
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" className="h-8" onClick={saveEdit}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">{t.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {t.slug || "no slug"} · {num(t.count)} products
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => {
                          setEditingId(t.id);
                          setEditingName(t.name);
                        }}
                        aria-label={`Rename term ${t.name}`}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(t)}
                        aria-label={`Delete term ${t.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {deleting && (
        <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete term?</AlertDialogTitle>
              <AlertDialogDescription>
                Term "{deleting.name}" will be removed from {attribute.name} in WooCommerce.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete term</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Dialog>
  );
}
