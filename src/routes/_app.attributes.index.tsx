import { createFileRoute } from "@tanstack/react-router";
import { AttributesPage } from "@/components/catalog/attributes-page";

export const Route = createFileRoute("/_app/attributes/")({
  head: () => ({
    meta: [
      { title: "Attributes — DPC Nexus" },
      { name: "description", content: "Product attributes and terms synced with WooCommerce." },
      { property: "og:title", content: "Attributes — DPC Nexus" },
      {
        property: "og:description",
        content: "Product attributes and terms synced with WooCommerce.",
      },
    ],
  }),
  component: AttributesIndexPage,
});

function AttributesIndexPage() {
  return <AttributesPage />;
}
