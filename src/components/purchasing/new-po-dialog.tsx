import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useOps } from "@/lib/ops-store";
import { money } from "@/lib/format";

interface DraftLine {
  productId: string;
  qty: string;
  unitCost: string;
}

export function NewPurchaseOrderDialog() {
  const { products } = useStore();
  const { suppliers, createPurchaseOrder } = useOps();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string>("");
  const [expectedAt, setExpectedAt] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qty: "1", unitCost: "" }]);

  const total = useMemo(
    () =>
      lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unitCost) || 0), 0),
    [lines],
  );

  const reset = () => {
    setSupplierId("");
    setExpectedAt("");
    setLines([{ productId: "", qty: "1", unitCost: "" }]);
  };

  const updateLine = (i: number, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const addLine = () => setLines((prev) => [...prev, { productId: "", qty: "1", unitCost: "" }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!supplierId) {
      toast.error("Select a supplier.");
      return;
    }
    if (!expectedAt) {
      toast.error("Set an expected delivery date.");
      return;
    }
    const validLines = lines
      .filter((l) => l.productId && Number(l.qty) > 0)
      .map((l) => {
        const p = products.find((x) => x.id === l.productId)!;
        return {
          productId: p.id,
          name: p.name,
          sku: p.sku,
          qty: Number(l.qty),
          unitCost: Number(l.unitCost) || p.cost,
        };
      });
    if (validLines.length === 0) {
      toast.error("Add at least one line with a product and quantity.");
      return;
    }
    const po = createPurchaseOrder({
      supplierId,
      lines: validLines,
      expectedAt: new Date(expectedAt).toISOString(),
    });
    if (!po) {
      toast.error("Could not create purchase order.");
      return;
    }
    toast.success(`Purchase order ${po.id} created.`);
    setOpen(false);
    reset();
    navigate({ to: "/purchasing/$poId", params: { poId: po.id } });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5 text-xs">
          <Plus className="size-3.5" /> New purchase order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New purchase order</DialogTitle>
          <DialogDescription>
            Pick a supplier, add product lines and set the expected delivery date.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expected">Expected delivery</Label>
              <Input
                id="expected"
                type="date"
                value={expectedAt}
                onChange={(e) => setExpectedAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Lines</Label>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addLine}>
                <Plus className="size-3.5" /> Add line
              </Button>
            </div>
            <div className="space-y-2 rounded-md border border-border p-2">
              {lines.map((l, i) => {
                const product = products.find((p) => p.id === l.productId);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Select
                      value={l.productId}
                      onValueChange={(v) => {
                        const p = products.find((x) => x.id === v);
                        updateLine(i, { productId: v, unitCost: p ? String(p.cost) : l.unitCost });
                      }}
                    >
                      <SelectTrigger className="h-8 flex-1 text-xs">
                        <SelectValue placeholder="Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => updateLine(i, { qty: e.target.value })}
                      className="h-8 w-16 text-xs"
                      placeholder="Qty"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={l.unitCost}
                      onChange={(e) => updateLine(i, { unitCost: e.target.value })}
                      className="h-8 w-24 text-xs"
                      placeholder={product ? String(product.cost) : "Cost"}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-muted-foreground"
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mono text-right text-xs text-muted-foreground">
            Estimated total: <span className="text-foreground">{money(total)}</span>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create purchase order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
