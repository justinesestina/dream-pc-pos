import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/staff")({
  head: () => ({
    meta: [
      { title: "Staff & Assignments — DPC Nexus" },
      { name: "description", content: "Technician workload and operational assignments." },
      { property: "og:title", content: "Staff & Assignments — DPC Nexus" },
      { property: "og:description", content: "Technician workload and operational assignments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Staff & Assignments" description="Technician workload and operational assignments." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
