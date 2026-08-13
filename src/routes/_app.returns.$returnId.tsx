import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/returns/$returnId")({
  head: () => ({
    meta: [
      { title: "Return Request — DPC Nexus" },
      { name: "description", content: "Inspection, approval and refund workflow for a return." },
      { property: "og:title", content: "Return Request — DPC Nexus" },
      { property: "og:description", content: "Inspection, approval and refund workflow for a return." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReturnDetailPage,
});

function ReturnDetailPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Return Request" description="Inspection, approval and refund workflow for a return." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
