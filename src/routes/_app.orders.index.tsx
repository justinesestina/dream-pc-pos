import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — DPC Nexus" },
      { name: "description", content: "Transaction history with payment and fulfillment status." },
      { property: "og:title", content: "Orders — DPC Nexus" },
      { property: "og:description", content: "Transaction history with payment and fulfillment status." },
    ],
  }),
  component: OrdersIndexPage,
});

function OrdersIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Orders" description="Transaction history with payment and fulfillment status." />
      <Panel>
        <EmptyState title="Orders module coming next" description="This surface is scaffolded and routed. The interactive orders experience is the next build step." />
      </Panel>
    </div>
  );
}
