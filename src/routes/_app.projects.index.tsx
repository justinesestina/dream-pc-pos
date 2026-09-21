import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  Briefcase,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Filter,
  FolderKanban,
  ListChecks,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Target,
  TrendingUp,
  UserPlus,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { SearchInput, Toolbar, ResultCount } from "@/components/nexus/toolbar";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useStore } from "@/lib/store";
import { UserAvatar } from "@/components/admin/users/user-bits";
import { CLIENT_TYPES } from "@/lib/client-types";
import { isDpcConnectorEnabled } from "@/lib/dpc-connector";
import { canAct } from "@/lib/permissions";
import type {
  ClientType,
  Project as StoreProject,
  ProjectTask as StoreTask,
} from "@/lib/types";
import { Reveal } from "@/components/nexus/motion";
import { money } from "@/lib/format";

export const Route = createFileRoute("/_app/projects/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : "projects",
    newProject: search["new"] === "1" || search["new"] === true,
    projectId: typeof search["projectId"] === "string" ? search["projectId"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Projects Studio — DPC POS" },
      { name: "description", content: "Projects, tasks and team coordination." },
    ],
  }),
  component: ProjectsPage,
});

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════════════════════ */

type ProjectStatus = "planning" | "active" | "on_hold" | "completed";
type Project = {
  id: string;
  name: string;
  customer: string;
  customerType: ClientType;
  status: ProjectStatus;
  startDate: string;
  due: string;
  owner: string;
  description: string;
  tasks: number;
  done: number;
  members: string[];
  scope: string;
  value: number; // Replaced priority with Project Value
};
type Task = {
  id: string;
  title: string;
  project: string;
  assignee: string;
  status: "todo" | "in_progress" | "done";
  due: string;
  duration: string; // Replaced priority with Estimated Duration
};

type MemberInfo = { name: string; role: string; initials: string; email: string; phone: string; skills: string[]; avatar_url: string };

/** Fallback roster rendered only until real DPC users load from the connector. */
let TEAM_MEMBERS: MemberInfo[] = [
  { name: "niel", role: "Project Manager", initials: "NI", email: "niel@dreampc.com", phone: "+63 917 000 0001", avatar_url: "", skills: ["Project Management", "Client Relations", "System Architecture"] },
  { name: "Dana Lim", role: "Purchasing", initials: "DL", email: "dana.lim@dreampc.com", phone: "+63 917 000 0002", avatar_url: "", skills: ["Purchasing", "Vendor Management", "Logistics"] },
  { name: "Arnel Bautista", role: "Technician", initials: "AB", email: "arnel.bautista@dreampc.com", phone: "+63 917 000 0003", avatar_url: "", skills: ["Hardware Diagnostics", "Network Setup", "PC Assembly"] },
  { name: "Grace Tan", role: "Purchasing Lead", initials: "GT", email: "grace.tan@dreampc.com", phone: "+63 917 000 0004", avatar_url: "", skills: ["Procurement", "Cost Analysis", "Supplier Relations"] },
];

const STATUS_META: Record<ProjectStatus, { color: string; bg: string; border: string }> = {
  planning: { color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
  active: { color: "text-info", bg: "bg-info/10", border: "border-info/20" },
  on_hold: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  completed: { color: "text-success", bg: "bg-success/10", border: "border-success/20" },
};

/** Resolves today once at load so overdue/due-today comparisons always work. */
const TODAY = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();

/** Maps a connector project onto the page's display shape (code as id). */
function toProject(p: StoreProject): Project {
  return {
    id: p.code,
    name: p.name,
    customer: p.customer,
    customerType: p.customerType,
    status: p.status,
    startDate: p.startDate,
    due: p.due,
    owner: p.ownerName || "Unassigned",
    description: p.description || "No description added.",
    tasks: p.tasks,
    done: p.done,
    members: p.memberNames.length ? p.memberNames : [],
    scope: p.scope || "Scope to be defined.",
    value: p.value,
  };
}

/** Maps a connector task onto the page's display shape. */
function toTask(t: StoreTask): Task {
  return {
    id: `T${t.id}`,
    title: t.title,
    project: t.project,
    assignee: t.assigneeName || "Unassigned",
    status: t.status,
    due: t.due,
    duration: t.duration,
  };
}


function Telemetry({ label, children, className }: { label: string; children: React.ReactNode, className?: string }) {
  return (
    <span className={`mono inline-flex items-baseline gap-1.5 text-[11px] tracking-wide uppercase ${className || ""}`}>
      <span className="text-subtle">{label}</span>
      <span className="text-foreground">{children}</span>
    </span>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════════
   SEARCHABLE CUSTOMER COMBOBOX
   ═══════════════════════════════════════════════════════════════════════════════ */
function ClientCombobox({ value, onChange, clients, onAddNew }: {
  value: string; onChange: (val: string) => void;
  clients: { id: string; name: string; type?: string }[]; onAddNew: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? clients.filter((c) => c.name.toLowerCase().includes(term)) : clients;
  }, [clients, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" id="project-client"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent/40 transition-colors">
          <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || "Search or select a client…"}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search client…" value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty><div className="py-4 text-center text-sm text-muted-foreground">No client found.</div></CommandEmpty>
            <CommandGroup>
              {filtered.map((c) => (
                <CommandItem key={c.id} value={c.name} onSelect={() => { onChange(c.name); setSearch(""); setOpen(false); }}>
                  <div className="flex flex-1 items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-elevated text-[10px] font-semibold uppercase text-muted-foreground">{c.name.slice(0, 2)}</span>
                    <span className="flex-1 text-sm">{c.name}</span>
                    {c.type && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.type}</span>}
                  </div>
                  {value === c.name && <Check className="ml-2 size-4 text-info" />}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="border-t border-border p-1">
              <button type="button" onClick={() => { setOpen(false); onAddNew(); }}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <UserPlus className="size-4" />Add new client…
              </button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MEMBER PICKER
   ═══════════════════════════════════════════════════════════════════════════════ */
function MemberPicker({ selected, onChange }: { selected: string[]; onChange: (members: string[]) => void }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? TEAM_MEMBERS.filter((m) => m.name.toLowerCase().includes(term) || m.role.toLowerCase().includes(term)) : TEAM_MEMBERS;
  }, [search]);
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter((m) => m !== name) : [...selected, name]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team members…"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-1.5">
        {filtered.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No members found.</p>}
        {filtered.map((member) => {
          const isSelected = selected.includes(member.name);
          return (
            <button key={member.name} type="button" onClick={() => toggle(member.name)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${isSelected ? "bg-info/10 text-foreground" : "text-foreground hover:bg-elevated"}`}>
              <UserAvatar user={member} size="sm" rounded="full" className="size-8" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">{member.name}</span>
                <span className="block text-[11px] text-muted-foreground">{member.role}</span>
              </span>
              <span className={`flex size-5 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-info bg-info text-white" : "border-border bg-background"}`}>
                {isSelected && <Check className="size-3" />}
              </span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((name) => (
            <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-2.5 py-1 text-[11px] font-medium text-info">
              {name}
              <button type="button" onClick={() => toggle(name)} className="rounded-full hover:bg-info/20 transition-colors" aria-label={`Remove ${name}`}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CREATE PROJECT MODAL
   ═══════════════════════════════════════════════════════════════════════════════ */
type CreateForm = { name: string; customer: string; customerType: ClientType; startDate: string; due: string; description: string; scope: string; members: string[]; value: number };

function CreateProjectModal({ open, onOpenChange, customers, onSubmit, onAddCustomer, busy }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  customers: { id: string; name: string; type?: string }[];
  onSubmit: (form: CreateForm) => void; onAddCustomer: () => void; busy?: boolean;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CreateForm>({ name: "", customer: "", customerType: "walk-in", startDate: TODAY, due: "", description: "", scope: "", members: TEAM_MEMBERS[0] ? [TEAM_MEMBERS[0].name] : [], value: 0 });
  const set = <K extends keyof CreateForm>(key: K, val: CreateForm[K]) => setForm((f) => ({ ...f, [key]: val }));
  const reset = () => { setStep(1); setForm({ name: "", customer: "", customerType: "walk-in", startDate: TODAY, due: "", description: "", scope: "", members: TEAM_MEMBERS[0] ? [TEAM_MEMBERS[0].name] : [], value: 0 }); };
  const handleClose = (v: boolean) => { if (busy) return; if (!v) reset(); onOpenChange(v); };
  const handleSubmit = () => { if (!form.name.trim() || !form.due || !form.startDate) { toast.error("Project name and dates are required."); return; } onSubmit(form); reset(); };
  const canNext = step === 1 ? Boolean(form.name.trim() && form.due && form.startDate) : true;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info border border-info/20 shadow-sm"><FolderKanban className="size-5" /></div>
            <div>
              <DialogTitle className="text-xl">Create New Project</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Step {step} of 2 — {step === 1 ? "Configure project details" : "Assemble the team"}</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            {[1, 2].map((s) => (<div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ease-out ${s <= step ? "bg-info" : "bg-muted"}`} />))}
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-semibold">Project name <span className="text-destructive">*</span></Label>
              <Input id="project-name" autoFocus value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Enterprise Network Overhaul" className="h-11 shadow-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-start" className="text-sm font-semibold">Start date <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="project-start" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="h-10 pl-9 shadow-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-due" className="text-sm font-semibold">Target end date <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="project-due" type="date" value={form.due} min={form.startDate} onChange={(e) => set("due", e.target.value)} className="h-10 pl-9 shadow-sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-client" className="text-sm font-semibold">Client</Label>
                <ClientCombobox value={form.customer} onChange={(val) => set("customer", val)} clients={customers} onAddNew={onAddCustomer} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-value" className="text-sm font-semibold">Estimated Budget / Value (Optional)</Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground font-semibold">₱</span>
                  <Input id="project-value" type="number" min="0" value={form.value || ""} onChange={(e) => set("value", Number(e.target.value))} placeholder="0.00" className="h-10 pl-8 shadow-sm" />
                </div>
              </div>
            </div>

            {/* Client type */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Client category</Label>
              <div className="grid grid-cols-3 gap-2">
                {CLIENT_TYPES.map((type) => (
                  <button key={type.id} type="button" onClick={() => set("customerType", type.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 transition-all ${form.customerType === type.id ? "border-info bg-info/10 text-foreground shadow-sm ring-1 ring-info/20" : "border-border text-muted-foreground hover:bg-elevated hover:text-foreground"}`}>
                    <type.icon className="size-4" />
                    <span className="text-[11px] font-bold tracking-tight">{type.label}</span>
                    <Mono className="text-[9px] font-semibold text-muted-foreground bg-background px-1.5 py-0.5 rounded-sm border border-border mt-0.5">{type.code}</Mono>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-sm font-semibold">Brief Description</Label>
              <Textarea id="project-description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="A quick summary of the project goals..." rows={2} className="resize-none text-sm shadow-sm" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-2">
            <div className="chassis-corners relative overflow-hidden rounded-xl border border-border bg-surface/60 p-4 shadow-sm">
               <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" />
               <div className="relative pl-3">
                <p className="text-lg font-bold text-foreground mb-1">{form.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><UserRound className="size-3.5" />{form.customer || "No client"}</span>
                  <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{form.startDate} to {form.due || "—"}</span>
                  {form.value > 0 && <span className="flex items-center gap-1.5 font-mono text-info"><Zap className="size-3.5"/>{money(form.value)}</span>}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  Assemble your team
                  <span className="rounded-full bg-info/10 px-2.5 py-0.5 text-[11px] font-bold text-info">{form.members.length} Selected</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">Search and assign operators, technicians, and managers to this project.</p>
              </div>
              <MemberPicker selected={form.members} onChange={(members) => set("members", members)} />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-4 border-t border-border mt-2">
          {step === 1 ? (
            <><Button variant="outline" onClick={() => handleClose(false)} disabled={busy}>Cancel</Button><Button onClick={() => setStep(2)} disabled={!canNext || busy}>Next: Team members</Button></>
          ) : (
            <><Button variant="outline" onClick={() => setStep(1)} disabled={busy}>Back</Button><Button onClick={handleSubmit} disabled={busy} className="gap-2">{busy ? <Loader2 className="size-4 animate-spin" /> : <FolderKanban className="size-4" />}{busy ? "Creating…" : "Create project"}</Button></>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TASK CARD
   ═══════════════════════════════════════════════════════════════════════════════ */
function TaskCard({ task, onCycle, busy }: { task: Task; onCycle: () => void; busy?: boolean }) {
  const isOverdue = task.status !== "done" && task.due < TODAY;
  const isDueSoon = task.status !== "done" && task.due === TODAY;
  const member = TEAM_MEMBERS.find(m => m.name === task.assignee);

  return (
    <div className="group bg-card border border-border hover:border-info/40 hover:shadow-md transition-all duration-300 rounded-xl p-4 cursor-pointer relative overflow-hidden" onClick={busy ? undefined : onCycle}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className={`text-sm font-semibold leading-snug transition-colors ${task.status === "done" ? "text-muted-foreground line-through opacity-70" : "text-foreground group-hover:text-info"}`}>{task.title}</h4>
        <div className={`mt-0.5 shrink-0 size-5 rounded-full border flex items-center justify-center transition-all duration-300 ${task.status === "done" ? "bg-success border-success text-white" : "border-muted-foreground/30 text-transparent group-hover:border-info group-hover:bg-info/5"} ${busy ? "border-info/40" : ""}`}>
          {busy ? <Loader2 className="size-3 animate-spin text-info" /> : task.status === "done" && <Check className="size-3.5" />}
        </div>
      </div>
      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mb-3"><FolderKanban className="size-3" />{task.project}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {member ? (
            <UserAvatar user={member} size="sm" rounded="full" className="size-6" />
          ) : (
            <span title={task.assignee} className="flex size-6 items-center justify-center rounded-full bg-elevated text-[10px] font-bold text-foreground ring-2 ring-background shadow-sm">?</span>
          )}
          {task.duration && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-elevated px-2 py-0.5 rounded-md border border-border">
              <Clock className="size-3" /> {task.duration}
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md ${task.status === "done" ? "bg-muted/50 text-muted-foreground" : isOverdue ? "bg-red-500/15 text-red-400" : isDueSoon ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}>
          {isOverdue && <AlertCircle className="size-3" />}
          {isDueSoon && !isOverdue && <Clock className="size-3" />}
          {!isOverdue && !isDueSoon && <CalendarDays className="size-3" />}
          <span className="uppercase tracking-wider">{isOverdue ? "Overdue" : isDueSoon ? "Today" : task.due}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PROJECT CARD
   ═══════════════════════════════════════════════════════════════════════════════ */
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const progress = project.tasks ? Math.round((project.done / project.tasks) * 100) : 0;
  const memberList = TEAM_MEMBERS.filter((m) => project.members.includes(m.name));
  const sm = STATUS_META[project.status];

  return (
    <button type="button" onClick={onClick} className="group flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Mono className="text-[11px]">{project.id}</Mono>
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sm.bg} ${sm.border} ${sm.color}`}>{project.status.replace("_", " ")}</span>
            {project.value > 0 && (
               <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-elevated px-2 py-0.5 rounded-md border border-border">
                 <Zap className="size-3" /> {money(project.value)}
               </span>
            )}
          </div>
          <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-info transition-colors">{project.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{project.customer} · {project.description}</p>
        </div>
        <div className={`shrink-0 text-right flex flex-col items-end gap-1 text-[11px] font-semibold ${project.status !== "completed" && project.due < TODAY ? "text-red-400" : "text-muted-foreground"}`}>
          <div className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /><span>Due: {project.due}</span></div>
          <div className="text-[10px] font-normal opacity-70">Started: {project.startDate}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex -space-x-2">
          {memberList.slice(0, 4).map((m) => (<UserAvatar key={m.name} user={m} size="sm" rounded="full" className="size-7 border-2 border-surface" />))}
          {project.members.length > 4 && <span className="flex size-7 items-center justify-center rounded-full border-2 border-surface bg-elevated text-[10px] font-bold text-muted-foreground shadow-sm">+{project.members.length - 4}</span>}
        </div>
        <div className="flex flex-1 items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden shadow-inner">
            <div className={`h-full rounded-full transition-all duration-700 ease-out ${progress === 100 ? "bg-success" : progress > 50 ? "bg-info" : "bg-warning"}`} style={{ width: `${progress}%` }} />
          </div>
          <Mono className="text-[11px] font-bold text-muted-foreground w-8 text-right">{progress}%</Mono>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
function ProjectsPage() {
  const store = useStore();
  const { customers, createCustomer } = store;
  const { tab: requestedTab, newProject, projectId } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState(requestedTab);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [detailMember, setDetailMember] = useState<string | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [taskForm, setTaskForm] = useState({ title: "", project: "", assignee: "", due: TODAY, duration: "" });
  const [customerForm, setCustomerForm] = useState({ name: "", email: "", phone: "", type: "individual" as "individual" | "business", address: "", notes: "" });
  const [busy, setBusy] = useState<"create" | "task" | "cycle" | "member" | null>(null);

  useEffect(() => { if (newProject) setCreateOpen(true); }, [newProject]);
  useEffect(() => { setTab(requestedTab); }, [requestedTab]);
  
  // Data is server-backed through the connector — refresh once on mount.
  useEffect(() => {
    if (isDpcConnectorEnabled() || store.projects.length === 0) void store.refreshProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open project detail modal when projectId is provided in search
  useEffect(() => {
    if (projectId && store.projects.length > 0) {
      const project = store.projects.find((p) => p.id === Number(projectId));
      if (project) {
        setDetailProject(toProject(project));
        // Clear the projectId from URL after opening modal
        navigate({ to: '/projects', search: { tab: requestedTab } });
      }
    }
  }, [projectId, store.projects, requestedTab, navigate]);

  const teamMembers = useMemo(() => {
    if (store.team.length === 0) return TEAM_MEMBERS;
    return store.team.map((m) => ({
      name: m.name,
      role: m.role || "Team Member",
      initials: m.initials,
      email: m.email,
      phone: "",
      avatar_url: m.avatar_url || "",
      skills: [m.role || "Team Member", "Project Delivery"],
    }));
  }, [store.team]);
  TEAM_MEMBERS = teamMembers;

  const teamIdByName = useMemo(
    () => new Map(store.team.map((m) => [m.name, m.id])),
    [store.team],
  );

  const projects = useMemo(() => store.projects.map(toProject), [store.projects]);
  const tasks = useMemo(() => store.projectTasks.map(toTask), [store.projectTasks]);

  const canCreateProject = store.user ? canAct(store.user, "projects.create") : false;
  const canUpdateProject = store.user ? canAct(store.user, "projects.update") : false;

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((p) => !term || `${p.id} ${p.name} ${p.customer} ${p.owner}`.toLowerCase().includes(term));
  }, [projects, query]);

  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalValue = projects.reduce((s, p) => s + (p.status !== "completed" ? p.value : 0), 0);

  const switchTab = (id: string) => { setTab(id); void navigate({ to: "/projects", search: { tab: id, newProject: false } }); };

  const handleCreateProject = async (form: CreateForm) => {
    if (!canCreateProject) { toast.error("You do not have permission to create projects."); return; }
    if (busy) return;
    setBusy("create");
    try {
      const created = await store.createProject({
        name: form.name.trim(),
        customer: form.customer.trim() || "Internal",
        customerType: form.customerType,
        status: "planning",
        startDate: form.startDate,
        due: form.due,
        description: form.description.trim() || "No description added.",
        scope: form.scope.trim() || "Scope to be defined.",
        value: form.value,
        members: form.members.map((n) => teamIdByName.get(n) ?? 0).filter((id) => id > 0),
      });
      if (created) { toast.success("Project created successfully."); setCreateOpen(false); }
      else toast.error("Could not create project. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  };

  const cycleTask = async (id: string) => {
    if (!canUpdateProject) { toast.error("You do not have permission to update tasks."); return; }
    if (busy) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const storeTask = store.projectTasks.find((t) => String(t.id) === id.slice(1));
    if (!storeTask) return;
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    setBusy("cycle");
    try {
      await store.updateProjectTask(storeTask.id, { status: next });
    } finally {
      setBusy(null);
    }
  };

  const createTask = async () => {
    if (!canCreateProject) { toast.error("You do not have permission to add tasks."); return; }
    if (!taskForm.title.trim() || !taskForm.project || !taskForm.due) { toast.error("Task title, project, and due date are required."); return; }
    const project = store.projects.find((p) => p.name === taskForm.project);
    if (!project) { toast.error("Select a valid project."); return; }
    const assigneeId = teamIdByName.get(taskForm.assignee) ?? 0;
    if (busy) return;
    setBusy("task");
    try {
      await store.createProjectTask(project.id, {
        title: taskForm.title.trim(),
        due: taskForm.due,
        duration: taskForm.duration.trim(),
        ...(assigneeId > 0 ? { assignee: assigneeId } : {}),
      });
      setTaskForm({ title: "", project: "", assignee: teamMembers[0]?.name ?? "", due: TODAY, duration: "" });
      setTaskOpen(false);
      toast.success("Task created and assigned.");
    } finally {
      setBusy(null);
    }
  };

  const toggleProjectMember = async (memberName: string) => {
    if (!detailProject) return;
    if (!canUpdateProject) { toast.error("You do not have permission to update the team."); return; }
    const storeProject = store.projects.find((p) => p.code === detailProject.id);
    if (!storeProject) return;
    const id = teamIdByName.get(memberName) ?? 0;
    if (!id) return;
    if (busy) return;
    const members = storeProject.members.includes(id)
      ? storeProject.members.filter((m) => m !== id)
      : [...storeProject.members, id];
    setBusy("member");
    try {
      const updated = await store.updateProject(storeProject.id, { members });
      if (updated) setDetailProject(toProject(updated));
    } finally {
      setBusy(null);
    }
  };

  const addCustomer = () => {
    if (!customerForm.name.trim() || !customerForm.email.trim()) { toast.error("Client name and email are required."); return; }
    const customer = createCustomer({ name: customerForm.name.trim(), email: customerForm.email.trim(), phone: customerForm.phone.trim(), type: customerForm.type, address: customerForm.address.trim(), notes: customerForm.notes.trim() || undefined });
    setCustomerForm({ name: "", email: "", phone: "", type: "individual", address: "", notes: "" });
    setCustomerOpen(false); setCreateOpen(true);
    toast.success(`${customer.name} added and selected.`);
  };

  // Calendar states (default to the current month/view).
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "year">("month");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[calendarMonth];

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
    setSelectedDate(TODAY);
  };

  // Calendar Day Grid Matrix
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      projectStarts: Project[];
      projectDues: Project[];
      tasks: Task[];
    }[] = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = calendarMonth === 0 ? 12 : calendarMonth;
      const y = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === TODAY,
        projectStarts: projects.filter((p) => p.startDate === dateStr),
        projectDues: projects.filter((p) => p.due === dateStr),
        tasks: tasks.filter((t) => t.due === dateStr),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === TODAY,
        projectStarts: projects.filter((p) => p.startDate === dateStr),
        projectDues: projects.filter((p) => p.due === dateStr),
        tasks: tasks.filter((t) => t.due === dateStr),
      });
    }

    // Next month filler days to complete grid
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = calendarMonth === 11 ? 1 : calendarMonth + 2;
      const y = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === TODAY,
        projectStarts: projects.filter((p) => p.startDate === dateStr),
        projectDues: projects.filter((p) => p.due === dateStr),
        tasks: tasks.filter((t) => t.due === dateStr),
      });
    }

    return days;
  }, [calendarYear, calendarMonth, projects, tasks]);

  // Selected date info
  const selectedDateObj = useMemo(() => {
    try {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return {
          dayWeek: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d).toUpperCase(),
          dayNum: parts[2],
          monthYear: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(d),
          full: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(d),
        };
      }
    } catch {
      // fallback
    }
    return { dayWeek: "FRI", dayNum: "18", monthYear: "Sep 2026", full: "September 18, 2026" };
  }, [selectedDate]);

  const selectedDateProjectStarts = useMemo(() => projects.filter((p) => p.startDate === selectedDate), [projects, selectedDate]);
  const selectedDateProjectDues = useMemo(() => projects.filter((p) => p.due === selectedDate), [projects, selectedDate]);
  const selectedDateTasks = useMemo(() => tasks.filter((t) => t.due === selectedDate), [tasks, selectedDate]);
  const hasSelectedEvents = selectedDateProjectStarts.length > 0 || selectedDateProjectDues.length > 0 || selectedDateTasks.length > 0;

  // Month overview stats
  const currentMonthPrefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`;
  const monthProjects = useMemo(() => projects.filter((p) => p.startDate.startsWith(currentMonthPrefix) || p.due.startsWith(currentMonthPrefix)), [projects, currentMonthPrefix]);
  const monthTasks = useMemo(() => tasks.filter((t) => t.due.startsWith(currentMonthPrefix)), [tasks, currentMonthPrefix]);
  const monthDoneTasks = useMemo(() => monthTasks.filter((t) => t.status === "done"), [monthTasks]);
  const monthOverdue = useMemo(() => monthTasks.filter((t) => t.status !== "done" && t.due < TODAY).length + projects.filter((p) => p.status !== "completed" && p.due < TODAY && p.due.startsWith(currentMonthPrefix)).length, [monthTasks, projects, currentMonthPrefix]);

  const TABS = [
    { id: "projects", label: "All Projects", icon: FolderKanban },
    { id: "tasks", label: "Tasks Board", icon: ListChecks },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "team", label: "Team Workload", icon: UserRound },
    { id: "reports", label: "Reports", icon: Activity },
  ];

  /* ── Filtered tasks based on member filter ── */
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (taskFilter !== "all") result = result.filter((t) => t.assignee === taskFilter);
    const term = query.trim().toLowerCase();
    if (term) result = result.filter((t) => `${t.title} ${t.project} ${t.assignee}`.toLowerCase().includes(term));
    return result;
  }, [tasks, taskFilter, query]);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* ── Command-center hero (Matches DPC POS Dashboard) ─────────────────────────────────────────── */}
      <Reveal>
        <div className="chassis-corners relative overflow-hidden rounded-xl border border-border bg-surface/60">
          <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" />
          <div className="pointer-events-none absolute inset-0 ambient-glow" />
          <div className="relative p-4 sm:p-6">
            <PageHeader
              title="Projects Studio"
              description="Coordinate builds, service work and internal initiatives with precision."
              actions={
                <Button
                  onClick={() => {
                    if (busy === "create") return;
                    if (!canCreateProject) { toast.error("You do not have permission to create projects."); return; }
                    setCreateOpen(true);
                  }}
                  disabled={busy === "create"}
                  className="gap-2 shadow-sm font-semibold h-10 px-5"
                >
                   {busy === "create" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} {busy === "create" ? "Creating…" : "Create Project"}
                </Button>
              }
            />

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-border pt-4">
              <span className="mono inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
                <span className="status-dot" />
                <span className="text-subtle">Tracker</span>
                <span className="text-success">Live</span>
              </span>
              {store.loadingProjects && (
                <span className="mono inline-flex items-center gap-2 text-[11px] tracking-wide uppercase text-info">
                  <Loader2 className="size-3 animate-spin" /> Syncing
                </span>
              )}
              <Telemetry label="Active Projects">{activeProjects}</Telemetry>
              <Telemetry label="Open Tasks">{activeTasks}</Telemetry>
              <Telemetry label="Pipeline Value">{money(totalValue)}</Telemetry>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── KPI grid ────────────────────────────────────────────────────── */}
      <Reveal stagger={0.06} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Projects"
          numericValue={activeProjects}
          hint="Currently in progress"
          icon={FolderKanban}
          accent="info"
        />
        <StatCard
          label="Open Tasks"
          numericValue={activeTasks}
          hint="Pending completion"
          icon={ListChecks}
        />
        <StatCard
          label="Overdue Items"
          numericValue={projects.filter(p => p.status !== "completed" && p.due < TODAY).length + tasks.filter(t => t.status !== "done" && t.due < TODAY).length}
          accent="warning"
          hint="Requires immediate attention"
          icon={AlertCircle}
        />
        <StatCard
          label="Pipeline Value"
          numericValue={totalValue}
          format={money}
          accent="success"
          hint="Total estimated revenue"
          icon={Zap}
        />
      </Reveal>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-px pt-2">
        {TABS.map((item) => (
          <button key={item.id} type="button" onClick={() => switchTab(item.id)}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === item.id ? "border-info text-info" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}>
            <item.icon className="size-4" />{item.label}
          </button>
        ))}
      </div>

      {/* ══════ ALL PROJECTS TAB ══════ */}
      {tab === "projects" && (
        <Reveal>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Toolbar className="border-b border-border p-4 bg-muted/20">
              <SearchInput value={query} onChange={setQuery} placeholder="Search project, client or owner…" />
              <ResultCount shown={filteredProjects.length} total={projects.length} noun="projects" />
            </Toolbar>
            <div className="divide-y divide-border">
              {filteredProjects.map((project) => (<ProjectCard key={project.id} project={project} onClick={() => setDetailProject(project)} />))}
              {filteredProjects.length === 0 && <div className="p-12"><EmptyState title="No projects found" description="Try another search or create a new project." icon={FolderKanban} /></div>}
            </div>
          </div>
        </Reveal>
      )}

      {/* ══════ TASKS BOARD TAB ══════ */}
      {tab === "tasks" && (
        <Reveal className="space-y-4">
          {/* Toolbar + Member Filter */}
          <div className="chassis-corners relative overflow-hidden bg-surface/60 border border-border rounded-xl p-4 shadow-sm space-y-3">
             <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-30" />
             <div className="relative">
              <Toolbar>
                <SearchInput value={query} onChange={setQuery} placeholder="Search task, project or assignee…" />
                <ResultCount shown={filteredTasks.length} total={tasks.length} noun="tasks" />
                <Button size="sm" onClick={() => setTaskOpen(true)} className="gap-2 font-semibold"><Plus className="size-4" />New Task</Button>
              </Toolbar>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button type="button" onClick={() => setTaskFilter("all")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${taskFilter === "all" ? "bg-info/10 text-info border border-info/20 shadow-sm" : "text-muted-foreground hover:bg-elevated border border-transparent"}`}>
                  <Users className="size-3.5" />All Members
                </button>
                {TEAM_MEMBERS.map(m => (
                  <button key={m.name} type="button" onClick={() => setTaskFilter(m.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${taskFilter === m.name ? "bg-info/10 text-info border border-info/20 shadow-sm" : "text-muted-foreground hover:bg-elevated border border-transparent"}`}>
                    <UserAvatar user={m} size="sm" rounded="full" className="size-5" />
                    {m.name}
                    <Mono className="text-[10px]">({tasks.filter(t => t.assignee === m.name && t.status !== "done").length})</Mono>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {(["todo", "in_progress", "done"] as const).map((status) => {
              const statusTasks = filteredTasks.filter((t) => t.status === status);
              return (
                <div key={status} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      {status === "todo" && <Circle className="size-4" />}
                      {status === "in_progress" && <Clock className="size-4 text-warning" />}
                      {status === "done" && <CheckCircle2 className="size-4 text-success" />}
                      {status.replace("_", " ")}
                    </h3>
                    <Mono className="text-[10px] font-bold text-muted-foreground bg-elevated px-2.5 py-1 rounded-full border border-border">{statusTasks.length}</Mono>
                  </div>
                  <div className="flex flex-col gap-3">
                    {statusTasks.map(task => <TaskCard key={task.id} task={task} onCycle={() => cycleTask(task.id)} busy={busy === "cycle"} />)}
                    {statusTasks.length === 0 && (
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground opacity-70 bg-card/50">
                        <ListChecks className="size-6" /><span className="text-xs font-semibold">No tasks here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* ══════ CALENDAR TAB ══════ */}
      {tab === "calendar" && (
        <Reveal className="space-y-5">
          {/* Calendar Header */}
          <div className="chassis-corners relative overflow-hidden rounded-xl border border-border bg-surface/60">
            <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-30" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
                <p className="text-sm text-muted-foreground mt-1">Project timelines, task deadlines, and milestones at a glance.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-border overflow-hidden">
                  <button type="button" onClick={() => setCalendarViewMode("month")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${calendarViewMode === "month" ? "bg-info text-white" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                    Month
                  </button>
                  <button type="button" onClick={() => setCalendarViewMode("year")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${calendarViewMode === "year" ? "bg-info text-white" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                    Year
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={goToToday} className="text-xs font-semibold gap-1.5">
                  <Target className="size-3.5" /> Today
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar body */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
            {/* Main Calendar Grid */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              {/* Month navigation */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
                <h3 className="text-xl font-bold tracking-tight">{currentMonthName} {calendarYear}</h3>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={prevMonth} className="p-2 rounded-lg hover:bg-elevated text-muted-foreground hover:text-foreground transition-colors" aria-label="Previous month">
                    <ChevronLeft className="size-4" />
                  </button>
                  <button type="button" onClick={nextMonth} className="p-2 rounded-lg hover:bg-elevated text-muted-foreground hover:text-foreground transition-colors" aria-label="Next month">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {calendarViewMode === "month" ? (
                <>
                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 border-b border-border bg-muted/10">
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                      <div key={d} className="px-2 py-2.5 text-center text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const hasEvents = day.projectStarts.length > 0 || day.projectDues.length > 0 || day.tasks.length > 0;
                      const isSelected = day.dateStr === selectedDate;
                      const isWeekend = idx % 7 === 0 || idx % 7 === 6;

                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          onClick={() => setSelectedDate(day.dateStr)}
                          className={`relative group min-h-[90px] p-2 text-left border-b border-r border-border/50 transition-all duration-200
                            ${!day.isCurrentMonth ? "bg-muted/20" : isWeekend ? "bg-muted/10" : "bg-card"}
                            ${isSelected ? "ring-2 ring-info ring-inset bg-info/5" : "hover:bg-elevated/60"}
                          `}
                        >
                          {/* Day Number */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-sm font-semibold tabular-nums transition-colors ${
                              day.isToday
                                ? "flex items-center justify-center size-7 rounded-full bg-info text-white font-bold"
                                : !day.isCurrentMonth
                                  ? "text-muted-foreground/40"
                                  : "text-foreground"
                            }`}>
                              {day.dayNum}
                            </span>
                            {day.isToday && (
                              <span className="text-[9px] font-bold tracking-wider text-info uppercase bg-info/10 px-1.5 py-0.5 rounded">TODAY</span>
                            )}
                          </div>

                          {/* Event indicators */}
                          {hasEvents && day.isCurrentMonth && (
                            <div className="space-y-0.5">
                              {day.projectStarts.slice(0, 1).map((p) => (
                                <div key={p.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-info/10 border border-info/20 truncate">
                                  <span className="size-1.5 rounded-full bg-info shrink-0" />
                                  <span className="text-[9px] font-semibold text-info truncate">{p.name}</span>
                                </div>
                              ))}
                              {day.projectDues.slice(0, 2).map((p) => (
                                <div key={p.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning/10 border border-warning/20 truncate">
                                  <span className="size-1.5 rounded-full bg-warning shrink-0" />
                                  <span className="text-[9px] font-semibold text-warning truncate">Due: {p.name}</span>
                                </div>
                              ))}
                              {day.tasks.slice(0, 3).map((t) => (
                                <div key={t.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded truncate ${
                                  t.status === "done"
                                    ? "bg-success/10 border border-success/20"
                                    : t.due < TODAY
                                      ? "bg-red-500/10 border border-red-500/20"
                                      : "bg-muted border border-border"
                                }`}>
                                  <span className={`size-1.5 rounded-full shrink-0 ${
                                    t.status === "done" ? "bg-success" : t.due < TODAY ? "bg-red-500" : "bg-muted-foreground"
                                  }`} />
                                  <span className={`text-[9px] font-semibold truncate ${
                                    t.status === "done" ? "text-success" : t.due < TODAY ? "text-red-400" : "text-muted-foreground"
                                  }`}>{t.title}</span>
                                </div>
                              ))}
                              {/* Overflow indicator */}
                              {(day.projectStarts.length + day.projectDues.length + day.tasks.length) > 5 && (
                                <span className="text-[9px] font-bold text-muted-foreground pl-1.5">
                                  +{day.projectStarts.length + day.projectDues.length + day.tasks.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-3 border-t border-border bg-muted/10">
                    {[
                      { color: "bg-info", label: "Project Start" },
                      { color: "bg-warning", label: "Deadline" },
                      { color: "bg-success", label: "Completed" },
                      { color: "bg-red-500", label: "Overdue" },
                      { color: "bg-muted-foreground", label: "Task Due" },
                    ].map((item) => (
                      <span key={item.label} className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                        <span className={`size-2 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                /* Year Overview (12 mini-month grid) */
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-5">
                  {monthNames.map((mName, mIdx) => {
                    const prefix = `${calendarYear}-${String(mIdx + 1).padStart(2, "0")}`;
                    const mProjects = projects.filter((p) => p.startDate.startsWith(prefix) || p.due.startsWith(prefix)).length;
                    const mTasks = tasks.filter((t) => t.due.startsWith(prefix)).length;
                    const isCurrentViewMonth = mIdx === calendarMonth;

                    return (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => { setCalendarMonth(mIdx); setCalendarViewMode("month"); }}
                        className={`group p-4 rounded-xl border text-left transition-all duration-200 ${
                          isCurrentViewMonth
                            ? "border-info bg-info/5 ring-1 ring-info/20 shadow-sm"
                            : "border-border bg-card hover:bg-elevated hover:border-info/30"
                        }`}
                      >
                        <p className={`text-sm font-bold mb-2 transition-colors ${isCurrentViewMonth ? "text-info" : "text-foreground group-hover:text-info"}`}>{mName}</p>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                            <FolderKanban className="size-3" />{mProjects}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                            <ListChecks className="size-3" />{mTasks}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Selected Date Card */}
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-info/10 border-b border-info/20 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-info">{selectedDateObj.dayWeek}</p>
                  <p className="text-4xl font-black text-foreground mt-1 tabular-nums">{selectedDateObj.dayNum}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">{selectedDateObj.monthYear}</p>
                </div>
                <div className="p-4">
                  {hasSelectedEvents ? (
                    <div className="space-y-4">
                      {projects
                        .filter((p) => p.startDate === selectedDate || p.due === selectedDate || selectedDateTasks.some(t => t.project === p.name))
                        .map((p) => {
                          const isStart = p.startDate === selectedDate;
                          const isDue = p.due === selectedDate;
                          const pTasks = selectedDateTasks.filter(t => t.project === p.name);

                          return (
                            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                              <button type="button" onClick={() => setDetailProject(p)} className="w-full text-left p-3.5 bg-muted/10 hover:bg-muted/30 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5"><UserRound className="size-3 shrink-0" /><span className="truncate">{p.customer}</span></p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    {isStart && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">Starts Today</span>}
                                    {isDue && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">Project Deadline</span>}
                                    {pTasks.length > 0 && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">{pTasks.length} {pTasks.length === 1 ? 'Task' : 'Tasks'} Due</span>}
                                  </div>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <CalendarDays className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-muted-foreground">No events scheduled</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Select a day to view details.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Month Summary Card */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarClock className="size-4 text-info" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Month Summary</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Projects", value: monthProjects.length, accent: "text-info" },
                    { label: "Tasks Due", value: monthTasks.length, accent: "text-foreground" },
                    { label: "Completed", value: monthDoneTasks.length, accent: "text-success" },
                    { label: "Overdue", value: monthOverdue, accent: monthOverdue > 0 ? "text-red-400" : "text-muted-foreground" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                      <Mono className={`text-sm font-bold ${stat.accent}`}>{stat.value}</Mono>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines Card */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="size-4 text-warning" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upcoming Deadlines</h4>
                </div>
                <div className="space-y-2.5">
                  {projects
                    .filter((p) => p.status !== "completed" && p.due >= TODAY)
                    .sort((a, b) => a.due.localeCompare(b.due))
                    .slice(0, 4)
                    .map((p) => {
                      const daysLeft = Math.ceil((new Date(p.due).getTime() - new Date(TODAY).getTime()) / 86400000);
                      const dueObj = new Date(p.due);
                      const monthStr = dueObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
                      const dayStr = dueObj.getDate().toString().padStart(2, "0");
                      
                      return (
                        <button key={p.id} type="button" onClick={() => { setSelectedDate(p.due); setDetailProject(p); }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left hover:bg-elevated transition-colors group">
                          <div className={`flex flex-col w-[42px] shrink-0 items-center justify-center rounded-lg py-1.5 border ${
                            daysLeft <= 3 ? "border-red-500/30 bg-red-500/10 text-red-400" : daysLeft <= 7 ? "border-warning/30 bg-warning/10 text-warning" : "border-border bg-muted/50 text-muted-foreground"
                          }`}>
                            <span className="text-[9px] font-bold uppercase leading-none mb-0.5">{monthStr}</span>
                            <span className="text-sm font-black leading-none">{dayStr}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate text-foreground group-hover:text-info transition-colors">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              <span className={daysLeft <= 3 ? "text-red-400 font-bold" : daysLeft <= 7 ? "text-warning font-bold" : ""}>
                                {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft} days left`}
                              </span>
                            </p>
                          </div>
                        </button>
                      );
                    })
                  }
                  {projects.filter((p) => p.status !== "completed" && p.due >= TODAY).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">No upcoming deadlines.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ══════ TEAM WORKLOAD TAB ══════ */}
      {tab === "team" && (
        <Reveal stagger={0.06} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM_MEMBERS.map(member => {
            const memberTasks = tasks.filter(t => t.assignee === member.name);
            const openTasks = memberTasks.filter(t => t.status !== "done").length;
            const doneTasks = memberTasks.filter(t => t.status === "done").length;
            const totalProjects = projects.filter(p => p.members.includes(member.name)).length;
            const completionRate = memberTasks.length ? Math.round((doneTasks / memberTasks.length) * 100) : 0;
            const isOverloaded = openTasks > 5;
            return (
              <button key={member.name} type="button" onClick={() => setDetailMember(member.name)}
                className="relative overflow-hidden group flex flex-col items-center p-6 bg-card border border-border rounded-2xl text-center hover:border-info/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {member.avatar_url ? (
                  <UserAvatar user={member} size="xl" rounded="full" className="size-20 shadow-sm ring-2 ring-offset-4 ring-offset-card transition-all duration-300 group-hover:scale-105" />
                ) : (
                  <div className={`relative flex size-20 items-center justify-center rounded-full text-2xl font-black shadow-sm transition-all duration-300 group-hover:scale-105 ${isOverloaded ? "bg-red-500/10 text-red-400 ring-red-500/30" : "bg-info/10 text-info ring-info/30"} ring-2 ring-offset-4 ring-offset-card`}>
                    {member.initials}
                  </div>
                )}
                <h3 className="mt-6 text-base font-bold text-foreground group-hover:text-info transition-colors">{member.name}</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">{member.role}</p>
                <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-5 border-t border-border/60 relative z-10">
                  <div className="flex flex-col items-center">
                    <p className="text-2xl font-black font-mono text-foreground">{totalProjects}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Projects</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className={`text-2xl font-black font-mono ${isOverloaded ? "text-red-400" : "text-foreground"}`}>{openTasks}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Open Tasks</p>
                  </div>
                </div>
                <div className="w-full mt-5 relative z-10">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-muted-foreground">Completion</span>
                    <span className={completionRate > 60 ? "text-success" : completionRate > 30 ? "text-warning" : "text-red-400"}>{completionRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${completionRate > 60 ? "bg-success" : completionRate > 30 ? "bg-warning" : "bg-red-500"}`} style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </Reveal>
      )}

      {/* ══════ REPORTS TAB (SIMPLIFIED & NON-TECHY) ══════ */}
      {tab === "reports" && (
        <Reveal className="space-y-6">
          <div className="chassis-corners relative overflow-hidden rounded-xl border border-border bg-surface/60 p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" />
            <div className="pointer-events-none absolute inset-0 ambient-glow" />
            <div className="relative max-w-3xl">
               <h2 className="text-2xl font-bold tracking-tight mb-2">Project Health Report</h2>
               <p className="text-muted-foreground text-sm">A simple, plain-English overview of how your projects and team are doing.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Business Health Card 1: Projects Overview */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-info/10 rounded-lg text-info"><FolderKanban className="size-5"/></div>
                 <h3 className="font-bold text-lg">Project Activity</h3>
               </div>
               
               <div className="space-y-6">
                 <div>
                   <p className="text-sm font-medium mb-1">How many projects are running right now?</p>
                   <p className="text-3xl font-black font-mono">{activeProjects} <span className="text-sm font-normal text-muted-foreground">active projects</span></p>
                 </div>
                 
                 <div>
                   <p className="text-sm font-medium mb-2">What is the status of all our projects?</p>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between text-sm">
                       <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-info"/> Active & Running</span>
                       <span className="font-mono font-bold">{projects.filter(p => p.status === 'active').length}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-muted-foreground"/> In Planning</span>
                       <span className="font-mono font-bold">{projects.filter(p => p.status === 'planning').length}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-warning"/> On Hold</span>
                       <span className="font-mono font-bold">{projects.filter(p => p.status === 'on_hold').length}</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Business Health Card 2: Team Capacity */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-success/10 rounded-lg text-success"><Users className="size-5"/></div>
                 <h3 className="font-bold text-lg">Team Capacity</h3>
               </div>
               
               <div className="space-y-6">
                 <div>
                   <p className="text-sm font-medium mb-1">Who has the most open tasks?</p>
                   {(() => {
                      const busyMember = TEAM_MEMBERS.map(m => ({ 
                        name: m.name, 
                        tasks: tasks.filter(t => t.assignee === m.name && t.status !== 'done').length 
                      })).sort((a,b) => b.tasks - a.tasks)[0];
                      
                      if (!busyMember) return null;
                      
                      return (
                        <p className="text-xl font-bold">{busyMember.name} <span className="text-sm font-normal text-muted-foreground">with {busyMember.tasks} open tasks</span></p>
                      );
                   })()}
                 </div>

                 <div>
                   <p className="text-sm font-medium mb-3">How is everyone doing?</p>
                   <div className="space-y-4">
                     {TEAM_MEMBERS.map(member => {
                       const memberTasks = tasks.filter((t) => t.assignee === member.name);
                       const done = memberTasks.filter((t) => t.status === "done").length;
                       const pct = memberTasks.length ? Math.round((done / memberTasks.length) * 100) : 0;
                       return (
                         <div key={member.name}>
                           <div className="flex justify-between text-xs mb-1">
                             <span className="font-semibold">{member.name}</span>
                             <span className="text-muted-foreground">{pct}% completed</span>
                           </div>
                           <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                             <div className="h-full bg-success" style={{ width: `${pct}%`}}/>
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 </div>
               </div>
            </div>

             {/* Business Health Card 3: Deadlines */}
             <div className="bg-card border border-border rounded-xl p-6 shadow-sm md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-warning/10 rounded-lg text-warning"><AlertCircle className="size-5"/></div>
                 <h3 className="font-bold text-lg">Deadlines & Timelines</h3>
               </div>
               
               <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                     <p className="text-sm font-medium mb-2">Are we hitting our project deadlines?</p>
                     {(() => {
                       const overdueProjects = projects.filter(p => p.status !== "completed" && p.due < TODAY);
                       if (overdueProjects.length === 0) {
                         return <p className="text-success font-bold flex items-center gap-2"><CheckCircle2 className="size-5"/> All projects are on schedule!</p>;
                       }
                       return (
                         <div className="space-y-2">
                           <p className="text-red-400 font-bold flex items-center gap-2"><AlertCircle className="size-5"/> {overdueProjects.length} projects are overdue.</p>
                           <ul className="list-disc pl-5 text-sm text-muted-foreground">
                             {overdueProjects.map(p => <li key={p.id}>{p.name} (Due {p.due})</li>)}
                           </ul>
                         </div>
                       )
                     })()}
                  </div>
                  <div>
                     <p className="text-sm font-medium mb-2">Tasks due very soon</p>
                     {(() => {
                       const urgentTasks = tasks.filter(t => t.status !== "done" && t.due <= TODAY);
                       if (urgentTasks.length === 0) {
                         return <p className="text-success font-bold flex items-center gap-2"><CheckCircle2 className="size-5"/> No urgent tasks due today.</p>;
                       }
                       return (
                         <div className="space-y-2">
                           <p className="text-warning font-bold flex items-center gap-2"><Clock className="size-5"/> {urgentTasks.length} tasks require immediate attention.</p>
                           <ul className="list-disc pl-5 text-sm text-muted-foreground">
                             {urgentTasks.slice(0,3).map(t => <li key={t.id}>{t.title} ({t.assignee})</li>)}
                             {urgentTasks.length > 3 && <li>...and {urgentTasks.length - 3} more.</li>}
                           </ul>
                         </div>
                       )
                     })()}
                  </div>
               </div>
            </div>

          </div>
        </Reveal>
      )}

      {/* ══════ CREATE PROJECT MODAL ══════ */}
      <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen}
        customers={customers.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
        onSubmit={handleCreateProject} onAddCustomer={() => { setCreateOpen(false); setCustomerOpen(true); }} busy={busy === "create"} />

      {/* ══════ ADD CLIENT MODAL ══════ */}
      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add client</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label htmlFor="pc-name">Full name / company</Label><Input id="pc-name" value={customerForm.name} onChange={(e) => setCustomerForm((f) => ({ ...f, name: e.target.value }))} autoFocus /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="pc-email">Email</Label><Input id="pc-email" type="email" value={customerForm.email} onChange={(e) => setCustomerForm((f) => ({ ...f, email: e.target.value }))} /></div>
              <div><Label htmlFor="pc-phone">Phone</Label><Input id="pc-phone" value={customerForm.phone} onChange={(e) => setCustomerForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div><Label htmlFor="pc-type">Client type</Label>
              <Select value={customerForm.type} onValueChange={(v) => setCustomerForm((f) => ({ ...f, type: v as "individual" | "business" }))}>
                <SelectTrigger id="pc-type"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="business">Business</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="pc-addr">Address</Label><Input id="pc-addr" value={customerForm.address} onChange={(e) => setCustomerForm((f) => ({ ...f, address: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCustomerOpen(false); setCreateOpen(true); }}>Cancel</Button>
            <Button onClick={addCustomer}><UserPlus className="size-3.5" />Add and select</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════ NEW TASK MODAL (NOTEPAD STYLE) ══════ */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border/50 bg-background shadow-2xl">
          <div className="p-6">
            <input 
               type="text" 
               autoFocus
               placeholder="Write a task..." 
               value={taskForm.title} 
               onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
               className="w-full bg-transparent text-2xl font-semibold placeholder:text-muted-foreground/40 border-none focus:outline-none focus:ring-0 mb-6"
            />
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b border-border/40 pb-4">
                <FolderKanban className="size-5 text-muted-foreground shrink-0"/>
                <div className="flex-1">
                  <Select value={taskForm.project} onValueChange={(v) => setTaskForm((f) => ({ ...f, project: v }))}>
                    <SelectTrigger className="border-none shadow-none focus:ring-0 px-0 h-auto text-base hover:text-info transition-colors bg-transparent"><SelectValue placeholder="Select associated project..." /></SelectTrigger>
                    <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-4 border-b border-border/40 pb-4">
                <UserRound className="size-5 text-muted-foreground shrink-0"/>
                <div className="flex-1">
                  <Select value={taskForm.assignee} onValueChange={(v) => setTaskForm((f) => ({ ...f, assignee: v }))}>
                    <SelectTrigger className="border-none shadow-none focus:ring-0 px-0 h-auto text-base hover:text-info transition-colors bg-transparent"><SelectValue placeholder="Assign to team member..."/></SelectTrigger>
                    <SelectContent>{TEAM_MEMBERS.map((m) => (<SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4 border-b border-border/40 pb-4">
                <CalendarDays className="size-5 text-muted-foreground shrink-0"/>
                <div className="flex-1 relative">
                  <label htmlFor="notepad-due" className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">Due: </label>
                  <input 
                    id="notepad-due" 
                    type="date" 
                    value={taskForm.due} 
                    onChange={(e) => setTaskForm((f) => ({ ...f, due: e.target.value }))} 
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 pl-12 text-base hover:text-info transition-colors cursor-pointer" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pb-2">
                <Clock className="size-5 text-muted-foreground shrink-0"/>
                <div className="flex-1">
                   <input 
                     type="text" 
                     placeholder="Estimated duration (e.g. 30 mins, 2 hours)..." 
                     value={taskForm.duration} 
                     onChange={(e) => setTaskForm((f) => ({ ...f, duration: e.target.value }))}
                     className="w-full bg-transparent text-base placeholder:text-muted-foreground/60 border-none focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

            </div>
          </div>
          <div className="bg-muted/30 p-4 border-t border-border/50 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setTaskOpen(false)} disabled={busy === "task"}>Cancel</Button>
            <Button onClick={createTask} disabled={busy === "task"} className="gap-2 px-6 rounded-full">{busy === "task" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{busy === "task" ? "Saving…" : "Save Note"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════ PROJECT DETAIL MODAL ══════ */}
      <Dialog open={detailProject !== null} onOpenChange={(open) => !open && setDetailProject(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          {detailProject && (
            <div className="flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]">
              <div className="bg-gradient-to-br from-muted/50 to-background p-6 border-b border-border relative">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Mono className="text-xs">{detailProject.id}</Mono>
                      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_META[detailProject.status].bg} ${STATUS_META[detailProject.status].border} ${STATUS_META[detailProject.status].color}`}>{detailProject.status.replace("_", " ")}</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold leading-tight">{detailProject.name}</DialogTitle>
                  </div>
                  {detailProject.value > 0 && (
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Project Value</p>
                        <Mono className="text-xl font-bold text-success">{money(detailProject.value)}</Mono>
                     </div>
                  )}
                </div>
              </div>
              <div className="p-6 overflow-y-auto space-y-8 flex-1">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex gap-3 items-start">
                    <div className="size-10 rounded-xl bg-elevated border border-border flex items-center justify-center shrink-0"><UserRound className="size-5 text-muted-foreground" /></div>
                    <div><p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Client</p><p className="text-sm font-semibold">{detailProject.customer}</p><p className="text-xs text-muted-foreground capitalize mt-0.5">{detailProject.customerType}</p></div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="size-10 rounded-xl bg-elevated border border-border flex items-center justify-center shrink-0"><CalendarClock className="size-5 text-muted-foreground" /></div>
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Timeline</p>
                      <p className="text-sm font-semibold">
                        {new Date(detailProject.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &rarr; {new Date(detailProject.due).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{detailProject.status !== "completed" && detailProject.due < TODAY ? <span className="text-red-400 font-medium flex items-center gap-1"><AlertCircle className="size-3" /> Overdue</span> : detailProject.due === TODAY ? <span className="text-warning font-medium">Due today</span> : "On schedule"}</p>
                    </div>
                  </div>
                </div>
                <div><p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b border-border pb-1">Project Scope & Deliverables</p><p className="text-sm leading-relaxed text-foreground/80">{detailProject.scope}</p></div>
                <div>
                  <div className="flex justify-between items-end mb-2 border-b border-border pb-1"><p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overall Progress</p><p className="mono text-xs font-bold">{detailProject.done} / {detailProject.tasks} tasks</p></div>
                  <div className="mt-3 h-2.5 rounded-full bg-muted shadow-inner overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ease-out ${detailProject.tasks > 0 && detailProject.done === detailProject.tasks ? "bg-success" : "bg-info"}`} style={{ width: `${detailProject.tasks ? (detailProject.done / detailProject.tasks) * 100 : 0}%` }} /></div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 border-b border-border pb-1">Project Tasks</p>
                  <div className="space-y-2">
                    {tasks.filter((t) => t.project === detailProject.name).map((task) => (
                      <button key={task.id} type="button" onClick={() => cycleTask(task.id)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left hover:border-info/40 hover:shadow-sm transition-all">
                        <span className={`shrink-0 size-5 rounded-full border flex items-center justify-center transition-colors ${task.status === "done" ? "bg-success border-success text-white" : "border-muted-foreground/30 text-transparent group-hover:border-info"}`}>{busy === "cycle" ? <Loader2 className="size-3 animate-spin text-info" /> : task.status === "done" && <Check className="size-3.5" />}</span>
                        <span className={`flex-1 text-sm font-medium transition-colors ${task.status === "done" ? "text-muted-foreground line-through opacity-70" : "text-foreground"}`}>{task.title}</span>
                        {task.duration && <span className="text-[10px] text-muted-foreground font-medium bg-elevated px-2 py-0.5 rounded-md border border-border">{task.duration}</span>}
                      </button>
                    ))}
                    {tasks.filter((t) => t.project === detailProject.name).length === 0 && <div className="border-2 border-dashed border-border rounded-xl p-6 text-center"><p className="text-sm font-medium text-muted-foreground">No tasks defined yet.</p></div>}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 border-b border-border pb-1">Assigned Team Members</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TEAM_MEMBERS.map((member) => (
                      <label key={member.name} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${detailProject.members.includes(member.name) ? "border-info/50 bg-info/5 shadow-sm ring-1 ring-info/20" : "border-border bg-card hover:bg-elevated"} ${busy === "member" ? "opacity-60 pointer-events-none" : ""}`}>
                        <input type="checkbox" checked={detailProject.members.includes(member.name)} onChange={() => toggleProjectMember(member.name)} disabled={busy === "member"} className="rounded border-border size-4 text-info focus:ring-info/30" />
                        {member.avatar_url ? (
                        <UserAvatar user={member} size="sm" rounded="full" className="size-8" />
                      ) : (
                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${detailProject.members.includes(member.name) ? "bg-info text-white" : "bg-elevated text-muted-foreground"}`}>{member.initials}</span>
                      )}
                        <span className="flex-1 min-w-0"><span className="block text-sm font-bold truncate">{member.name}</span><span className="text-[10px] uppercase tracking-wider text-muted-foreground block truncate">{member.role}</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════ MEMBER DETAIL SHEET ══════ */}
      <Sheet open={detailMember !== null} onOpenChange={(open) => !open && setDetailMember(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto border-l border-border/50 shadow-2xl">
          {detailMember && (() => {
            const member = TEAM_MEMBERS.find((m) => m.name === detailMember)!;
            const memberTasks = tasks.filter((t) => t.assignee === detailMember);
            const openTasks = memberTasks.filter((t) => t.status !== "done").length;
            const doneTasks = memberTasks.filter((t) => t.status === "done").length;
            const memberProjects = projects.filter((p) => p.members.includes(detailMember));
            const completionRate = memberTasks.length ? Math.round((doneTasks / memberTasks.length) * 100) : 0;

            return (
              <div className="flex flex-col min-h-full">
                {/* Rich Header */}
                <div className="bg-gradient-to-br from-card to-muted p-8 border-b border-border relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-info via-info to-info/20" />
                  <div className="absolute -right-8 -top-8 size-40 rounded-full bg-info/5 blur-2xl pointer-events-none" />
                  <div className="flex flex-col items-center text-center gap-4 relative z-10">
                    {member.avatar_url ? (
                      <UserAvatar user={member} size="xl" rounded="full" className="size-24 border-4 border-card shadow-xl ring-2 ring-info/20" />
                    ) : (
                      <div className="flex size-24 items-center justify-center rounded-full bg-background border-4 border-card text-info font-black text-3xl shadow-xl ring-2 ring-info/20">{member.initials}</div>
                    )}
                    <div>
                      <h2 className="text-2xl font-black text-foreground tracking-tight">{member.name}</h2>
                      <p className="text-xs font-bold uppercase tracking-widest text-info mt-1.5 bg-info/10 px-3 py-1 rounded-full inline-block">{member.role}</p>
                    </div>
                    {/* Contact Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                      <span className="flex items-center gap-1.5 bg-background/50 border border-border px-2.5 py-1 rounded-md text-[11px] font-semibold text-muted-foreground shadow-sm"><span className="size-2 rounded-full bg-success" /> Online</span>
                      <span className="flex items-center gap-1.5 bg-background/50 border border-border px-2.5 py-1 rounded-md text-[11px] font-semibold text-muted-foreground shadow-sm"><Mail className="size-3" />{member.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-7 bg-background">
                  {/* Skills */}
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Specialties & Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 rounded-md bg-info/10 border border-info/20 text-[10px] font-bold text-info uppercase tracking-wider">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Performance Overview</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-card border border-border rounded-xl text-center shadow-sm">
                        <FolderKanban className="size-4 text-info mx-auto mb-1.5" />
                        <Mono className="text-2xl font-black">{memberProjects.length}</Mono>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Projects</p>
                      </div>
                      <div className="p-3 bg-card border border-border rounded-xl text-center shadow-sm">
                        <ListChecks className="size-4 text-warning mx-auto mb-1.5" />
                        <Mono className="text-2xl font-black">{openTasks}</Mono>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Open</p>
                      </div>
                      <div className="p-3 bg-card border border-border rounded-xl text-center shadow-sm">
                        <CheckCircle2 className="size-4 text-success mx-auto mb-1.5" />
                        <Mono className="text-2xl font-black text-success">{completionRate}%</Mono>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Done Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      {[
                        { icon: Mail, label: "Email", value: member.email },
                        { icon: Phone, label: "Phone", value: member.phone },
                        { icon: Briefcase, label: "Department", value: member.role },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-elevated transition-colors">
                          <div className="size-8 rounded-lg bg-elevated border border-border flex items-center justify-center shrink-0"><item.icon className="size-4 text-muted-foreground" /></div>
                          <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p><p className="text-sm font-medium">{item.value}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Roster */}
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><FolderKanban className="size-4" />Project Roster</h3>
                    <div className="space-y-3">
                      {memberProjects.map(p => (
                        <div key={p.id} className="p-4 border border-border rounded-xl bg-card shadow-sm hover:border-info/30 transition-colors">
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <div>
                              <p className="text-sm font-bold leading-tight text-foreground">{p.name}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><CalendarDays className="size-3" />{p.due}</span>
                              </div>
                            </div>
                            <StatusBadge status={p.status} label={p.status.replace("_", " ")} />
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-info rounded-full" style={{ width: `${p.tasks ? (p.done / p.tasks) * 100 : 0}%` }} /></div>
                        </div>
                      ))}
                      {memberProjects.length === 0 && <div className="p-6 text-center border-2 border-dashed border-border rounded-xl"><p className="text-xs font-semibold text-muted-foreground">No assigned projects.</p></div>}
                    </div>
                  </div>

                  {/* Task Backlog */}
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><ListChecks className="size-4" />Task Backlog</h3>
                    <div className="space-y-2.5">
                      {memberTasks.filter(t => t.status !== "done").map(t => (
                        <div key={t.id} className="p-3 border border-border rounded-xl bg-card flex gap-3 items-start shadow-sm hover:border-warning/30 transition-colors">
                          <button type="button" onClick={() => cycleTask(t.id)} disabled={busy === "cycle"} className="mt-0.5 shrink-0 size-5 rounded-full border-2 border-muted-foreground/30 hover:border-success flex items-center justify-center transition-colors">{busy === "cycle" && <Loader2 className="size-3 animate-spin text-info" />}</button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-snug">{t.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-medium text-muted-foreground">{t.project}</span>
                              {t.duration && <span className="text-[9px] text-muted-foreground font-medium bg-elevated px-1.5 py-0.5 rounded-sm border border-border">{t.duration}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                      {memberTasks.filter(t => t.status !== "done").length === 0 && <div className="p-6 text-center border-2 border-dashed border-border rounded-xl"><p className="text-xs font-semibold text-muted-foreground flex flex-col items-center gap-2"><CheckCircle2 className="size-6 text-success"/> All tasks completed!</p></div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
