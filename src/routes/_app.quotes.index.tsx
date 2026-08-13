import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/quotes/")({
  head: () => ({
    meta: [
      { title: "Quotes — DPC Nexus" },
      { name: "description", content: "Quotations, validity windows and conversion to orders." },
      { property: "og:title", content: "Quotes — DPC Nexus" },
      { property: "og:description", content: "Quotations, validity windows and conversion to orders." },
    ],
  }),
  component: QuotesIndexPage,
});

function QuotesIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Quotes" description="Quotations, validity windows and conversion to orders." />
      <Panel>
        <EmptyState title="Quotes module coming next" description="This surface is scaffolded and routed. The interactive quotes experience is the next build step." />
      </Panel>
    </div>
  );
}
