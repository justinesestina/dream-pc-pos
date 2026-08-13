import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/purchasing/")({
  head: () => ({
    meta: [
      { title: "Purchasing — DPC Nexus" },
      { name: "description", content: "Purchase orders, supplier commitments and expected deliveries." },
      { property: "og:title", content: "Purchasing — DPC Nexus" },
      { property: "og:description", content: "Purchase orders, supplier commitments and expected deliveries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PurchasingIndexPage,
});

function PurchasingIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Purchasing" description="Purchase orders, supplier commitments and expected deliveries." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
