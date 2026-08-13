import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/consultations/$consultationId")({
  head: () => ({
    meta: [
      { title: "Consultation — DPC Nexus" },
      { name: "description", content: "Requirements, recommendation and conversion path." },
      { property: "og:title", content: "Consultation — DPC Nexus" },
      { property: "og:description", content: "Requirements, recommendation and conversion path." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsultationDetailPage,
});

function ConsultationDetailPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Consultation" description="Requirements, recommendation and conversion path." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
