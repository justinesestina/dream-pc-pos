import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MinusCircle, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Segmented } from "@/components/nexus/toolbar";
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
  adjustBackendStock,
  fetchBackendProducts,
  fetchBackendWarehouses,
  fetchWarehouseStock,
  type AddStockInput,
} from "@/lib/api-client";
import { num } from "@/lib/format";
import type { Product, Warehouse } from "@/lib/types";

type Mode = "add" | "deduct";

export function AddStockDialog({
  open,
  onOpenChange,
  warehouseId,
  initialMode = "add",
  initialProductId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fix the destination warehouse (detail page); omit to let the user pick. */
  warehouseId?: string;
  initialMode?: Mode;
  initialProductId?: string;
  onDone?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productId, setProductId] = useState(initialProductId ?? "");
  const [targetId, setTargetId] = useState(warehouseId ?? "");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    if (initialProductId) setProductId(initialProductId);
    setTargetId(warehouseId ?? "");
    setQuantity("");
    setCostPrice("");
    setSupplier("");
    setReference("");
    setNotes("");
  }, [open, initialMode, initialProductId, warehouseId]);

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
    if (!open || !targetId) {
      setStockMap({});
      return;
    }
    let cancelled = false;
    fetchWarehouseStock(targetId)
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const r of rows) map[r.productId] = r.quantity;
        setStockMap(map);
      })
      .catch(() => !cancelled && setStockMap({}));
    return () => {
      cancelled = true;
    };
  }, [open, targetId]);

  const product = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  );
  const available = productId ? (stockMap[productId] ?? 0) : 0;
  const deducting = mode === "deduct";

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

    setSaving(true);
    if (deducting) {
      const res = await adjustBackendStock(productId, {
        warehouseId: targetId,
        delta: -qty,
        ...(reference.trim() ? { reference: reference.trim() } : {}),
        ...(notes.trim() ? { note: notes.trim() } : {}),
      });
      setSaving(false);
      if (!res) {
        toast.error("Could not deduct stock. Check the available quantity.");
        return;
      }
      toast.success(`Deducted ${qty} × ${product?.name ?? "product"}.`);
    } else {
      const payload: AddStockInput = { productId, quantity: qty };
      if (costPrice.trim()) payload.costPrice = Number(costPrice.trim());
      if (supplier.trim()) payload.supplier = supplier.trim();
      if (reference.trim()) payload.reference = reference.trim();
      if (notes.trim()) payload.notes = notes.trim();
      const res = await addWarehouseStock(targetId, payload);
      setSaving(false);
      if (!res) {
        toast.error("Could not add stock.");
        return;
      }
      toast.success(`Added ${qty} × ${product?.name ?? "product"} to stock.`);
    }
    onOpenChange(false);
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {deducting ? (
              <MinusCircle className="size-4 text-destructive" />
            ) : (
              <PackagePlus className="size-4 text-info" />
            )}
            {deducting ? "Deduct stock" : "Add stock"}
          </DialogTitle>
          <DialogDescription>
            {deducting
              ? "Removes stock and logs a movement. WooCommerce sellable stock is recalculated."
              : "Records a stock-in movement and updates the product's warehouse quantity."}
          </DialogDescription>
        </DialogHeader>

        <Segmented
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          options={[
            { value: "add", label: "Add" },
            { value: "deduct", label: "Deduct" },
          ]}
        />

        <div
          className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
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
                      {w.type === "selling" ? " · WooCommerce" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="as-qty">{deducting ? "Quantity to remove" : "Quantity"}</Label>
            <Input
              id="as-qty"
              type="number"
              min={1}
              max={deducting && available > 0 ? available : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
            {deducting && productId && targetId && (
              <p className="text-xs text-muted-foreground">
                Available in this warehouse:{" "}
                <span className="mono text-foreground">{num(available)}</span>
              </p>
            )}
          </div>

          {!deducting && (
            <>
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
            </>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="as-ref">Reference number</Label>
            <Input
              id="as-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={deducting ? "Ticket / reason ref." : "PO / invoice no."}
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
          <Button
            onClick={submit}
            disabled={saving}
            variant={deducting ? "destructive" : "default"}
          >
            {saving ? "Saving…" : deducting ? "Deduct stock" : "Add stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
