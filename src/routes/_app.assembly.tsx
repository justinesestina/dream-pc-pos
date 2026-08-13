import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Cpu, Hammer, User } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, Mono, TechLabel } from "@/components/nexus/primitives";
import { ProgressBar, DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Toolbar, SearchInput, ResultCount } from "@/components/nexus/toolbar";
import { StatCard } from "@/components/nexus/stat-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useOps, stageProgress } from "@/lib/ops-store";
import { ASSEMBLY_STAGES } from "@/lib/ops-types";
import { money, dateShort, titleCase } from "@/lib/format";
import type { Build } from "@/lib/types";

export const Route = createFileRoute("/_app/assembly")({
  head: () => ({
    meta: [
      { title: "Assembly Workspace — DPC Nexus" },
      { name: "description", content: "Technician kanban board for custom build assembly, testing and QA." },
      { property: "og:title", content: "Assembly Workspace — DPC Nexus" },
      { property: "og:description", content: "Technician kanban board for custom build assembly, testing and QA." },
    ],
  }),
  component: AssemblyWorkspacePage,
});

const TECHS = ["Unassigned", "Marco Reyes", "Angelo Cruz", "Bea Santos", "Jun Dela Cruz", "Ken Villareal"];

interface KanbanColumn {
  id: string;
  label: string;
  filterFn: (b: Build) => boolean;
  accent: string;
}

const COLUMNS: KanbanColumn[] = [
  {
    id: "parts_reserved",
    label: "Parts Reserved",
    filterFn: (b) => b.status === "parts_reserved" || b.status === "approved",
    accent: "border-t-info/60",
  },
  {
    id: "assembly",
    label: "Assembly",
    filterFn: (b) => b.status === "assembly",
    accent: "border-t-warning/60",
  },
  {
    id: "testing",
    label: "Testing / QA",
    filterFn: (b) => b.status === "testing",
    accent: "border-t-[#c084fc]/60",
  },
  {
    id: "ready",
    label: "Ready for Release",
    filterFn: (b) => b.status === "ready",
    accent: "border-t-success/60",
  },
  {
    id: "cancelled",
    label: "Cancelled",
    filterFn: (b) => b.status === "cancelled",
    accent: "border-t-destructive/50",
  },
];

/* ───────────────────────────── Build Card ──── */

function BuildCard({ build, expanded, onToggle }: { build: Build; expanded: boolean; onToggle: () => void }) {
  const store = useStore();
  const ops = useOps();
  const o = ops.opsForBuild(build.id);
  const pct = stageProgress(o.stage);
  const assemblyDone = o.assembly.filter((a) => a.done).length;
  const testsPassed = o.tests.filter((t) => t.result === "pass").length;

  return (
    <div className="rounded-lg border border-border bg-elevated/60 transition-colors hover:border-border-strong">
      {/* Card header — always visible */}
      <button
        type="button"
        className="w-full p-3 text-left"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-2">
          <Mono className="text-foreground">{build.id}</Mono>
          <StatusBadge status={build.status} />
        </div>
        <p className="mt-1.5 truncate text-[13px] text-foreground">{build.customerName}</p>
        <p className="truncate text-xs text-muted-foreground">{build.purpose}</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-subtle">
            <User className="size-3" />
            {build.technician}
          </span>
          <span className="mono text-foreground">{money(build.budget)}</span>
        </div>
        <ProgressBar value={pct} className="mt-2" />
        <div className="mt-1.5 flex gap-3 text-[10.5px] text-subtle">
          <span>Assembly {assemblyDone}/{o.assembly.length}</span>
          <span>Tests {testsPassed}/{o.tests.length}</span>
        </div>
      </button>

      {/* Expanded inline detail */}
      {expanded && (
        <div className="border-t border-border/60 p-3 pt-2.5">
          {/* Quick technician assignment */}
          <div className="mb-3 space-y-1.5">
            <TechLabel>Technician</TechLabel>
            <Select
              value={build.technician}
              onValueChange={(v) => {
                store.updateBuild(build.id, { technician: v });
                ops.assignBuildStaff(build.id, { technician: v });
                toast.success(`Assigned ${v} to ${build.id}.`);
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TECHS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assembly checklist (compact) */}
          <TechLabel>Assembly</TechLabel>
          <div className="mb-2 mt-1 max-h-36 space-y-0.5 overflow-y-auto">
            {o.assembly.map((a) => (
              <label key={a.label} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-elevated">
                <Checkbox
                  checked={a.done}
                  onCheckedChange={(v) => ops.toggleAssemblyStep(build.id, a.label, v === true)}
                  className="size-3.5"
                />
                <span className={cn("text-[11.5px]", a.done ? "text-foreground line-through opacity-60" : "text-muted-foreground")}>
                  {a.label}
                </span>
              </label>
            ))}
          </div>

          {/* Test results (compact) */}
          <TechLabel>Tests</TechLabel>
          <div className="mb-2 mt-1 max-h-28 space-y-0.5 overflow-y-auto">
            {o.tests.map((t) => (
              <div key={t.label} className="flex items-center justify-between gap-2 rounded px-1.5 py-1">
                <span className="text-[11.5px] text-muted-foreground">{t.label}</span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                      t.result === "pass" ? "bg-success/20 text-success" : "bg-elevated text-subtle hover:text-foreground",
                    )}
                    onClick={() => ops.setTestResult(build.id, t.label, "pass")}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                      t.result === "fail" ? "bg-destructive/20 text-destructive" : "bg-elevated text-subtle hover:text-foreground",
                    )}
                    onClick={() => ops.setTestResult(build.id, t.label, "fail")}
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Link
              to="/builds/$buildId"
              params={{ buildId: build.id }}
              className="flex-1"
            >
              <Button size="sm" variant="outline" className="w-full text-xs">
                Full details
              </Button>
            </Link>
            {build.status === "assembly" && (
              <Button
                size="sm"
                className="flex-1 text-xs"
                disabled={assemblyDone < o.assembly.length}
                onClick={() => {
                  store.setBuildStatus(build.id, "testing");
                  ops.setBuildStage(build.id, "testing");
                  toast.success(`${build.id} moved to Testing.`);
                }}
              >
                → Testing
              </Button>
            )}
            {build.status === "testing" && (
              <Button
                size="sm"
                className="flex-1 text-xs"
                disabled={testsPassed < o.tests.length}
                onClick={() => {
                  store.setBuildStatus(build.id, "ready");
                  ops.setBuildStage(build.id, "ready");
                  store.finalizeQa(build.id, "pass");
                  ops.signQa(build.id, store.user?.name ?? "QA Staff");
                  toast.success(`${build.id} QA passed — ready for release.`);
                }}
              >
                → Ready
              </Button>
            )}
            {(build.status === "parts_reserved" || build.status === "approved") && (
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  store.setBuildStatus(build.id, "assembly");
                  ops.setBuildStage(build.id, "assembly");
                  toast.success(`${build.id} moved to Assembly.`);
                }}
              >
                Start assembly
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── Main Page ──── */

function AssemblyWorkspacePage() {
  const store = useStore();
  const ops = useOps();
  const [q, setQ] = useState("");
  const [techFilter, setTechFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Only show builds that are in the active pipeline (cancelled stay visible in their own column)
  const activeBuilds = useMemo(() => {
    return store.builds.filter(
      (b) =>
        b.status !== "draft" &&
        b.status !== "consultation" &&
        b.status !== "quoted" &&
        b.status !== "released",
    );
  }, [store.builds]);

  const filtered = useMemo(() => {
    let list = activeBuilds;
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.id.toLowerCase().includes(query) ||
          b.customerName.toLowerCase().includes(query) ||
          b.purpose.toLowerCase().includes(query) ||
          b.technician.toLowerCase().includes(query),
      );
    }
    if (techFilter !== "all") {
      list = list.filter((b) => b.technician === techFilter);
    }
    return list;
  }, [activeBuilds, q, techFilter]);

  const inAssembly = activeBuilds.filter((b) => b.status === "assembly").length;
  const inTesting = activeBuilds.filter((b) => b.status === "testing").length;
  const ready = activeBuilds.filter((b) => b.status === "ready").length;
  const avgProgress = useMemo(() => {
    const pipeline = activeBuilds.filter((b) => b.status !== "cancelled");
    if (pipeline.length === 0) return 0;
    return Math.round(
      pipeline.reduce((s, b) => s + stageProgress(ops.opsForBuild(b.id).stage), 0) /
        pipeline.length,
    );
  }, [activeBuilds, ops]);

  const assignedTechs = useMemo(() => {
    const set = new Set<string>();
    for (const b of store.builds) set.add(b.technician);
    return [...set].sort();
  }, [store.builds]);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Assembly Workspace"
        description="Kanban board for build assembly, testing and QA — designed for technicians."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="In assembly" numericValue={inAssembly} format={(n) => Math.round(n).toString()} accent="warning" hint="Currently on the bench" />
        <StatCard label="In testing / QA" numericValue={inTesting} format={(n) => Math.round(n).toString()} accent="info" hint="Tests & QA sign-off" />
        <StatCard label="Ready for release" numericValue={ready} format={(n) => Math.round(n).toString()} accent="success" hint="Awaiting customer pickup" />
        <StatCard label="Avg. progress" numericValue={avgProgress} format={(n) => `${Math.round(n)}%`} accent="info" hint="Across active pipeline" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search build ID, customer, technician…" />
          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="h-8 w-40 text-[13px]">
              <SelectValue placeholder="All technicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All technicians</SelectItem>
              {assignedTechs.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ResultCount shown={filtered.length} total={activeBuilds.length} noun="builds" />
        </Toolbar>
      </Panel>

      {filtered.length === 0 ? (
        <Panel>
          <EmptyState
            title="No active builds"
            description="No builds are currently in the assembly pipeline. Create a new build and advance it past the 'Approved' stage."
            icon={Hammer}
          />
        </Panel>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((col) => {
            const items = filtered.filter(col.filterFn);
            return (
              <div key={col.id} className="w-72 shrink-0">
                <div className={cn("mb-3 rounded-t-md border-t-2 px-1 pt-0.5", col.accent)}>
                  <div className="flex items-center justify-between">
                    <TechLabel>{col.label}</TechLabel>
                    <Mono className="text-subtle">{items.length}</Mono>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-subtle">
                      No builds
                    </div>
                  ) : (
                    items.map((b) => (
                      <BuildCard
                        key={b.id}
                        build={b}
                        expanded={expandedId === b.id}
                        onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DemoNote>
        The assembly workspace reads from local demo state. Drag-and-drop between columns is not
        implemented — use the quick-action buttons or the full build detail page to advance stages.
      </DemoNote>
    </div>
  );
}
