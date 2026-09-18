import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuditLogsPage, type AuditTab } from "@/components/admin/audit-page";

const TAB_IDS: AuditTab[] = ["all", "auth", "users", "roles", "integrations", "security"];

export const Route = createFileRoute("/_app/admin/audit")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      typeof search.tab === "string" && TAB_IDS.includes(search.tab as AuditTab)
        ? (search.tab as AuditTab)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Audit Logs — DPC POS" },
      {
        name: "description",
        content: "Immutable trail of authentication and administrative actions across the system.",
      },
    ],
  }),
  component: AdminAuditRoute,
});

function AdminAuditRoute() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();

  const onNavigate = (nextTab: AuditTab) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: nextTab === "all" ? undefined : nextTab,
      }),
    });
  };

  return <AuditLogsPage tab={tab} onNavigate={onNavigate} />;
}
