import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/consultations/")({
  head: () => ({
    meta: [
      { title: "Consultations — DPC Nexus" },
      { name: "description", content: "Customer build consultations and requirements capture." },
      { property: "og:title", content: "Consultations — DPC Nexus" },
      { property: "og:description", content: "Customer build consultations and requirements capture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsultationsIndexPage,
});

function ConsultationsIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Consultations" description="Customer build consultations and requirements capture." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
