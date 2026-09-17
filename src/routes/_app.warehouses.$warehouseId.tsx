import { createFileRoute } from "@tanstack/react-router";
import { WarehouseDetailPage } from "@/components/catalog/warehouse-detail-page";

export const Route = createFileRoute("/_app/warehouses/$warehouseId")({
  head: () => ({
    meta: [
      { title: "Warehouse — DPC Nexus" },
      { name: "description", content: "Warehouse stock, movements, transfers and settings." },
      { property: "og:title", content: "Warehouse — DPC Nexus" },
      {
        property: "og:description",
        content: "Warehouse stock, movements, transfers and settings.",
      },
    ],
  }),
  component: WarehouseDetailRoute,
});

function WarehouseDetailRoute() {
  const { warehouseId } = Route.useParams();
  return <WarehouseDetailPage warehouseId={warehouseId} />;
}
