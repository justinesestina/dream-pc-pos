import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Hammer, LayoutGrid, List, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, Mono, TechLabel } from "@/components/nexus/primitives";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Toolbar, SearchInput, Segmented, ResultCount } from "@/components/nexus/toolbar";
import { StatCard } from "@/components/nexus/stat-card";
import { StatusBadge } from "@/components/nexus/status-badge";
import { ProgressBar } from "@/components/nexus/detail";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { useOps, stageProgress } from "@/lib/ops-store";
import { money, dateShort, titleCase } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Build, BuildStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/builds/")({
  head: () => ({
    meta: [
      { title: "Custom Builds — DPC Nexus" },
      { name: "description", content: "Build pipeline from consultation through QA to release." },
      { property: "og:title", content: "Custom Builds — DPC Nexus" },
      { property: "og:description", content: "Build pipeline from consultation through QA to release." },
    ],
  }),
  component: BuildsIndexPage,
});

const STAGE_GROUPS: { status: BuildStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "consultation", label: "Consultation" },
  { status: "quoted", label: "Quoted" },
  { status: "approved", label: "Approved" },
  { status: "parts_reserved", label: "Parts Reserved" },
  { status: "assembly", label: "Assembly" },
  { status: "testing", label: "Testing / QA" },
  { status: "ready", label: "Ready" },
  { status: "released", label: "Released" },
];

function NewBuildDialog() {
  const store = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string>("none");
  const [purpose, setPurpose] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!purpose.trim()) {
      toast.error("Purpose is required.");
      return;
    }
    const trimmedNotes = notes.trim();
    const build = store.createBuild({
      customerId: customerId === "none" ? null : customerId,
      purpose: purpose.trim(),
      budget: Number(budget) || 0,
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    });
    toast.success(`${build.id} created.`);
    setOpen(false);
    setPurpose("");
    setBudget("");
    setNotes("");
    setCustomerId("none");
    navigate({ to: "/builds/$buildId", params: { buildId: build.id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5" /> New build
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New custom build</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="nb-customer">Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger id="nb-customer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Walk-in customer</SelectItem>
                {store.customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nb-purpose">Purpose</Label>
            <Input id="nb-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. 1440p gaming rig" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nb-budget">Budget (PHP)</Label>
            <Input id="nb-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="80000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nb-notes">Notes</Label>
            <Textarea id="nb-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create build</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BuildCard({ build }: { build: Build }) {
  const ops = useOps();
  const o = ops.opsForBuild(build.id);
  const pct = stageProgress(o.stage);
  return (
    <Link
      to="/builds/$buildId"
      params={{ buildId: build.id }}
      className="block rounded-md border border-border bg-elevated/60 p-3 transition-colors hover:border-border-strong hover:bg-elevated"
    >
      <div className="flex items-start justify-between gap-2">
        <Mono className="text-foreground">{build.id}</Mono>
        <StatusBadge status={build.status} />
      </div>
      <p className="mt-1.5 truncate text-[13px] text-foreground">{build.customerName}</p>
      <p className="truncate text-xs text-muted-foreground">{build.purpose}</p>
      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="text-subtle">{build.technician}</span>
        <span className="mono text-foreground">{money(build.budget)}</span>
      </div>
      <ProgressBar value={pct} className="mt-2" />
    </Link>
  );
}

function BuildsIndexPage() {
  const store = useStore();
  const ops = useOps();
  const loading = useSimulatedLoad();
  const [view, setView] = useState<"board" | "table">("board");
  const [q, setQ] = useState("");

  const builds = store.builds;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return builds;
    return builds.filter(
      (b) =>
        b.id.toLowerCase().includes(query) ||
        b.customerName.toLowerCase().includes(query) ||
        b.purpose.toLowerCase().includes(query),
    );
  }, [builds, q]);

  const active = builds.filter((b) => b.status !== "released" && b.status !== "cancelled").length;
  const inAssembly = builds.filter((b) => b.status === "assembly").length;
  const awaitingQa = builds.filter((b) => b.status === "testing").length;
  const readyForRelease = builds.filter((b) => b.status === "ready").length;

  const columns: Column<Build>[] = [
    { key: "id", header: "Build ID", cell: (b) => <Mono className="text-foreground">{b.id}</Mono>, sortValue: (b) => b.id },
    { key: "customer", header: "Customer", cell: (b) => b.customerName, sortValue: (b) => b.customerName },
    { key: "purpose", header: "Purpose", cell: (b) => <span className="text-muted-foreground">{b.purpose}</span> },
    { key: "budget", header: "Budget", align: "right", cell: (b) => <Mono>{money(b.budget)}</Mono>, sortValue: (b) => b.budget },
    { key: "status", header: "Stage", cell: (b) => <StatusBadge status={b.status} /> },
    { key: "technician", header: "Technician", cell: (b) => b.technician },
    {
      key: "progress",
      header: "Progress",
      cell: (b) => <ProgressBar value={stageProgress(ops.opsForBuild(b.id).stage)} className="w-24" />,
    },
    { key: "created", header: "Created", cell: (b) => <Mono>{dateShort(b.createdAt)}</Mono>, sortValue: (b) => b.createdAt },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Custom Builds"
        description="Build pipeline from consultation through QA to release."
        actions={<NewBuildDialog />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active builds" numericValue={active} accent="info" hint="Not released or cancelled" />
        <StatCard label="In assembly" numericValue={inAssembly} accent="warning" hint="Currently on the bench" />
        <StatCard label="Awaiting QA" numericValue={awaitingQa} accent="warning" hint="In testing stage" />
        <StatCard label="Ready for release" numericValue={readyForRelease} accent="success" hint="Awaiting pickup" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search build ID, customer, purpose…" />
          <ResultCount shown={filtered.length} total={builds.length} noun="builds" />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "board", label: <LayoutGrid className="size-3.5" /> },
              { value: "table", label: <List className="size-3.5" /> },
            ]}
          />
        </Toolbar>

        {loading ? (
          <div className="p-4">
            <EmptyState title="Loading builds…" icon={Hammer} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No builds found" description="Try a different search or create a new build." icon={Hammer} />
        ) : view === "table" ? (
          <DataTable rows={filtered} columns={columns} pageSize={15} />
        ) : (
          <div className="flex gap-3 overflow-x-auto p-3">
            {STAGE_GROUPS.map((g) => {
              const items = filtered.filter((b) => b.status === g.status);
              if (items.length === 0) return null;
              return (
                <div key={g.status} className="w-64 shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <TechLabel>{g.label}</TechLabel>
                    <Mono className="text-subtle">{items.length}</Mono>
                  </div>
                  <div className="space-y-2">
                    {items.map((b) => (
                      <BuildCard key={b.id} build={b} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
