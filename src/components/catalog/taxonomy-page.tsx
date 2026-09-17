import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
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
import { num } from "@/lib/format";
import type { CatalogTerm } from "@/lib/types";

interface TaxonomyCrud {
  fetchList: () => Promise<CatalogTerm[]>;
  create: (term: Partial<CatalogTerm>) => Promise<CatalogTerm | null>;
  update: (id: string, term: Partial<CatalogTerm>) => Promise<CatalogTerm | null>;
  remove: (id: string) => Promise<boolean>;
}

/** Full brand/tag CRUD page backed by the WooCommerce taxonomy endpoints. */
export function TaxonomyPage({
  title,
  description,
  noun,
  api,
}: {
  title: string;
  description: string;
  noun: string;
  api: TaxonomyCrud;
}) {
  const lower = noun.toLowerCase();
  const [rows, setRows] = useState<CatalogTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogTerm | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [deleting, setDeleting] = useState<CatalogTerm | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .fetchList()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error(`Could not load ${lower}.`);
      })
      .finally(() => setLoading(false));
  }, [api, lower]);

  const reload = () => {
    api
      .fetchList()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error(`Could not load ${lower}.`);
      })
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDialogOpen(true);
  };

  const openEdit = (t: CatalogTerm) => {
    setEditing(t);
    setName(t.name);
    setSlug(t.slug);
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error(`${noun} name is required.`);
      return;
    }
    const payload: Partial<CatalogTerm> = { name: name.trim() };
    const trimmedSlug = slug.trim();
    if (trimmedSlug) payload.slug = trimmedSlug;
    if (editing) {
      const res = await api.update(editing.id, payload);
      if (!res) {
        toast.error(`Could not update ${lower}.`);
        return;
      }
      toast.success(`${noun} "${res.name}" updated.`);
    } else {
      const res = await api.create(payload);
      if (!res) {
        toast.error(`Could not create ${lower}.`);
        return;
      }
      toast.success(`${noun} "${res.name}" created.`);
    }
    setDialogOpen(false);
    reload();
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }
    const name = deleting.name;
    const ok = await api.remove(deleting.id);
    if (!ok) {
      toast.error(`Could not delete ${lower}.`);
      return;
    }
    toast.success(`${noun} "${name}" deleted.`);
    setDeleting(null);
    reload();
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (t) => t.name.toLowerCase().includes(needle) || t.slug.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns: Column<CatalogTerm>[] = [
    {
      key: "name",
      header: "Name",
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{t.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">id {t.id}</p>
        </div>
      ),
      sortValue: (t) => t.name,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (t) => <span className="mono text-xs text-muted-foreground">{t.slug || "—"}</span>,
      sortValue: (t) => t.slug,
    },
    {
      key: "count",
      header: "Products",
      align: "center",
      cell: (t) => <span className="mono text-xs text-muted-foreground">{num(t.count)}</span>,
      sortValue: (t) => t.count,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-24",
      cell: (t) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => openEdit(t)}
            aria-label={`Edit ${noun.toLowerCase()} ${t.name}`}
          >
            <Pencil className="size-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => setDeleting(t)}
                aria-label={`Delete ${noun.toLowerCase()} ${t.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {noun.toLowerCase()}?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{t.name}" will be removed from WooCommerce. Products already using it keep their
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>
                  Delete {noun.toLowerCase()}
                </AlertDialogAction>
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
        title={title}
        description={description}
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" /> New {noun.toLowerCase()}
          </Button>
        }
      />

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder={`Search ${lower}…`} />
          <ResultCount shown={filtered.length} total={rows.length} noun={lower} />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          initialSort={{ key: "name", dir: "asc" }}
          empty={
            <EmptyState
              icon={PackageOpen}
              title={`No ${lower} yet`}
              description={`Add your first ${lower} to start organizing products.`}
              action={
                <Button size="sm" onClick={openAdd}>
                  <Plus className="size-4" /> New {noun.toLowerCase()}
                </Button>
              }
            />
          }
        />
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${noun.toLowerCase()}` : `New ${noun.toLowerCase()}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tax-name">Name</Label>
              <Input
                id="tax-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. ${noun} name…`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tax-slug">Slug</Label>
              <Input
                id="tax-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated if left blank"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>
              {editing ? "Save changes" : "Create " + noun.toLowerCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
