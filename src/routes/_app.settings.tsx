import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DPC Nexus" },
      { name: "description", content: "Store profile, roles, tax rules and preferences." },
      { property: "og:title", content: "Settings — DPC Nexus" },
      { property: "og:description", content: "Store profile, roles, tax rules and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Settings" description="Store profile, roles, tax rules and preferences." />
      <Panel>
        <EmptyState title="Settings module coming next" description="This surface is scaffolded and routed. The interactive settings experience is the next build step." />
      </Panel>
    </div>
  );
}
