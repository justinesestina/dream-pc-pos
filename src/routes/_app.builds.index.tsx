import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/builds/")({
  head: () => ({
    meta: [
      { title: "Custom Builds — DPC Nexus" },
      { name: "description", content: "Build pipeline from consultation through QA to release." },
      { property: "og:title", content: "Custom Builds — DPC Nexus" },
      { property: "og:description", content: "Build pipeline from consultation through QA to release." },
    ],
  }),
  component: BuildsIndexPage,
});

function BuildsIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Custom Builds" description="Build pipeline from consultation through QA to release." />
      <Panel>
        <EmptyState title="Builds module coming next" description="This surface is scaffolded and routed. The interactive builds experience is the next build step." />
      </Panel>
    </div>
  );
}
