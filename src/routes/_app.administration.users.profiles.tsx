import { createFileRoute } from "@tanstack/react-router";
import { ProfilesPage } from "@/components/admin/users/profiles-page";

export const Route = createFileRoute("/_app/administration/users/profiles")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "User Profiles — Administration — DPC POS" },
      {
        name: "description",
        content: "Browse accounts and edit their profile, access and security.",
      },
      { property: "og:title", content: "User Profiles — DPC POS" },
    ],
  }),
  component: ProfilesPage,
});
