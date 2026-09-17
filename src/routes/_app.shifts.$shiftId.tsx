import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, TechLabel } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, TotalsRows } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
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
import { useOps, expectedCash } from "@/lib/ops-store";
import { useStore } from "@/lib/store";
import { money, dateTime, titleCase } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_app/shifts/$shiftId")({
  head: () => ({
    meta: [
      { title: "Shift — DPC POS" },
      { name: "description", content: "Shift detail with tender breakdown and variance." },
      { property: "og:title", content: "Shift — DPC POS" },
      { property: "og:description", content: "Shift detail with tender breakdown and variance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShiftDetailPage,
});

const METHODS: PaymentMethod[] = ["cash", "gcash", "bank", "card"];

function ShiftDetailPage() {
  const { shiftId } = Route.useParams();
  const ops = useOps();
  const { orders } = useStore();
  const shift = ops.shifts.find((s) => s.id === shiftId);
  const [kind, setKind] = useState<"cash_in" | "cash_out">("cash_in");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [counted, setCounted] = useState("");
  const [notes, setNotes] = useState("");
  const [tenders, setTenders] = useState<Record<PaymentMethod, string>>({
    cash: "",
    gcash: "",
    bank: "",
    card: "",
  });
  const [refunds, setRefunds] = useState("");

  if (!shift) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Shift" description="Shift detail with tender breakdown and variance." />
        <Panel>
          <EmptyState title="Shift not found" description={`No shift matches "${shiftId}".`} />
        </Panel>
      </div>
    );
  }

  const adjTotal = shift.adjustments.reduce((s, a) => s + (a.kind === "cash_in" ? a.amount : -a.amount), 0);
  const openAt = +new Date(shift.openedAt);
  const closeAt = shift.closedAt ? +new Date(shift.closedAt) : Date.now();
  const cashSales = orders.reduce((sum, o) => {
    if (!o.payment || o.payment.method !== "cash") return sum;
    const at = +new Date(o.payment.at);
    if (at < openAt || at > closeAt) return sum;
    return sum + o.payment.amount;
  }, 0);
  const refundsNum = Number(refunds) || 0;
  const refundsTotal = shift.status === "closed" ? (shift.refunds ?? 0) : refundsNum;
  const expected = expectedCash(shift, cashSales, refundsTotal);
  const variance = shift.countedCash !== undefined ? shift.countedCash - expected : undefined;
  const tenderTotal = shift.tenders ? Object.values(shift.tenders).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {shift.id}
            <StatusBadge status={shift.status} tone={shift.status === "open" ? "success" : "neutral"} />
          </span>
        }
        description={`Cashier: ${shift.cashier}`}
        meta={
          <>
            <span className="text-xs text-muted-foreground">Opened {dateTime(shift.openedAt)}</span>
            {shift.closedAt && <span className="text-xs text-muted-foreground">Closed {dateTime(shift.closedAt)}</span>}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Summary">
            <TotalsRows
              className="p-4"
              rows={[
                { label: "Opening cash", value: money(shift.openingCash) },
                { label: "Cash sales (this shift)", value: money(cashSales) },
                { label: "Cash refunds", value: money(shift.refunds ?? refundsTotal), muted: (shift.refunds ?? refundsTotal) === 0 },
                { label: "Cash adjustments (net)", value: money(adjTotal) },
                { label: "Expected cash", value: money(expected), strong: true },
                ...(shift.countedCash !== undefined
                  ? [
                      { label: "Counted cash", value: money(shift.countedCash) },
                      {
                        label: "Variance",
                        value: `${(variance ?? 0) > 0 ? "+" : ""}${money(variance ?? 0)}`,
                      },
                    ]
                  : []),
              ]}
            />
          </Section>

          <Section title="Tender breakdown" hint={shift.tenders ? money(tenderTotal) + " total" : "Recorded at close"}>
            {shift.tenders ? (
              <KeyValueGrid
                cols={4}
                items={METHODS.map((m) => ({ label: titleCase(m), value: money(shift.tenders![m]), mono: true }))}
              />
            ) : (
              <EmptyState title="Tenders not yet recorded" description="Tender breakdown is captured when the shift is closed." />
            )}
          </Section>

          <Section title="Cash adjustments" hint={`${shift.adjustments.length} entries`}>
            {shift.adjustments.length === 0 ? (
              <EmptyState title="No adjustments" description="No cash in/out entries for this shift." />
            ) : (
              <div className="divide-y divide-border/60">
                {shift.adjustments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div>
                      <p className="text-[13px] text-foreground">{a.reason}</p>
                      <p className="mono text-[11px] text-subtle">
                        {dateTime(a.at)} · {a.actor}
                      </p>
                    </div>
                    <Mono className={a.kind === "cash_in" ? "text-success" : "text-destructive"}>
                      {a.kind === "cash_in" ? "+" : "-"}
                      {money(a.amount)}
                    </Mono>
                  </div>
                ))}
              </div>
            )}
            {shift.status === "open" && (
              <div className="flex flex-wrap items-end gap-2 border-t border-border p-4">
                <Select value={kind} onValueChange={(v) => setKind(v as "cash_in" | "cash_out")}>
                  <SelectTrigger className="h-8 w-28 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash_in">Cash in</SelectItem>
                    <SelectItem value="cash_out">Cash out</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="h-8 w-28 text-[13px]"
                />
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason"
                  className="h-8 flex-1 min-w-[10rem] text-[13px]"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!amount || Number(amount) <= 0 || !reason.trim()) {
                      toast.error("Amount and reason are required.");
                      return;
                    }
                    ops.addCashAdjustment(shift.id, { kind, amount: Number(amount), reason: reason.trim() });
                    toast.success("Adjustment recorded.");
                    setAmount("");
                    setReason("");
                  }}
                >
                  Add
                </Button>
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-5">
          {shift.status === "open" ? (
            <Section title="Close shift">
              <div className="space-y-3 p-4">
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                  Enter the per-method sales totals and the cashier's physical count. Expected cash includes cash
                  sales and any refunds entered below.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {METHODS.map((m) => (
                    <div key={m} className="space-y-1.5">
                      <Label htmlFor={`tender-${m}`}>{titleCase(m)}</Label>
                      <Input
                        id={`tender-${m}`}
                        type="number"
                        min={0}
                        value={tenders[m]}
                        onChange={(e) => setTenders((t) => ({ ...t, [m]: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shift-refunds">Cash refunds issued (PHP)</Label>
                  <Input id="shift-refunds" type="number" min={0} value={refunds} onChange={(e) => setRefunds(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shift-counted">Counted cash (PHP)</Label>
                  <Input id="shift-counted" type="number" value={counted} onChange={(e) => setCounted(e.target.value)} placeholder={String(expected)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shift-notes">Notes</Label>
                  <Textarea id="shift-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    const parsed = Object.fromEntries(METHODS.map((m) => [m, Number(tenders[m]) || 0])) as Record<PaymentMethod, number>;
                    ops.closeShift(shift.id, Number(counted) || 0, parsed, refundsNum, notes.trim() || undefined);
                    toast.success(`${shift.id} closed.`);
                  }}
                >
                  Close shift
                </Button>
              </div>
            </Section>
          ) : (
            <Section title="Close details">
              <KeyValueGrid
                cols={2}
                items={[
                  { label: "Notes", value: shift.notes ?? "—" },
                  { label: "Counted cash", value: shift.countedCash !== undefined ? money(shift.countedCash) : "—", mono: true },
                  { label: "Variance", value: variance !== undefined ? `${variance > 0 ? "+" : ""}${money(variance)}` : "—", mono: true },
                  { label: "Cash refunds", value: shift.refunds ? money(shift.refunds) : "—", mono: true },
                ]}
              />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
