import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

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

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
  }, [open, category]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    if (isEdit && category) {
      const res = store.updateCategory(category.id, { name });
      if (!res.ok) {
        toast.error(res.error ?? "Could not update category.");
        return;
      }
      toast.success(`Category renamed to "${name.trim()}".`);
    } else {
      const res = store.createCategory(name);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Rename category" : "New category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
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
