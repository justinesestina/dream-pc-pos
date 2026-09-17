import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { money, dateShort } from "@/lib/format";
import type { ServiceStatus, ServiceTicket } from "@/lib/types";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/services/")({
  validateSearch: (search: Record<string, unknown>) => ({ openNew: search["new"] === "1" || search["new"] === true }),
  head: () => ({
    meta: [
      { title: "Service Tickets — DPC POS" },
      { name: "description", content: "Repairs, diagnostics and upgrade jobs." },
      { property: "og:title", content: "Service Tickets — DPC POS" },
      { property: "og:description", content: "Repairs, diagnostics and upgrade jobs." },
    ],
  }),
  component: ServicesIndexPage,
});

const SERVICE_STATUSES: ServiceStatus[] = [
  "received",
  "diagnosing",
  "waiting_customer",
  "waiting_parts",
  "in_repair",
  "ready",
  "released",
  "cancelled",
];

function ServicesIndexPage() {
  const { services, customers, createService } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const { openNew } = Route.useSearch();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [tech, setTech] = useState("all");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (openNew) setOpen(true);
  }, [openNew]);

  const technicians = useMemo(
    () => Array.from(new Set(services.map((s) => s.technician))).sort(),
    [services],
  );

  const stats = useMemo(() => {
    const openTickets = services.filter((s) => !["released", "cancelled"].includes(s.status)).length;
    const waiting = services.filter((s) => s.status === "waiting_customer" || s.status === "waiting_parts").length;
    const weekAgo = Date.now() - 7 * 86400000;
    const completedThisWeek = services.filter(
      (s) => s.status === "released" && new Date(s.createdAt).getTime() >= weekAgo,
    ).length;
    const revenue = services.reduce((sum, s) => sum + (s.actualCost ?? 0), 0);
    return { openTickets, waiting, completedThisWeek, revenue };
  }, [services]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return services.filter((s) => {
      if (status !== "all" && s.status !== status) return false;
      if (tech !== "all" && s.technician !== tech) return false;
      if (
        term &&
        !(
          s.id.toLowerCase().includes(term) ||
          s.customerName.toLowerCase().includes(term) ||
          s.device.toLowerCase().includes(term) ||
          s.issue.toLowerCase().includes(term)
        )
      )
        return false;
      return true;
    });
  }, [services, q, status, tech]);

  const [form, setForm] = useState({
    customerId: "",
    device: "",
    issue: "",
    estimatedCost: "",
    labor: "",
  });

  const columns: Column<ServiceTicket>[] = [
    { key: "id", header: "Ticket ID", cell: (s) => <Mono className="text-[13px] text-foreground">{s.id}</Mono>, sortValue: (s) => s.id },
    { key: "customer", header: "Customer", cell: (s) => s.customerName, sortValue: (s) => s.customerName },
    { key: "device", header: "Device", cell: (s) => s.device, sortValue: (s) => s.device },
    {
      key: "issue",
      header: "Issue",
      cell: (s) => <span className="block max-w-[220px] truncate text-muted-foreground">{s.issue}</span>,
      sortValue: (s) => s.issue,
    },
    { key: "tech", header: "Technician", cell: (s) => s.technician, sortValue: (s) => s.technician },
    { key: "received", header: "Received", cell: (s) => dateShort(s.createdAt), sortValue: (s) => s.createdAt },
    {
      key: "cost",
      header: "Est. cost",
      align: "right",
      cell: (s) => <span className="mono tabular-nums">{money(s.estimatedCost)}</span>,
      sortValue: (s) => s.estimatedCost,
    },
    { key: "status", header: "Status", cell: (s) => <StatusBadge status={s.status} {...(s.status === "received" ? { tone: "neutral" as const } : {})} />, sortValue: (s) => s.status },
  ];

  const submit = () => {
    if (!form.customerId || !form.device.trim() || !form.issue.trim()) {
      toast.error("Customer, device and issue are required.");
      return;
    }
    const ticket = createService({
      customerId: form.customerId,
      device: form.device.trim(),
      issue: form.issue.trim(),
      estimatedCost: Number(form.estimatedCost) || 0,
      labor: Number(form.labor) || 0,
    });
    toast.success(`Ticket ${ticket.id} created.`);
    setOpen(false);
    setForm({ customerId: "", device: "", issue: "", estimatedCost: "", labor: "" });
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Service Tickets"
        description="Repairs, diagnostics and upgrade jobs."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-3.5" /> New ticket
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open tickets" numericValue={stats.openTickets} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Waiting on customer/parts" numericValue={stats.waiting} format={(n) => Math.round(n).toString()} accent="warning" />
        <StatCard label="Completed this week" numericValue={stats.completedThisWeek} format={(n) => Math.round(n).toString()} accent="success" />
        <StatCard label="Service revenue" numericValue={stats.revenue} format={money} accent="success" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search ticket, customer, device…" />
          <FilterSelect value={status} onChange={setStatus} options={SERVICE_STATUSES} label="Status" />
          <FilterSelect value={tech} onChange={setTech} options={technicians} label="Technician" />
          <ResultCount shown={filtered.length} total={services.length} noun="tickets" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(s) => navigate({ to: "/services/$ticketId", params: { ticketId: s.id } })}
          initialSort={{ key: "received", dir: "desc" }}
          empty={<EmptyState title="No tickets match your filters" description="Try adjusting search terms or clearing filters." />}
        />
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New service ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="s-customer">Customer</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                <SelectTrigger id="s-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="s-device">Device</Label>
              <Input id="s-device" value={form.device} onChange={(e) => setForm((f) => ({ ...f, device: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="s-issue">Issue</Label>
              <Textarea id="s-issue" value={form.issue} onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="s-est">Estimated cost (₱)</Label>
                <Input id="s-est" type="number" value={form.estimatedCost} onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="s-labor">Labor (₱)</Label>
                <Input id="s-labor" type="number" value={form.labor} onChange={(e) => setForm((f) => ({ ...f, labor: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Create ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
