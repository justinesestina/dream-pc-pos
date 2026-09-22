import type { BillingCharge, BillingCustomerType, BillingStatement } from "./types";

/**
 * Billing Statement numbering.
 *
 *   {WI|BC|HH}BS-CS26-80001
 *
 * WI = Walk-in, BC = Business, HH = Household, BS = Billing Statement,
 * CSxx = current series year code, 80001 = running sequence per customer type.
 * The sequence is maintained separately for each customer type.
 */

const TYPE_PREFIX: Record<BillingCustomerType, string> = {
  "walk-in": "WI",
  business: "BC",
  household: "HH",
};

const SERIES_BASE = 80001;

/** Current series year code, e.g. 2026 → "CS26". */
export function billingSeriesCode(date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  return `CS${yy}`;
}

/** Statement number prefix for a customer type + series, e.g. "WIBS-CS26-". */
export function billingPrefix(type: BillingCustomerType, date = new Date()): string {
  return `${TYPE_PREFIX[type]}BS-${billingSeriesCode(date)}-`;
}

/** Next available statement number for a customer type (sequenced separately). */
export function nextBillingNumber(
  type: BillingCustomerType,
  existing: Pick<BillingStatement, "id">[],
  date = new Date(),
): string {
  const prefix = billingPrefix(type, date);
  let max = 0;
  for (const s of existing) {
    if (!s.id.startsWith(prefix)) continue;
    const seq = Number(s.id.slice(prefix.length));
    if (Number.isFinite(seq) && seq > max) max = seq;
  }
  return `${prefix}${Math.max(SERIES_BASE, max + 1)}`;
}

export interface BillingTotals {
  itemsSubtotal: number;
  additionalTotal: number;
  discount: number;
  tax: number;
  previousBalance: number;
  total: number;
}

/**
 * Computes the financial summary for a statement.
 *
 *   itemsSubtotal = Σ qty × unitPrice
 *   additionalTotal = Σ additional charges
 *   taxable = itemsSubtotal + additionalTotal − discount
 *   tax = VAT ? 12% of taxable : 0 (non-vat / tax-exempt → 0)
 *   total = taxable + tax + previousBalance
 */
export function billingTotals(
  items: { qty: number; unitPrice: number }[],
  additionalCharges: BillingCharge[],
  discount: number,
  taxSetting: BillingStatement["taxSetting"],
  previousBalance: number,
): BillingTotals {
  const itemsSubtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const additionalTotal = additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxable = Math.max(0, itemsSubtotal + additionalTotal - discount);
  const tax = taxSetting === "vat" ? Math.round(taxable * 0.12 * 100) / 100 : 0;
  const total = Math.round((taxable + tax + previousBalance) * 100) / 100;
  return { itemsSubtotal, additionalTotal, discount, tax, previousBalance, total };
}

export function customerTypeLabel(type: BillingCustomerType): string {
  switch (type) {
    case "business":
      return "Business";
    case "household":
      return "Household";
    default:
      return "Walk-In";
  }
}
