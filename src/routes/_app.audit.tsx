import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/audit")({
  head: () => ({
    meta: [
      { title: "Audit Log — DPC Nexus" },
      { name: "description", content: "Read-only record of system activity." },
      { property: "og:title", content: "Audit Log — DPC Nexus" },
      { property: "og:description", content: "Read-only record of system activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Audit Log" description="Read-only record of system activity." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
