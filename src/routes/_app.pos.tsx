import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/pos")({
  head: () => ({
    meta: [
      { title: "Point of Sale — DPC Nexus" },
      { name: "description", content: "Ring up walk-in sales, apply discounts and take payment." },
      { property: "og:title", content: "Point of Sale — DPC Nexus" },
      { property: "og:description", content: "Ring up walk-in sales, apply discounts and take payment." },
    ],
  }),
  component: PosPage,
});

function PosPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Point of Sale" description="Ring up walk-in sales, apply discounts and take payment." />
      <Panel>
        <EmptyState title="Register module coming next" description="This surface is scaffolded and routed. The interactive register experience is the next build step." />
      </Panel>
    </div>
  );
}
