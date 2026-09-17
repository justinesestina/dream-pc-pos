import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  createBackendTransfer,
  fetchBackendProducts,
  fetchBackendWarehouses,
  fetchWarehouseStock,
  getLastApiError,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { num } from "@/lib/format";
import type { Product, Warehouse } from "@/lib/types";

type FormErrors = {
  from?: string | undefined;
  to?: string | undefined;
  product?: string | undefined;
  quantity?: string | undefined;
  form?: string | undefined;
};

const invalidClass = "border-destructive focus-visible:ring-destructive";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

export function TransferStockDialog({
  open,
  onOpenChange,
  initialFromId,
  initialToId,
  initialProductId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFromId?: string;
  initialToId?: string;
  initialProductId?: string;
  onDone?: () => void;
}) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fromId, setFromId] = useState(initialFromId ?? "");
  const [toId, setToId] = useState(initialToId ?? "");
  const [productId, setProductId] = useState(initialProductId ?? "");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;
    setFromId(initialFromId ?? "");
    setToId(initialToId ?? "");
    setProductId(initialProductId ?? "");
    setQuantity("");
    setNotes("");
    setErrors({});
    fetchBackendWarehouses()
      .then(setWarehouses)
      .catch(() => setWarehouses([]));
    fetchBackendProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [open, initialFromId, initialToId, initialProductId]);

  useEffect(() => {
    if (!open || !fromId) {
      setStockMap({});
      return;
    }
    let cancelled = false;
    fetchWarehouseStock(fromId)
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
  }, [open, fromId]);

  const available = useMemo(
    () => (productId ? (stockMap[productId] ?? 0) : 0),
    [stockMap, productId],
  );

  const submit = async () => {
    const next: FormErrors = {};
    if (!fromId) next.from = "Choose a source warehouse.";
    if (!toId) next.to = "Choose a destination warehouse.";
    else if (fromId && fromId === toId)
      next.to = "Source and destination must be different warehouses.";
    if (!productId) next.product = "Please choose a product.";
    const qty = Number(quantity);
    if (!quantity.trim()) next.quantity = "Quantity is required.";
    else if (!Number.isFinite(qty) || qty <= 0) next.quantity = "Enter a number greater than 0.";
    else if (productId && fromId && qty > available)
      next.quantity = `Only ${num(available)} unit(s) available in the source warehouse.`;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const payload = { fromWarehouseId: fromId, toWarehouseId: toId, productId, quantity: qty };
    const res = await createBackendTransfer(
      notes.trim() ? { ...payload, notes: notes.trim() } : payload,
    );
    setSaving(false);
    if (!res) {
      const message = getLastApiError() ?? "Could not create transfer.";
      setErrors({ form: message });
      toast.error("Could not create transfer", { description: message });
      return;
    }
    toast.success("Transfer created — approve & complete it on the Stock Transfers page.");
    onOpenChange(false);
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-info" /> New stock transfer
          </DialogTitle>
          <DialogDescription>
            Creates a draft transfer. Approve & complete it on the Stock Transfers page to move the
            stock.
          </DialogDescription>
        </DialogHeader>

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
          <div className="space-y-1.5">
            <Label htmlFor="ts-from">
              From warehouse <span className="text-destructive">*</span>
            </Label>
            <Select
              value={fromId}
              onValueChange={(v) => {
                setFromId(v);
                setErrors((e) => ({ ...e, from: "", form: "" }));
              }}
            >
              <SelectTrigger id="ts-from" className={cn(errors.from && invalidClass)}>
                <SelectValue placeholder="Source…" />
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
            <FieldError message={errors.from} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ts-to">
              To warehouse <span className="text-destructive">*</span>
            </Label>
            <Select
              value={toId}
              onValueChange={(v) => {
                setToId(v);
                setErrors((e) => ({ ...e, to: "", form: "" }));
              }}
            >
              <SelectTrigger id="ts-to" className={cn(errors.to && invalidClass)}>
                <SelectValue placeholder="Destination…" />
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
            <FieldError message={errors.to} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ts-product">
              Product <span className="text-destructive">*</span>
            </Label>
            <ProductPicker
              products={products}
              value={productId}
              stockByProduct={stockMap}
              stockNoun={fromId ? "in source" : "in stock"}
              onChange={(id) => {
                setProductId(id);
                setErrors((e) => ({ ...e, product: "", quantity: "", form: "" }));
              }}
              invalid={Boolean(errors.product)}
            />
            <FieldError message={errors.product} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ts-qty">
              Quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ts-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((er) => ({ ...er, quantity: "", form: "" }));
              }}
              placeholder="0"
              className={cn(errors.quantity && invalidClass)}
            />
            <FieldError message={errors.quantity} />
            {fromId && productId && !errors.quantity && (
              <p className="text-xs text-muted-foreground">
                Available in source: <span className="mono text-foreground">{num(available)}</span>
              </p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ts-notes">Notes</Label>
            <Textarea
              id="ts-notes"
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
            {saving ? "Creating…" : "Create transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
