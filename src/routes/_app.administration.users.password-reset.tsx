import { createFileRoute } from "@tanstack/react-router";
import { PasswordResetPage } from "@/components/admin/users/password-reset-page";

export const Route = createFileRoute("/_app/administration/users/password-reset")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Password Reset — Administration — DPC POS" },
      {
        name: "description",
        content: "Issue a temporary password for any account.",
      },
      { property: "og:title", content: "Password Reset — DPC POS" },
    ],
  }),
  component: PasswordResetPage,
});
