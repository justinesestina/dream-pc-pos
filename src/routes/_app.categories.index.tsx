import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/catalog/category-page";

export const Route = createFileRoute("/_app/categories/")({
  head: () => ({
    meta: [
      { title: "Categories — DPC Nexus" },
      { name: "description", content: "Product categories synced with WooCommerce." },
      { property: "og:title", content: "Categories — DPC Nexus" },
      { property: "og:description", content: "Product categories synced with WooCommerce." },
    ],
  }),
  component: CategoriesIndexPage,
});

function CategoriesIndexPage() {
  return <CategoryPage />;
}
