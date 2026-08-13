import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — DPC Nexus" },
      { name: "description", content: "Stock on hand, reserved units, reorder points and serials." },
      { property: "og:title", content: "Inventory — DPC Nexus" },
      { property: "og:description", content: "Stock on hand, reserved units, reorder points and serials." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Inventory" description="Stock on hand, reserved units, reorder points and serials." />
      <Panel>
        <EmptyState title="Inventory module coming next" description="This surface is scaffolded and routed. The interactive inventory experience is the next build step." />
      </Panel>
    </div>
  );
}
