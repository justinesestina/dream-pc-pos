import { createFileRoute } from "@tanstack/react-router";
import { AccountStatusPage } from "@/components/admin/users/account-status-page";

export const Route = createFileRoute("/_app/administration/users/account-status")({
  head: () => ({
    meta: [
      { title: "Account Status — Administration — DPC POS" },
      {
        name: "description",
        content: "Monitor sign-in state, lockouts and lifecycle across all accounts.",
      },
      { property: "og:title", content: "Account Status — DPC POS" },
    ],
  }),
  component: AccountStatusPage,
});
