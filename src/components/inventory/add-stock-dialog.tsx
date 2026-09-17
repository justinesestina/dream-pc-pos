import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  addWarehouseStock,
  fetchBackendProducts,
  fetchBackendWarehouses,
  type AddStockInput,
} from "@/lib/api-client";
import type { Product, Warehouse } from "@/lib/types";

export function AddStockDialog({
  open,
  onOpenChange,
  warehouseId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fix the destination warehouse (detail page); omit to let the user pick. */
  warehouseId?: string;
  onDone?: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productId, setProductId] = useState("");
  const [targetId, setTargetId] = useState(warehouseId ?? "");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchBackendProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
    if (!warehouseId) {
      fetchBackendWarehouses()
        .then(setWarehouses)
        .catch(() => setWarehouses([]));
    }
  }, [open, warehouseId]);

  useEffect(() => {
    if (open && warehouseId) setTargetId(warehouseId);
  }, [open, warehouseId]);

  const reset = () => {
    setProductId("");
    setQuantity("");
    setCostPrice("");
    setSupplier("");
    setReference("");
    setNotes("");
    if (!warehouseId) setTargetId("");
  };

  const product = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  );

  const submit = async () => {
    if (!targetId) {
      toast.error("Choose a warehouse.");
      return;
    }
    if (!productId) {
      toast.error("Choose a product.");
      return;
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }
    const payload: AddStockInput = { productId, quantity: qty };
    if (costPrice.trim()) payload.costPrice = Number(costPrice.trim());
    if (supplier.trim()) payload.supplier = supplier.trim();
    if (reference.trim()) payload.reference = reference.trim();
    if (notes.trim()) payload.notes = notes.trim();

    setSaving(true);
    const res = await addWarehouseStock(targetId, payload);
    setSaving(false);
    if (!res) {
      toast.error("Could not add stock.");
      return;
    }
    toast.success(`Added ${qty} × ${product?.name ?? "product"} to stock.`);
    reset();
    onOpenChange(false);
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="size-4 text-info" /> Add stock
          </DialogTitle>
          <DialogDescription>
            Records a stock-in movement and updates the product's warehouse quantity.
          </DialogDescription>
        </DialogHeader>
        <div
          className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
          data-lenis-prevent
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="as-product">Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger id="as-product">
                <SelectValue placeholder="Select a product…" />
              </SelectTrigger>
              <SelectContent>
                {products.slice(0, 200).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.sku ? ` · ${p.sku}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!warehouseId && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="as-warehouse">Warehouse</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger id="as-warehouse">
                  <SelectValue placeholder="Select a warehouse…" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="as-qty">Quantity</Label>
            <Input
              id="as-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="as-cost">Cost price</Label>
            <Input
              id="as-cost"
              type="number"
              min={0}
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="as-supplier">Supplier</Label>
            <Input
              id="as-supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="as-ref">Reference number</Label>
            <Input
              id="as-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="PO / invoice no."
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="as-notes">Notes</Label>
            <Textarea
              id="as-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Add stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
