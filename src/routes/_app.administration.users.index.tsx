import { createFileRoute } from "@tanstack/react-router";
import { AllUsersPage } from "@/components/admin/users/all-users-page";

export const Route = createFileRoute("/_app/administration/users/")({
  head: () => ({
    meta: [
      { title: "Users — Administration — DPC POS" },
      {
        name: "description",
        content: "Directory of accounts with roles, branch access and activity.",
      },
      { property: "og:title", content: "Users — DPC POS" },
    ],
  }),
  component: AllUsersPage,
});
