import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { EmptyState, Panel } from "@/components/nexus/primitives";
import { ResultCount, SearchInput, Toolbar } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageDropzone } from "@/components/products/image-dropzone";
import {
  createBackendCategory,
  deleteBackendCategory,
  fetchBackendCategories,
  updateBackendCategory,
} from "@/lib/api-client";
import { num } from "@/lib/format";
import type { Category } from "@/lib/types";

const NO_PARENT = "__none__";
const DISPLAY_TYPES = ["default", "products", "subcategories", "both"] as const;

export function CategoryPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState(NO_PARENT);
  const [display, setDisplay] = useState<(typeof DISPLAY_TYPES)[number]>("default");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchBackendCategories()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error("Could not load categories.");
      })
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    fetchBackendCategories()
      .then((data) => setRows(data))
      .catch(() => {
        setRows([]);
        toast.error("Could not load categories.");
      })
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setParentId(NO_PARENT);
    setDisplay("default");
    setDescription("");
    setImage("");
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug ?? "");
    setParentId(c.parentId ?? NO_PARENT);
    setDisplay(c.display ?? "default");
    setDescription(c.description ?? "");
    setImage(c.image ?? "");
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    const parent = parentId === NO_PARENT ? "" : parentId;
    if (editing) {
      const payload: Partial<Category> = {
        name: name.trim(),
        parentId: parent,
        display,
      };
      if (slug.trim()) payload.slug = slug.trim();
      if (description.trim()) payload.description = description.trim();
      if (image.trim()) payload.image = image.trim();
      const res = await updateBackendCategory(editing.id, payload);
      if (!res) {
        toast.error("Could not update category.");
        return;
      }
      toast.success(`Category "${res.name}" updated.`);
    } else {
      const payload: Partial<Category> = { name: name.trim(), display };
      const trimmedSlug = slug.trim();
      if (trimmedSlug) payload.slug = trimmedSlug;
      if (parent) payload.parentId = parent;
      if (description.trim()) payload.description = description.trim();
      if (image.trim()) payload.image = image.trim();
      const res = await createBackendCategory(payload);
      if (!res) {
        toast.error("Could not create category.");
        return;
      }
      toast.success(`Category "${res.name}" created.`);
    }
    setDialogOpen(false);
    reload();
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }
    const ok = await deleteBackendCategory(deleting.id);
    if (!ok) {
      toast.error("Could not delete category.");
      return;
    }
    toast.success(`Category "${deleting.name}" deleted.`);
    setDeleting(null);
    reload();
  };

  const parentOptions = rows.filter((c) => !editing || c.id !== editing.id);
  const parentName = (id?: string) => rows.find((c) => c.id === id)?.name;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        (c.slug ?? "").toLowerCase().includes(needle) ||
        (parentName(c.parentId) ?? "").toLowerCase().includes(needle),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q]);

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Name",
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{c.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            id {c.id}
            {c.parentId ? ` · in ${parentName(c.parentId) ?? "—"}` : ""}
          </p>
        </div>
      ),
      sortValue: (c) => c.name,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (c) => <span className="mono text-xs text-muted-foreground">{c.slug || "—"}</span>,
      sortValue: (c) => c.slug ?? "",
    },
    {
      key: "display",
      header: "Display",
      align: "center",
      cell: (c) => <span className="label-tech">{c.display ?? "default"}</span>,
      sortValue: (c) => c.display ?? "default",
    },
    {
      key: "count",
      header: "Products",
      align: "center",
      cell: (c) => <span className="mono text-xs text-muted-foreground">{num(c.count ?? 0)}</span>,
      sortValue: (c) => c.count ?? 0,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-24",
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => openEdit(c)}
            aria-label={`Edit category ${c.name}`}
          >
            <Pencil className="size-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => setDeleting(c)}
                aria-label={`Delete category ${c.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete category?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{c.name}" will be removed from WooCommerce. Products already in it keep their
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Delete category</AlertDialogAction>
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
        title="Categories"
        description="Product categories with hierarchy, display type and images, synced with WooCommerce."
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" /> New category
          </Button>
        }
      />

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search categories…" />
          <ResultCount shown={filtered.length} total={rows.length} noun="categories" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          initialSort={{ key: "name", dir: "asc" }}
          empty={
            <EmptyState
              icon={FolderTree}
              title="No categories yet"
              description="Organize products into categories with display types and images."
              action={
                <Button size="sm" onClick={openAdd}>
                  <Plus className="size-4" /> New category
                </Button>
              }
            />
          }
        />
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <div
            className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
            data-lenis-prevent
          >
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smart TVs, Printers, Laptops…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated if left blank"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-parent">Parent category</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="cat-parent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>— none —</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cat-display">Display type</Label>
              <Select
                value={display}
                onValueChange={(v) => setDisplay(v as (typeof DISPLAY_TYPES)[number])}
              >
                <SelectTrigger id="cat-display">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISPLAY_TYPES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Shown on the storefront category page."
              />
            </div>
            <div className="sm:col-span-2">
              <ImageDropzone label="Category image" imageUrl={image} onChange={setImage} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? "Save changes" : "Create category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
