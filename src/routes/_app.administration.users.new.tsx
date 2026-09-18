import { createFileRoute } from "@tanstack/react-router";
import { AddUserPage } from "@/components/admin/users/add-user-page";

export const Route = createFileRoute("/_app/administration/users/new")({
  head: () => ({
    meta: [
      { title: "Add User — Administration — DPC POS" },
      {
        name: "description",
        content: "Create a new account with roles, branch access and status.",
      },
      { property: "og:title", content: "Add User — DPC POS" },
    ],
  }),
  component: AddUserPage,
});
