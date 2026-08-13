import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { dateTime, num, relative } from "@/lib/format";
import type { AuditLog } from "@/lib/types";

export const Route = createFileRoute("/_app/audit")({
  head: () => ({
    meta: [
      { title: "Audit Log — DPC Nexus" },
      { name: "description", content: "Read-only record of system activity." },
      { property: "og:title", content: "Audit Log — DPC Nexus" },
      { property: "og:description", content: "Read-only record of system activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState("all");
  const [entity, setEntity] = useState("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const logs = store.auditLogs;

  const actors = useMemo(() => Array.from(new Set(logs.map((l) => l.actor))), [logs]);
  const entities = useMemo(
    () => Array.from(new Set(logs.map((l) => l.entity.split("-")[0] ?? l.entity))),
    [logs],
  );

  const now = new Date();
  const todayCount = logs.filter((l) => new Date(l.at).toDateString() === now.toDateString()).length;
  const weekCount = logs.filter((l) => Date.now() - new Date(l.at).getTime() < 7 * 86400000).length;
  const distinctActors = new Set(logs.map((l) => l.actor)).size;
  const actionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of logs) {
      const key = l.action.split(" ")[0] ?? l.action;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [logs]);
  const mostCommonAction = actionCounts[0]?.[0] ?? "—";

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (actor !== "all" && l.actor !== actor) return false;
      if (entity !== "all" && !l.entity.startsWith(entity)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.actor.toLowerCase().includes(q) &&
          !l.action.toLowerCase().includes(q) &&
          !l.entity.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [logs, actor, entity, search]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        sortDir === "desc"
          ? new Date(b.at).getTime() - new Date(a.at).getTime()
          : new Date(a.at).getTime() - new Date(b.at).getTime(),
      ),
    [filtered, sortDir],
  );

  const columns: Column<AuditLog>[] = [
    {
      key: "at",
      header: "Timestamp",
      cell: (r) => <span className="mono text-xs text-muted-foreground">{dateTime(r.at)}</span>,
      sortValue: (r) => new Date(r.at).getTime(),
    },
    {
      key: "actor",
      header: "Actor",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-foreground">{r.actor}</span>
          <StatusBadge status={r.role} tone="neutral" label={r.role} />
        </div>
      ),
      sortValue: (r) => r.actor,
    },
    {
      key: "action",
      header: "Action",
      cell: (r) => <span className="text-[13px] text-foreground">{r.action}</span>,
      sortValue: (r) => r.action,
    },
    {
      key: "entity",
      header: "Entity",
      cell: (r) => <span className="mono text-xs text-info">{r.entity}</span>,
      sortValue: (r) => r.entity,
    },
    {
      key: "detail",
      header: "Details",
      cell: (r) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 text-xs">View</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-[13px]">
            <p className="label-tech mb-2">Full record</p>
            <dl className="space-y-1.5">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">ID</dt><dd className="mono text-xs">{r.id}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Actor</dt><dd>{r.actor}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Role</dt><dd>{r.role}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Action</dt><dd className="text-right">{r.action}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Entity</dt><dd className="mono text-xs text-info">{r.entity}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">At</dt><dd className="mono text-xs">{dateTime(r.at)} ({relative(r.at)})</dd></div>
            </dl>
          </PopoverContent>
        </Popover>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Audit Log" description="Read-only record of system activity." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Events today" numericValue={todayCount} accent="info" hint="Since midnight" />
        <StatCard label="Events this week" numericValue={weekCount} accent="success" hint="Trailing 7 days" />
        <StatCard label="Distinct actors" numericValue={distinctActors} hint="Users generating events" />
        <StatCard label="Most common action" value={mostCommonAction} hint={`${actionCounts[0]?.[1] ?? 0} occurrences`} />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search actor, action, entity…" />
          <FilterSelect value={actor} onChange={setActor} options={actors} label="ACTOR" />
          <FilterSelect value={entity} onChange={setEntity} options={entities} label="ENTITY" />
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          >
            {sortDir === "desc" ? "Newest first" : "Oldest first"}
          </Button>
          <ResultCount shown={sorted.length} total={logs.length} noun="events" />
        </Toolbar>
        <DataTable
          rows={sorted}
          columns={columns}
          pageSize={15}
          empty={<EmptyState title="No matching events" description="Adjust your search or filters." />}
        />
      </Panel>
    </div>
  );
}
