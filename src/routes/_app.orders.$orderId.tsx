import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order detail — DPC Nexus" },
      { name: "description", content: "Line items, payment breakdown and receipt actions." },
      { property: "og:title", content: "Order detail — DPC Nexus" },
      { property: "og:description", content: "Line items, payment breakdown and receipt actions." },
    ],
  }),
  component: OrdersOrderidPage,
});

function OrdersOrderidPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Order detail" description="Line items, payment breakdown and receipt actions." />
      <Panel>
        <EmptyState title="Order module coming next" description="This surface is scaffolded and routed. The interactive order experience is the next build step." />
      </Panel>
    </div>
  );
}
