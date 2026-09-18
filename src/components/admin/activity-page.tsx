import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Boxes,
  Landmark,
  Settings2,
  ShoppingBag,
  UserCog,
  Users,
  Wrench,
  Package,
  KeyRound,
} from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, RowsSkeleton } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Button } from "@/components/ui/button";
import { parseServerDate, serverDateTimeShort, serverRelative } from "@/lib/format";
import {
  fetchAdminActivity,
  fetchAdminUsers,
  getLastApiError,
  type AdminActivityRow,
  type AdminUser,
} from "@/lib/api-client";

export type ActivityTab =
  | "all"
  | "users"
  | "roles"
  | "integrations"
  | "sales"
  | "inventory"
  | "customers"
  | "accounts"
  | "projects"
  | "settings";

const TABS: { id: ActivityTab; label: string; icon: typeof Activity }[] = [
  { id: "all", label: "Everything", icon: Activity },
  { id: "users", label: "User Activity", icon: Users },
  { id: "roles", label: "Permission Activity", icon: KeyRound },
  { id: "integrations", label: "Integration Activity", icon: Boxes },
  { id: "sales", label: "Sales", icon: ShoppingBag },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "customers", label: "CRM", icon: UserCog },
  { id: "accounts", label: "Accounts", icon: Landmark },
  { id: "projects", label: "Projects", icon: Wrench },
  { id: "settings", label: "System", icon: Settings2 },
];

interface Row {
  id: string;
  entry: AdminActivityRow;
}

export function ActivityLogsPage({
  tab: requestedTab,
  onNavigate,
}: {
  tab: ActivityTab | undefined;
  onNavigate: (tab: ActivityTab) => void;
}) {
  const [tab, setTab] = useState<ActivityTab>(requestedTab ?? "all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminActivityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [usersById, setUsersById] = useState<Map<number, AdminUser>>(new Map());

  useEffect(() => {
    if (requestedTab) setTab(requestedTab);
  }, [requestedTab]);

  useEffect(() => {
    let alive = true;
    fetchAdminUsers({ per_page: 200 })
      .then((res) => {
        if (alive) setUsersById(new Map(res.items.map((u) => [Number(u.id), u])));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const load = (nextPage = 1, append = false, forTab = tab) => {
    if (nextPage === 1) setLoading(true);
    else setLoadingMore(true);
    fetchAdminActivity({
      module: forTab === "all" ? undefined : forTab,
      page: nextPage,
      per_page: 100,
    })
      .then((res) => {
        setTotal(res.total);
        setPage(nextPage);
        setRows((prev) => (append ? [...prev, ...res.items] : res.items));
      })
      .catch(() => {
        if (append) {
          toast.error("Could not load more activity", {
            description: getLastApiError() ?? undefined,
          });
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    load(1, false, requestedTab ?? "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTab]);

  const pickTab = (next: ActivityTab) => {
    setTab(next);
    if (next !== tab) load(1, false, next);
    onNavigate(next);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.action, r.module, r.description, r.record_id, String(r.user_id ?? "")]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const actorName = (entry: AdminActivityRow) => {
    if (!entry.user_id) return "System";
    const user = usersById.get(Number(entry.user_id));
    return user ? user.display_name : `User #${entry.user_id}`;
  };

  const columns: Column<Row>[] = [
    {
      key: "time",
      header: "When",
      cell: (r) => (
        <div>
          <p className="text-[12.5px] whitespace-nowrap text-foreground">
            {serverDateTimeShort(r.entry.created_at)}
          </p>
          <p className="text-[10.5px] whitespace-nowrap text-subtle">
            {serverRelative(r.entry.created_at)}
          </p>
        </div>
      ),
      sortValue: (r) => parseServerDate(r.entry.created_at).getTime(),
    },
    {
      key: "actor",
      header: "Actor",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground">{actorName(r.entry)}</p>
          <p className="mono text-[10.5px] text-subtle">#{r.entry.user_id ?? "—"}</p>
        </div>
      ),
      sortValue: (r) => actorName(r.entry),
    },
    {
      key: "action",
      header: "Action",
      cell: (r) => (
        <span className="mono text-xs whitespace-nowrap text-foreground">{r.entry.action}</span>
      ),
      sortValue: (r) => r.entry.action,
    },
    {
      key: "description",
      header: "Activity",
      cell: (r) => (
        <p className="max-w-[380px] truncate text-[12.5px] text-muted-foreground">
          {r.entry.description || r.entry.action}
        </p>
      ),
    },
    {
      key: "module",
      header: "Module",
      cell: (r) => <span className="mono text-xs text-muted-foreground">{r.entry.module}</span>,
    },
    {
      key: "record",
      header: "Record",
      cell: (r) =>
        r.entry.record_id ? (
          <span className="mono text-[11px] text-subtle">{r.entry.record_id}</span>
        ) : (
          <span className="text-[11px] text-border">—</span>
        ),
    },
  ];

  const rowsOut: Row[] = filtered.map((e) => ({ id: String(e.id), entry: e }));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Activity Logs"
        description="Operational timeline of what happened across the system, newest first."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Activity events"
          numericValue={total}
          accent="info"
          hint={tab === "all" ? "All modules" : `Module: ${tab}`}
        />
        <StatCard label="Loaded" numericValue={rows.length} accent="neutral" hint="Newest first" />
        <StatCard
          label="Modules recorded"
          numericValue={new Set(rows.map((r) => r.module)).size}
          accent="neutral"
          hint="On loaded events"
        />
        <StatCard
          label="Actors"
          numericValue={usersById.size}
          accent="neutral"
          hint="Known DPC users"
        />
      </div>

      <Panel>
        <PanelHeader
          title={`Activity Logs — ${TABS.find((t) => t.id === tab)?.label ?? "Everything"}`}
        />
        <div className="flex flex-wrap gap-1 px-4 pb-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <Button
                key={t.id}
                size="sm"
                variant={tab === t.id ? "default" : "outline"}
                className="h-8 gap-1.5 text-xs"
                onClick={() => pickTab(t.id)}
              >
                <Icon className="size-3.5" />
                {t.label}
              </Button>
            );
          })}
        </div>

        <Toolbar>
          <SearchInput value={query} onChange={setQuery} placeholder="Search activity…" />
          {rows.length < total && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              disabled={loadingMore}
              onClick={() => load(page + 1, true)}
            >
              {loadingMore ? "Loading…" : `Load more (${total - rows.length} left)`}
            </Button>
          )}
          <ResultCount shown={rowsOut.length} total={total} noun="events" />
        </Toolbar>

        {loading ? (
          <RowsSkeleton rows={8} />
        ) : rowsOut.length === 0 ? (
          <EmptyState
            title="No activity here yet"
            description={
              tab !== "all"
                ? `The ${TABS.find((t) => t.id === tab)?.label ?? tab} module has not logged any activity yet.`
                : "Activity appears here as actions happen (logins, user and role changes)."
            }
          />
        ) : (
          <DataTable
            rows={rowsOut}
            columns={columns}
            pageSize={12}
            initialSort={{ key: "time", dir: "desc" }}
          />
        )}
      </Panel>
    </div>
  );
}
