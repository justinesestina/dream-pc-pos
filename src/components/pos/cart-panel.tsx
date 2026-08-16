import { useState } from "react";
import { Minus, Pause, Play, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState, Mono, Panel, PanelHeader } from "@/components/nexus/primitives";
import { TotalsRows } from "@/components/nexus/detail";
import { CustomerSelect } from "./customer-select";
import { PaymentDialog } from "./payment-dialog";
import { useStore, computeTotals } from "@/lib/store";
import { money, moneyExact, relative, VAT_RATE } from "@/lib/format";
import type { PaymentMethod, Product } from "@/lib/types";

function SerialPicker({
  product,
  qty,
  current,
  onApply,
}: {
  product: Product;
  qty: number;
  current: string[];
  onApply: (serials: string[]) => void;
}) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [manual, setManual] = useState("");
  const available = store.availableSerialsOf(product.id);
  const missing = Math.max(0, qty - current.length);

  const toggle = (ser: string) => {
    setDraft((d) => {
      const has = d.includes(ser);
      if (has) return d.filter((x) => x !== ser);
      if (d.length >= qty) {
        toast.error(`Up to ${qty} serial(s) for ${product.name}.`);
        return d;
      }
      return [...d, ser];
    });
  };

  const addManual = () => {
    const parts = manual
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setDraft((d) => {
      const next = [...d];
      for (const p of parts) {
        if (next.length >= qty) break;
        if (!next.includes(p)) next.push(p);
      }
      return next;
    });
    setManual("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`mono inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10.5px] transition-colors ${
            missing > 0
              ? "border-warning/40 bg-warning/10 text-warning hover:bg-warning/20"
              : "border-border bg-elevated text-subtle hover:border-foreground/30 hover:text-foreground"
          }`}
        >
          S/N {current.length}/{qty}
          {missing > 0 ? " · assign" : ""}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign serial numbers</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-[13px] text-muted-foreground">
            {product.name} — select {qty} unit{qty === 1 ? "" : "s"} from the in-stock register or type them in
            manually.
          </p>
          {available.length === 0 ? (
            <EmptyState title="No serials in register" description="Type the serial numbers manually to register them on checkout." />
          ) : (
            <ul
              className="max-h-48 divide-y divide-border overflow-y-auto rounded border border-border"
              data-lenis-prevent
            >
              {available.map((sn) => (
                <li key={sn.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-elevated">
                    <Checkbox
                      checked={draft.includes(sn.serial)}
                      onCheckedChange={() => toggle(sn.serial)}
                    />
                    <span className="mono text-[12.5px] text-foreground">{sn.serial}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2">
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addManual();
                }
              }}
              placeholder="Or type serials, comma-separated"
              className="h-8 text-xs"
            />
            <Button size="sm" variant="outline" onClick={addManual}>
              Add
            </Button>
          </div>
          {draft.length > 0 && (
            <p className="mono text-[11px] text-subtle">
              Selected: {draft.join(", ")}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => { onApply(draft.slice(0, qty)); setOpen(false); }} disabled={draft.length === 0}>
            Assign serials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CartPanel({
  notes,
  onNotesChange,
  onCheckout,
}: {
  notes: string;
  onNotesChange: (v: string) => void;
  onCheckout: (method: PaymentMethod, tendered: number, change: number, reference: string) => void;
}) {
  const store = useStore();
  const [payOpen, setPayOpen] = useState(false);
  const lines = store.cart.map((l) => {
    const p = store.productById(l.productId)!;
    return { ...l, product: p, lineTotal: p.price * l.qty };
  });
  const productLines = lines.filter((l) => !l.product.isService);
  const serviceLines = lines.filter((l) => l.product.isService);
  const serviceTotal = serviceLines.reduce((s, l) => s + l.lineTotal, 0);
  const totals = computeTotals(
    productLines.map((l) => ({ qty: l.qty, unitPrice: l.product.price })),
    store.cartDiscount,
    serviceTotal,
  );
  const serialIncomplete = lines.some(
    (l) => l.product.serialTracked && (l.serials?.length ?? 0) < l.qty,
  );

  return (
    <Panel className="flex min-h-0 flex-col">
      <PanelHeader
        title="Current sale"
        hint={`${lines.length} line${lines.length === 1 ? "" : "s"}`}
        action={
          lines.length > 0 ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => {
                  store.holdCart();
                  toast.success("Transaction held");
                }}
              >
                <Pause className="size-3.5" /> Hold
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive">
                    <Trash2 className="size-3.5" /> Clear
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear this sale?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All {lines.length} lines, the discount and the attached customer will be
                      removed. Hold the transaction instead if you need it later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep sale</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        store.clearCart();
                        onNotesChange("");
                        toast.success("Sale cleared");
                      }}
                    >
                      Clear sale
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : null
        }
      />

      <div className="border-b border-border px-3 py-2.5">
        <CustomerSelect />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {lines.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No items yet"
            description="Search the catalog and add products to start a sale. Press F2 to focus search."
          />
        ) : (
          <ul className="divide-y divide-border">
            {lines.map((l) => (
              <li key={l.productId} className="px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-foreground">{l.product.name}</p>
                    <p className="mono text-[10.5px] text-subtle">
                      {l.product.sku} · {money(l.product.price)} ea
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${l.product.name}`}
                    onClick={() => store.removeCartLine(l.productId)}
                    className="text-subtle transition-colors hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-6"
                      aria-label="Decrease quantity"
                      onClick={() => store.setCartQty(l.productId, l.qty - 1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="mono w-9 text-center text-[13px] tabular-nums">{l.qty}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-6"
                      aria-label="Increase quantity"
                      disabled={!l.product.isService && store.availableOf(l.productId) <= 0}
                      onClick={() => {
                        const res = store.addToCart(l.productId, 1);
                        if (!res.ok) toast.error(res.error ?? "Stock limit reached");
                      }}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <span className="mono text-[13px] tabular-nums text-foreground">
                    {money(l.lineTotal)}
                  </span>
                </div>
                {l.product.serialTracked && (
                  <div className="mt-2">
                    <SerialPicker
                      product={l.product}
                      qty={l.qty}
                      current={l.serials ?? []}
                      onApply={(serials) => store.setCartLineSerials(l.productId, serials)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {store.heldCarts.length > 0 && (
          <div className="border-t border-border p-3">
            <p className="label-tech">Held transactions</p>
            <ul className="mt-2 space-y-1.5">
              {store.heldCarts.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-2">
                  <span className="mono truncate text-[11px] text-muted-foreground">
                    {h.id} · {h.lines.length} lines · {relative(h.at)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px]"
                    onClick={() => {
                      store.resumeHeldCart(h.id);
                      toast.success("Transaction resumed");
                    }}
                  >
                    <Play className="size-3" /> Resume
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="pos-discount" className="label-tech shrink-0">
            Discount
          </label>
          <Input
            id="pos-discount"
            type="number"
            min={0}
            value={store.cartDiscount || ""}
            placeholder="0"
            onChange={(e) => store.setCartDiscount(Math.max(0, Number(e.target.value) || 0))}
            className="h-7 flex-1 text-right text-[13px]"
          />
        </div>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Sale notes (optional)…"
          className="min-h-[52px] resize-none text-[13px]"
        />
        <TotalsRows
          rows={[
            { label: "Products", value: moneyExact(totals.gross) },
            ...(serviceTotal > 0
              ? [{ label: "Service total", value: moneyExact(serviceTotal) }]
              : []),
            { label: "Discount", value: `− ${moneyExact(totals.discount)}` },
            { label: `VAT-exclusive subtotal`, value: moneyExact(totals.subtotal) },
            { label: `VAT (${Math.round(VAT_RATE * 100)}%)`, value: moneyExact(totals.tax) },
            { label: "Total due", value: moneyExact(totals.total), strong: true },
          ]}
        />
        <Button
          className="h-10 w-full"
          disabled={lines.length === 0 || serialIncomplete}
          onClick={() => setPayOpen(true)}
        >
          Checkout · {money(totals.total)}
        </Button>
        {serialIncomplete && (
          <p className="text-center text-[11px] text-warning">
            Assign serial numbers to every serial-tracked line to complete checkout.
          </p>
        )}
        <PaymentDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          total={totals.total}
          onConfirm={onCheckout}
        />
      </div>
    </Panel>
  );
}
