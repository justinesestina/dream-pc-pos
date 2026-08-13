import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

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
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Warranty" description="Coverage, claims and history for one warranty record." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
