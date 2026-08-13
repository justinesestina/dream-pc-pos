import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

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

function ServicesTicketidPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Ticket detail" description="Diagnosis, parts used, labor and status timeline." />
      <Panel>
        <EmptyState title="Ticket module coming next" description="This surface is scaffolded and routed. The interactive ticket experience is the next build step." />
      </Panel>
    </div>
  );
}
