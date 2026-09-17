import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, MinusCircle, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Segmented } from "@/components/nexus/toolbar";
import { ProductPicker } from "@/components/inventory/product-picker";
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
  getLastApiError,
  newIdempotencyKey,
  type AddStockInput,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { num } from "@/lib/format";
import type { Product, Warehouse } from "@/lib/types";

type Mode = "add" | "deduct";

type FormErrors = {
  warehouse?: string | undefined;
  product?: string | undefined;
  quantity?: string | undefined;
  form?: string | undefined;
};

const invalidClass = "border-destructive focus-visible:ring-destructive";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

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
  const [errors, setErrors] = useState<FormErrors>({});
  // One key per dialog session: a retry after a failure reuses it so the
  // backend applies the change at most once.
  const idemRef = useRef(newIdempotencyKey());

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
    setErrors({});
    idemRef.current = newIdempotencyKey();
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
    const next: FormErrors = {};
    if (!targetId) next.warehouse = "Please choose a warehouse.";
    if (!productId) next.product = "Please choose a product.";
    const qty = Number(quantity);
    if (!quantity.trim()) next.quantity = "Quantity is required.";
    else if (!Number.isFinite(qty) || qty <= 0) next.quantity = "Enter a number greater than 0.";
    else if (deducting && qty > available)
      next.quantity = `Only ${num(available)} unit(s) available in this warehouse.`;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    if (deducting) {
      const res = await adjustBackendStock(productId, {
        warehouseId: targetId,
        delta: -qty,
        ...(reference.trim() ? { reference: reference.trim() } : {}),
        ...(notes.trim() ? { note: notes.trim() } : {}),
        idempotencyKey: idemRef.current,
      });
      setSaving(false);
      if (!res) {
        const message = getLastApiError() ?? "Could not deduct stock.";
        setErrors({ form: message });
        toast.error("Could not deduct stock", { description: message });
        return;
      }
      toast.success(`Deducted ${qty} × ${product?.name ?? "product"}.`);
    } else {
      const payload: AddStockInput = {
        productId,
        quantity: qty,
        idempotencyKey: idemRef.current,
      };
      if (costPrice.trim()) payload.costPrice = Number(costPrice.trim());
      if (supplier.trim()) payload.supplier = supplier.trim();
      if (reference.trim()) payload.reference = reference.trim();
      if (notes.trim()) payload.notes = notes.trim();
      const res = await addWarehouseStock(targetId, payload);
      setSaving(false);
      if (!res) {
        const message = getLastApiError() ?? "Could not add stock.";
        setErrors({ form: message });
        toast.error("Could not add stock", { description: message });
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
          onChange={(v) => {
            setMode(v as Mode);
            setErrors({});
          }}
          options={[
            { value: "add", label: "Add" },
            { value: "deduct", label: "Deduct" },
          ]}
        />

        {errors.form && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <div
          className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
          data-lenis-prevent
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="as-product">
              Product <span className="text-destructive">*</span>
            </Label>
            <ProductPicker
              products={products}
              value={productId}
              onChange={(id) => {
                setProductId(id);
                setErrors((e) => ({ ...e, product: "", form: "" }));
              }}
              invalid={Boolean(errors.product)}
            />
            <FieldError message={errors.product} />
          </div>

          {!warehouseId && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="as-warehouse">
                Warehouse <span className="text-destructive">*</span>
              </Label>
              <Select
                value={targetId}
                onValueChange={(v) => {
                  setTargetId(v);
                  setErrors((e) => ({ ...e, warehouse: "", form: "" }));
                }}
              >
                <SelectTrigger id="as-warehouse" className={cn(errors.warehouse && invalidClass)}>
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
              <FieldError message={errors.warehouse} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="as-qty">
              {deducting ? "Quantity to remove" : "Quantity"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="as-qty"
              type="number"
              min={1}
              max={deducting && available > 0 ? available : undefined}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((er) => ({ ...er, quantity: "", form: "" }));
              }}
              placeholder="0"
              className={cn(errors.quantity && invalidClass)}
            />
            <FieldError message={errors.quantity} />
            {productId && targetId && !errors.quantity && (
              <p className="text-xs text-muted-foreground">
                {deducting ? "Available in this warehouse: " : "Currently in this warehouse: "}
                <span className="mono text-foreground">{num(available)}</span>
                {!deducting && quantity.trim() && Number(quantity) > 0 && (
                  <>
                    {" "}
                    → <span className="mono text-success">{num(available + Number(quantity))}</span>
                  </>
                )}
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
