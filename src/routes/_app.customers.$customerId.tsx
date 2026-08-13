import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { KeyValueGrid, Section } from "@/components/nexus/detail";
import { StatCard } from "@/components/nexus/stat-card";
import { StatusBadge } from "@/components/nexus/status-badge";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { money, dateShort, titleCase } from "@/lib/format";
import type { Order, Quote, Build, ServiceTicket, Warranty } from "@/lib/types";

export const Route = createFileRoute("/_app/customers/$customerId")({
  head: () => ({
    meta: [
      { title: "Customer detail — DPC Nexus" },
      { name: "description", content: "Profile, owned systems, orders and tickets." },
      { property: "og:title", content: "Customer detail — DPC Nexus" },
      { property: "og:description", content: "Profile, owned systems, orders and tickets." },
    ],
  }),
  component: CustomersCustomeridPage,
});

function CustomersCustomeridPage() {
  const { customerId } = Route.useParams();
  const { customers, orders, quotes, builds, services, warranties } = useStore();

  const customer = customers.find((c) => c.id === customerId);

  const cOrders = useMemo(() => orders.filter((o) => o.customerId === customerId), [orders, customerId]);
  const cQuotes = useMemo(() => quotes.filter((q) => q.customerId === customerId), [quotes, customerId]);
  const cBuilds = useMemo(() => builds.filter((b) => b.customerId === customerId), [builds, customerId]);
  const cServices = useMemo(() => services.filter((s) => s.customerId === customerId), [services, customerId]);
  const cWarranties = useMemo(() => warranties.filter((w) => w.customerId === customerId), [warranties, customerId]);

  const kpis = useMemo(() => {
    const totalSpend = cOrders.reduce((s, o) => s + o.total, 0);
    const avg = cOrders.length ? totalSpend / cOrders.length : 0;
    const openServices = cServices.filter((s) => !["released", "cancelled"].includes(s.status)).length;
    return { orders: cOrders.length, totalSpend, avg, openServices };
  }, [cOrders, cServices]);

  if (!customer) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Customer detail" description="Profile, owned systems, orders and tickets." />
        <Panel>
          <EmptyState title="Customer not found" description={`No customer with id "${customerId}".`} action={<Button asChild size="sm" variant="outline"><Link to="/customers" search={{ openNew: false }}>Back to customers</Link></Button>} />
        </Panel>
      </div>
    );
  }

  const orderColumns: Column<Order>[] = [
    { key: "id", header: "Order", cell: (o) => <IdLink to="/orders/$orderId" params={{ orderId: o.id }}>{o.id}</IdLink> },
    { key: "date", header: "Date", cell: (o) => dateShort(o.createdAt) },
    { key: "total", header: "Total", align: "right", cell: (o) => <span className="mono">{money(o.total)}</span> },
    { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
  ];

  const quoteColumns: Column<Quote>[] = [
    { key: "id", header: "Quote", cell: (q) => <IdLink to="/quotes/$quoteId" params={{ quoteId: q.id }}>{q.id}</IdLink> },
    { key: "date", header: "Date", cell: (q) => dateShort(q.createdAt) },
    { key: "total", header: "Total", align: "right", cell: (q) => <span className="mono">{money(q.total)}</span> },
    { key: "status", header: "Status", cell: (q) => <StatusBadge status={q.status} /> },
  ];

  const buildColumns: Column<Build>[] = [
    { key: "id", header: "Build", cell: (b) => <IdLink to="/builds/$buildId" params={{ buildId: b.id }}>{b.id}</IdLink> },
    { key: "purpose", header: "Purpose", cell: (b) => b.purpose },
    { key: "date", header: "Date", cell: (b) => dateShort(b.createdAt) },
    { key: "status", header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
  ];

  const serviceColumns: Column<ServiceTicket>[] = [
    { key: "id", header: "Ticket", cell: (s) => <IdLink to="/services/$ticketId" params={{ ticketId: s.id }}>{s.id}</IdLink> },
    { key: "device", header: "Device", cell: (s) => s.device },
    { key: "date", header: "Received", cell: (s) => dateShort(s.createdAt) },
    { key: "status", header: "Status", cell: (s) => <StatusBadge status={s.status} {...(s.status === "received" ? { tone: "neutral" as const } : {})} /> },
  ];

  const warrantyColumns: Column<Warranty>[] = [
    { key: "id", header: "Warranty", cell: (w) => <IdLink to="/warranty/$warrantyId" params={{ warrantyId: w.id }}>{w.id}</IdLink> },
    { key: "product", header: "Product", cell: (w) => w.productName },
    { key: "expires", header: "Expires", cell: (w) => dateShort(w.expiresAt) },
    { key: "status", header: "Status", cell: (w) => <StatusBadge status={w.status} /> },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={customer.name}
        description="Profile, owned systems, orders and tickets."
        status={<StatusBadge status={customer.status} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders" numericValue={kpis.orders} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Total spend" numericValue={kpis.totalSpend} format={money} accent="success" />
        <StatCard label="Avg order value" numericValue={kpis.avg} format={money} accent="neutral" />
        <StatCard label="Open services" numericValue={kpis.openServices} format={(n) => Math.round(n).toString()} accent="warning" />
      </div>

      <Section title="Profile">
        <KeyValueGrid
          cols={4}
          items={[
            { label: "Type", value: titleCase(customer.type) },
            { label: "Email", value: customer.email, mono: true },
            { label: "Phone", value: customer.phone, mono: true },
            { label: "Customer since", value: dateShort(customer.since) },
            { label: "Address", value: customer.address || "—" },
            { label: "Notes", value: customer.notes || "—" },
          ]}
        />
      </Section>

      <Section title="Orders" hint={`${cOrders.length} total`}>
        <DataTable rows={cOrders} columns={orderColumns} pageSize={5} empty={<EmptyState title="No orders yet" />} />
      </Section>

      <Section title="Quotes" hint={`${cQuotes.length} total`}>
        <DataTable rows={cQuotes} columns={quoteColumns} pageSize={5} empty={<EmptyState title="No quotes yet" />} />
      </Section>

      <Section title="Builds" hint={`${cBuilds.length} total`}>
        <DataTable rows={cBuilds} columns={buildColumns} pageSize={5} empty={<EmptyState title="No builds yet" />} />
      </Section>

      <Section title="Service tickets" hint={`${cServices.length} total`}>
        <DataTable rows={cServices} columns={serviceColumns} pageSize={5} empty={<EmptyState title="No service tickets yet" />} />
      </Section>

      <Section title="Warranties" hint={`${cWarranties.length} total`}>
        <DataTable rows={cWarranties} columns={warrantyColumns} pageSize={5} empty={<EmptyState title="No warranties yet" />} />
      </Section>
    </div>
  );
}
