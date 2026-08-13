import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/receiving/")({
  head: () => ({
    meta: [
      { title: "Stock Receiving — DPC Nexus" },
      { name: "description", content: "Goods receipts against purchase orders." },
      { property: "og:title", content: "Stock Receiving — DPC Nexus" },
      { property: "og:description", content: "Goods receipts against purchase orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReceivingIndexPage,
});

function ReceivingIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Stock Receiving" description="Goods receipts against purchase orders." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
