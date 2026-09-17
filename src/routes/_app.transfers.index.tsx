import { createFileRoute } from "@tanstack/react-router";
import { TransfersPage } from "@/components/catalog/transfers-page";

export const Route = createFileRoute("/_app/transfers/")({
  head: () => ({
    meta: [
      { title: "Stock Transfers — DPC Nexus" },
      { name: "description", content: "Move stock between warehouses." },
      { property: "og:title", content: "Stock Transfers — DPC Nexus" },
      { property: "og:description", content: "Move stock between warehouses." },
    ],
  }),
  component: TransfersIndexPage,
});

function TransfersIndexPage() {
  return <TransfersPage />;
}
