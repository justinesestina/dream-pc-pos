import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { company } from "@/lib/ops-data";
import { dateTime, moneyExact } from "@/lib/format";

export type DocKind =
  | "Sales Receipt"
  | "Invoice"
  | "Quotation"
  | "Purchase Order"
  | "Delivery / Release"
  | "Service Receipt";

export interface DocLine {
  description: string;
  sku?: string | undefined;
  qty: number;
  unitPrice: number;
}

/**
 * Print-ready document preview (receipt, invoice, quotation, PO, release note).
 * DEMO: rendering + browser print only — no thermal printer or e-invoicing.
 */
export function DocumentPreview({
  kind,
  reference,
  issuedAt,
  status,
  party,
  lines,
  totals,
  footer,
  className,
}: {
  kind: DocKind;
  reference: string;
  issuedAt: string;
  status?: string;
  party: { title: string; name: string; lines?: (string | undefined)[] };
  lines: DocLine[];
  totals: { label: string; value: number; strong?: boolean }[];
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl rounded-lg border border-border bg-elevated/40 p-6 text-[12.5px] print:border-0 print:bg-white print:text-black",
        className,
      )}
      data-document
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-foreground">{company.name}</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">{company.address}</p>
          <p className="text-[11.5px] text-muted-foreground">
            {company.phone} · {company.email}
          </p>
          <p className="mono mt-1 text-[10.5px] text-subtle">TIN {company.tin}</p>
        </div>
        <div className="text-right">
          <p className="label-tech">{kind}</p>
          <p className="mono mt-1 text-sm text-foreground">{reference}</p>
          <p className="mono mt-1 text-[11px] text-subtle">{dateTime(issuedAt)}</p>
          {status && (
            <p className="mono mt-1 text-[10.5px] tracking-wide text-info uppercase">{status}</p>
          )}
        </div>
      </header>

      <div className="border-b border-border py-3">
        <p className="label-tech">{party.title}</p>
        <p className="mt-1 text-[13px] text-foreground">{party.name}</p>
        {party.lines?.filter(Boolean).map((l) => (
          <p key={l} className="text-[11.5px] text-muted-foreground">
            {l}
          </p>
        ))}
      </div>

      <table className="w-full border-collapse py-2 text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="label-tech py-2 font-normal">Description</th>
            <th className="label-tech py-2 text-right font-normal">Qty</th>
            <th className="label-tech py-2 text-right font-normal">Unit</th>
            <th className="label-tech py-2 text-right font-normal">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={`${l.description}-${i}`} className="border-b border-border/60">
              <td className="py-2 pr-3">
                <p className="text-foreground">{l.description}</p>
                {l.sku && <p className="mono text-[10.5px] text-subtle">{l.sku}</p>}
              </td>
              <td className="mono py-2 text-right tabular-nums">{l.qty}</td>
              <td className="mono py-2 text-right tabular-nums">{moneyExact(l.unitPrice)}</td>
              <td className="mono py-2 text-right tabular-nums">
                {moneyExact(l.qty * l.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <dl className="w-full max-w-xs space-y-1.5">
          {totals.map((t) => (
            <div
              key={t.label}
              className={cn(
                "flex items-baseline justify-between gap-6",
                t.strong && "border-t border-border pt-2 text-[14px] font-semibold",
              )}
            >
              <dt className={t.strong ? "" : "text-muted-foreground"}>{t.label}</dt>
              <dd className="mono tabular-nums">{moneyExact(t.value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {footer && <div className="mt-5 border-t border-border pt-3 text-[11.5px] text-muted-foreground">{footer}</div>}
    </div>
  );
}

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
    >
      <Printer className="size-3.5" /> {label}
    </Button>
  );
}
