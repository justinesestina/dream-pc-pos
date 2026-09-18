import { createFileRoute } from "@tanstack/react-router";
import { BranchesPage } from "@/components/admin/users/branches-page";

export const Route = createFileRoute("/_app/administration/users/branches")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Assign Branches — Administration — DPC POS" },
      {
        name: "description",
        content: "Grant branch access and choose a default branch per account.",
      },
      { property: "og:title", content: "Assign Branches — DPC POS" },
    ],
  }),
  component: BranchesPage,
});
