import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/customers/$customerId")({
  head: () => ({
    meta: [
      { title: "Customer detail — DPC Nexus" },
      { name: "description", content: "Profile, owned systems, orders and tickets." },
      { property: "og:title", content: "Customer detail — DPC Nexus" },
      { property: "og:description", content: "Profile, owned systems, orders and tickets." },
    ],
  }),
  component: CustomersCustomeridPage,
});

function CustomersCustomeridPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Customer detail" description="Profile, owned systems, orders and tickets." />
      <Panel>
        <EmptyState title="Customer module coming next" description="This surface is scaffolded and routed. The interactive customer experience is the next build step." />
      </Panel>
    </div>
  );
}
