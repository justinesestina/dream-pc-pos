import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/services/")({
  head: () => ({
    meta: [
      { title: "Service Tickets — DPC Nexus" },
      { name: "description", content: "Repairs, diagnostics and upgrade jobs." },
      { property: "og:title", content: "Service Tickets — DPC Nexus" },
      { property: "og:description", content: "Repairs, diagnostics and upgrade jobs." },
    ],
  }),
  component: ServicesIndexPage,
});

function ServicesIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Service Tickets" description="Repairs, diagnostics and upgrade jobs." />
      <Panel>
        <EmptyState title="Service module coming next" description="This surface is scaffolded and routed. The interactive service experience is the next build step." />
      </Panel>
    </div>
  );
}
