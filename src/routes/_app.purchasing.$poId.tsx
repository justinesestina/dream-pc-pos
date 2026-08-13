import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/purchasing/$poId")({
  head: () => ({
    meta: [
      { title: "Purchase Order — DPC Nexus" },
      { name: "description", content: "Purchase order lines, costs and receiving progress." },
      { property: "og:title", content: "Purchase Order — DPC Nexus" },
      { property: "og:description", content: "Purchase order lines, costs and receiving progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PurchaseOrderDetailPage,
});

function PurchaseOrderDetailPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Purchase Order" description="Purchase order lines, costs and receiving progress." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
