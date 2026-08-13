import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, TechLabel } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { DemoNote, ProgressBar } from "@/components/nexus/detail";
import { Button } from "@/components/ui/button";
import { useOps } from "@/lib/ops-store";
import { useStore } from "@/lib/store";
import { dateShort, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StaffMember } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/staff")({
  head: () => ({
    meta: [
      { title: "Staff & Assignments — DPC Nexus" },
      { name: "description", content: "Technician workload and operational assignments." },
      { property: "og:title", content: "Staff & Assignments — DPC Nexus" },
      { property: "og:description", content: "Technician workload and operational assignments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffPage,
});

interface Assignment {
  id: string;
  staffName: string;
  kind: "Task" | "Build" | "QA" | "Service" | "Shift";
  refId: string;
  detail: string;
  due: string;
  status: string;
  to: string;
  param: string;
}

const KINDS = ["Task", "Build", "QA", "Service", "Shift"];

function StaffPage() {
  const { staff, tasks, buildOps, shifts } = useOps();
  const { builds, services } = useStore();

  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [focus, setFocus] = useState<string | null>(null);

  const assignments = useMemo<Assignment[]>(() => {
    const list: Assignment[] = [];

    for (const t of tasks) {
      if (t.status === "done") continue;
      list.push({
        id: `a-task-${t.id}`,
        staffName: t.assignee,
        kind: "Task",
        refId: t.id,
        detail: t.title,
        due: t.dueAt,
        status: t.status,
        to: "/tasks",
        param: "",
      });
    }

    for (const b of buildOps) {
      const build = builds.find((x) => x.id === b.buildId);
      if (!build || build.status === "released") continue;
      if (b.technician && b.technician !== "Unassigned") {
        list.push({
          id: `a-build-${b.buildId}`,
          staffName: b.technician,
          kind: "Build",
          refId: b.buildId,
          detail: `${build.purpose} — ${titleCase(b.stage)}`,
          due: build.createdAt,
          status: build.status,
          to: "/builds/$buildId",
          param: "buildId",
        });
      }
      if (b.qaStaff && b.qaStaff !== "Unassigned" && !b.qaSignedAt) {
        list.push({
          id: `a-qa-${b.buildId}`,
          staffName: b.qaStaff,
          kind: "QA",
          refId: b.buildId,
          detail: `QA sign-off pending — ${build.purpose}`,
          due: build.createdAt,
          status: build.status,
          to: "/builds/$buildId",
          param: "buildId",
        });
      }
    }

    for (const s of services) {
      if (s.status === "completed" || s.status === "cancelled") continue;
      list.push({
        id: `a-svc-${s.id}`,
        staffName: s.technician,
        kind: "Service",
        refId: s.id,
        detail: `${s.device} — ${s.issue}`,
        due: s.createdAt,
        status: s.status,
        to: "/services/$ticketId",
        param: "ticketId",
      });
    }

    for (const sh of shifts) {
      if (sh.status !== "open") continue;
      list.push({
        id: `a-shift-${sh.id}`,
        staffName: sh.cashier,
        kind: "Shift",
        refId: sh.id,
        detail: `Register open since ${dateShort(sh.openedAt)}`,
        due: sh.openedAt,
        status: sh.status,
        to: "/shifts/$shiftId",
        param: "shiftId",
      });
    }

    return list;
  }, [tasks, buildOps, builds, services, shifts]);

  const loadByStaff = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assignments) map.set(a.staffName, (map.get(a.staffName) ?? 0) + 1);
    return map;
  }, [assignments]);

  const maxLoad = Math.max(1, ...Array.from(loadByStaff.values()));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return assignments.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      if (focus && a.staffName !== focus) return false;
      if (!needle) return true;
      return (
        a.staffName.toLowerCase().includes(needle) ||
        a.refId.toLowerCase().includes(needle) ||
        a.detail.toLowerCase().includes(needle)
      );
    });
  }, [assignments, kind, focus, q]);

  const stats = useMemo(
    () => ({
      available: staff.filter((s) => s.status === "available").length,
      busy: staff.filter((s) => s.status === "busy").length,
      open: assignments.length,
      completed: staff.reduce((sum, s) => sum + s.completed, 0),
    }),
    [staff, assignments],
  );

  const columns: Column<Assignment>[] = [
    { key: "staff", header: "Staff", cell: (a) => a.staffName, sortValue: (a) => a.staffName },
    { key: "kind", header: "Type", cell: (a) => a.kind, sortValue: (a) => a.kind },
    {
      key: "ref",
      header: "Reference",
      cell: (a) =>
        a.param ? (
          <IdLink to={a.to} params={{ [a.param]: a.refId }}>
            {a.refId}
          </IdLink>
        ) : (
          <span className="mono text-[11.5px] text-muted-foreground">{a.refId}</span>
        ),
      sortValue: (a) => a.refId,
    },
    {
      key: "detail",
      header: "Detail",
      cell: (a) => <span className="line-clamp-1 text-[12.5px] text-muted-foreground">{a.detail}</span>,
      sortValue: (a) => a.detail,
    },
    { key: "since", header: "Since / due", cell: (a) => dateShort(a.due), sortValue: (a) => a.due },
    { key: "status", header: "Status", cell: (a) => <StatusBadge status={a.status} />, sortValue: (a) => a.status },
  ];

  const staffTone: Record<StaffMember["status"], "success" | "warning" | "neutral"> = {
    available: "success",
    busy: "warning",
    off: "neutral",
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Staff & Assignments"
        description="Technician workload and operational assignments."
        actions={
          focus ? (
            <Button size="sm" variant="outline" onClick={() => setFocus(null)}>
              Clear focus — {focus}
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available now" numericValue={stats.available} format={(n) => Math.round(n).toString()} accent="success" />
        <StatCard label="Currently busy" numericValue={stats.busy} format={(n) => Math.round(n).toString()} accent="warning" />
        <StatCard label="Open assignments" numericValue={stats.open} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Jobs completed" numericValue={stats.completed} format={(n) => Math.round(n).toString()} accent="neutral" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {staff.map((s) => {
          const load = loadByStaff.get(s.name) ?? 0;
          const active = focus === s.name;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setFocus(active ? null : s.name);
                if (!active) toast.info(`Filtered assignments for ${s.name}.`);
              }}
              aria-pressed={active}
              className={cn(
                "rounded-lg border bg-surface p-3.5 text-left transition-colors",
                active ? "border-border-strong ring-1 ring-info/40" : "border-border hover:border-border-strong",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="mono flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-[12px] text-foreground">
                  {s.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13.5px] font-medium text-foreground">{s.name}</p>
                    <StatusBadge status={s.status} tone={staffTone[s.status]} />
                  </div>
                  <p className="text-[11.5px] text-muted-foreground">
                    {s.role} · {s.shift}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <TechLabel>Workload</TechLabel>
                  <span className="mono text-[11px] text-subtle">{load} open</span>
                </div>
                <ProgressBar
                  className="mt-1.5"
                  value={(load / maxLoad) * 100}
                  tone={load > maxLoad * 0.66 ? "warning" : "info"}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded border border-border bg-elevated px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <p className="mono mt-3 text-[10.5px] text-subtle">{s.completed} jobs completed all-time</p>
            </button>
          );
        })}
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search staff, reference or detail…" />
          <FilterSelect value={kind} onChange={setKind} options={KINDS} label="Type" />
          <ResultCount shown={filtered.length} total={assignments.length} noun="assignments" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          pageSize={12}
          initialSort={{ key: "since", dir: "desc" }}
          empty={
            <EmptyState
              title="No assignments match your filters"
              description="Clear the staff focus or change the type filter."
            />
          }
        />
      </Panel>

      <DemoNote>
        Workload is derived from local demo tasks, builds, services and shifts. Rosters, payroll and time tracking are
        not simulated.
      </DemoNote>
    </div>
  );
}
