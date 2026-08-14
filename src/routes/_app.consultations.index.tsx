import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, TechLabel } from "@/components/nexus/primitives";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { StatCard } from "@/components/nexus/stat-card";
import { StatusBadge } from "@/components/nexus/status-badge";
import { useOps } from "@/lib/ops-store";
import { money, titleCase } from "@/lib/format";
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
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { Consultation, ConsultationStatus } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/consultations/")({
  validateSearch: (search: Record<string, unknown>) => ({ openNew: search["new"] === "1" || search["new"] === true }),
  head: () => ({
    meta: [
      { title: "Consultations — DPC Nexus" },
      { name: "description", content: "Customer build consultations and requirements capture." },
      { property: "og:title", content: "Consultations — DPC Nexus" },
      { property: "og:description", content: "Customer build consultations and requirements capture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsultationsIndexPage,
});

const STATUSES: ConsultationStatus[] = ["new", "requirements", "recommended", "quoted", "won", "lost"];

function NewConsultationDialog({ openNew = false }: { openNew?: boolean }) {
  const ops = useOps();
  const store = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState(store.customers[0]?.id ?? "");
  const [primaryUse, setPrimaryUse] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (openNew) setOpen(true);
  }, [openNew]);

  const submit = () => {
    const customer = store.customerById(customerId);
    if (!primaryUse.trim() || !customer) {
      toast.error("Primary use and customer are required.");
      return;
    }
    const c = ops.createConsultation({
      customerId: customer.id,
      customerName: customer.name,
      primaryUse: primaryUse.trim(),
      budget: Number(budget) || 0,
      targetResolution: "1080p",
      workloads: [],
      preferences: [],
      existingHardware: [],
      upgradeOnly: false,
      consultant: ops.actor,
    });
    toast.success(`${c.id} created.`);
    setOpen(false);
    navigate({ to: "/consultations/$consultationId", params: { consultationId: c.id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5" /> New consultation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New consultation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="nc-customer">Customer</Label>
            <select
              id="nc-customer"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {store.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-use">Primary use</Label>
            <Input id="nc-use" value={primaryUse} onChange={(e) => setPrimaryUse(e.target.value)} placeholder="e.g. Video editing" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-budget">Budget (PHP)</Label>
            <Input id="nc-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="70000" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConsultationsIndexPage() {
  const ops = useOps();
  const navigate = useNavigate();
  const { openNew } = Route.useSearch();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const list = ops.consultations;

  const filtered = useMemo(() => {
    return list.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      const query = q.trim().toLowerCase();
      if (!query) return true;
      return (
        c.id.toLowerCase().includes(query) ||
        c.customerName.toLowerCase().includes(query) ||
        c.primaryUse.toLowerCase().includes(query)
      );
    });
  }, [list, q, status]);

  const newCount = list.filter((c) => c.status === "new").length;
  const inRequirements = list.filter((c) => c.status === "requirements" || c.status === "recommended").length;
  const quotedCount = list.filter((c) => c.status === "quoted").length;
  const closed = list.filter((c) => c.status === "won" || c.status === "lost").length;
  const winRate = closed === 0 ? 0 : Math.round((list.filter((c) => c.status === "won").length / closed) * 100);

  const columns: Column<Consultation>[] = [
    { key: "id", header: "ID", cell: (c) => <Mono className="text-foreground">{c.id}</Mono>, sortValue: (c) => c.id },
    { key: "customer", header: "Customer", cell: (c) => c.customerName, sortValue: (c) => c.customerName },
    { key: "use", header: "Primary use", cell: (c) => <span className="text-muted-foreground">{c.primaryUse}</span> },
    { key: "budget", header: "Budget", align: "right", cell: (c) => <Mono>{money(c.budget)}</Mono>, sortValue: (c) => c.budget },
    { key: "consultant", header: "Consultant", cell: (c) => c.consultant },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Consultations"
        description="Customer build consultations and requirements capture."
        actions={<NewConsultationDialog openNew={openNew} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New" numericValue={newCount} accent="info" />
        <StatCard label="In requirements" numericValue={inRequirements} accent="warning" />
        <StatCard label="Quoted" numericValue={quotedCount} accent="info" />
        <StatCard label="Win rate" value={`${winRate}%`} accent="success" hint={`${closed} closed`} />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search ID, customer, use case…" />
          <FilterSelect value={status} onChange={setStatus} options={STATUSES} label="Status" />
          <ResultCount shown={filtered.length} total={list.length} noun="consultations" />
        </Toolbar>
        {filtered.length === 0 ? (
          <EmptyState title="No consultations found" icon={Users} />
        ) : (
          <DataTable
            rows={filtered}
            columns={columns}
            pageSize={15}
            onRowClick={(c) => navigate({ to: "/consultations/$consultationId", params: { consultationId: c.id } })}
          />
        )}
      </Panel>
    </div>
  );
}
