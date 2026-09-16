import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { QuoteClientMessage } from "@/components/quotes/quote-message";
import { createQuotePdf } from "@/lib/quote-pdf";
import { useStore, computeTotals } from "@/lib/store";
import { dateShort, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Quote, QuoteItem } from "@/lib/types";

function templateFor(quote: Quote): string {
  const firstName = quote.customerName.split(" ")[0] || "valued customer";
  const lines: string[] = [
    `Hi ${firstName},`,
    ``,
    `Thank you for requesting a quotation from Dream PC Build & IT Solutions.`,
    ``,
    `Please find your quotation (${quote.id}) below. I've included a summary of the items, quantities and the total price — everything listed is covered by our standard warranty and service policy.`,
    ``,
    `If this looks good to you, simply reply to this message and we'll start preparing your order right away. We're also happy to adjust the configuration, swap components, or look at a different budget if you'd like.`,
    ``,
    `This quotation is valid until ${dateShort(quote.expiresAt)}.`,
    ``,
    `Looking forward to building with you.`,
    ``,
    `Best regards,`,
    quote.preparedBy,
    `Dream PC Build & IT Solutions`,
  ];
  return lines.join("\n");
}

function defaultSubjectFor(quote: Quote): string {
  return `Your quotation ${quote.id} — ${quote.customerName}`;
}

interface EditableItem {
  productId: string;
  qty: string;
  unitPrice: string;
}

/**
 * Full "edit & send" editor for a quotation. The admin picks the customer, edits
 * every part of the quotation (items, quantities, prices, discount, service
 * total, notes, validity), optionally adjusts the cover message, then sends the
 * final quotation straight to the customer's e-mail (simulated).
 */
export function QuoteEditorDialog({
  open,
  onOpenChange,
  quote,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  quote: Quote;
}) {
  const { products, customers, updateQuote, sendQuote } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerId, setCustomerId] = useState<string | null>(quote.customerId);
  const [lines, setLines] = useState<EditableItem[]>([]);
  const [discountType, setDiscountType] = useState<"amount" | "percentage">(quote.discountType ?? "amount");
  const [discountPercentage, setDiscountPercentage] = useState(quote.discountPercentage ? String(quote.discountPercentage) : "");
  const [discount, setDiscount] = useState(quote.discount ? String(quote.discount) : "");
  const [serviceTotal, setServiceTotal] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState("14");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pdf, setPdf] = useState<{ url: string | URL } | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCustomerId(quote.customerId);
    setLines(
      quote.items.map((i) => ({
        productId: i.productId,
        qty: String(i.qty),
        unitPrice: String(i.unitPrice),
      })),
    );
    setDiscountType(quote.discountType ?? "amount");
    setDiscountPercentage(quote.discountPercentage ? String(quote.discountPercentage) : "");
    setDiscount(quote.discount ? String(quote.discount) : "");
    setServiceTotal(quote.serviceTotal ? String(quote.serviceTotal) : "");
    setShippingFee(quote.shippingFee ? String(quote.shippingFee) : "");
    setNotes(quote.notes ?? "");
    setValidDays(
      String(Math.max(1, Math.ceil((new Date(quote.expiresAt).getTime() - Date.now()) / 86400000))),
    );
    setSubject(quote.subject || defaultSubjectFor(quote));
    setMessage(quote.message || templateFor(quote));
    setPdf(null);
    setPdfBusy(false);
    setCustomerOpen(false);
    setIsSaving(false);
  }, [open, quote]);

  const selectableCustomers = useMemo(() => {
    const list = customers.filter((c) => c.status !== "inactive");
    return list.length > 0 ? list : customers;
  }, [customers]);

  const selectedCustomer = selectableCustomers.find((c) => c.id === customerId);
  const customerName = selectedCustomer?.name ?? quote.customerName;

  const updateLine = (i: number, patch: Partial<EditableItem>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const addLine = () => setLines((prev) => [...prev, { productId: "", qty: "1", unitPrice: "" }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const serviceNum = Number(serviceTotal) || 0;
  const shippingNum = Number(shippingFee) || 0;
  const validDaysNum = Math.max(1, Number(validDays) || 14);

  const resolvedItems = useMemo<QuoteItem[]>(
    () =>
      lines
        .filter((l) => l.productId && Number(l.qty) > 0)
        .map((l) => {
          const p = products.find((x) => x.id === l.productId);
          return {
            productId: l.productId,
            name: p?.name ?? l.productId,
            sku: p?.sku ?? "N/A",
            qty: Number(l.qty),
            unitPrice: Number(l.unitPrice) || (p?.price ?? 0),
          };
        }),
    [lines, products],
  );

  const subtotalBeforeDiscount = useMemo(() => {
    return resolvedItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
  }, [resolvedItems]);

  const discountNum = useMemo(() => {
    if (discountType === "percentage") {
      const pct = Number(discountPercentage) || 0;
      return Math.round(subtotalBeforeDiscount * (pct / 100) * 100) / 100;
    }
    return Number(discount) || 0;
  }, [discountType, discountPercentage, discount, subtotalBeforeDiscount]);

  const totals = useMemo(
    () => computeTotals(resolvedItems, discountNum, serviceNum, shippingNum),
    [resolvedItems, discountNum, serviceNum, shippingNum],
  );

  const totalCost = useMemo(() => {
    return resolvedItems.reduce((sum, item) => {
      const p = products.find((x) => x.id === item.productId);
      return sum + (p?.cost ?? 0) * item.qty;
    }, 0);
  }, [resolvedItems, products]);

  const profitMarginAmount = (totals.total - totals.tax) - totalCost;
  const profitMarginPercent = totals.total - totals.tax > 0 ? (profitMarginAmount / (totals.total - totals.tax)) * 100 : 0;

  const previewQuote = useMemo<Quote>(
    () => ({
      ...quote,
      customerId,
      customerName,
      items: resolvedItems,
      discountType,
      discountPercentage: Number(discountPercentage) || undefined,
      discount: discountNum,
      serviceTotal: serviceNum,
      shippingFee: shippingNum,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      expiresAt: new Date(Date.now() + validDaysNum * 86400000).toISOString(),
      notes: notes.trim(),
      subject: subject.trim(),
      message: message.trim(),
    }),
    [
      quote,
      customerId,
      customerName,
      resolvedItems,
      discountType,
      discountPercentage,
      discountNum,
      serviceNum,
      shippingNum,
      totals,
      validDaysNum,
      notes,
      subject,
      message,
    ],
  );

  const canContinue = Boolean(customerId) && resolvedItems.length > 0;
  const canSend = canContinue && subject.trim().length > 0 && message.trim().length > 0;

  useEffect(() => {
    if (!open || step !== 3) return;
    let active = true;
    setPdfBusy(true);
    createQuotePdf(previewQuote).then((created) => {
      if (!active) return;
      setPdf({ url: created.url });
      setPdfBusy(false);
    });
    return () => {
      active = false;
    };
  }, [open, step, previewQuote]);

  const submit = () => {
    updateQuote(quote.id, {
      customerId,
      items: resolvedItems,
      discountType,
      discountPercentage: Number(discountPercentage) || undefined,
      discount: discountNum,
      serviceTotal: serviceNum,
      shippingFee: shippingNum,
      notes: notes.trim(),
      expiresInDays: validDaysNum,
    });
    sendQuote(quote.id, { subject: subject.trim(), message: message.trim() });
    toast.success(`Quote ${quote.id} sent to ${customerName} via e-mail`);
    onOpenChange(false);
  };

  const saveOnly = async () => {
    setIsSaving(true);
    try {
      console.log("Saving quote with data:", {
        customerId,
        items: resolvedItems,
        discountType,
        discountPercentage: Number(discountPercentage) || undefined,
        discount: discountNum,
        serviceTotal: serviceNum,
        shippingFee: shippingNum,
        notes: notes.trim(),
        expiresInDays: validDaysNum,
      });
      
      updateQuote(quote.id, {
        customerId,
        items: resolvedItems,
        discountType,
        discountPercentage: Number(discountPercentage) || undefined,
        discount: discountNum,
        serviceTotal: serviceNum,
        shippingFee: shippingNum,
        notes: notes.trim(),
        expiresInDays: validDaysNum,
      });
      
      // Wait a moment for the state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Quote ${quote.id} saved successfully`);
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Failed to save quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const stepBase = "label-tech inline-flex items-center gap-1.5";
  const activeStep = "text-foreground";
  const dimStep = "text-subtle";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto overflow-x-visible sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-muted-foreground" /> Edit &amp; send quotation{" "}
            <span className="mono">{quote.id}</span>
          </DialogTitle>
          <DialogDescription>
            Customize anything — customer, items, prices, discount, services — then send the final
            quotation straight to the client&apos;s e-mail.
          </DialogDescription>
        </DialogHeader>

        {/* step indicator */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <span className={cn(stepBase, step === 1 ? activeStep : dimStep)}>
            <span className="grid size-4 place-items-center rounded-full border border-border text-[10px]">
              1
            </span>
            Quotation
          </span>
          <ArrowRight className="size-3.5 text-subtle" />
          <span className={cn(stepBase, step === 2 ? activeStep : dimStep)}>
            <span className="grid size-4 place-items-center rounded-full border border-border text-[10px]">
              2
            </span>
            Message
          </span>
          <ArrowRight className="size-3.5 text-subtle" />
          <span className={cn(stepBase, step === 3 ? activeStep : dimStep)}>
            <span className="grid size-4 place-items-center rounded-full border border-border text-[10px]">
              3
            </span>
            Check PDF &amp; send
          </span>
        </div>

        {step === 1 ? (
          <>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label htmlFor="qe-customer" className="label-tech">
                    Customer
                  </label>
                  <Popover open={customerOpen} onOpenChange={setCustomerOpen} modal>
                    <PopoverTrigger asChild>
                      <Button
                        id="qe-customer"
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerOpen}
                        className="h-9 w-full justify-between font-normal"
                      >
                        <span className="truncate">
                          {selectedCustomer?.name ?? (customerId ? customerName : "Select customer")}
                        </span>
                        <ChevronDown className="size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="z-[300] w-[var(--radix-popover-trigger-width)] p-0"
                    >
                      <Command>
                        <CommandInput placeholder="Search customers…" className="h-9" />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {selectableCustomers.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={`${c.name} ${c.email} ${c.phone} ${c.id}`}
                                onSelect={() => {
                                  setCustomerId(c.id);
                                  setCustomerOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "size-3.5",
                                    customerId === c.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <span className="min-w-0">
                                  <span className="block truncate">{c.name}</span>
                                  <span className="mono block truncate text-[10.5px] text-subtle">
                                    {c.email || c.phone}
                                  </span>
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="qe-discount" className="label-tech">
                    Discount
                  </label>
                  <div className="flex gap-1">
                    <div className="flex shrink-0 rounded-md border border-input p-0.5">
                      <button
                        type="button"
                        aria-pressed={discountType === "amount"}
                        onClick={() => setDiscountType("amount")}
                        className={cn(
                          "h-8 min-w-9 rounded px-2 text-xs font-medium",
                          discountType === "amount"
                            ? "bg-foreground/10 text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        ₱
                      </button>
                      <button
                        type="button"
                        aria-pressed={discountType === "percentage"}
                        onClick={() => setDiscountType("percentage")}
                        className={cn(
                          "h-8 min-w-9 rounded px-2 text-xs font-medium",
                          discountType === "percentage"
                            ? "bg-foreground/10 text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        %
                      </button>
                    </div>
                    <Input
                      id="qe-discount"
                      type="number"
                      min={0}
                      max={discountType === "percentage" ? 100 : undefined}
                      value={discountType === "percentage" ? discountPercentage : discount}
                      onChange={(e) => {
                        if (discountType === "percentage") {
                          setDiscountPercentage(e.target.value);
                        } else {
                          setDiscount(e.target.value);
                        }
                      }}
                      className="h-9 flex-1"
                      placeholder={discountType === "percentage" ? "0" : "0.00"}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="qe-service" className="label-tech">
                    Service / labor (₱)
                  </label>
                  <Input
                    id="qe-service"
                    type="number"
                    min={0}
                    value={serviceTotal}
                    onChange={(e) => setServiceTotal(e.target.value)}
                    className="h-9"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="qe-shipping" className="label-tech">
                    Shipping fee (₱)
                  </label>
                  <Input
                    id="qe-shipping"
                    type="number"
                    min={0}
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    className="h-9"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="qe-lines" className="label-tech">
                    Items
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    onClick={addLine}
                  >
                    <Plus className="size-3.5" /> Add item
                  </Button>
                </div>
                <div className="space-y-2 rounded-md border border-border p-2">
                  {lines.length === 0 && (
                    <p className="px-1 py-2 text-xs text-muted-foreground">
                      No items yet — add at least one product with a quantity.
                    </p>
                  )}
                  {lines.map((l, i) => {
                    const product = products.find((p) => p.id === l.productId);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <Select
                          value={l.productId}
                          onValueChange={(v) => {
                            const p = products.find((x) => x.id === v);
                            updateLine(i, {
                              productId: v,
                              unitPrice: p ? String(p.price) : l.unitPrice,
                            });
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
                          value={l.unitPrice}
                          onChange={(e) => updateLine(i, { unitPrice: e.target.value })}
                          className="h-8 w-28 text-xs"
                          placeholder={product ? String(product.price) : "Price"}
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

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="qe-notes" className="label-tech">
                    Notes (printed on the quotation)
                  </label>
                  <Textarea
                    id="qe-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[64px] resize-y text-[13px] leading-relaxed"
                    placeholder="e.g. Editing workstation, prefers quiet operation…"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="qe-valid" className="label-tech">
                    Valid for (days)
                  </label>
                  <Input
                    id="qe-valid"
                    type="number"
                    min={1}
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface/40 p-3 relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="label-tech">Quotation totals</p>
                  <div className={cn(
                    "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                    profitMarginPercent < 5 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                  )}>
                    Est. Margin: {profitMarginPercent.toFixed(1)}% ({money(profitMarginAmount)})
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-6">
                  <div>
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="mono">{money(totals.subtotal)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Discount −</dt>
                    <dd className="mono text-destructive">{money(-discountNum)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Services</dt>
                    <dd className="mono">{money(serviceNum)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="mono">{money(shippingNum)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">VAT (12%)</dt>
                    <dd className="mono">{money(totals.tax)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total</dt>
                    <dd className="mono text-[13px] font-medium">{money(totals.total)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={saveOnly} disabled={!canContinue || isSaving}>
                {isSaving ? "Saving..." : "Save Only"}
              </Button>
              <Button disabled={!canContinue || isSaving} onClick={() => setStep(2)}>
                Continue to message <ArrowRight className="size-3.5" />
              </Button>
            </DialogFooter>
          </>
        ) : step === 2 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Compose */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="qe-subject" className="label-tech">
                    Subject
                  </label>
                  <Input
                    id="qe-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Your quotation …"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="qe-message" className="label-tech">
                    Message for the client
                  </label>
                  <Textarea
                    id="qe-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write the cover message that accompanies the quotation…"
                    className="min-h-[280px] resize-y text-[13px] leading-relaxed"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The item summary and totals are generated automatically from your quotation — the
                  message above sits on top of them.
                </p>
              </div>

              {/* Live preview */}
              <div className="max-h-[420px] overflow-y-auto rounded-lg border border-border">
                <QuoteClientMessage quote={previewQuote} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)} disabled={isSaving}>
                <ArrowLeft className="size-3.5" /> Back to quotation
              </Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={saveOnly} disabled={!canContinue || isSaving}>
                {isSaving ? "Saving..." : "Save Only"}
              </Button>
              <Button disabled={!canSend || isSaving} onClick={() => setStep(3)}>
                Preview PDF <ArrowRight className="size-3.5" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground">
                This is the <strong>actual PDF file</strong> (A4) that ships with the quotation —
                with the company logo. Check the layout and that everything is readable before you
                send it.
              </p>
              <div className="h-[56vh] w-full overflow-hidden rounded-lg border border-border bg-surface/60">
                {pdfBusy || !pdf ? (
                  <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                    Generating PDF…
                  </div>
                ) : (
                  <iframe
                    title={`${quote.id} PDF preview`}
                    src={String(pdf.url)}
                    className="h-full w-full"
                  />
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pdf}
                  onClick={() => pdf && window.open(String(pdf.url), "_blank", "noopener")}
                >
                  <FileText className="size-3.5" /> Open in browser
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(2)} disabled={isSaving}>
                <ArrowLeft className="size-3.5" /> Back to message
              </Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={saveOnly} disabled={!canContinue || isSaving}>
                {isSaving ? "Saving..." : "Save Only"}
              </Button>
              <Button disabled={!canSend || isSaving} onClick={submit}>
                <Send className="size-3.5" /> Send to customer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
