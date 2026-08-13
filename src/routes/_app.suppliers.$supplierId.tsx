import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { StatusBadge } from "@/components/nexus/status-badge";
import { KeyValueGrid, Section, TotalsRows } from "@/components/nexus/detail";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { useOps } from "@/lib/ops-store";
import { money, num, dateShort } from "@/lib/format";
import type { PurchaseOrder } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/suppliers/$supplierId")({
  head: () => ({
    meta: [
      { title: "Supplier — DPC Nexus" },
      { name: "description", content: "Supplier profile, purchase history and supplied products." },
      { property: "og:title", content: "Supplier — DPC Nexus" },
      { property: "og:description", content: "Supplier profile, purchase history and supplied products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SupplierDetailPage,
});

function SupplierDetailPage() {
  const { supplierId } = Route.useParams();
  const { supplierById, purchaseOrders } = useOps();
  const navigate = useNavigate();
  const supplier = supplierById(supplierId);

  const orders = useMemo(
    () => purchaseOrders.filter((p) => p.supplierId === supplierId),
    [purchaseOrders, supplierId],
  );

  const spend = useMemo(() => {
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    const received = orders.filter((o) => o.status === "received").reduce((sum, o) => sum + o.total, 0);
    return { total, received, open: total - received };
  }, [orders]);

  if (!supplier) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Supplier" description="Supplier profile, purchase history and supplied products." />
        <Panel>
          <EmptyState title="Supplier not found" description={`No supplier matches ${supplierId}.`} />
        </Panel>
      </div>
    );
  }

  const columns: Column<PurchaseOrder>[] = [
    { key: "id", header: "PO ID", cell: (r) => <Mono className="text-foreground">{r.id}</Mono>, sortValue: (r) => r.id },
    { key: "created", header: "Created", cell: (r) => <span className="mono text-xs">{dateShort(r.createdAt)}</span>, sortValue: (r) => r.createdAt },
    { key: "expected", header: "Expected", cell: (r) => <span className="mono text-xs">{dateShort(r.expectedAt)}</span>, sortValue: (r) => r.expectedAt },
    { key: "lines", header: "Lines", cell: (r) => <span className="mono tabular-nums">{num(r.lines.length)}</span>, align: "right" },
    { key: "total", header: "Total", cell: (r) => <span className="mono tabular-nums">{money(r.total)}</span>, sortValue: (r) => r.total, align: "right" },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, align: "right" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={supplier.name}
        description="Supplier profile, purchase history and supplied products."
        status={<StatusBadge status={supplier.status} />}
      />

      <Section title="Contact">
        <KeyValueGrid
          cols={4}
          items={[
            { label: "Contact", value: supplier.contact },
            { label: "Email", value: supplier.email },
            { label: "Phone", value: supplier.phone, mono: true },
            { label: "Address", value: supplier.address },
            { label: "Terms", value: supplier.terms, mono: true },
            { label: "Lead time", value: `${supplier.leadTimeDays} days` },
            { label: "Rating", value: supplier.rating.toFixed(1) },
            { label: "Categories", value: supplier.categories.join(", ") },
          ]}
        />
        {supplier.notes && (
          <p className="border-t border-border px-4 py-3 text-[13px] text-muted-foreground">{supplier.notes}</p>
        )}
      </Section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Panel className="p-4">
          <TotalsRows rows={[{ label: "Total spend", value: money(spend.total), strong: true }]} />
        </Panel>
        <Panel className="p-4">
          <TotalsRows rows={[{ label: "Received value", value: money(spend.received) }]} />
        </Panel>
        <Panel className="p-4">
          <TotalsRows rows={[{ label: "Outstanding value", value: money(spend.open) }]} />
        </Panel>
      </div>

      <Section title="Purchase orders" hint={`${orders.length} order(s) with this supplier`}>
        <DataTable
          rows={orders}
          columns={columns}
          onRowClick={(r) => navigate({ to: "/purchasing/$poId", params: { poId: r.id } })}
          empty={<EmptyState title="No purchase orders yet" description="This supplier has no purchase orders on record." />}
        />
      </Section>
    </div>
  );
}
