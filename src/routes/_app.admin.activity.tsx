import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ActivityLogsPage, type ActivityTab } from "@/components/admin/activity-page";

const TAB_IDS: ActivityTab[] = [
  "all",
  "users",
  "roles",
  "integrations",
  "sales",
  "inventory",
  "customers",
  "accounts",
  "projects",
  "settings",
];

export const Route = createFileRoute("/_app/admin/activity")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      typeof search.tab === "string" && TAB_IDS.includes(search.tab as ActivityTab)
        ? (search.tab as ActivityTab)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Activity Logs — DPC POS" },
      {
        name: "description",
        content: "Operational timeline of activity across the system.",
      },
    ],
  }),
  component: AdminActivityRoute,
});

function AdminActivityRoute() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();

  const onNavigate = (nextTab: ActivityTab) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: nextTab === "all" ? undefined : nextTab,
      }),
    });
  };

  return <ActivityLogsPage tab={tab} onNavigate={onNavigate} />;
}
