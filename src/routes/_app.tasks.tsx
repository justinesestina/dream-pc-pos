import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarClock, Plus } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, TechLabel } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount, Segmented } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { DemoNote } from "@/components/nexus/detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOps } from "@/lib/ops-store";
import { dateShort, relative, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OpsTask, TaskPriority, TaskStatus } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — DPC Nexus" },
      { name: "description", content: "Operational tasks across builds, services and receiving." },
      { property: "og:title", content: "Tasks — DPC Nexus" },
      { property: "og:description", content: "Operational tasks across builds, services and receiving." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

const STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];
const PRIORITIES: TaskPriority[] = ["urgent", "high", "normal", "low"];

const priorityTone: Record<TaskPriority, "danger" | "warning" | "info" | "neutral"> = {
  urgent: "danger",
  high: "warning",
  normal: "info",
  low: "neutral",
};

const LINK_ROUTE: Record<string, { to: string; param: string }> = {
  build: { to: "/builds/$buildId", param: "buildId" },
  service: { to: "/services/$ticketId", param: "ticketId" },
  order: { to: "/orders/$orderId", param: "orderId" },
  receiving: { to: "/receiving/$receiptId", param: "receiptId" },
  qa: { to: "/builds/$buildId", param: "buildId" },
  customer: { to: "/customers/$customerId", param: "customerId" },
};

function isOverdue(t: OpsTask) {
  return t.status !== "done" && new Date(t.dueAt).getTime() < Date.now();
}

function TaskLink({ task }: { task: OpsTask }) {
  if (!task.link) return <span className="text-subtle">—</span>;
  const route = LINK_ROUTE[task.link.kind];
  if (!route) return <span className="mono text-[11.5px] text-subtle">{task.link.id}</span>;
  return (
    <IdLink to={route.to} params={{ [route.param]: task.link.id }}>
      {task.link.id}
    </IdLink>
  );
}

function TasksPage() {
  const { tasks, staff, createTask, setTaskStatus, assignTask } = useOps();

  const [view, setView] = useState<"board" | "list">("board");
  const [q, setQ] = useState("");
  const [assignee, setAssignee] = useState("all");
  const [priority, setPriority] = useState("all");
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("normal");
  const [dueAt, setDueAt] = useState("");

  const assignees = useMemo(
    () => Array.from(new Set([...staff.map((s) => s.name), ...tasks.map((t) => t.assignee)])).sort(),
    [staff, tasks],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tasks.filter((t) => {
      if (assignee !== "all" && t.assignee !== assignee) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (!needle) return true;
      return (
        t.title.toLowerCase().includes(needle) ||
        (t.detail ?? "").toLowerCase().includes(needle) ||
        (t.link?.id ?? "").toLowerCase().includes(needle) ||
        t.id.toLowerCase().includes(needle)
      );
    });
  }, [tasks, q, assignee, priority]);

  const stats = useMemo(
    () => ({
      openCount: tasks.filter((t) => t.status !== "done").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      overdue: tasks.filter(isOverdue).length,
    }),
    [tasks],
  );

  const resetForm = () => {
    setTitle("");
    setDetail("");
    setNewAssignee("");
    setNewPriority("normal");
    setDueAt("");
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }
    if (!newAssignee) {
      toast.error("Pick an assignee.");
      return;
    }
    const due = dueAt ? new Date(dueAt).toISOString() : new Date(Date.now() + 864e5).toISOString();
    const created = createTask({
      title: title.trim(),
      detail: detail.trim() ? detail.trim() : undefined,
      assignee: newAssignee,
      priority: newPriority,
      dueAt: due,
    });
    toast.success(`${created.id} assigned to ${newAssignee}.`);
    resetForm();
    setOpen(false);
  };

  const advance = (t: OpsTask) => {
    const next: TaskStatus = t.status === "todo" ? "in_progress" : t.status === "in_progress" ? "done" : "in_progress";
    setTaskStatus(t.id, next);
    toast.success(`${t.id} → ${titleCase(next)}`);
  };

  const columns: Column<OpsTask>[] = [
    {
      key: "task",
      header: "Task",
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-foreground">{t.title}</p>
          <p className="mono text-[10.5px] text-subtle">{t.id}</p>
        </div>
      ),
      sortValue: (t) => t.title,
    },
    { key: "assignee", header: "Assignee", cell: (t) => t.assignee, sortValue: (t) => t.assignee },
    {
      key: "priority",
      header: "Priority",
      cell: (t) => <StatusBadge status={t.priority} tone={priorityTone[t.priority]} />,
      sortValue: (t) => PRIORITIES.indexOf(t.priority),
    },
    { key: "link", header: "Linked to", cell: (t) => <TaskLink task={t} />, sortValue: (t) => t.link?.id ?? "" },
    {
      key: "due",
      header: "Due",
      cell: (t) => (
        <span className={cn("mono text-[11.5px]", isOverdue(t) ? "text-destructive" : "text-muted-foreground")}>
          {dateShort(t.dueAt)}
        </span>
      ),
      sortValue: (t) => t.dueAt,
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => <StatusBadge status={t.status} tone={t.status === "blocked" ? "danger" : t.status === "done" ? "success" : t.status === "in_progress" ? "info" : "neutral"} />,
      sortValue: (t) => STATUSES.indexOf(t.status),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (t) =>
        t.status === "done" ? (
          <span className="mono text-[11px] text-subtle">{relative(t.dueAt)}</span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              advance(t);
            }}
          >
            {t.status === "todo" ? "Start" : t.status === "in_progress" ? "Complete" : "Unblock"}
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Tasks"
        description="Operational tasks across builds, services and receiving."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> New task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New task</DialogTitle>
                <DialogDescription>Assign operational work to a team member.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cable-manage BUILD-10488"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-detail">Detail</Label>
                  <Textarea
                    id="task-detail"
                    rows={3}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="Optional notes or acceptance criteria"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Assignee</Label>
                    <Select value={newAssignee} onValueChange={setNewAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select value={newPriority} onValueChange={(v) => setNewPriority(v as TaskPriority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {titleCase(p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="task-due">Due</Label>
                    <Input id="task-due" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open tasks" numericValue={stats.openCount} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="In progress" numericValue={stats.inProgress} format={(n) => Math.round(n).toString()} accent="warning" />
        <StatCard label="Blocked" numericValue={stats.blocked} format={(n) => Math.round(n).toString()} accent="danger" />
        <StatCard label="Overdue" numericValue={stats.overdue} format={(n) => Math.round(n).toString()} accent={stats.overdue ? "danger" : "success"} />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search title, reference or ID…" />
          <FilterSelect value={assignee} onChange={setAssignee} options={assignees} label="Assignee" />
          <FilterSelect value={priority} onChange={setPriority} options={PRIORITIES} label="Priority" />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "board", label: "Board" },
              { value: "list", label: "List" },
            ]}
          />
          <ResultCount shown={filtered.length} total={tasks.length} noun="tasks" />
        </Toolbar>

        {view === "list" ? (
          <DataTable
            rows={filtered}
            columns={columns}
            pageSize={12}
            initialSort={{ key: "due", dir: "asc" }}
            empty={<EmptyState title="No tasks match your filters" description="Adjust the assignee or priority filter." />}
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="No tasks match your filters" description="Adjust the assignee or priority filter." />
        ) : (
          <div className="grid gap-3 p-3 lg:grid-cols-4">
            {STATUSES.map((status) => {
              const rows = filtered.filter((t) => t.status === status);
              return (
                <div key={status} className="rounded-lg border border-border bg-elevated/40 p-2.5">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <TechLabel>{titleCase(status)}</TechLabel>
                    <span className="mono text-[11px] text-subtle">{rows.length}</span>
                  </div>
                  <div className="space-y-2">
                    {rows.length === 0 && (
                      <p className="px-1 py-4 text-center text-[11.5px] text-subtle">Nothing here</p>
                    )}
                    {rows.map((t) => (
                      <article
                        key={t.id}
                        className="rounded-md border border-border bg-surface p-2.5 transition-colors hover:border-border-strong"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12.5px] leading-snug text-foreground">{t.title}</p>
                          <StatusBadge status={t.priority} tone={priorityTone[t.priority]} />
                        </div>
                        {t.detail && <p className="mt-1 line-clamp-2 text-[11.5px] text-muted-foreground">{t.detail}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-subtle">
                          <span className="mono">{t.id}</span>
                          {t.link && <TaskLink task={t} />}
                          <span className={cn("inline-flex items-center gap-1", isOverdue(t) && "text-destructive")}>
                            <CalendarClock className="size-3" />
                            {dateShort(t.dueAt)}
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2">
                          <Select value={t.assignee} onValueChange={(v) => assignTask(t.id, v)}>
                            <SelectTrigger className="h-7 flex-1 text-[11.5px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assignees.map((a) => (
                                <SelectItem key={a} value={a}>
                                  {a}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {t.status !== "done" && (
                            <Button size="sm" variant="outline" className="h-7" onClick={() => advance(t)}>
                              {t.status === "todo" ? "Start" : t.status === "in_progress" ? "Done" : "Unblock"}
                            </Button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <DemoNote>
        Task changes update local demo state only — no notifications, calendar sync or assignment emails are sent.
      </DemoNote>
    </div>
  );
}
