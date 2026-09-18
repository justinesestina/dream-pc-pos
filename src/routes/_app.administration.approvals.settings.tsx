import { createFileRoute } from "@tanstack/react-router";
import { ApprovalsSettingsPage } from "@/components/admin/approvals-settings-page";

export const Route = createFileRoute("/_app/administration/approvals/settings")({
  head: () => ({
    meta: [
      { title: "Workflow Settings — Administration — DPC POS" },
      {
        name: "description",
        content: "Configure the approval chains used across purchasing, expenses and inventory.",
      },
      { property: "og:title", content: "Workflow Settings — DPC POS" },
    ],
  }),
  component: ApprovalsSettingsPage,
});
