import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { StatusBadge } from "@/components/nexus/status-badge";
import { KeyValueGrid, Section, TotalsRows, DemoNote, ProgressBar } from "@/components/nexus/detail";
import { Button } from "@/components/ui/button";
import { useOps } from "@/lib/ops-store";
import { money, num, dateShort } from "@/lib/format";
import type { PurchaseStatus } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/purchasing/$poId")({
  head: () => ({
    meta: [
      { title: "Purchase Order — DPC Nexus" },
      { name: "description", content: "Purchase order lines, costs and receiving progress." },
      { property: "og:title", content: "Purchase Order — DPC Nexus" },
      { property: "og:description", content: "Purchase order lines, costs and receiving progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PurchaseOrderDetailPage,
});

const NEXT_STATUS: Partial<Record<PurchaseStatus, PurchaseStatus>> = {
  draft: "submitted",
  submitted: "confirmed",
};

function PurchaseOrderDetailPage() {
  const { poId } = Route.useParams();
  const { poById, setPoStatus, startReceipt, receipts } = useOps();
  const navigate = useNavigate();
  const po = poById(poId);

  if (!po) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Purchase Order" description="Purchase order lines, costs and receiving progress." />
        <Panel>
          <EmptyState title="Purchase order not found" description={`No purchase order matches ${poId}.`} />
        </Panel>
      </div>
    );
  }

  const relatedReceipt = receipts.find((r) => r.purchaseOrderId === po.id);
  const canReceive = ["submitted", "confirmed", "partial"].includes(po.status);
  const next = NEXT_STATUS[po.status];

  const handleStartReceiving = () => {
    const receipt = startReceipt(po.id);
    if (!receipt) {
      toast.error("Could not start receiving for this purchase order.");
      return;
    }
    toast.success(`Receiving started — ${receipt.id}`);
    navigate({ to: "/receiving/$receiptId", params: { receiptId: receipt.id } });
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={<Mono className="text-[19px] text-foreground">{po.id}</Mono>}
        description="Purchase order lines, costs and receiving progress."
        status={<StatusBadge status={po.status} />}
        actions={
          <>
            {next && (
              <Button size="sm" variant="outline" onClick={() => setPoStatus(po.id, next)}>
                Mark as {next}
              </Button>
            )}
            {po.status !== "cancelled" && po.status !== "received" && (
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => setPoStatus(po.id, "cancelled")}>
                Cancel PO
              </Button>
            )}
            {canReceive && !relatedReceipt && (
              <Button size="sm" onClick={handleStartReceiving}>
                Start receiving
              </Button>
            )}
            {relatedReceipt && (
              <Button size="sm" variant="outline" asChild>
                <Link to="/receiving/$receiptId" params={{ receiptId: relatedReceipt.id }}>
                  View receipt {relatedReceipt.id}
                </Link>
              </Button>
            )}
          </>
        }
      />

      <Section title="Supplier">
        <KeyValueGrid
          cols={4}
          items={[
            { label: "Supplier", value: <IdLink to="/suppliers/$supplierId" params={{ supplierId: po.supplierId }}>{po.supplierName}</IdLink> },
            { label: "Created", value: dateShort(po.createdAt) },
            { label: "Expected", value: dateShort(po.expectedAt) },
            { label: "Created by", value: po.createdBy },
          ]}
        />
      </Section>

      <Section title="Lines" hint={`${po.lines.length} line item(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="label-tech px-4 py-2.5 font-normal">SKU</th>
                <th className="label-tech px-4 py-2.5 font-normal">Product</th>
                <th className="label-tech px-4 py-2.5 text-right font-normal">Qty</th>
                <th className="label-tech px-4 py-2.5 text-right font-normal">Received</th>
                <th className="label-tech px-4 py-2.5 text-right font-normal">Unit cost</th>
                <th className="label-tech px-4 py-2.5 text-right font-normal">Line total</th>
                <th className="label-tech px-4 py-2.5 font-normal">Progress</th>
              </tr>
            </thead>
            <tbody>
              {po.lines.map((l) => (
                <tr key={l.productId} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5"><Mono>{l.sku}</Mono></td>
                  <td className="px-4 py-2.5 text-foreground">{l.name}</td>
                  <td className="px-4 py-2.5 text-right"><span className="mono tabular-nums">{num(l.qty)}</span></td>
                  <td className="px-4 py-2.5 text-right"><span className="mono tabular-nums">{num(l.received)}</span></td>
                  <td className="px-4 py-2.5 text-right"><span className="mono tabular-nums">{money(l.unitCost)}</span></td>
                  <td className="px-4 py-2.5 text-right"><span className="mono tabular-nums">{money(l.qty * l.unitCost)}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={(l.received / l.qty) * 100} tone={l.received >= l.qty ? "success" : "info"} className="w-20" />
                      <span className="mono text-[11px] text-subtle">{Math.round((l.received / l.qty) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-border p-4">
          <TotalsRows
            rows={[
              { label: "Lines total", value: money(po.total) },
              { label: "Total", value: money(po.total), strong: true },
            ]}
          />
        </div>
      </Section>

      {po.notes && (
        <Section title="Notes">
          <p className="p-4 text-[13px] text-muted-foreground">{po.notes}</p>
        </Section>
      )}

      <DemoNote>
        Status transitions and receiving are simulated locally — no supplier EDI or accounting integration exists in this demo.
      </DemoNote>
    </div>
  );
}
