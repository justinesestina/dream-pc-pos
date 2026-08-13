import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — DPC Nexus" },
      { name: "description", content: "Sales, margin, inventory turnover and technician output." },
      { property: "og:title", content: "Reports — DPC Nexus" },
      { property: "og:description", content: "Sales, margin, inventory turnover and technician output." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Reports" description="Sales, margin, inventory turnover and technician output." />
      <Panel>
        <EmptyState title="Reports module coming next" description="This surface is scaffolded and routed. The interactive reports experience is the next build step." />
      </Panel>
    </div>
  );
}
