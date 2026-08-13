import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/builds/$buildId")({
  head: () => ({
    meta: [
      { title: "Build detail — DPC Nexus" },
      { name: "description", content: "Parts list, compatibility checks, QA results and timeline." },
      { property: "og:title", content: "Build detail — DPC Nexus" },
      { property: "og:description", content: "Parts list, compatibility checks, QA results and timeline." },
    ],
  }),
  component: BuildsBuildidPage,
});

function BuildsBuildidPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Build detail" description="Parts list, compatibility checks, QA results and timeline." />
      <Panel>
        <EmptyState title="Build module coming next" description="This surface is scaffolded and routed. The interactive build experience is the next build step." />
      </Panel>
    </div>
  );
}
