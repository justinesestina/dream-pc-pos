import { createFileRoute } from "@tanstack/react-router";
import { TaxonomyPage } from "@/components/catalog/taxonomy-page";
import { brandsApi } from "@/lib/api-client";

export const Route = createFileRoute("/_app/brands/")({
  head: () => ({
    meta: [
      { title: "Brands — DPC Nexus" },
      { name: "description", content: "Product brands synced with WooCommerce." },
      { property: "og:title", content: "Brands — DPC Nexus" },
      { property: "og:description", content: "Product brands synced with WooCommerce." },
    ],
  }),
  component: BrandsIndexPage,
});

function BrandsIndexPage() {
  return (
    <TaxonomyPage
      title="Brands"
      description="Brand directory synced with WooCommerce."
      noun="Brand"
      api={brandsApi}
    />
  );
}
