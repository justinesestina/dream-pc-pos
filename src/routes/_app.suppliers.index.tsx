import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/suppliers/")({
  head: () => ({
    meta: [
      { title: "Suppliers — DPC Nexus" },
      { name: "description", content: "Supplier directory, terms and lead times." },
      { property: "og:title", content: "Suppliers — DPC Nexus" },
      { property: "og:description", content: "Supplier directory, terms and lead times." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SuppliersIndexPage,
});

function SuppliersIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Suppliers" description="Supplier directory, terms and lead times." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
