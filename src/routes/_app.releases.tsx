import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/releases")({
  head: () => ({
    meta: [
      { title: "Delivery & Release — DPC Nexus" },
      { name: "description", content: "Pickup and delivery handover for builds and services." },
      { property: "og:title", content: "Delivery & Release — DPC Nexus" },
      { property: "og:description", content: "Pickup and delivery handover for builds and services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReleasesPage,
});

function ReleasesPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Delivery & Release" description="Pickup and delivery handover for builds and services." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
