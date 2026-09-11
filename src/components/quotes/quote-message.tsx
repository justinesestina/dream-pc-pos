import { company } from "@/lib/ops-data";
import { dateShort, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Quote } from "@/lib/types";

/**
 * Renders the client-facing quotation message exactly as it would be read
 * by the customer who requested the quote — subject, body, item summary,
 * totals and validity. Used for the live preview in the compose dialog and
 * for the read-only "Message sent" view on the quote detail page.
 */
export function QuoteClientMessage({ quote, className }: { quote: Quote; className?: string }) {
  const fromLine = `Your quotation ${quote.id} — ${quote.customerName}`;
  return (
    <div className={cn("flex flex-col rounded-lg border border-border bg-elevated/40", className)}>
      {/* Message chrome — like an e-mail thread header */}
      <div className="border-b border-border px-4 py-3">
        <p className="label-tech">Quotation message</p>
        <p className="mono mt-0.5 text-sm text-foreground">{fromLine}</p>
        <div className="mt-2 space-y-0.5 text-[11.5px] text-muted-foreground">
          <p>
            <span className="mono text-subtle">From:</span> {company.name}
          </p>
          <p>
            <span className="mono text-subtle">To:</span> {quote.customerName}
          </p>
          <p className="flex flex-wrap gap-x-3">
            <span>
              <span className="mono text-subtle">Subject:</span> {quote.subject || fromLine}
            </span>
            {quote.sentAt && (
              <span>
                <span className="mono text-subtle">Sent:</span> {dateShort(quote.sentAt)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {quote.message ? (
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-foreground">
            {quote.message}
          </p>
        ) : (
          <p className="text-[13px] italic text-muted-foreground">No cover message was included.</p>
        )}

        {/* Auto-generated item summary */}
        {quote.items.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <p className="label-tech border-b border-border bg-surface px-3 py-2">
              Requested items
            </p>
            <table className="w-full bg-surface/60 text-left text-[12px]">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="px-3 py-1.5 font-normal">Item</th>
                  <th className="px-3 py-1.5 text-right font-normal">Qty</th>
                  <th className="px-3 py-1.5 text-right font-normal">Unit</th>
                  <th className="px-3 py-1.5 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((i) => (
                  <tr key={i.productId} className="border-b border-border/40">
                    <td className="px-3 py-1.5">
                      <span className="text-foreground">{i.name}</span>
                      <span className="mono ml-2 text-[10px] text-subtle">{i.sku}</span>
                    </td>
                    <td className="mono px-3 py-1.5 text-right tabular-nums">{i.qty}</td>
                    <td className="mono px-3 py-1.5 text-right tabular-nums">
                      {money(i.unitPrice)}
                    </td>
                    <td className="mono px-3 py-1.5 text-right tabular-nums">
                      {money(i.qty * i.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="space-y-1 bg-surface/40 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-6 text-[11.5px]">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="mono tabular-nums">{money(quote.subtotal)}</dd>
              </div>
              {quote.discount > 0 && (
                <div className="flex items-baseline justify-between gap-6 text-[11.5px]">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="mono tabular-nums">−{money(quote.discount)}</dd>
                </div>
              )}
              {quote.serviceTotal > 0 && (
                <div className="flex items-baseline justify-between gap-6 text-[11.5px]">
                  <dt className="text-muted-foreground">Services</dt>
                  <dd className="mono tabular-nums">{money(quote.serviceTotal)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-6 text-[11.5px]">
                <dt className="text-muted-foreground">VAT (12%)</dt>
                <dd className="mono tabular-nums">{money(quote.tax)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-t border-border/60 pt-1.5 text-[13px]">
                <dt className="font-medium text-foreground">Total</dt>
                <dd className="mono font-semibold tabular-nums text-foreground">
                  {money(quote.total)}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <p className="mt-4 text-[11.5px] text-muted-foreground">
          This quotation is valid until{" "}
          <span className="mono text-foreground">{dateShort(quote.expiresAt)}</span>. Reply to this
          message to approve it, request changes, or ask us anything.
        </p>
      </div>

      {/* Signature block */}
      <div className="mt-auto border-t border-border bg-surface/50 px-4 py-3 text-[11.5px] text-muted-foreground">
        <p>Best regards,</p>
        <p className="text-foreground">{quote.preparedBy}</p>
        <p className="mono text-subtle">DPC NEXUS · PC Retail &amp; Operations Platform</p>
      </div>
    </div>
  );
}
