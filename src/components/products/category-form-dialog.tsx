import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { ImageDropzone } from "@/components/products/image-dropzone";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

const NO_PARENT = "__none__";

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category?: Category | undefined;
}) {
  const store = useStore();
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState(NO_PARENT);
  const [display, setDisplay] = useState<NonNullable<Category["display"]>>("default");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const parentOptions = store.categories.filter((c) => !c.archived && c.id !== category?.id);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setParentId(category?.parentId ?? NO_PARENT);
    setDisplay(category?.display ?? "default");
    setDescription(category?.description ?? "");
    setImage(category?.image ?? "");
  }, [open, category]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    const extra = {
      slug: slug.trim() || undefined,
      parentId: parentId === NO_PARENT ? undefined : parentId,
      display,
      description: description.trim() || undefined,
      image: image.trim() || undefined,
    };
    if (isEdit && category) {
      const res = store.updateCategory(category.id, { name, ...extra });
      if (!res.ok) {
        toast.error(res.error ?? "Could not update category.");
        return;
      }
      toast.success(`Category "${name.trim()}" updated.`);
    } else {
      const res = store.createCategory(name, extra);
      if (!res.ok) {
        toast.error(res.error ?? "Could not create category.");
        return;
      }
      toast.success(`Category "${res.category?.name}" created.`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2" data-lenis-prevent>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cf-name">Name</Label>
            <Input
              id="cf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smart TVs, Printers, Laptops…"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-slug">Slug</Label>
            <Input id="cf-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated if left blank" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-parent">Parent category</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="cf-parent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PARENT}>— none —</SelectItem>
                {parentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cf-display">Display type</Label>
            <Select value={display} onValueChange={(v) => setDisplay(v as typeof display)}>
              <SelectTrigger id="cf-display">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="subcategories">Subcategories</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cf-desc">Description</Label>
            <Textarea id="cf-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Shown on the storefront category page." />
          </div>
          <div className="sm:col-span-2">
            <ImageDropzone label="Category image" imageUrl={image} onChange={setImage} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{isEdit ? "Save changes" : "Create category"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
