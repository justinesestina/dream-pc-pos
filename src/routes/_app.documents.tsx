import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({
    meta: [
      { title: "Documents — DPC Nexus" },
      { name: "description", content: "Receipts, invoices, quotations and release documents." },
      { property: "og:title", content: "Documents — DPC Nexus" },
      { property: "og:description", content: "Receipts, invoices, quotations and release documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Documents" description="Receipts, invoices, quotations and release documents." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
