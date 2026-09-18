import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RolesPage, type RolesTab } from "@/components/admin/roles-page";

const TAB_IDS: RolesTab[] = ["all", "add", "matrix", "modules", "crud", "assignments"];

export const Route = createFileRoute("/_app/admin/roles")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      typeof search.tab === "string" && TAB_IDS.includes(search.tab as RolesTab)
        ? (search.tab as RolesTab)
        : undefined,
    role: typeof search.role === "string" && search.role.length > 0 ? search.role : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Roles & Permissions — DPC POS" },
      {
        name: "description",
        content: "Role definitions, permission matrices, module permissions and role assignments.",
      },
    ],
  }),
  component: AdminRolesRoute,
});

function AdminRolesRoute() {
  const { tab, role } = Route.useSearch();
  const navigate = useNavigate();

  const onNavigate = (nextTab: RolesTab, roleId?: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: nextTab === "all" ? undefined : nextTab,
        role: roleId ?? prev.role,
      }),
    });
  };

  return <RolesPage tab={tab} roleId={role} onNavigate={onNavigate} />;
}
