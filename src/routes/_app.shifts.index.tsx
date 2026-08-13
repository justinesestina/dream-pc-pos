import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/shifts/")({
  head: () => ({
    meta: [
      { title: "Cash Drawer — DPC Nexus" },
      { name: "description", content: "Cashier shifts, cash movements and end-of-shift reconciliation." },
      { property: "og:title", content: "Cash Drawer — DPC Nexus" },
      { property: "og:description", content: "Cashier shifts, cash movements and end-of-shift reconciliation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShiftsIndexPage,
});

function ShiftsIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Cash Drawer" description="Cashier shifts, cash movements and end-of-shift reconciliation." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
