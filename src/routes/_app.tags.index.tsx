import { createFileRoute } from "@tanstack/react-router";
import { TaxonomyPage } from "@/components/catalog/taxonomy-page";
import { tagsApi } from "@/lib/api-client";

export const Route = createFileRoute("/_app/tags/")({
  head: () => ({
    meta: [
      { title: "Tags — DPC Nexus" },
      { name: "description", content: "Product tags synced with WooCommerce." },
      { property: "og:title", content: "Tags — DPC Nexus" },
      { property: "og:description", content: "Product tags synced with WooCommerce." },
    ],
  }),
  component: TagsIndexPage,
});

function TagsIndexPage() {
  return (
    <TaxonomyPage
      title="Tags"
      description="Product tags synced with WooCommerce."
      noun="Tag"
      api={tagsApi}
    />
  );
}
