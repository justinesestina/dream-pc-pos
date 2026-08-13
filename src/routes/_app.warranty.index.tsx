import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/warranty/")({
  head: () => ({
    meta: [
      { title: "Warranty — DPC Nexus" },
      { name: "description", content: "Warranty registry, coverage windows and claims." },
      { property: "og:title", content: "Warranty — DPC Nexus" },
      { property: "og:description", content: "Warranty registry, coverage windows and claims." },
    ],
  }),
  component: WarrantyPage,
});

function WarrantyPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Warranty" description="Warranty registry, coverage windows and claims." />
      <Panel>
        <EmptyState title="Warranty module coming next" description="This surface is scaffolded and routed. The interactive warranty experience is the next build step." />
      </Panel>
    </div>
  );
}
