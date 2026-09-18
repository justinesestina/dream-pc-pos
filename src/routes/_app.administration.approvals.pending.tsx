import { createFileRoute } from "@tanstack/react-router";
import { ApprovalsPendingPage } from "@/components/admin/approvals-pending-page";

export const Route = createFileRoute("/_app/administration/approvals/pending")({
  head: () => ({
    meta: [
      { title: "Pending Approvals — Administration — DPC POS" },
      {
        name: "description",
        content: "Central approval queue for purchase orders, expenses and inventory requests.",
      },
      { property: "og:title", content: "Pending Approvals — DPC POS" },
    ],
  }),
  component: ApprovalsPendingPage,
});
