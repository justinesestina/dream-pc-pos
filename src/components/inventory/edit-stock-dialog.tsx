import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  fetchWarehouseStock,
  getLastApiError,
  newIdempotencyKey,
  setWarehouseStock,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { num } from "@/lib/format";
import type { Product, Warehouse } from "@/lib/types";

type FormErrors = {
  warehouse?: string | undefined;
  product?: string | undefined;
  quantity?: string | undefined;
  cost?: string | undefined;
  form?: string | undefined;
};

const invalidClass = "border-destructive focus-visible:ring-destructive";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

/**
 * Inline row editor — set a product's absolute quantity and unit cost inside a
 * warehouse. Stock changes are logged as an adjustment movement; WooCommerce
 * sellable stock is recalculated from the selling warehouse(s).
 */
export function EditStockDialog({
  open,
  onOpenChange,
  warehouseId,
  initialWarehouseId,
  productId,
  initialQuantity,
  initialCost,
  warehouses = [],
  products = [],
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lock the warehouse (detail page). */
  warehouseId?: string | undefined;
  /** Pre-select a warehouse while still letting the user switch it. */
  initialWarehouseId?: string | undefined;
  productId?: string | undefined;
  initialQuantity?: number | undefined;
  initialCost?: number | undefined;
  warehouses?: Warehouse[];
  products?: Product[];
  onDone?: () => void;
}) {
  const [targetWarehouseId, setTargetWarehouseId] = useState(warehouseId ?? "");
  const [targetProductId, setTargetProductId] = useState(productId ?? "");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const idemRef = useRef(newIdempotencyKey());

  useEffect(() => {
    if (!open) return;
    setTargetWarehouseId(warehouseId ?? initialWarehouseId ?? "");
    setTargetProductId(productId ?? "");
    setQuantity(initialQuantity === undefined ? "" : String(initialQuantity));
    setCost(initialCost === undefined ? "" : String(initialCost));
    setErrors({});
    idemRef.current = newIdempotencyKey();
  }, [open, warehouseId, initialWarehouseId, productId, initialQuantity, initialCost]);

  // When the warehouse (or product) is changed in the dialog, refill from stock.
  useEffect(() => {
    if (!open || warehouseId || !targetWarehouseId || !targetProductId) return;
    let cancelled = false;
    fetchWarehouseStock(targetWarehouseId)
      .then((rows) => {
        if (cancelled) return;
        const row = rows.find((r) => r.productId === targetProductId);
        setQuantity(row ? String(row.quantity) : "0");
        setCost(row?.cost === undefined ? "" : String(row.cost));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, warehouseId, targetWarehouseId, targetProductId]);

  const submit = async () => {
    const next: FormErrors = {};
    if (!targetWarehouseId) next.warehouse = "Choose a warehouse.";
    if (!targetProductId) next.product = "Choose a product.";
    const qty = Number(quantity);
    if (quantity.trim() === "" || !Number.isFinite(qty) || qty < 0) {
      next.quantity = "Enter a quantity of 0 or more.";
    }
    const costValue = cost.trim() === "" ? undefined : Number(cost);
    if (costValue !== undefined && (!Number.isFinite(costValue) || costValue < 0)) {
      next.cost = "Enter a valid cost, or leave blank.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const res = await setWarehouseStock(targetWarehouseId, targetProductId, {
      quantity: Math.floor(qty),
      ...(costValue !== undefined ? { costPrice: costValue } : {}),
      idempotencyKey: idemRef.current,
    });
    setSaving(false);
    if (!res) {
      const message = getLastApiError() ?? "Could not update stock.";
      setErrors({ form: message });
      toast.error("Could not update stock", { description: message });
      return;
    }
    toast.success("Stock updated.");
    onOpenChange(false);
    onDone?.();
  };

  const product = products.find((p) => p.id === targetProductId);
  const value =
    Number(quantity) > 0 && Number(cost) > 0 ? Number(quantity) * Number(cost) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-info" /> Edit stock
          </DialogTitle>
          <DialogDescription>
            Set the absolute quantity and unit cost. Changes are logged as a movement.
          </DialogDescription>
        </DialogHeader>

        {errors.form && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1" data-lenis-prevent>
          {!warehouseId && (
            <div className="space-y-1.5">
              <Label htmlFor="es-warehouse">
                Warehouse <span className="text-destructive">*</span>
              </Label>
              <Select
                value={targetWarehouseId}
                onValueChange={(v) => {
                  setTargetWarehouseId(v);
                  setErrors((e) => ({ ...e, warehouse: "", form: "" }));
                }}
              >
                <SelectTrigger id="es-warehouse" className={cn(errors.warehouse && invalidClass)}>
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

          {!productId && (
            <div className="space-y-1.5">
              <Label htmlFor="es-product">
                Product <span className="text-destructive">*</span>
              </Label>
              <ProductPicker
                products={products}
                value={targetProductId}
                onChange={(id) => {
                  setTargetProductId(id);
                  setErrors((e) => ({ ...e, product: "", form: "" }));
                }}
                invalid={Boolean(errors.product)}
              />
              <FieldError message={errors.product} />
            </div>
          )}

          {product && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-elevated px-3 py-2">
              <span className="text-sm text-foreground">{product.name}</span>
              {product.sku && (
                <span className="mono text-[11px] text-muted-foreground">{product.sku}</span>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="es-qty">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="es-qty"
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setErrors((er) => ({ ...er, quantity: "", form: "" }));
                }}
                className={cn(errors.quantity && invalidClass)}
              />
              <FieldError message={errors.quantity} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="es-cost">Unit cost</Label>
              <Input
                id="es-cost"
                type="number"
                min={0}
                step="0.01"
                value={cost}
                onChange={(e) => {
                  setCost(e.target.value);
                  setErrors((er) => ({ ...er, cost: "", form: "" }));
                }}
                placeholder="Optional"
                className={cn(errors.cost && invalidClass)}
              />
              <FieldError message={errors.cost} />
            </div>
          </div>

          {value !== undefined && (
            <p className="text-xs text-muted-foreground">
              Line value: <span className="mono text-foreground">{num(value)}</span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
