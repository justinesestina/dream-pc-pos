import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, Mono } from "@/components/nexus/primitives";
import { KeyValueGrid, Section, TotalsRows, DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Timeline } from "@/components/nexus/timeline";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { money, dateShort } from "@/lib/format";
import type { ServiceStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/services/$ticketId")({
  head: () => ({
    meta: [
      { title: "Ticket detail — DPC Nexus" },
      { name: "description", content: "Diagnosis, parts used, labor and status timeline." },
      { property: "og:title", content: "Ticket detail — DPC Nexus" },
      { property: "og:description", content: "Diagnosis, parts used, labor and status timeline." },
    ],
  }),
  component: ServicesTicketidPage,
});

const FLOW: ServiceStatus[] = [
  "received",
  "diagnosing",
  "waiting_customer",
  "waiting_parts",
  "in_repair",
  "ready",
  "released",
];

function ServicesTicketidPage() {
  const { ticketId } = Route.useParams();
  const { services, setServiceStatus, customerById } = useStore();
  const ticket = services.find((t) => t.id === ticketId);

  const nextStatuses = useMemo(() => {
    if (!ticket) return [];
    const idx = FLOW.indexOf(ticket.status);
    if (idx === -1) return [];
    return FLOW.slice(idx + 1);
  }, [ticket]);

  if (!ticket) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Ticket detail" description="Diagnosis, parts used, labor and status timeline." />
        <Panel>
          <EmptyState
            title="Ticket not found"
            description={`No service ticket with id "${ticketId}".`}
            action={<Button asChild size="sm" variant="outline"><Link to="/services">Back to tickets</Link></Button>}
          />
        </Panel>
      </div>
    );
  }

  const customer = customerById(ticket.customerId);
  const partsTotal = ticket.parts.reduce((s, p) => s + p.qty * p.price, 0);

  const advance = (status: ServiceStatus) => {
    setServiceStatus(ticket.id, status);
    toast.success(`${ticket.id} set to ${status.replace(/_/g, " ")}.`);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={ticket.id}
        description="Diagnosis, parts used, labor and status timeline."
        status={<StatusBadge status={ticket.status} />}
        actions={
          <div className="flex flex-wrap gap-2">
            {nextStatuses.slice(0, 3).map((st) => (
              <Button key={st} size="sm" variant="outline" onClick={() => advance(st)}>
                Mark {st.replace(/_/g, " ")}
              </Button>
            ))}
            {ticket.status !== "cancelled" && ticket.status !== "released" && (
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => advance("cancelled")}>
                Cancel
              </Button>
            )}
          </div>
        }
      />

      <Section title="Device & issue">
        <KeyValueGrid
          cols={3}
          items={[
            { label: "Customer", value: customer ? <IdLink to="/customers/$customerId" params={{ customerId: customer.id }}>{customer.name}</IdLink> : ticket.customerName },
            { label: "Device", value: ticket.device },
            { label: "Technician", value: ticket.technician },
            { label: "Received", value: dateShort(ticket.createdAt) },
            { label: "Issue", value: ticket.issue },
            { label: "Diagnosis", value: ticket.diagnosis || "Not yet diagnosed" },
          ]}
        />
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Parts used" hint={`${ticket.parts.length} line(s)`}>
          {ticket.parts.length === 0 ? (
            <EmptyState title="No parts recorded" description="No parts have been logged against this ticket yet." />
          ) : (
            <div className="divide-y divide-border">
              {ticket.parts.map((p) => (
                <div key={p.productId} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                  <div>
                    <p className="text-foreground">{p.name}</p>
                    <Mono>{p.qty} × {money(p.price)}</Mono>
                  </div>
                  <span className="mono tabular-nums">{money(p.qty * p.price)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-border p-4">
            <TotalsRows
              rows={[
                { label: "Parts", value: money(partsTotal) },
                { label: "Labor", value: money(ticket.labor) },
                { label: "Estimated cost", value: money(ticket.estimatedCost), muted: true },
                { label: "Actual cost", value: ticket.actualCost != null ? money(ticket.actualCost) : "—", strong: true },
              ]}
            />
          </div>
        </Section>

        <Section title="Status timeline">
          <div className="p-4">
            <Timeline events={ticket.timeline} />
          </div>
        </Section>
      </div>

      <DemoNote>Status advancement and cost capture are simulated locally — no technician notifications or payment processing occur.</DemoNote>
    </div>
  );
}
