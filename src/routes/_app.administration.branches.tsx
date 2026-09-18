import { createFileRoute } from "@tanstack/react-router";
import { BranchManagementPage } from "@/components/admin/branch-management-page";

export const Route = createFileRoute("/_app/administration/branches")({
  head: () => ({
    meta: [
      { title: "Branches — Administration — DPC POS" },
      {
        name: "description",
        content: "Branches, the users assigned to them and their operational context.",
      },
      { property: "og:title", content: "Branches — DPC POS" },
    ],
  }),
  component: BranchManagementPage,
});
