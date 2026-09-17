import { createFileRoute } from "@tanstack/react-router";
import { WarehousesPage } from "@/components/catalog/warehouses-page";

export const Route = createFileRoute("/_app/warehouses/")({
  head: () => ({
    meta: [
      { title: "Warehouses — DPC Nexus" },
      { name: "description", content: "Branch and storage locations." },
      { property: "og:title", content: "Warehouses — DPC Nexus" },
      { property: "og:description", content: "Branch and storage locations." },
    ],
  }),
  component: WarehousesIndexPage,
});

function WarehousesIndexPage() {
  return <WarehousesPage />;
}
