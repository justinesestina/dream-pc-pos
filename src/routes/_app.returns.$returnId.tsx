import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, PackageCheck, RotateCcw, ShieldX, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, DemoNote, TotalsRows } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Timeline } from "@/components/nexus/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useOps } from "@/lib/ops-store";
import { useStore } from "@/lib/store";
import { money, dateTime, titleCase } from "@/lib/format";
import type { TimelineEvent } from "@/lib/types";
import type { ReturnRequest, ReturnResolution } from "@/lib/ops-types";
import type { PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_app/returns/$returnId")({
  head: () => ({
    meta: [
      { title: "Return Request — DPC POS" },
      { name: "description", content: "Inspection, approval and refund workflow for a return." },
      { property: "og:title", content: "Return Request — DPC POS" },
      { property: "og:description", content: "Inspection, approval and refund workflow for a return." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReturnDetailPage,
});

const CONDITION_LABEL: Record<ReturnRequest["condition"], string> = {
  sealed: "Sealed / unopened",
  used_good: "Used — good condition",
  used_damaged: "Used — damaged",
  defective: "Defective",
};

const RESOLUTIONS: ReturnResolution[] = ["refund", "replacement", "repair", "none"];
const METHODS: PaymentMethod[] = ["cash", "gcash", "bank", "card"];

/** Frontend-only lifecycle used to render the RMA progress timeline. */
function buildTimeline(r: ReturnRequest): TimelineEvent[] {
  const order: ReturnRequest["status"][] = ["requested", "inspection", "approved", "refunded"];
  const terminal = r.status === "rejected" || r.status === "refunded" || r.status === "replaced";
  const idx = order.indexOf(r.status);

  const stateFor = (step: number): TimelineEvent["state"] => {
    if (r.status === "rejected") return step === 0 || step === 1 ? "done" : "pending";
    if (idx < 0) return step <= 2 ? "done" : "pending";
    if (step < idx) return "done";
    if (step === idx) return terminal ? "done" : "active";
    return "pending";
  };

  const events: TimelineEvent[] = [
    { label: "Return requested", at: r.createdAt, actor: r.customerName, state: stateFor(0), note: r.reason },
    {
      label: "Inspection",
      at: r.inspectedBy ? r.createdAt : "",
      actor: r.inspectedBy ?? undefined,
      note: r.inspectionNotes ?? undefined,
      state: stateFor(1),
    },
  ];

  if (r.status === "rejected") {
    events.push({
      label: "Rejected",
      at: r.createdAt,
      actor: r.inspectedBy ?? undefined,
      note: r.inspectionNotes ?? "Return did not pass inspection.",
      state: "done",
    });
    return events;
  }

  events.push({
    label: `Approved — ${titleCase(r.resolution)}`,
    at: idx >= 2 ? r.createdAt : "",
    actor: r.inspectedBy ?? undefined,
    state: stateFor(2),
  });
  events.push({
    label:
      r.status === "replaced"
        ? "Replacement issued"
        : r.resolution === "replacement"
          ? "Replacement pending"
          : `Refund ${r.status === "refunded" ? "issued" : "pending"}`,
    at: r.status === "refunded" || r.status === "replaced" ? r.createdAt : "",
    note: r.refundAmount ? `${money(r.refundAmount)} via ${r.refundMethod ? titleCase(r.refundMethod) : "—"}` : undefined,
    state: r.status === "refunded" || r.status === "replaced" ? "done" : stateFor(3),
  });

  return events;
}

function ReturnDetailPage() {
  const { returnId } = Route.useParams();
  const navigate = useNavigate();
  const { returnById, setReturnStatus, updateReturn, actor } = useOps();
  const { orders, customerById, productById, invFor, adjustStock, serials, updateSerial } = useStore();

  const rma = returnById(returnId);
  const order = useMemo(() => orders.find((o) => o.id === rma?.orderId), [orders, rma?.orderId]);
  const customer = customerById(rma?.customerId ?? null);
  const product = rma ? productById(rma.productId) : undefined;
  const inv = rma ? invFor(rma.productId) : undefined;
  const serial = useMemo(
    () => (rma?.serial ? serials.find((s) => s.serial === rma.serial) : undefined),
    [serials, rma?.serial],
  );

  const [notes, setNotes] = useState(rma?.inspectionNotes ?? "");
  const [resolution, setResolution] = useState<ReturnResolution>(rma?.resolution ?? "refund");
  const [method, setMethod] = useState<PaymentMethod>(rma?.refundMethod ?? "cash");
  const [amount, setAmount] = useState(String(rma?.refundAmount ?? 0));
  const [restock, setRestock] = useState(rma?.restock ?? false);

  if (!rma) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Return Request" description="Inspection, approval and refund workflow for a return." />
        <Panel>
          <EmptyState
            title="Return not found"
            description={`No RMA with reference ${returnId} exists in the demo dataset.`}
            action={
              <Button variant="outline" size="sm" onClick={() => navigate({ to: "/returns" })}>
                <ArrowLeft className="mr-1.5 size-3.5" /> Back to returns
              </Button>
            }
          />
        </Panel>
      </div>
    );
  }

  const closed = rma.status === "refunded" || rma.status === "replaced" || rma.status === "rejected";
  const refundValue = Number.parseFloat(amount) || 0;
  const orderLine = order?.items.find((i) => i.productId === rma.productId);
  const maxRefund = orderLine ? orderLine.unitPrice * rma.qty : rma.refundAmount;
  const overRefund = refundValue > maxRefund && maxRefund > 0;

  function startInspection() {
    setReturnStatus(rma!.id, "inspection", { inspectedBy: actor });
    toast.success(`${rma!.id} moved to inspection.`, { description: `Assigned to ${actor}.` });
  }

  function saveInspection() {
    updateReturn(rma!.id, { inspectionNotes: notes, inspectedBy: actor, resolution, restock });
    toast.success("Inspection notes saved.");
  }

  function approve() {
    updateReturn(rma!.id, {
      inspectionNotes: notes,
      inspectedBy: actor,
      resolution,
      restock,
      refundMethod: resolution === "refund" ? method : null,
      refundAmount: resolution === "refund" ? refundValue : 0,
    });
    setReturnStatus(rma!.id, "approved");
    toast.success(`${rma!.id} approved.`, { description: `Resolution: ${titleCase(resolution)}.` });
  }

  function reject() {
    updateReturn(rma!.id, {
      inspectionNotes: notes || "Rejected after inspection.",
      inspectedBy: actor,
      resolution: "none",
      refundAmount: 0,
      refundMethod: null,
      restock: false,
    });
    setReturnStatus(rma!.id, "rejected");
    toast.error(`${rma!.id} rejected.`);
  }

  function settle() {
    const next = resolution === "replacement" ? "replaced" : "refunded";
    const shouldRestock = restock && !rma!.restockedAt;
    updateReturn(rma!.id, {
      refundMethod: next === "refunded" ? method : null,
      refundAmount: next === "refunded" ? refundValue : 0,
      restock,
      ...(shouldRestock ? { restockedAt: new Date().toISOString() } : {}),
    });
    setReturnStatus(rma!.id, next);
    if (shouldRestock) {
      adjustStock(rma!.productId, rma!.qty, `Return restock — ${rma!.id}`);
    }
    if (serial) {
      updateSerial(serial.id, { status: shouldRestock ? "in_stock" : "rma" });
    }
    toast.success(next === "refunded" ? `Refund of ${money(refundValue)} recorded.` : "Replacement issued.", {
      description: shouldRestock
        ? `${rma!.qty} unit(s) returned to available stock.`
        : rma!.restockedAt
          ? "Stock was already restored for this RMA."
          : "No inventory adjustment applied.",
    });
  }

  function reopen() {
    setReturnStatus(rma!.id, "inspection", { inspectedBy: actor });
    toast.info(`${rma!.id} reopened for inspection.`);
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={rma.id}
        description={`${rma.productName} · ${rma.customerName}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={rma.status} />
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/returns" })}>
              <ArrowLeft className="mr-1.5 size-3.5" /> Returns
            </Button>
            {closed ? (
              <Button size="sm" variant="outline" onClick={reopen}>
                <Undo2 className="mr-1.5 size-3.5" /> Reopen
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Return details">
            <KeyValueGrid
              items={[
                {
                  label: "Order",
                  value: order ? (
                    <IdLink to="/orders/$orderId" params={{ orderId: order.id }}>
                      {order.id}
                    </IdLink>
                  ) : (
                    <Mono>{rma.orderId}</Mono>
                  ),
                },
                {
                  label: "Customer",
                  value: customer ? (
                    <IdLink to="/customers/$customerId" params={{ customerId: customer.id }}>
                      {customer.name}
                    </IdLink>
                  ) : (
                    rma.customerName
                  ),
                },
                {
                  label: "Product",
                  value: product ? (
                    <IdLink to="/products/$productId" params={{ productId: product.id }}>
                      {product.name}
                    </IdLink>
                  ) : (
                    rma.productName
                  ),
                },
                { label: "Serial", value: rma.serial ? <Mono className="text-foreground">{rma.serial}</Mono> : "Not serialised" },
                { label: "Quantity", value: rma.qty, mono: true },
                { label: "Condition", value: CONDITION_LABEL[rma.condition] },
                { label: "Requested", value: dateTime(rma.createdAt) },
                { label: "Inspected by", value: rma.inspectedBy ?? "Unassigned" },
                { label: "Resolution", value: titleCase(rma.resolution) },
              ]}
            />
            <div className="border-t border-border px-4 py-3">
              <p className="label-tech">Customer reason</p>
              <p className="mt-1 text-[13px] text-foreground">{rma.reason}</p>
            </div>
          </Section>

          <Section
            title="Inspection & decision"
            hint={closed ? "This RMA is closed — reopen to make changes." : "Record findings, then approve or reject."}
          >
            <div className="space-y-4 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="rma-notes">Inspection notes</Label>
                <Textarea
                  id="rma-notes"
                  value={notes}
                  disabled={closed}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Findings, tested behaviour, physical condition…"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rma-resolution">Resolution</Label>
                  <Select value={resolution} onValueChange={(v) => setResolution(v as ReturnResolution)} disabled={closed}>
                    <SelectTrigger id="rma-resolution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {titleCase(r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rma-amount">Refund amount</Label>
                  <Input
                    id="rma-amount"
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    disabled={closed || resolution !== "refund"}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {overRefund && (
                    <p className="text-[11px] text-danger">Exceeds line value of {money(maxRefund)}.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rma-method">Refund method</Label>
                  <Select
                    value={method}
                    onValueChange={(v) => setMethod(v as PaymentMethod)}
                    disabled={closed || resolution !== "refund"}
                  >
                    <SelectTrigger id="rma-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {titleCase(m)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border bg-elevated/40 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13px] text-foreground">Restock on settlement</p>
                  <p className="text-xs text-muted-foreground">
                    Returns {rma.qty} unit(s) of {rma.productName} to available stock.
                  </p>
                </div>
                <Switch checked={restock} onCheckedChange={setRestock} disabled={closed} />
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                {rma.status === "requested" && (
                  <Button size="sm" onClick={startInspection}>
                    Start inspection
                  </Button>
                )}
                {rma.status === "inspection" && (
                  <>
                    <Button size="sm" variant="outline" onClick={saveInspection}>
                      Save notes
                    </Button>
                    <Button size="sm" onClick={approve} disabled={overRefund}>
                      <PackageCheck className="mr-1.5 size-3.5" /> Approve
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <ShieldX className="mr-1.5 size-3.5" /> Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject this return?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {rma.id} will be closed as rejected with no refund and no inventory adjustment. You can
                            reopen it afterwards in this demo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={reject}>Reject return</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                {rma.status === "approved" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" disabled={overRefund}>
                        <RotateCcw className="mr-1.5 size-3.5" />
                        {resolution === "replacement" ? "Issue replacement" : `Issue refund ${money(refundValue)}`}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Settle {rma.id}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {resolution === "replacement"
                            ? "A replacement unit will be marked as issued."
                            : `${money(refundValue)} will be recorded as refunded via ${titleCase(method)}.`}{" "}
                          {restock
                            ? `${rma.qty} unit(s) will be added back to available stock.`
                            : "No inventory adjustment will be applied."}{" "}
                          This is simulated demo state — no money moves.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={settle}>Confirm</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {closed && (
                  <p className="text-xs text-muted-foreground">
                    Closed as <span className="text-foreground">{titleCase(rma.status)}</span>
                    {rma.status === "refunded" ? ` · ${money(rma.refundAmount)} via ${rma.refundMethod ? titleCase(rma.refundMethod) : "—"}` : ""}
                  </p>
                )}
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Financials">
            <TotalsRows
              rows={[
                { label: "Line value", value: money(maxRefund) },
                { label: "Requested refund", value: money(rma.refundAmount || refundValue) },
                { label: "Method", value: rma.refundMethod ? titleCase(rma.refundMethod) : "—" },
                {
                  label: "Settled",
                  value: rma.status === "refunded" ? money(rma.refundAmount) : money(0),
                  strong: true,
                },
              ]}
            />
          </Section>

          <Section title="Inventory impact" hint="Simulated adjustment">
            <KeyValueGrid
              cols={2}
              items={[
                { label: "On hand", value: inv ? inv.onHand : "—", mono: true },
                { label: "Reserved", value: inv ? inv.reserved : "—", mono: true },
                { label: "Damaged", value: inv ? inv.damaged : "—", mono: true },
                { label: "Restock", value: rma.restockedAt ? `Applied ${dateTime(rma.restockedAt)}` : restock ? `+${rma.qty} on settle` : "None", mono: true },
              ]}
            />
            {serial && (
              <div className="border-t border-border px-4 py-3">
                <p className="label-tech">Serial status</p>
                <p className="mono mt-1 text-xs text-foreground">
                  {serial.serial} · {titleCase(serial.status)}
                </p>
              </div>
            )}
          </Section>

          <Section title="Timeline">
            <div className="p-4">
              <Timeline events={buildTimeline(rma)} />
            </div>
          </Section>
        </div>
      </div>

      <DemoNote>
        Returns are settled against local demo state only — no payment gateway refund, accounting entry or supplier RMA
        is created.
      </DemoNote>
    </div>
  );
}
