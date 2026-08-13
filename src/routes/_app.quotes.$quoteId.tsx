import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/quotes/$quoteId")({
  head: () => ({
    meta: [
      { title: "Quote detail — DPC Nexus" },
      { name: "description", content: "Quoted configuration, totals and approval state." },
      { property: "og:title", content: "Quote detail — DPC Nexus" },
      { property: "og:description", content: "Quoted configuration, totals and approval state." },
    ],
  }),
  component: QuotesQuoteidPage,
});

function QuotesQuoteidPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Quote detail" description="Quoted configuration, totals and approval state." />
      <Panel>
        <EmptyState title="Quote module coming next" description="This surface is scaffolded and routed. The interactive quote experience is the next build step." />
      </Panel>
    </div>
  );
}
