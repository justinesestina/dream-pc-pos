import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/receiving/$receiptId")({
  head: () => ({
    meta: [
      { title: "Goods Receipt — DPC Nexus" },
      { name: "description", content: "Receive items, record damage and capture serial numbers." },
      { property: "og:title", content: "Goods Receipt — DPC Nexus" },
      { property: "og:description", content: "Receive items, record damage and capture serial numbers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReceiptDetailPage,
});

function ReceiptDetailPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Goods Receipt" description="Receive items, record damage and capture serial numbers." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
