import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import type { ServiceTicket } from "@/lib/types";

export function AddServicePartDialog({ ticket }: { ticket: ServiceTicket }) {
  const { products, invFor, addServicePart } = useStore();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");

  const partsAvailable = useMemo(
    () => products.filter((p) => !p.isService && (invFor(p.id)?.onHand ?? 0) > 0),
    [products, invFor],
  );

  const submit = () => {
    const p = partsAvailable.find((x) => x.id === productId);
    if (!p) {
      toast.error("Select a part with stock on hand.");
      return;
    }
    const n = Math.max(1, Math.floor(Number(qty) || 1));
    const onHand = invFor(p.id)?.onHand ?? 0;
    if (n > onHand) {
      toast.error(`Only ${onHand} unit(s) of ${p.name} on hand.`);
      return;
    }
    addServicePart(ticket.id, p.id, n);
    toast.success(`${n}× ${p.name} added to ${ticket.id}.`);
    setOpen(false);
    setProductId("");
    setQty("1");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          <Plus className="size-3.5" /> Add part
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use a part on {ticket.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Part</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select in-stock part" />
              </SelectTrigger>
              <SelectContent>
                {partsAvailable.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {invFor(p.id)?.onHand ?? 0} on hand
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-part-qty">Quantity</Label>
            <Input
              id="svc-part-qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!productId}>Use part</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceDiagnosisEditor({ ticket }: { ticket: ServiceTicket }) {
  const { updateService } = useStore();
  const [diagnosis, setDiagnosis] = useState(ticket.diagnosis ?? "");
  const [labor, setLabor] = useState(String(ticket.labor));
  const [actual, setActual] = useState(ticket.actualCost != null ? String(ticket.actualCost) : "");

  const save = () => {
    updateService(ticket.id, {
      ...(diagnosis.trim() !== (ticket.diagnosis ?? "") ? { diagnosis: diagnosis.trim() } : {}),
      labor: Math.max(0, Number(labor) || 0),
      ...(actual !== "" ? { actualCost: Math.max(0, Number(actual) || 0) } : { actualCost: null }),
    });
    toast.success(`${ticket.id} saved.`);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1.5">
        <Label htmlFor="svc-diagnosis">Diagnosis</Label>
        <Textarea
          id="svc-diagnosis"
          rows={2}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Root cause and recommended action…"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="svc-labor">Labor (₱)</Label>
          <Input id="svc-labor" type="number" min={0} value={labor} onChange={(e) => setLabor(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="svc-actual">Actual cost (₱)</Label>
          <Input
            id="svc-actual"
            type="number"
            min={0}
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            placeholder="Leave blank until billed"
          />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          Estimated {money(ticket.estimatedCost)}
          {ticket.actualCost != null ? ` · Actual ${money(ticket.actualCost)}` : ""}
        </p>
        <Button size="sm" onClick={save}>Save</Button>
      </div>
    </div>
  );
}
