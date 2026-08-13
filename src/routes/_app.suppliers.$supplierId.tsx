import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/suppliers/$supplierId")({
  head: () => ({
    meta: [
      { title: "Supplier — DPC Nexus" },
      { name: "description", content: "Supplier profile, purchase history and supplied products." },
      { property: "og:title", content: "Supplier — DPC Nexus" },
      { property: "og:description", content: "Supplier profile, purchase history and supplied products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SupplierDetailPage,
});

function SupplierDetailPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Supplier" description="Supplier profile, purchase history and supplied products." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
