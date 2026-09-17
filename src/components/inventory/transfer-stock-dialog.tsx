import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";
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
  createBackendTransfer,
  fetchBackendProducts,
  fetchBackendWarehouses,
} from "@/lib/api-client";
import type { Product, Warehouse } from "@/lib/types";

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFromId(initialFromId ?? "");
    setToId(initialToId ?? "");
    setProductId(initialProductId ?? "");
    setQuantity("");
    setNotes("");
    fetchBackendWarehouses()
      .then(setWarehouses)
      .catch(() => setWarehouses([]));
    fetchBackendProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [open, initialFromId, initialToId, initialProductId]);

  const submit = async () => {
    if (!fromId || !toId) {
      toast.error("Choose a source and destination warehouse.");
      return;
    }
    if (fromId === toId) {
      toast.error("Source and destination must be different warehouses.");
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
    const payload = { fromWarehouseId: fromId, toWarehouseId: toId, productId, quantity: qty };
    const res = await createBackendTransfer(
      notes.trim() ? { ...payload, notes: notes.trim() } : payload,
    );
    setSaving(false);
    if (!res) {
      toast.error("Could not create transfer.");
      return;
    }
    toast.success("Transfer created — approve and complete it on the Stock Transfers page.");
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
            Creates a draft transfer. Approve then complete it to actually move the stock.
          </DialogDescription>
        </DialogHeader>
        <div
          className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
          data-lenis-prevent
        >
          <div className="space-y-1.5">
            <Label htmlFor="ts-from">From warehouse</Label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger id="ts-from">
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ts-to">To warehouse</Label>
            <Select value={toId} onValueChange={setToId}>
              <SelectTrigger id="ts-to">
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
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ts-product">Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger id="ts-product">
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
          <div className="space-y-1.5">
            <Label htmlFor="ts-qty">Quantity</Label>
            <Input
              id="ts-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
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
