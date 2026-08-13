import { useState } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdjustStockDialog({
  productId,
  productName,
  trigger,
}: {
  productId: string;
  productName: string;
  trigger?: React.ReactNode;
}) {
  const { adjustStock } = useStore();
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("0");
  const [note, setNote] = useState("");

  const submit = () => {
    const n = Number(delta);
    if (!Number.isFinite(n) || n === 0) {
      toast.error("Enter a non-zero quantity.");
      return;
    }
    if (!note.trim()) {
      toast.error("A note is required for stock adjustments.");
      return;
    }
    adjustStock(productId, n, note.trim());
    toast.success(`Stock adjusted for ${productName} (${n > 0 ? "+" : ""}${n})`);
    setOpen(false);
    setDelta("0");
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger ?? (
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
            <SlidersHorizontal className="size-3.5" /> Adjust
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock — {productName}</DialogTitle>
          <DialogDescription>
            Positive values increase on-hand quantity, negative values decrease it. This is recorded
            as a manual adjustment movement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="delta">Quantity delta</Label>
            <Input
              id="delta"
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className={cn("mono")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for adjustment (e.g. cycle count correction, damage found)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
