import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "@/components/admin/users/activity-page";

export const Route = createFileRoute("/_app/administration/users/activity")({
  validateSearch: (search: Record<string, unknown>) => ({
    user: typeof search["user"] === "string" ? search["user"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Activity Log — Administration — DPC POS" },
      {
        name: "description",
        content: "A running log of actions taken across the system.",
      },
      { property: "og:title", content: "Activity Log — DPC POS" },
    ],
  }),
  component: ActivityPage,
});
