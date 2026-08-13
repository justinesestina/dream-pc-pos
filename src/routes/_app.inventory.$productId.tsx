import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/inventory/$productId")({
  head: () => ({
    meta: [
      { title: "Stock Item — DPC Nexus" },
      { name: "description", content: "Stock levels, movements and serial numbers for one product." },
      { property: "og:title", content: "Stock Item — DPC Nexus" },
      { property: "og:description", content: "Stock levels, movements and serial numbers for one product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InventoryItemPage,
});

function InventoryItemPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Stock Item" description="Stock levels, movements and serial numbers for one product." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
