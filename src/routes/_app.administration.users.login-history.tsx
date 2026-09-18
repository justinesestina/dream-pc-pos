import { createFileRoute } from "@tanstack/react-router";
import { LoginHistoryPage } from "@/components/admin/users/login-history-page";

export const Route = createFileRoute("/_app/administration/users/login-history")({
  validateSearch: (search: Record<string, unknown>) => ({
    user: typeof search["user"] === "string" ? search["user"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login History — Administration — DPC POS" },
      {
        name: "description",
        content: "Every sign-in attempt across all accounts.",
      },
      { property: "og:title", content: "Login History — DPC POS" },
    ],
  }),
  component: LoginHistoryPage,
});
