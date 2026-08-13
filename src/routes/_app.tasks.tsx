import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — DPC Nexus" },
      { name: "description", content: "Operational tasks across builds, services and receiving." },
      { property: "og:title", content: "Tasks — DPC Nexus" },
      { property: "og:description", content: "Operational tasks across builds, services and receiving." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Tasks" description="Operational tasks across builds, services and receiving." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
