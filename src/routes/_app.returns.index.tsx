import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/returns/")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds — DPC Nexus" },
      { name: "description", content: "Return requests, inspection outcomes and refunds." },
      { property: "og:title", content: "Returns & Refunds — DPC Nexus" },
      { property: "og:description", content: "Return requests, inspection outcomes and refunds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReturnsIndexPage,
});

function ReturnsIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Returns & Refunds" description="Return requests, inspection outcomes and refunds." />
      <Panel>
        <EmptyState title="Not built yet" description="This surface is scaffolded and routed." />
      </Panel>
    </div>
  );
}
