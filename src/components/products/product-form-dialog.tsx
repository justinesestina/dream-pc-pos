import { useEffect, useState } from "react";
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
import type { Product, ProductCategory } from "@/lib/types";

const CATEGORIES: ProductCategory[] = [
  "CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case", "Cooling",
  "Fans", "Monitor", "Keyboard", "Mouse", "Headset", "Networking", "Accessories",
  "Software", "Services",
];

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
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Accessories");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [warranty, setWarranty] = useState("0");
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");
  const [serialTracked, setSerialTracked] = useState(false);
  const [isService, setIsService] = useState(false);
  const [specs, setSpecs] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(product?.name ?? "");
    setSku(product?.sku ?? "");
    setBrand(product?.brand ?? "");
    setCategory(product?.category ?? "Accessories");
    setPrice(product ? String(product.price) : "");
    setCost(product ? String(product.cost) : "");
    setWarranty(product ? String(product.warrantyMonths) : "0");
    setLocation(product?.location ?? "");
    setSupplier(product?.supplier ?? "");
    setSerialTracked(product?.serialTracked ?? false);
    setIsService(product?.isService ?? false);
    setSpecs(product ? specsToText(product.specs) : "");
  }, [open, product]);

  const submit = () => {
    if (!name.trim() || !sku.trim()) {
      toast.error("Name and SKU are required.");
      return;
    }
    const priceNum = Number(price) || 0;
    const costNum = Number(cost) || 0;
    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      brand: brand.trim() || "Generic",
      category,
      price: priceNum,
      cost: costNum,
      warrantyMonths: Math.max(0, Math.floor(Number(warranty) || 0)),
      location: location.trim() || "—",
      supplier: supplier.trim() || "—",
      serialTracked,
      isService,
      specs: parseSpecs(specs),
    };
    if (isEdit && product) {
      store.updateProduct(product.id, payload);
      toast.success(`${product.name} updated.`);
    } else {
      const created = store.createProduct(payload);
      toast.success(`${created.name} added to the catalog.`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. RTX 5070 Gaming OC" />
          </div>
          <div className="space-y-1.5">
            <Label>SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="GPU-RTX5070" />
          </div>
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Gigabyte" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Selling price (₱)</Label>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cost (₱)</Label>
            <Input type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Warranty (months)</Label>
            <Input type="number" min={0} value={warranty} onChange={(e) => setWarranty(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Nexlogic Distribution" />
          </div>
          <div className="space-y-1.5">
            <Label>Bin location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. A1-01" />
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Checkbox checked={serialTracked} onCheckedChange={(v) => setSerialTracked(v === true)} />
              Serial tracked
            </label>
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Checkbox checked={isService} onCheckedChange={(v) => setIsService(v === true)} />
              Service item
            </label>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Specifications (key: value, one per line)</Label>
            <Textarea rows={3} value={specs} onChange={(e) => setSpecs(e.target.value)} placeholder={"socket: AM5\nmemoryType: DDR5\ntdp: 120"} />
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
