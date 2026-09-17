import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { StatusBadge } from "@/components/nexus/status-badge";
import { KeyValueGrid, Section, DemoNote } from "@/components/nexus/detail";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useOps } from "@/lib/ops-store";
import { useStore } from "@/lib/store";
import { num, dateShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/receiving/$receiptId")({
  head: () => ({
    meta: [
      { title: "Goods Receipt — DPC POS" },
      { name: "description", content: "Receive items, record damage and capture serial numbers." },
      { property: "og:title", content: "Goods Receipt — DPC POS" },
      { property: "og:description", content: "Receive items, record damage and capture serial numbers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReceiptDetailPage,
});

function ReceiptDetailPage() {
  const { receiptId } = Route.useParams();
  const { receiptById, updateReceiptLine, setReceiptNotes, completeReceipt } = useOps();
  const { adjustStock, registerSerials, productById } = useStore();
  const receipt = receiptById(receiptId);
  const [notesDraft, setNotesDraft] = useState(receipt?.notes ?? "");

  if (!receipt) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Goods Receipt" description="Receive items, record damage and capture serial numbers." />
        <Panel>
          <EmptyState title="Receipt not found" description={`No goods receipt matches ${receiptId}.`} />
        </Panel>
      </div>
    );
  }

  const locked = receipt.status !== "in_progress";

  const serialIssue = receipt.lines.find((l) => {
    const p = productById(l.productId);
    if (!p?.serialTracked || l.received === 0) return false;
    return l.serials.length !== l.received;
  });

  const handleComplete = () => {
    if (serialIssue) {
      toast.error(
        `${serialIssue.name}: expected ${serialIssue.received} serial number(s) but found ${serialIssue.serials.length}.`,
      );
      return;
    }
    completeReceipt(
      receipt.id,
      (productId, qty, ref) => adjustStock(productId, qty, `Goods receipt ${ref}`),
      (productId, serials, ref) => registerSerials(productId, serials, ref),
    );
    toast.success(`Receipt ${receipt.id} completed and stock posted.`);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={<Mono className="text-[19px] text-foreground">{receipt.id}</Mono>}
        description="Receive items, record damage and capture serial numbers."
        status={<StatusBadge status={receipt.status} />}
        actions={
          !locked && (
            <Button size="sm" onClick={handleComplete}>
              Complete receipt
            </Button>
          )
        }
      />

      <Section title="Reference">
        <KeyValueGrid
          cols={4}
          items={[
            { label: "Purchase order", value: <IdLink to="/purchasing/$poId" params={{ poId: receipt.purchaseOrderId }}>{receipt.purchaseOrderId}</IdLink> },
            { label: "Supplier", value: <IdLink to="/suppliers/$supplierId" params={{ supplierId: receipt.supplierId }}>{receipt.supplierName}</IdLink> },
            { label: "Received by", value: receipt.receivedBy },
            { label: "Date", value: dateShort(receipt.receivedAt) },
          ]}
        />
      </Section>

      <Section title="Lines" hint="Enter received and damaged quantities per line">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="label-tech px-4 py-2.5 font-normal">SKU</th>
                <th className="label-tech px-4 py-2.5 font-normal">Product</th>
                <th className="label-tech px-4 py-2.5 text-right font-normal">Expected</th>
                <th className="label-tech px-4 py-2.5 text-right font-normal">Received</th>
                <th className="label-tech px-4 py-2.5 text-right font-normal">Damaged</th>
                <th className="label-tech px-4 py-2.5 font-normal">Serials</th>
              </tr>
            </thead>
            <tbody>
              {receipt.lines.map((l) => {
                const mismatch = l.received !== l.expected || l.damaged > 0;
                const serialCount = l.serials.length;
                const dupSerials = serialCount !== new Set(l.serials).size;
                const serialMismatch = l.received > 0 && serialCount !== l.received;
                return (
                  <tr key={l.productId} className={cn("border-b border-border/60 last:border-0", mismatch && "bg-warning/5")}>
                    <td className="px-4 py-2.5"><Mono>{l.sku}</Mono></td>
                    <td className="px-4 py-2.5 text-foreground">{l.name}</td>
                    <td className="px-4 py-2.5 text-right"><span className="mono tabular-nums">{num(l.expected)}</span></td>
                    <td className="px-4 py-2.5 text-right">
                      <Input
                        type="number"
                        min={0}
                        disabled={locked}
                        value={l.received}
                        onChange={(e) => {
                          const r = Math.min(Math.max(0, Number(e.target.value) || 0), l.expected);
                          updateReceiptLine(receipt.id, l.productId, {
                            received: r,
                            damaged: Math.min(l.damaged, r),
                          });
                        }}
                        className={cn("h-8 w-20 text-right", mismatch && "border-warning/50 text-warning")}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Input
                        type="number"
                        min={0}
                        disabled={locked}
                        value={l.damaged}
                        onChange={(e) => {
                          const d = Math.max(0, Number(e.target.value) || 0);
                          updateReceiptLine(receipt.id, l.productId, { damaged: Math.min(d, l.received) });
                        }}
                        className="h-8 w-20 text-right"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input
                        disabled={locked}
                        placeholder="Comma-separated serials"
                        defaultValue={l.serials.join(", ")}
                        onBlur={(e) =>
                          updateReceiptLine(receipt.id, l.productId, {
                            serials: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className={cn("h-8 min-w-[12rem] text-xs", (serialMismatch || dupSerials) && "border-warning/50")}
                      />
                      {serialMismatch && (
                        <p className="mt-1 text-[11px] text-warning">
                          {serialCount} serial(s) entered, {l.received} expected.
                        </p>
                      )}
                      {dupSerials && (
                        <p className="mt-1 text-[11px] text-destructive">Duplicate serials detected.</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Notes">
        <div className="space-y-2 p-4">
          <Textarea
            rows={3}
            disabled={locked}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            onBlur={() => setReceiptNotes(receipt.id, notesDraft)}
            placeholder="Notes about condition, shortages or supplier communication"
          />
        </div>
      </Section>

      <DemoNote>
        Completing this receipt posts stock movements to inventory via the demo store — no warehouse scanner integration exists.
      </DemoNote>
    </div>
  );
}
