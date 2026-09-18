import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, Circle, FolderKanban, ListChecks, Plus, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { SearchInput, Toolbar, ResultCount } from "@/components/nexus/toolbar";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { CLIENT_TYPES } from "@/lib/client-types";
import type { ClientType } from "@/lib/types";

export const Route = createFileRoute("/_app/projects/")({
  validateSearch: (search: Record<string, unknown>) => ({ tab: typeof search.tab === "string" ? search.tab : "projects", newProject: search.new === "1" || search.new === true }),
  head: () => ({ meta: [{ title: "Projects — DPC POS" }, { name: "description", content: "Projects, tasks and team coordination." }] }),
  component: ProjectsPage,
});

type ProjectStatus = "planning" | "active" | "on_hold" | "completed";
type Project = { id: string; name: string; customer: string; customerType: ClientType; status: ProjectStatus; due: string; owner: string; description: string; tasks: number; done: number; members: string[]; scope: string; priority: "low" | "medium" | "high" };
type Task = { id: string; title: string; project: string; assignee: string; status: "todo" | "in_progress" | "done"; due: string };
const PROJECTS_LOCKED = true;

const initialProjects: Project[] = [
  { id: "PRJ-001", name: "Office PC Refresh", customer: "Northstar Accounting", customerType: "business", status: "active", due: "2026-09-28", owner: "niel", description: "Replace twelve workstations and migrate user profiles.", tasks: 8, done: 5, members: ["niel", "Dana Lim"], scope: "Hardware replacement, profile migration, deployment and handover.", priority: "high" },
  { id: "PRJ-002", name: "Creator Workstation Build", customer: "Mara Santos", customerType: "walk-in", status: "planning", due: "2026-10-04", owner: "niel", description: "High-end editing workstation with calibrated display.", tasks: 6, done: 1, members: ["niel"], scope: "Parts sourcing, assembly, burn-in testing and client orientation.", priority: "medium" },
  { id: "PRJ-003", name: "Branch Network Upgrade", customer: "Dream PC Cebu", customerType: "business", status: "on_hold", due: "2026-10-12", owner: "niel", description: "Switch, access point and structured cabling upgrade.", tasks: 10, done: 4, members: ["Arnel Bautista", "Grace Tan"], scope: "Site survey, network design, installation and validation.", priority: "low" },
];

const initialTasks: Task[] = [
  { id: "TSK-101", title: "Confirm component availability", project: "Office PC Refresh", assignee: "niel", status: "done", due: "2026-09-18" },
  { id: "TSK-102", title: "Prepare migration checklist", project: "Office PC Refresh", assignee: "niel", status: "in_progress", due: "2026-09-20" },
  { id: "TSK-103", title: "Send final quote for approval", project: "Creator Workstation Build", assignee: "niel", status: "todo", due: "2026-09-22" },
  { id: "TSK-104", title: "Confirm cabling schedule", project: "Branch Network Upgrade", assignee: "niel", status: "todo", due: "2026-09-24" },
];

function ProjectsPage() {
  const { customers, createCustomer } = useStore();
  const { tab: requestedTab, newProject } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState(requestedTab);
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [detailMember, setDetailMember] = useState<string | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", project: "", assignee: "niel", due: "" });
  const [calendarView, setCalendarView] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [form, setForm] = useState({ name: "", customer: "", customerType: "walk-in" as ClientType, due: "", description: "", scope: "", priority: "medium" as Project["priority"] });
  const [customerForm, setCustomerForm] = useState({ name: "", email: "", phone: "", type: "individual" as "individual" | "business", address: "", notes: "" });

  if (PROJECTS_LOCKED) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Panel className="max-w-md p-6 text-center">
          <FolderKanban className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-4 text-lg font-semibold text-foreground">Projects temporarily locked</h1>
          <p className="mt-2 text-sm text-muted-foreground">This workspace is temporarily unavailable and will return tomorrow.</p>
        </Panel>
      </div>
    );
  }

  useEffect(() => {
    if (newProject) setCreateOpen(true);
  }, [newProject]);

  useEffect(() => {
    setTab(requestedTab);
  }, [requestedTab]);

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((project) => !term || `${project.id} ${project.name} ${project.customer} ${project.owner}`.toLowerCase().includes(term));
  }, [projects, query]);
  const activeTasks = tasks.filter((task) => task.status !== "done").length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const projectCategories = ["Internal", "Client Project", "Deployment", "Installation", "Maintenance", "Repair"];
  const teamMembers = ["niel", "Dana Lim", "Arnel Bautista", "Grace Tan"];
  const visibleTasks = tasks.filter((task) => {
    if (requestedTab === "my-tasks") return task.assignee === "niel";
    if (requestedTab === "completed-tasks") return task.status === "done";
    return true;
  });

  const createProject = () => {
    if (!form.name.trim() || !form.due) {
      toast.error("Project name and due date are required.");
      return;
    }
    setProjects((current) => [{ id: `PRJ-${String(current.length + 1).padStart(3, "0")}`, name: form.name.trim(), customer: form.customer || "Internal", customerType: form.customerType, status: "planning", due: form.due, owner: "niel", description: form.description.trim() || "No description added.", tasks: 0, done: 0, members: ["niel"], scope: form.scope.trim() || "Scope to be defined.", priority: form.priority }, ...current]);
    setForm({ name: "", customer: "", customerType: "walk-in", due: "", description: "", scope: "", priority: "medium" });
    setCreateOpen(false);
    toast.success("Project created.");
  };

  const cycleTask = (id: string) => setTasks((current) => current.map((task) => task.id !== id ? task : { ...task, status: task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo" }));

  const createTask = () => {
    if (!taskForm.title.trim() || !taskForm.project || !taskForm.due) {
      toast.error("Task title, project, and due date are required.");
      return;
    }
    const task: Task = {
      id: `TSK-${Math.floor(Math.random() * 900 + 100)}`,
      title: taskForm.title.trim(),
      project: taskForm.project,
      assignee: taskForm.assignee,
      status: "todo",
      due: taskForm.due,
    };
    setTasks((current) => [task, ...current]);
    setProjects((current) => current.map((project) => project.name === task.project ? { ...project, tasks: project.tasks + 1 } : project));
    setTaskForm({ title: "", project: "", assignee: "niel", due: "" });
    setTaskOpen(false);
    toast.success("Task created and assigned.");
  };

  const openTaskForProject = (project: Project) => {
    setTaskForm((current) => ({ ...current, project: project.name }));
    setTaskOpen(true);
  };

  const toggleProjectMember = (member: string) => {
    if (!detailProject) return;
    const members = detailProject.members.includes(member)
      ? detailProject.members.filter((item) => item !== member)
      : [...detailProject.members, member];
    const updated = { ...detailProject, members };
    setDetailProject(updated);
    setProjects((current) => current.map((project) => project.id === updated.id ? updated : project));
  };

  const addCustomer = () => {
    if (!customerForm.name.trim() || !customerForm.email.trim()) {
      toast.error("Customer name and email are required.");
      return;
    }
    const customer = createCustomer({
      name: customerForm.name.trim(),
      email: customerForm.email.trim(),
      phone: customerForm.phone.trim(),
      type: customerForm.type,
      address: customerForm.address.trim(),
      notes: customerForm.notes.trim() || undefined,
    });
    setForm((current) => ({ ...current, customer: customer.name }));
    setCustomerForm({ name: "", email: "", phone: "", type: "individual", address: "", notes: "" });
    setCustomerOpen(false);
    toast.success(`${customer.name} added and selected.`);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Projects" description="Coordinate builds, service work and internal initiatives." actions={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="size-3.5" /> New project</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active projects" numericValue={projects.filter((p) => p.status === "active").length} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Open tasks" numericValue={activeTasks} format={(n) => Math.round(n).toString()} accent="warning" />
        <StatCard label="Completed tasks" numericValue={completedTasks} format={(n) => Math.round(n).toString()} accent="success" />
        <StatCard label="Team members" value="4" accent="neutral" />
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border">
        {[{ id: "projects", label: "All projects", icon: FolderKanban }, { id: "tasks", label: "Tasks", icon: ListChecks }, { id: "team", label: "Team members", icon: UserRound }, { id: "reports", label: "Reports", icon: BarChart3 }].map((item) => <button key={item.id} type="button" onClick={() => { setTab(item.id); void navigate({ to: "/projects", search: { tab: item.id, newProject: false } }); }} className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium ${tab === item.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><item.icon className="size-3.5" />{item.label}</button>)}
      </div>
      {tab === "dashboard" && <div className="grid gap-3 lg:grid-cols-2"><Panel className="p-4"><h3 className="font-medium">Project progress</h3><div className="mt-4 space-y-3">{projects.map((project) => <div key={project.id}><div className="flex justify-between text-xs"><span>{project.name}</span><Mono>{project.tasks ? Math.round(project.done / project.tasks * 100) : 0}%</Mono></div><div className="mt-1 h-2 rounded bg-muted"><div className="h-full rounded bg-info" style={{ width: `${project.tasks ? project.done / project.tasks * 100 : 0}%` }} /></div></div>)}</div></Panel><Panel className="p-4"><h3 className="font-medium">Tasks by status</h3><div className="mt-4 grid grid-cols-4 gap-2 text-center">{["todo", "in_progress", "done", "review"].map((status) => <div key={status} className="rounded border border-border p-3"><p className="mono text-lg">{status === "review" ? 1 : tasks.filter((task) => task.status === status).length}</p><p className="mt-1 text-[11px] capitalize text-muted-foreground">{status.replace("_", " ")}</p></div>)}</div></Panel><Panel className="p-4 lg:col-span-2"><h3 className="font-medium">Projects by category</h3><div className="mt-4 flex flex-wrap gap-2">{projectCategories.map((category, index) => <span key={category} className="rounded border border-border px-3 py-2 text-xs text-muted-foreground">{category} <Mono className="ml-2">{index < projects.length ? 1 : 0}</Mono></span>)}</div></Panel></div>}
      {tab === "categories" && <Panel><div className="divide-y divide-border">{projectCategories.map((category) => <div key={category} className="flex items-center justify-between px-4 py-4"><div><p className="font-medium text-foreground">{category}</p><p className="text-xs text-muted-foreground">Project work grouped under this category.</p></div><Mono>{category === "Client Project" ? projects.length : 0} projects</Mono></div>)}</div></Panel>}
      {tab === "archived" && <Panel><EmptyState title="No archived projects" description="Archived projects will appear here when a project is closed or cancelled." /></Panel>}
      {tab === "projects" && <Panel><Toolbar><SearchInput value={query} onChange={setQuery} placeholder="Search project, customer or owner…" /><ResultCount shown={filteredProjects.length} total={projects.length} noun="projects" /></Toolbar><div className="divide-y divide-border">{filteredProjects.map((project) => <button key={project.id} type="button" onClick={() => setDetailProject(project)} className="flex w-full flex-wrap items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-elevated"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Mono>{project.id}</Mono><StatusBadge status={project.status} label={project.status.replace("_", " ")} /></div><h3 className="mt-1 font-medium text-foreground">{project.name}</h3><p className="text-xs text-muted-foreground">{project.customer} · {project.description}</p></div><div className="w-40"><div className="flex justify-between text-[11px] text-muted-foreground"><span>{project.members.length} members</span><Mono>{project.tasks ? Math.round(project.done / project.tasks * 100) : 0}%</Mono></div><div className="mt-1 h-1.5 rounded bg-muted"><div className="h-full rounded bg-info" style={{ width: `${project.tasks ? project.done / project.tasks * 100 : 0}%` }} /></div><p className="mt-1 text-right text-xs text-muted-foreground">Due {project.due}</p></div></button>)}{filteredProjects.length === 0 && <EmptyState title="No projects found" description="Try another search or create a new project." />}</div></Panel>}
      {(["tasks", "my-tasks", "completed-tasks"] as string[]).includes(tab) && <Panel><Toolbar><SearchInput value={query} onChange={setQuery} placeholder="Search task, project or assignee…" /><ResultCount shown={visibleTasks.filter((task) => `${task.title} ${task.project} ${task.assignee}`.toLowerCase().includes(query.toLowerCase())).length} total={visibleTasks.length} noun="tasks" /><Button size="sm" onClick={() => setTaskOpen(true)}><Plus className="size-3.5" /> New task</Button></Toolbar><div className="divide-y divide-border">{visibleTasks.filter((task) => `${task.title} ${task.project} ${task.assignee}`.toLowerCase().includes(query.toLowerCase())).map((task) => <button key={task.id} type="button" onClick={() => cycleTask(task.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-elevated"><span>{task.status === "done" ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}</span><span className="min-w-0 flex-1"><span className="block text-sm text-foreground">{task.title}</span><span className="block text-xs text-muted-foreground">{task.project} · {task.assignee} · due {task.due}</span></span><StatusBadge status={task.status} label={task.status.replace("_", " ")} /></button>)}</div></Panel>}
      {tab === "board" && <div className="grid gap-3 md:grid-cols-4">{["todo", "in_progress", "review", "done"].map((status) => <Panel key={status} className="min-h-48 p-3"><h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">{status === "todo" ? "To do" : status === "in_progress" ? "In progress" : status === "done" ? "Completed" : "Review"}</h3><div className="space-y-2">{(status === "review" ? [] : tasks.filter((task) => task.status === status)).map((task) => <button key={task.id} type="button" onClick={() => cycleTask(task.id)} className="w-full rounded border border-border p-3 text-left text-xs hover:bg-elevated">{task.title}<span className="mt-1 block text-muted-foreground">{task.project}</span></button>)}</div></Panel>)}</div>}
      {(["assign", "roles"] as string[]).includes(tab) && <Panel><div className="divide-y divide-border">{teamMembers.map((member, index) => <div key={member} className="flex items-center gap-3 px-4 py-4"><span className="flex-1"><span className="block text-sm">{member}</span><span className="text-xs text-muted-foreground">{tab === "roles" ? ["Project Manager", "Team Lead", "Member", "Member"][index] : `${projects.filter((project) => project.members.includes(member)).length} assigned projects`}</span></span>{tab === "assign" && <Select defaultValue={projects[0]?.id}><SelectTrigger className="w-56"><SelectValue placeholder="Assign to project" /></SelectTrigger><SelectContent>{projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select>}</div>)}</div></Panel>}
      {(["calendar", "deadlines", "milestones"] as string[]).includes(tab) && <Panel><div className="mb-3 flex items-center gap-2 px-4 pt-4 text-xs text-muted-foreground"><CalendarDays className="size-4 text-info" />{tab === "calendar" ? "Monthly project schedule" : tab === "deadlines" ? "Upcoming project deadlines" : "Milestone tracking"}</div><div className="divide-y divide-border">{[...projects].sort((a, b) => a.due.localeCompare(b.due)).map((project) => <div key={project.id} className="flex items-center gap-4 px-4 py-4"><CalendarDays className="size-4 text-info" /><div className="flex-1"><p className="text-sm font-medium">{project.name}</p><p className="text-xs text-muted-foreground">{tab === "milestones" ? `Milestone: ${project.done} of ${project.tasks} tasks complete` : tab === "deadlines" ? "Project deadline" : "Project schedule"}</p></div><Mono>{project.due}</Mono></div>)}</div></Panel>}
      {tab === "team" && <Panel><div className="divide-y divide-border">{["niel", "Dana Lim", "Arnel Bautista", "Grace Tan"].map((member, index) => <button key={member} type="button" onClick={() => setDetailMember(member)} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-elevated"><span className="flex size-8 items-center justify-center rounded-full border border-border bg-elevated text-xs font-medium">{member.slice(0, 2).toUpperCase()}</span><span className="flex-1"><span className="block text-sm text-foreground">{member}</span><span className="block text-xs text-muted-foreground">{["Project owner", "Purchasing", "Technician", "Purchasing lead"][index]}</span></span><Mono>{projects.filter((project) => project.members.includes(member)).length} projects</Mono></button>)}</div></Panel>}
      {(["reports", "team-performance", "completion"] as string[]).includes(tab) && <div className="grid gap-3 md:grid-cols-2"><Panel className="p-4"><h3 className="font-medium">{tab === "team-performance" ? "Team performance" : tab === "completion" ? "Completion statistics" : "Project reports"}</h3><div className="mt-4 grid grid-cols-2 gap-2">{[{ label: "Active projects", value: projects.filter((p) => p.status === "active").length }, { label: "Completed projects", value: projects.filter((p) => p.status === "completed").length }, { label: "Overdue projects", value: projects.filter((p) => p.status !== "completed" && p.due < "2026-09-17").length }, { label: "Tasks completed", value: completedTasks }].map((item) => <div key={item.label} className="rounded border border-border p-3"><Mono className="text-lg">{item.value}</Mono><p className="mt-1 text-[11px] text-muted-foreground">{item.label}</p></div>)}</div></Panel><Panel className="p-4"><h3 className="font-medium">{tab === "team-performance" ? "Workload by member" : "Delivery outlook"}</h3><div className="mt-4 space-y-2">{teamMembers.map((member) => <div key={member} className="flex justify-between border-b border-border py-2 text-xs"><span>{member}</span><Mono>{tasks.filter((task) => task.assignee === member && task.status === "done").length} done</Mono></div>)}</div></Panel></div>}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}><DialogContent><DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader><div className="space-y-3"><div><Label htmlFor="task-title">Task title</Label><Input id="task-title" value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Prepare handover checklist" /></div><div><Label htmlFor="task-project">Project</Label><Select value={taskForm.project} onValueChange={(value) => setTaskForm((f) => ({ ...f, project: value }))}><SelectTrigger id="task-project"><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.map((project) => <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="task-assignee">Assignee</Label><Select value={taskForm.assignee} onValueChange={(value) => setTaskForm((f) => ({ ...f, assignee: value }))}><SelectTrigger id="task-assignee"><SelectValue /></SelectTrigger><SelectContent>{["niel", "Dana Lim", "Arnel Bautista", "Grace Tan"].map((member) => <SelectItem key={member} value={member}>{member}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="task-due">Due date</Label><Input id="task-due" type="date" value={taskForm.due} onChange={(e) => setTaskForm((f) => ({ ...f, due: e.target.value }))} /></div></div><DialogFooter><Button variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button><Button onClick={createTask}>Create task</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={detailProject !== null} onOpenChange={(open) => !open && setDetailProject(null)}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{detailProject?.name}</DialogTitle></DialogHeader>{detailProject && <div className="space-y-5"><div className="flex flex-wrap items-center gap-2"><Mono>{detailProject.id}</Mono><StatusBadge status={detailProject.status} label={detailProject.status.replace("_", " ")} /><StatusBadge status={detailProject.priority} label={`${detailProject.priority} priority`} /></div><div className="grid gap-4 sm:grid-cols-2"><div><p className="label-tech">Customer</p><p className="mt-1 text-sm">{detailProject.customer}</p><p className="text-xs text-muted-foreground">{detailProject.customerType}</p></div><div><p className="label-tech">Due date</p><p className="mt-1 mono text-sm">{detailProject.due}</p></div></div><div><p className="label-tech">What this project is for</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detailProject.scope}</p></div><div><p className="label-tech">Project tasks</p><div className="mt-2 space-y-1">{tasks.filter((task) => task.project === detailProject.name).map((task) => <button key={task.id} type="button" onClick={() => cycleTask(task.id)} className="flex w-full items-center gap-2 rounded border border-border px-3 py-2 text-left text-xs hover:bg-elevated"><span className="flex-1">{task.title}</span><StatusBadge status={task.status} label={task.status.replace("_", " ")} /></button>)}{tasks.filter((task) => task.project === detailProject.name).length === 0 && <p className="text-xs text-muted-foreground">No tasks created for this project yet.</p>}</div></div><div><p className="label-tech">Assign team members</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{["niel", "Dana Lim", "Arnel Bautista", "Grace Tan"].map((member) => <label key={member} className="flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-2 text-sm hover:bg-elevated"><input type="checkbox" checked={detailProject.members.includes(member)} onChange={() => toggleProjectMember(member)} /><button type="button" className="text-left hover:underline" onClick={(event) => { event.preventDefault(); setDetailMember(member); }}>{member}</button></label>)}</div></div><div><p className="label-tech">Progress</p><div className="mt-2 h-2 rounded bg-muted"><div className="h-full rounded bg-info" style={{ width: `${detailProject.tasks ? detailProject.done / detailProject.tasks * 100 : 0}%` }} /></div><p className="mt-1 mono text-xs text-muted-foreground">{detailProject.done} of {detailProject.tasks} tasks complete</p></div></div>}</DialogContent></Dialog>
      <Dialog open={detailMember !== null} onOpenChange={(open) => !open && setDetailMember(null)}><DialogContent><DialogHeader><DialogTitle>{detailMember}</DialogTitle></DialogHeader>{detailMember && <div className="space-y-4"><div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full border border-border bg-elevated font-medium">{detailMember.slice(0, 2).toUpperCase()}</span><div><p className="text-sm font-medium">{detailMember}</p><p className="text-xs text-muted-foreground">{detailMember === "niel" ? "Project owner" : "Operations team member"}</p></div></div><div className="grid gap-3 sm:grid-cols-2"><div><p className="label-tech">Assigned projects</p><p className="mt-1 mono text-sm">{projects.filter((project) => project.members.includes(detailMember)).length}</p></div><div><p className="label-tech">Open tasks</p><p className="mt-1 mono text-sm">{tasks.filter((task) => task.assignee === detailMember && task.status !== "done").length}</p></div></div><div><p className="label-tech">Current assignments</p><div className="mt-2 space-y-1">{projects.filter((project) => project.members.includes(detailMember)).map((project) => <p key={project.id} className="text-sm text-muted-foreground">{project.name}</p>)}</div></div></div>}</DialogContent></Dialog>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader><div className="space-y-3"><div><Label htmlFor="project-name">Project name</Label><Input id="project-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Office PC Refresh" /></div><div><Label>Customer type</Label><div className="mt-2 grid grid-cols-3 gap-2">{CLIENT_TYPES.map((type) => <button key={type.id} type="button" onClick={() => setForm((f) => ({ ...f, customerType: type.id }))} className={`flex flex-col items-center gap-1 rounded border px-2 py-2 text-xs ${form.customerType === type.id ? "border-info bg-info/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}><type.icon className="size-4" /><span>{type.label}</span><Mono>{type.code}</Mono></button>)}</div></div><div><Label htmlFor="project-customer">Customer</Label><div className="flex gap-2"><Select value={form.customer} onValueChange={(value) => setForm((f) => ({ ...f, customer: value }))}><SelectTrigger id="project-customer" className="flex-1"><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map((customer) => <SelectItem key={customer.id} value={customer.name}>{customer.name}</SelectItem>)}</SelectContent></Select><Button type="button" variant="outline" size="icon" aria-label="Add customer" title="Add customer" onClick={() => setCustomerOpen(true)}><UserPlus className="size-4" /></Button></div><p className="text-xs text-muted-foreground">Choose an existing customer or add one without leaving this form.</p></div><div><Label htmlFor="project-due">Due date</Label><Input id="project-due" type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} /></div><div><Label htmlFor="project-priority">Priority</Label><Select value={form.priority} onValueChange={(value) => setForm((f) => ({ ...f, priority: value as Project["priority"] }))}><SelectTrigger id="project-priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div><div><Label htmlFor="project-description">Description</Label><Textarea id="project-description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Scope, deliverables, or notes" /></div><div><Label htmlFor="project-scope">Project scope</Label><Textarea id="project-scope" value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} placeholder="What is this project for?" /></div></div><DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={createProject}>Create project</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}><DialogContent><DialogHeader><DialogTitle>Add customer</DialogTitle></DialogHeader><div className="space-y-3"><div><Label htmlFor="project-customer-name">Full name / company</Label><Input id="project-customer-name" value={customerForm.name} onChange={(e) => setCustomerForm((f) => ({ ...f, name: e.target.value }))} autoFocus /></div><div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="project-customer-email">Email</Label><Input id="project-customer-email" type="email" value={customerForm.email} onChange={(e) => setCustomerForm((f) => ({ ...f, email: e.target.value }))} /></div><div><Label htmlFor="project-customer-phone">Phone</Label><Input id="project-customer-phone" value={customerForm.phone} onChange={(e) => setCustomerForm((f) => ({ ...f, phone: e.target.value }))} /></div></div><div><Label htmlFor="project-customer-type">Customer type</Label><Select value={customerForm.type} onValueChange={(value) => setCustomerForm((f) => ({ ...f, type: value as "individual" | "business" }))}><SelectTrigger id="project-customer-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="business">Business</SelectItem></SelectContent></Select></div><div><Label htmlFor="project-customer-address">Address</Label><Input id="project-customer-address" value={customerForm.address} onChange={(e) => setCustomerForm((f) => ({ ...f, address: e.target.value }))} /></div><div><Label htmlFor="project-customer-notes">Notes</Label><Textarea id="project-customer-notes" value={customerForm.notes} onChange={(e) => setCustomerForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional customer or project notes" /></div></div><DialogFooter><Button variant="outline" onClick={() => setCustomerOpen(false)}>Cancel</Button><Button onClick={addCustomer}><UserPlus className="size-3.5" /> Add and select</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
