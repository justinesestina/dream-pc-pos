import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { Section } from "@/components/nexus/detail";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatCard } from "@/components/nexus/stat-card";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOps } from "@/lib/ops-store";
import { money, dateTime } from "@/lib/format";
import type { Shift } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/shifts/")({
  head: () => ({
    meta: [
      { title: "Cash Drawer — DPC Nexus" },
      { name: "description", content: "Cashier shifts, cash movements and end-of-shift reconciliation." },
      { property: "og:title", content: "Cash Drawer — DPC Nexus" },
      { property: "og:description", content: "Cashier shifts, cash movements and end-of-shift reconciliation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShiftsIndexPage,
});

function shiftCash(s: Shift) {
  const adj = s.adjustments.reduce((sum, a) => sum + (a.kind === "cash_in" ? a.amount : -a.amount), 0);
  return s.openingCash + adj;
}

function ShiftsIndexPage() {
  const ops = useOps();
  const navigate = useNavigate();
  const [opening, setOpening] = useState("");
  const [cashier, setCashier] = useState(ops.actor);

  const open = ops.openShift;
  const shifts = ops.shifts;
  const lastClosed = shifts.find((s) => s.status === "closed" && s.countedCash !== undefined);
  const lastVariance = lastClosed ? (lastClosed.countedCash ?? 0) - shiftCash(lastClosed) : 0;

  const columns: Column<Shift>[] = [
    { key: "id", header: "Shift ID", cell: (s) => <Mono className="text-foreground">{s.id}</Mono>, sortValue: (s) => s.id },
    { key: "cashier", header: "Cashier", cell: (s) => s.cashier },
    { key: "opened", header: "Opened", cell: (s) => <Mono>{dateTime(s.openedAt)}</Mono>, sortValue: (s) => s.openedAt },
    { key: "closed", header: "Closed", cell: (s) => <Mono>{s.closedAt ? dateTime(s.closedAt) : "—"}</Mono> },
    { key: "opening", header: "Opening cash", align: "right", cell: (s) => <Mono>{money(s.openingCash)}</Mono> },
    { key: "counted", header: "Counted", align: "right", cell: (s) => <Mono>{s.countedCash !== undefined ? money(s.countedCash) : "—"}</Mono> },
    {
      key: "variance",
      header: "Variance",
      align: "right",
      cell: (s) => {
        if (s.countedCash === undefined) return <span className="text-subtle">—</span>;
        const v = s.countedCash - shiftCash(s);
        return (
          <Mono className={v === 0 ? "text-muted-foreground" : v > 0 ? "text-success" : "text-destructive"}>
            {v > 0 ? "+" : ""}
            {money(v)}
          </Mono>
        );
      },
    },
    { key: "status", header: "Status", cell: (s) => <StatusBadge status={s.status} tone={s.status === "open" ? "success" : "neutral"} /> },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Cash Drawer" description="Cashier shifts, cash movements and end-of-shift reconciliation." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Shift status" value={open ? "Open" : "Closed"} accent={open ? "success" : "neutral"} hint={open ? open.id : "No active shift"} />
        <StatCard label="Cash on hand" value={open ? money(shiftCash(open)) : "—"} accent="info" />
        <StatCard label="Adjustments this shift" numericValue={open ? open.adjustments.length : 0} accent="warning" />
        <StatCard
          label="Variance last close"
          value={lastClosed ? money(lastVariance) : "—"}
          accent={lastVariance === 0 ? "neutral" : lastVariance > 0 ? "success" : "danger"}
        />
      </div>

      {!open && (
        <Section title="Open a new shift">
          <div className="flex flex-wrap items-end gap-3 p-4">
            <div className="space-y-1.5">
              <Label>Cashier</Label>
              <Input value={cashier} onChange={(e) => setCashier(e.target.value)} className="w-48" />
            </div>
            <div className="space-y-1.5">
              <Label>Opening cash (PHP)</Label>
              <Input type="number" value={opening} onChange={(e) => setOpening(e.target.value)} className="w-40" placeholder="5000" />
            </div>
            <Button
              onClick={() => {
                const shift = ops.openNewShift(Number(opening) || 0, cashier || "Cashier");
                toast.success(`${shift.id} opened.`);
                setOpening("");
                navigate({ to: "/shifts/$shiftId", params: { shiftId: shift.id } });
              }}
            >
              Open shift
            </Button>
          </div>
        </Section>
      )}

      <Panel>
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 className="text-sm font-medium text-foreground">Shift history</h2>
        </div>
        {shifts.length === 0 ? (
          <EmptyState title="No shifts recorded" icon={Wallet} />
        ) : (
          <DataTable
            rows={shifts}
            columns={columns}
            pageSize={15}
            initialSort={{ key: "opened", dir: "desc" }}
            onRowClick={(s) => navigate({ to: "/shifts/$shiftId", params: { shiftId: s.id } })}
          />
        )}
      </Panel>
    </div>
  );
}
