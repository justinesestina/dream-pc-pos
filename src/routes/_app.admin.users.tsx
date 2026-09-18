import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UsersPage, type UsersTab } from "@/components/admin/users-page";

const TAB_IDS: UsersTab[] = [
  "all",
  "add",
  "profile",
  "password",
  "roles",
  "login-history",
  "activity",
  "status",
];

export const Route = createFileRoute("/_app/admin/users")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      typeof search.tab === "string" && TAB_IDS.includes(search.tab as UsersTab)
        ? (search.tab as UsersTab)
        : "all",
    id: typeof search.id === "string" && search.id.length > 0 ? search.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "User Management — DPC POS" },
      {
        name: "description",
        content: "User accounts, roles, passwords, sessions, login history and activity.",
      },
    ],
  }),
  component: AdminUsersRoute,
});

function AdminUsersRoute() {
  const { tab, id } = Route.useSearch();
  const navigate = useNavigate();

  const onNavigate = (nextTab: UsersTab, nextId?: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: nextTab,
        id: nextId ?? prev.id,
      }),
    });
  };

  return <UsersPage tab={tab} selectedId={id} onNavigate={onNavigate} />;
}
