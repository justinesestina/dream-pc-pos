import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/products/$productId")({
  head: () => ({
    meta: [
      { title: "Product detail — DPC Nexus" },
      { name: "description", content: "Specifications, pricing, stock and movement history." },
      { property: "og:title", content: "Product detail — DPC Nexus" },
      { property: "og:description", content: "Specifications, pricing, stock and movement history." },
    ],
  }),
  component: ProductsProductidPage,
});

function ProductsProductidPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Product detail" description="Specifications, pricing, stock and movement history." />
      <Panel>
        <EmptyState title="Product module coming next" description="This surface is scaffolded and routed. The interactive product experience is the next build step." />
      </Panel>
    </div>
  );
}
