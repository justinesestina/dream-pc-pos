import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useStore } from "@/lib/store";
import type { Product, ProductType } from "@/lib/types";

function parseSpecs(raw: string): Product["specs"] {
  const out: Product["specs"] = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const rawVal = line.slice(idx + 1).trim();
    if (!key) continue;
    const numVal = Number(rawVal);
    out[key] = rawVal !== "" && !Number.isNaN(numVal) ? numVal : rawVal;
  }
  return out;
}

function specsToText(specs: Product["specs"]) {
  return Object.entries(specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: Product | undefined;
}) {
  const store = useStore();
  const isEdit = Boolean(product);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState<ProductType>("product");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [onHand, setOnHand] = useState("0");
  const [reorderPoint, setReorderPoint] = useState("4");
  const [warranty, setWarranty] = useState("0");
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");
  const [serialTracked, setSerialTracked] = useState(false);
  const [specs, setSpecs] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = useMemo(
    () =>
      store.categories
        .filter((c) => !c.archived || c.id === product?.categoryId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [store.categories, product?.categoryId],
  );

  useEffect(() => {
    if (!open) return;
    const inv = product ? store.invFor(product.id) : undefined;
    setName(product?.name ?? "");
    setImageUrl(product?.imageUrl ?? "");
    setSku(product?.sku ?? "");
    setBrand(product?.brand ?? "");
    setCategoryId(product?.categoryId ?? store.categories.find((c) => !c.archived)?.id ?? "");
    setProductType(product?.productType ?? (product?.isService ? "service" : "product"));
    setDescription(product?.description ?? "");
    setPrice(product ? String(product.price) : "");
    setCost(product ? String(product.cost) : "");
    setOnHand(product ? String(inv?.onHand ?? 0) : "0");
    setReorderPoint(product ? String(inv?.reorderPoint ?? 4) : "4");
    setWarranty(product ? String(product.warrantyMonths) : "0");
    setLocation(product?.location ?? "");
    setSupplier(product?.supplier ?? "");
    setSerialTracked(product?.serialTracked ?? false);
    setSpecs(product ? specsToText(product.specs) : "");
  }, [open, product, store]);

  const submit = () => {
    if (!name.trim() || !sku.trim()) {
      toast.error("Name and SKU are required.");
      return;
    }
    if (!categoryId) {
      toast.error("Select a category.");
      return;
    }
    const priceNum = Number(price) || 0;
    const costNum = Number(cost) || 0;
    const onHandNum = Math.max(0, Math.floor(Number(onHand) || 0));
    const reorderNum = Math.max(0, Math.floor(Number(reorderPoint) || 0));
    const payload = {
      name: name.trim(),
      imageUrl: imageUrl.trim() || undefined,
      sku: sku.trim().toUpperCase(),
      brand: brand.trim() || "Generic",
      categoryId,
      productType,
      isService: productType === "service",
      description: description.trim() || undefined,
      price: priceNum,
      cost: costNum,
      warrantyMonths: Math.max(0, Math.floor(Number(warranty) || 0)),
      location: location.trim() || "—",
      supplier: supplier.trim() || "—",
      serialTracked,
      specs: parseSpecs(specs),
    };
    if (isEdit && product) {
      const res = store.updateProduct(product.id, payload, { onHand: onHandNum, reorderPoint: reorderNum });
      if (!res.ok) {
        toast.error(res.error ?? "Could not update product.");
        return;
      }
      toast.success(`${product.name} updated.`);
    } else {
      const res = store.createProduct(payload, { onHand: onHandNum, reorderPoint: reorderNum });
      if (!res.ok) {
        toast.error(res.error ?? "Could not add product.");
        return;
      }
      toast.success(`${res.product?.name} added to the catalog.`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>
        <div
          className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
          data-lenis-prevent
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pf-name">Name</Label>
            <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. RTX 5070 Gaming OC" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-image">Image URL</Label>
            <Input id="pf-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-sku">SKU</Label>
            <Input id="pf-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="GPU-RTX5070" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-brand">Brand</Label>
            <Input id="pf-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Gigabyte" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="pf-category">
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-type">Product type</Label>
            <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
              <SelectTrigger id="pf-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="bundle">Bundle / Package</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-price">Selling price (₱)</Label>
            <Input id="pf-price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-cost">Cost (₱)</Label>
            <Input id="pf-cost" type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-onhand">Stock on hand</Label>
            <Input id="pf-onhand" type="number" min={0} value={onHand} onChange={(e) => setOnHand(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-reorder">Reorder point</Label>
            <Input id="pf-reorder" type="number" min={0} value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-warranty">Warranty (months)</Label>
            <Input id="pf-warranty" type="number" min={0} value={warranty} onChange={(e) => setWarranty(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-supplier">Supplier</Label>
            <Input id="pf-supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Nexlogic Distribution" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-location">Bin location</Label>
            <Input id="pf-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. A1-01" />
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Checkbox checked={serialTracked} onCheckedChange={(v) => setSerialTracked(v === true)} />
              Serial tracked
            </label>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pf-desc">Description</Label>
            <Textarea id="pf-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description shown on the product page." />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pf-local-image">Upload Image</Label>
            <Input
              id="pf-local-image"
              type="file"
              accept="image/*"
              className="cursor-pointer"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("Image file size must be less than 5MB");
                  return;
                }

                setUploading(true);

                // Try backend upload first (sends to WordPress media library)
                try {
                  const { uploadImageToBackend } = await import("@/lib/api-client");
                  const result = await uploadImageToBackend(file);
                  if (result.ok && result.url) {
                    setImageUrl(result.url);
                    setUploading(false);
                    toast.success("Image uploaded to WordPress media library!");
                    return;
                  }
                  // Backend failed — fall through to local base64
                  console.warn("Backend upload failed, using local fallback:", result.error);
                } catch {
                  console.warn("Backend unreachable, using local fallback");
                }

                // Fallback: save as base64 data URL locally
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (typeof reader.result === "string") {
                    setImageUrl(reader.result);
                    toast.success("Image loaded locally (backend unavailable)");
                  }
                  setUploading(false);
                };
                reader.onerror = () => {
                  toast.error("Failed to read image file");
                  setUploading(false);
                };
                reader.readAsDataURL(file);
              }}
            />
            {uploading && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-info/30 bg-info/10 px-3 py-2 text-xs text-info">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Uploading to WordPress…
              </div>
            )}
            {imageUrl && !uploading && (
              <div className="mt-2 flex items-center gap-3 rounded-md border p-2.5 bg-muted/30">
                <div className="relative h-20 w-20 overflow-hidden rounded-md border border-border bg-muted/40 p-1 shrink-0 flex items-center justify-center shadow-xs">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 overflow-hidden text-xs space-y-1">
                  <p className="font-semibold text-foreground">Image Preview</p>
                  <p className="text-muted-foreground truncate">
                    {imageUrl.startsWith("data:") ? "Local File Upload" : imageUrl}
                  </p>
                  <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Ready to save
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setImageUrl("")}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pf-specs">Specifications (key: value, one per line)</Label>
            <Textarea id="pf-specs" rows={3} value={specs} onChange={(e) => setSpecs(e.target.value)} placeholder={"socket: AM5\nmemoryType: DDR5\ntdp: 120"} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{isEdit ? "Save changes" : "Add product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
