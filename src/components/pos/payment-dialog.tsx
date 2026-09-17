import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Landmark, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { money, moneyExact } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

const METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "gcash", label: "GCash", icon: Smartphone },
  { id: "bank", label: "Bank transfer", icon: Landmark },
];

export function PaymentDialog({
  open,
  onOpenChange,
  total,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  total: number;
  onConfirm: (method: PaymentMethod, tendered: number, change: number, reference: string) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [tendered, setTendered] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open) {
      setMethod("cash");
      setTendered("");
      setReference("");
    }
  }, [open]);

  const tenderedNum = useMemo(() => {
    const n = Number(tendered);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }, [tendered]);

  const isCash = method === "cash";
  const change = isCash ? Math.max(0, tenderedNum - total) : 0;
  const sufficient = !isCash || tenderedNum >= total;
  const refLabel =
    method === "bank" ? "Transfer reference" : method === "gcash" ? "GCash reference" : "Card reference";
  const refValid = reference.trim().length > 0;
  const canCharge = isCash ? sufficient && tenderedNum > 0 : sufficient && refValid;
  const quickTenders = useMemo(() => {
    const roundUp = (to: number) => Math.ceil(total / to) * to;
    const base = new Set<number>();
    if (total > 0) {
      base.add(total);
      base.add(roundUp(500));
      base.add(roundUp(1000));
      base.add(roundUp(5000));
    }
    return Array.from(base)
      .filter((n) => n >= total)
      .sort((a, b) => a - b)
      .slice(0, 4);
  }, [total]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Take payment</DialogTitle>
          <DialogDescription>
            Select a payment method to complete the sale of{" "}
            <span className="mono text-foreground">{money(total)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-[11px] transition-colors",
                method === m.id
                  ? "border-foreground/40 bg-foreground/10 text-foreground"
                  : "border-border bg-elevated text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              <m.icon className="size-4" />
              {m.label}
            </button>
          ))}
        </div>

        {isCash ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="pos-tendered" className="label-tech">
                Cash received
              </label>
              <Input
                id="pos-tendered"
                type="number"
                inputMode="decimal"
                min={0}
                autoFocus
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
                placeholder="0.00"
                className="h-10 text-right text-lg tabular-nums"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickTenders.map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11.5px]"
                  onClick={() => setTendered(n.toFixed(2))}
                >
                  {n === total ? "Exact" : money(n)}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-elevated px-3 py-2">
              <span className="label-tech">Change</span>
              <span
                className={cn(
                  "mono text-lg tabular-nums",
                  sufficient ? "text-success" : "text-destructive",
                )}
              >
                {moneyExact(change)}
              </span>
            </div>
            {tenderedNum > 0 && !sufficient && (
              <p className="text-[11.5px] text-destructive">
                Received {money(tenderedNum)} — short by {money(total - tenderedNum)}.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="rounded-md border border-border bg-elevated px-3 py-2.5 text-[12.5px] text-muted-foreground">
              {method === "card" && "Card payment is approved instantly."}
              {method === "gcash" && "Enter the reference from the GCash prompt before confirming."}
              {method === "bank" && "Bank transfer is marked paid on confirmation."}
            </p>
            <div className="space-y-1.5">
              <label htmlFor="pos-reference" className="label-tech">
                {refLabel}
              </label>
              <Input
                id="pos-reference"
                autoFocus
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={method === "card" ? "Last 4 digits" : "e.g. GCASH-123456 / BPI-0001"}
                className="h-10 tabular-nums"
              />
              {!refValid && (
                <p className="text-[11.5px] text-destructive">
                  A reference is required for {method} payments.
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canCharge}
            onClick={() => {
              onConfirm(method, isCash ? tenderedNum : total, change, isCash ? "" : reference.trim());
              onOpenChange(false);
            }}
          >
            Charge {money(total)}
            {change > 0 ? ` · change ${moneyExact(change)}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
