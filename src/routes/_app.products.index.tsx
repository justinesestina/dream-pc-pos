import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { EmptyState } from "@/components/nexus/primitives";

export const Route = createFileRoute("/_app/products/")({
  head: () => ({
    meta: [
      { title: "Products — DPC Nexus" },
      { name: "description", content: "Catalog of components, peripherals and prebuilt systems." },
      { property: "og:title", content: "Products — DPC Nexus" },
      { property: "og:description", content: "Catalog of components, peripherals and prebuilt systems." },
    ],
  }),
  component: ProductsIndexPage,
});

function ProductsIndexPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Products" description="Catalog of components, peripherals and prebuilt systems." />
      <Panel>
        <EmptyState title="Catalog module coming next" description="This surface is scaffolded and routed. The interactive catalog experience is the next build step." />
      </Panel>
    </div>
  );
}
