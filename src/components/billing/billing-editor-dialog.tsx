import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Trash2, X } from "lucide-react";
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
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { billingTotals, nextBillingNumber } from "@/lib/billing";
import { cn } from "@/lib/utils";
import type { BillingCustomerType, BillingStatement, BillingStatementItem } from "@/lib/types";

const ADDITIONAL_CHARGE_LABELS = [
  "Shipping Fee",
  "Service Fee",
  "Labor Fee",
  "Installation Fee",
  "Delivery Fee",
  "Other Charges",
];

interface EditableCharge {
  label: string;
  amount: string;
}

interface EditableItem {
  productId: string;
  qty: string;
  unitPrice: string;
}

/**
 * Create / edit dialog for a billing statement. The admin picks the customer
 * and type (the statement number auto-generates per type), adds charges and
 * additional charges, applies a discount, sets the tax treatment and an
 * optional previous balance — the financial summary recomputes live.
 */
export function BillingEditorDialog({
  open,
  onOpenChange,
  statementId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  statementId?: string;
}) {
  const { products, customers, billingStatements, createBillingStatement, updateBillingStatement } =
    useStore();

  const statement = billingStatements.find((s) => s.id === statementId);

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerType, setCustomerType] = useState<BillingCustomerType>("walk-in");
  const [issuedAt, setIssuedAt] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [salesRep, setSalesRep] = useState("");
  const [lines, setLines] = useState<EditableItem[]>([]);
  const [charges, setCharges] = useState<EditableCharge[]>([]);
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discount, setDiscount] = useState("");
  const [taxSetting, setTaxSetting] = useState<"vat" | "non-vat" | "tax-exempt">("vat");
  const [previousBalance, setPreviousBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomerId(statement?.customerId ?? null);
    setCustomerType(statement?.customerType ?? "walk-in");
    setIssuedAt(statement?.issuedAt ?? new Date().toISOString().slice(0, 10));
    setDueAt(statement?.dueAt ?? new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
    setReferenceNumber(statement?.referenceNumber ?? "");
    setSalesRep(statement?.salesRep ?? "");
    setLines(
      (statement?.items ?? []).map((i) => ({
        productId: i.productId,
        qty: String(i.qty),
        unitPrice: String(i.unitPrice),
      })),
    );
    setCharges(
      (statement?.additionalCharges ?? []).map((c) => ({
        label: c.label,
        amount: String(c.amount),
      })),
    );
    setDiscountType(statement?.discountType ?? "amount");
    setDiscountPercentage(
      statement?.discountPercentage ? String(statement.discountPercentage) : "",
    );
    setDiscount(statement?.discount ? String(statement.discount) : "");
    setTaxSetting(statement?.taxSetting ?? "vat");
    setPreviousBalance(statement?.previousBalance ? String(statement.previousBalance) : "");
    setNotes(statement?.notes ?? "");
    setCustomerOpen(false);
  }, [open, statement]);

  const isNew = !statement;
  const number = useMemo(() => {
    if (statement) return statement.id;
    return nextBillingNumber(customerType, billingStatements);
  }, [statement, customerType, billingStatements]);

  const selectableCustomers = useMemo(() => {
    const list = customers.filter((c) => c.status !== "inactive");
    return list.length > 0 ? list : customers;
  }, [customers]);

  const selectedCustomer = selectableCustomers.find((c) => c.id === customerId);
  const customerName = selectedCustomer?.name ?? statement?.customerName ?? "Walk-in Customer";

  const updateLine = (i: number, patch: Partial<EditableItem>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addLine = () => setLines((prev) => [...prev, { productId: "", qty: "1", unitPrice: "" }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const updateCharge = (i: number, patch: Partial<EditableCharge>) =>
    setCharges((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const addCharge = () => setCharges((prev) => [...prev, { label: "Shipping Fee", amount: "" }]);
  const removeCharge = (i: number) => setCharges((prev) => prev.filter((_, idx) => idx !== i));

  const resolvedItems = useMemo<BillingStatementItem[]>(
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

  const itemsSubtotal = resolvedItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  const discountNum = useMemo(() => {
    if (discountType === "percentage") {
      const pct = Number(discountPercentage) || 0;
      return Math.round(itemsSubtotal * (pct / 100) * 100) / 100;
    }
    return Number(discount) || 0;
  }, [discountType, discountPercentage, discount, itemsSubtotal]);

  const resolvedCharges = useMemo(
    () =>
      charges
        .filter((c) => c.label && Number(c.amount) > 0)
        .map((c) => ({ label: c.label, amount: Number(c.amount) })),
    [charges],
  );

  const totals = useMemo(
    () =>
      billingTotals(
        resolvedItems,
        resolvedCharges,
        discountNum,
        taxSetting,
        Number(previousBalance) || 0,
      ),
    [resolvedItems, resolvedCharges, discountNum, taxSetting, previousBalance],
  );

  const canSave = Boolean(customerId) && resolvedItems.length > 0 && dueAt >= issuedAt;

  const submit = () => {
    const payload = {
      customerId,
      customerType,
      items: resolvedItems,
      additionalCharges: resolvedCharges,
      discountType,
      discountPercentage: Number(discountPercentage) || 0,
      discount: discountNum,
      taxSetting,
      previousBalance: Number(previousBalance) || 0,
      referenceNumber: referenceNumber.trim(),
      salesRep: salesRep.trim(),
      issuedAt,
      dueAt,
      notes: notes.trim(),
    };
    if (isNew) {
      createBillingStatement(payload);
      toast.success(`Billing statement ${number} created`);
    } else {
      updateBillingStatement(statement.id, payload);
      toast.success(`Billing statement ${statement.id} updated`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto overflow-x-visible sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isNew ? <Plus className="size-4 text-muted-foreground" /> : null}
            {isNew ? "New billing statement" : "Edit billing statement"}{" "}
            <span className="mono">{number}</span>
          </DialogTitle>
          <DialogDescription>
            Statement of account with itemized charges and terms. The number is auto-generated per
            customer type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* billing info */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="bs-customer" className="label-tech">
                Customer
              </label>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    id="bs-customer"
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
              <label htmlFor="bs-type" className="label-tech">
                Customer Type
              </label>
              <Select
                value={customerType}
                onValueChange={(v) => setCustomerType(v as BillingCustomerType)}
              >
                <SelectTrigger id="bs-type" className="h-9">
                  <SelectValue placeholder="Customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-In</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="household">Household</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bs-no" className="label-tech">
                Statement No. (auto)
              </label>
              <Input id="bs-no" value={number} readOnly className="mono h-9 bg-muted/40" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bs-sales" className="label-tech">
                Sales Rep
              </label>
              <Input
                id="bs-sales"
                value={salesRep}
                onChange={(e) => setSalesRep(e.target.value)}
                className="h-9"
                placeholder="Assigned sales rep"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bs-issued" className="label-tech">
                Date Issued
              </label>
              <Input
                id="bs-issued"
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bs-due" className="label-tech">
                Due Date
              </label>
              <Input
                id="bs-due"
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bs-ref" className="label-tech">
                Reference Number
              </label>
              <Input
                id="bs-ref"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="h-9"
                placeholder="PO / OR / reference"
              />
            </div>
          </div>

          {/* charges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bs-lines" className="label-tech">
                Charges (products / services)
              </label>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addLine}>
                <Plus className="size-3.5" /> Add item
              </Button>
            </div>
            <div className="space-y-2 rounded-md border border-border p-2">
              {lines.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted-foreground">
                  No charges yet — add at least one product or service.
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
                        <SelectValue placeholder="Product / service" />
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
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* additional charges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bs-charges" className="label-tech">
                Additional Charges
              </label>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addCharge}>
                <Plus className="size-3.5" /> Add charge
              </Button>
            </div>
            <div className="space-y-2 rounded-md border border-border p-2">
              {charges.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted-foreground">
                  Shipping, service, labor, installation, delivery or other fees.
                </p>
              )}
              {charges.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select value={c.label} onValueChange={(v) => updateCharge(i, { label: v })}>
                    <SelectTrigger className="h-8 flex-1 text-xs">
                      <SelectValue placeholder="Charge type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDITIONAL_CHARGE_LABELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    value={c.amount}
                    onChange={(e) => updateCharge(i, { amount: e.target.value })}
                    className="h-8 w-32 text-xs"
                    placeholder="0.00"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 shrink-0 text-muted-foreground"
                    onClick={() => removeCharge(i)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* discount + tax */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="bs-discount" className="label-tech">
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
                  id="bs-discount"
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
              <label htmlFor="bs-tax" className="label-tech">
                Tax
              </label>
              <Select
                value={taxSetting}
                onValueChange={(v) => setTaxSetting(v as BillingStatement["taxSetting"])}
              >
                <SelectTrigger id="bs-tax" className="h-9">
                  <SelectValue placeholder="Tax setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vat">VAT (12%)</SelectItem>
                  <SelectItem value="non-vat">Non-VAT</SelectItem>
                  <SelectItem value="tax-exempt">Tax Exempt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bs-prev" className="label-tech">
                Previous Balance (₱)
              </label>
              <Input
                id="bs-prev"
                type="number"
                min={0}
                value={previousBalance}
                onChange={(e) => setPreviousBalance(e.target.value)}
                className="h-9"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bs-notes" className="label-tech">
              Notes (printed on the statement)
            </label>
            <Textarea
              id="bs-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[56px] resize-y text-[13px] leading-relaxed"
              placeholder="e.g. Net-15 terms, balance due before release…"
            />
          </div>

          {/* financial summary */}
          <div className="rounded-lg border border-border bg-surface/40 p-3">
            <p className="label-tech mb-2">Financial summary</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-6">
              <div>
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="mono">{money(totals.itemsSubtotal)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Discount −</dt>
                <dd className="mono text-destructive">{money(-discountNum)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Additional charges</dt>
                <dd className="mono">{money(totals.additionalTotal)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {taxSetting === "vat"
                    ? "VAT (12%)"
                    : taxSetting === "non-vat"
                      ? "Non-VAT"
                      : "Tax exempt"}
                </dt>
                <dd className="mono">{money(totals.tax)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Previous balance</dt>
                <dd className="mono">{money(totals.previousBalance)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total amount</dt>
                <dd className="mono text-[13px] font-medium">{money(totals.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isNew && (
            <Button
              variant="ghost"
              onClick={() => {
                updateBillingStatement(statement.id, {
                  items: resolvedItems,
                  additionalCharges: resolvedCharges,
                  discountType,
                  discountPercentage: Number(discountPercentage) || 0,
                  discount: discountNum,
                  taxSetting,
                  previousBalance: Number(previousBalance) || 0,
                });
                toast.success(`Billing statement ${statement.id} updated`);
                onOpenChange(false);
              }}
            >
              Save
            </Button>
          )}
          <Button disabled={!canSave} onClick={submit}>
            {isNew ? "Create statement" : "Save & update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
