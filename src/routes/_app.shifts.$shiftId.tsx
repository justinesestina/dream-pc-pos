import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/shifts/$shiftId")({
  head: () => ({
    meta: [
      { title: "Shift — DPC Nexus" },
      { name: "description", content: "Shift detail with tender breakdown and variance." },
      { property: "og:title", content: "Shift — DPC Nexus" },
      { property: "og:description", content: "Shift detail with tender breakdown and variance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShiftDetailPage,
});

function ShiftDetailPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Shift" description="Shift detail with tender breakdown and variance." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
