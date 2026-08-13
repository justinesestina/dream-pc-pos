import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, Mono } from "@/components/nexus/primitives";
import { KeyValueGrid, Section, ProgressBar } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { dateShort, daysUntil } from "@/lib/format";
import type { WarrantyClaim } from "@/lib/types";

export const Route = createFileRoute("/_app/warranty/$warrantyId")({
  head: () => ({
    meta: [
      { title: "Warranty — DPC Nexus" },
      { name: "description", content: "Coverage, claims and history for one warranty record." },
      { property: "og:title", content: "Warranty — DPC Nexus" },
      { property: "og:description", content: "Coverage, claims and history for one warranty record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WarrantyDetailPage,
});

function WarrantyDetailPage() {
  const { warrantyId } = Route.useParams();
  const { warranties, claims, customerById, createClaim } = useStore();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const warranty = warranties.find((w) => w.id === warrantyId);
  const warrantyClaims = useMemo(
    () => claims.filter((c) => c.warrantyId === warrantyId),
    [claims, warrantyId],
  );

  if (!warranty) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Warranty" description="Coverage, claims and history for one warranty record." />
        <Panel>
          <EmptyState
            title="Warranty not found"
            description={`No warranty record with id "${warrantyId}".`}
            action={<Button asChild size="sm" variant="outline"><Link to="/warranty">Back to warranty registry</Link></Button>}
          />
        </Panel>
      </div>
    );
  }

  const customer = customerById(warranty.customerId);
  const totalDays = Math.max(
    1,
    Math.round((new Date(warranty.expiresAt).getTime() - new Date(warranty.purchasedAt).getTime()) / 86400000),
  );
  const remaining = daysUntil(warranty.expiresAt);
  const usedPct = Math.max(0, Math.min(100, 100 - (remaining / totalDays) * 100));

  const claimColumns: Column<WarrantyClaim>[] = [
    { key: "id", header: "Claim", cell: (c) => <Mono>{c.id}</Mono> },
    { key: "created", header: "Filed", cell: (c) => dateShort(c.createdAt) },
    { key: "reason", header: "Reason", cell: (c) => <span className="max-w-[280px] truncate block">{c.reason}</span> },
    { key: "resolution", header: "Resolution", cell: (c) => c.resolution || "—" },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
  ];

  const submit = () => {
    if (!reason.trim()) {
      toast.error("Describe the issue to file a claim.");
      return;
    }
    const claim = createClaim(warranty.id, reason.trim());
    toast.success(`Claim ${claim.id} filed.`);
    setOpen(false);
    setReason("");
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={warranty.id}
        description="Coverage, claims and history for one warranty record."
        status={<StatusBadge status={warranty.status} />}
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            File claim
          </Button>
        }
      />

      <Section title="Coverage">
        <KeyValueGrid
          cols={3}
          items={[
            { label: "Serial", value: warranty.serial ? (
              <Link to="/serials" search={{ serial: warranty.serial }} className="mono underline decoration-border underline-offset-2 hover:text-foreground">{warranty.serial}</Link>
            ) : "—" },
            { label: "Product", value: warranty.productName },
            {
              label: "Customer",
              value: customer ? (
                <IdLink to="/customers/$customerId" params={{ customerId: customer.id }}>{customer.name}</IdLink>
              ) : (
                warranty.customerName
              ),
            },
            { label: "Order", value: <IdLink to="/orders/$orderId" params={{ orderId: warranty.orderId }}>{warranty.orderId}</IdLink> },
            { label: "Purchased", value: dateShort(warranty.purchasedAt) },
            { label: "Expires", value: dateShort(warranty.expiresAt) },
          ]}
        />
        <div className="space-y-2 px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="label-tech">Remaining coverage</span>
            <span className="mono">{remaining >= 0 ? `${remaining} days left` : "expired"}</span>
          </div>
          <ProgressBar value={usedPct} tone={remaining < 0 ? "warning" : remaining <= 30 ? "warning" : "success"} />
        </div>
      </Section>

      <Section title="Claim history" hint={`${warrantyClaims.length} filed`}>
        <DataTable
          rows={warrantyClaims}
          columns={claimColumns}
          pageSize={8}
          empty={<EmptyState title="No claims filed" description="This warranty has no claim history." />}
        />
      </Section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File a warranty claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="claim-reason">Reason</Label>
              <Textarea id="claim-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe the defect or issue…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Submit claim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
