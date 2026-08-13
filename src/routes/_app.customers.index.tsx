import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/customers/")({
  head: () => ({
    meta: [
      { title: "Customers — DPC Nexus" },
      { name: "description", content: "Customer directory with purchase and service history." },
      { property: "og:title", content: "Customers — DPC Nexus" },
      { property: "og:description", content: "Customer directory with purchase and service history." },
    ],
  }),
  component: CustomersIndexPage,
});

function CustomersIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Customers" description="Customer directory with purchase and service history." />
      <Panel>
        <EmptyState title="Customers module coming next" description="This surface is scaffolded and routed. The interactive customers experience is the next build step." />
      </Panel>
    </div>
  );
}
