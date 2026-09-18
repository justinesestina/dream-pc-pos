import { createFileRoute } from "@tanstack/react-router";
import { RolesPage } from "@/components/admin/users/roles-page";

export const Route = createFileRoute("/_app/administration/users/roles")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Assign Roles — Administration — DPC POS" },
      {
        name: "description",
        content: "Set the primary and additional roles for each account.",
      },
      { property: "og:title", content: "Assign Roles — DPC POS" },
    ],
  }),
  component: RolesPage,
});
