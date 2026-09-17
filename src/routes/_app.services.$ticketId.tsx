import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, Mono } from "@/components/nexus/primitives";
import { KeyValueGrid, Section, TotalsRows, DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { PrintButton } from "@/components/nexus/document";
import { Timeline } from "@/components/nexus/timeline";
import { Button } from "@/components/ui/button";
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
import { useStore } from "@/lib/store";
import { NewReleaseDialog } from "@/components/releases/new-release-dialog";
import { AddServicePartDialog, ServiceDiagnosisEditor } from "@/components/services/service-editor";
import { money, dateShort } from "@/lib/format";
import type { ServiceStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/services/$ticketId")({
  head: () => ({
    meta: [
      { title: "Ticket detail — DPC POS" },
      { name: "description", content: "Diagnosis, parts used, labor and status timeline." },
      { property: "og:title", content: "Ticket detail — DPC POS" },
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
  const { services, setServiceStatus, customerById, removeServicePart } = useStore();
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
            action={<Button asChild size="sm" variant="outline"><Link to="/services" search={{ openNew: false }}>Back to tickets</Link></Button>}
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
        status={<StatusBadge status={ticket.status} {...(ticket.status === "received" ? { tone: "neutral" as const } : {})} />}
        actions={
          <div className="flex flex-wrap gap-2">
            <PrintButton label="Print ticket" />
            {nextStatuses.slice(0, 3).map((st) => (
              <Button key={st} size="sm" variant="outline" onClick={() => advance(st)}>
                Mark {st.replace(/_/g, " ")}
              </Button>
            ))}
            {ticket.status !== "cancelled" && ticket.status !== "released" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-destructive">Cancel</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel ticket {ticket.id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The service ticket will be closed as cancelled and removed from the active queue.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep ticket</AlertDialogCancel>
                    <AlertDialogAction onClick={() => advance("cancelled")}>Cancel ticket</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {ticket.status === "ready" && <NewReleaseDialog triggerLabel="Schedule release" />}
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
            <div className="p-4">
              <EmptyState title="No parts recorded" description="No parts have been logged against this ticket yet." />
              <div className="flex justify-end">
                <AddServicePartDialog ticket={ticket} />
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {ticket.parts.map((p) => (
                  <div key={p.productId} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                    <div>
                      <p className="text-foreground">{p.name}</p>
                      <Mono>{p.qty} × {money(p.price)}</Mono>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="mono tabular-nums">{money(p.qty * p.price)}</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {p.name} from ticket?</AlertDialogTitle>
                            <AlertDialogDescription>
                              The part will be removed from this ticket and its quantity returned to stock.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep part</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                removeServicePart(ticket.id, p.productId);
                                toast.success(`${p.name} returned to stock.`);
                              }}
                            >
                              Remove part
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border p-3">
                <AddServicePartDialog ticket={ticket} />
                <span className="text-[11px] text-subtle">Parts deduct from on-hand stock.</span>
              </div>
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
            </>
          )}
        </Section>

        <Section title="Diagnosis & costs">
          <ServiceDiagnosisEditor ticket={ticket} />
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
