import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Fingerprint, History, KeyRound, ScrollText, ShieldAlert, UserCog } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, RowsSkeleton } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { dateTimeShort } from "@/lib/format";
import {
  fetchAdminAudit,
  fetchAdminUsers,
  getLastApiError,
  type AdminAuditRow,
  type AdminUser,
} from "@/lib/api-client";

export type AuditTab = "all" | "auth" | "users" | "roles" | "integrations" | "security";

const TABS: { id: AuditTab; label: string; icon: typeof History }[] = [
  { id: "all", label: "All Events", icon: ScrollText },
  { id: "auth", label: "Login Logs", icon: Fingerprint },
  { id: "users", label: "User Changes", icon: UserCog },
  { id: "roles", label: "Permission Changes", icon: KeyRound },
  { id: "integrations", label: "Integrations", icon: History },
  { id: "security", label: "Security Events", icon: ShieldAlert },
];

interface Row {
  id: string;
  entry: AdminAuditRow;
}

const MODULE_LABELS: Record<string, string> = {
  users: "Users",
  roles: "Roles & Permissions",
  integrations: "Integrations",
};

function passes(entry: AdminAuditRow, tab: AuditTab, query: string, resultFilter: string): boolean {
  const q = query.trim().toLowerCase();
  if (q) {
    const hay = [
      entry.action,
      entry.module,
      entry.resource,
      entry.record_id,
      entry.ip,
      String(entry.user_id ?? ""),
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (resultFilter && resultFilter !== "all" && entry.result !== resultFilter) return false;
  if (tab === "all") return true;
  if (tab === "security") return entry.result === "failure" || entry.result === "none";
  if (tab === "auth") return entry.action.startsWith("auth.") || entry.action.startsWith("sso.");
  if (tab === "users") return entry.action.startsWith("user.");
  if (tab === "roles") return entry.action.startsWith("role.");
  if (tab === "integrations") return entry.action.startsWith("integration.");
  return true;
}

function changePreview(entry: AdminAuditRow): string {
  if (!entry.old_value && !entry.new_value) {
    return entry.resource || entry.action;
  }
  const parts: string[] = [];
  if (entry.old_value !== null && entry.old_value !== undefined && String(entry.old_value) !== "") {
    parts.push("before");
  }
  if (entry.new_value !== null && entry.new_value !== undefined && String(entry.new_value) !== "") {
    parts.push("after");
  }
  return parts.join(" → ") || entry.action;
}

export function AuditLogsPage({
  tab: requestedTab,
  onNavigate,
}: {
  tab: AuditTab | undefined;
  onNavigate: (tab: AuditTab, userId?: string) => void;
}) {
  const [tab, setTab] = useState<AuditTab>(requestedTab ?? "all");
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [rows, setRows] = useState<AdminAuditRow[]>([]);
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

  const load = (nextPage = 1, append = false) => {
    if (nextPage === 1) setLoading(true);
    else setLoadingMore(true);
    fetchAdminAudit({ page: nextPage, per_page: 100 })
      .then((res) => {
        setTotal(res.total);
        setPage(nextPage);
        setRows((prev) => (append ? [...prev, ...res.items] : res.items));
      })
      .catch(() => {
        if (append) {
          toast.error("Could not load more events", {
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
    load();
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => passes(r, tab, query, resultFilter)),
    [rows, tab, query, resultFilter],
  );

  const actorName = (entry: AdminAuditRow) => {
    if (!entry.user_id) return "System";
    const user = usersById.get(Number(entry.user_id));
    return user ? user.display_name : `User #${entry.user_id}`;
  };

  const columns: Column<Row>[] = [
    {
      key: "time",
      header: "Time",
      cell: (r) => (
        <span className="text-[12.5px] whitespace-nowrap text-muted-foreground">
          {dateTimeShort(r.entry.created_at)}
        </span>
      ),
      sortValue: (r) => new Date(r.entry.created_at).getTime(),
    },
    {
      key: "user",
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
      key: "module",
      header: "Module",
      cell: (r) => (
        <span className="mono text-xs text-muted-foreground">
          {MODULE_LABELS[r.entry.module] ?? r.entry.module}
        </span>
      ),
    },
    {
      key: "detail",
      header: "Detail",
      cell: (r) => {
        const hasBefore =
          r.entry.old_value !== null &&
          r.entry.old_value !== undefined &&
          String(r.entry.old_value) !== "";
        return (
          <div className="max-w-[300px]">
            <p className="truncate text-[12.5px] text-muted-foreground">{changePreview(r.entry)}</p>
            {hasBefore && (
              <details className="mt-1">
                <summary className="cursor-pointer text-[11px] text-info underline-offset-2 hover:underline">
                  Inspect before → after
                </summary>
                <pre className="mono mt-1 max-h-32 overflow-auto rounded border border-border bg-elevated p-2 text-[10px] text-foreground">
                  {JSON.stringify(r.entry.old_value, null, 2)}
                  {"\n\n→\n\n"}
                  {JSON.stringify(r.entry.new_value ?? "", null, 2)}
                </pre>
              </details>
            )}
          </div>
        );
      },
    },
    {
      key: "result",
      header: "Result",
      cell: (r) => (
        <StatusBadge
          status={r.entry.result}
          label={r.entry.result}
          tone={
            r.entry.result === "success"
              ? "success"
              : r.entry.result === "failure"
                ? "danger"
                : "warning"
          }
        />
      ),
    },
    {
      key: "ip",
      header: "IP",
      cell: (r) => <span className="mono text-[11px] text-subtle">{r.entry.ip || "—"}</span>,
    },
  ];

  const rowsOut: Row[] = filtered.map((e) => ({ id: String(e.id), entry: e }));
  const failureCount = rows.filter((r) => r.result === "failure").length;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable, tamper-evident trail of authentication and administrative actions."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Logged events" numericValue={total} accent="info" hint="All time" />
        <StatCard
          label="On this view"
          numericValue={rowsOut.length}
          accent="neutral"
          hint={`${rows.length} loaded`}
        />
        <StatCard
          label="Failures"
          numericValue={failureCount}
          accent="warning"
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
          title={`Audit Logs — ${TABS.find((t) => t.id === tab)?.label ?? "All Events"}`}
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
                onClick={() => {
                  setTab(t.id);
                  onNavigate(t.id);
                }}
              >
                <Icon className="size-3.5" />
                {t.label}
              </Button>
            );
          })}
        </div>

        <Toolbar>
          <SearchInput value={query} onChange={setQuery} placeholder="Search events…" />
          <FilterSelect
            value={resultFilter}
            onChange={setResultFilter}
            options={["success", "failure", "none"]}
            label="Result"
          />
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
            title="No matching events"
            description="Adjust the filters, or events for this category appear once activity happens."
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
