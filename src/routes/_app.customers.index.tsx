import { useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { money, dateShort, titleCase } from "@/lib/format";
import type { Customer } from "@/lib/types";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/customers/")({
  head: () => ({
    meta: [
      { title: "Customers — DPC Nexus" },
      { name: "description", content: "Customer directory with purchase and service history." },
      { property: "og:title", content: "Customers — DPC Nexus" },
      { property: "og:description", content: "Customer directory with purchase and service history." },
    ],
  }),
  component: CustomersIndexPage,
});

const TYPES = ["individual", "business"];
const STATUSES = ["active", "inactive"];

function CustomersIndexPage() {
  const { customers, orders, createCustomer } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "individual" as Customer["type"],
    address: "",
    notes: "",
  });

  const orderStatsByCustomer = useMemo(() => {
    const map = new Map<string, { count: number; spend: number }>();
    for (const o of orders) {
      if (!o.customerId) continue;
      const cur = map.get(o.customerId) ?? { count: 0, spend: 0 };
      cur.count += 1;
      cur.spend += o.total;
      map.set(o.customerId, cur);
    }
    return map;
  }, [orders]);

  const stats = useMemo(() => {
    const business = customers.filter((c) => c.type === "business").length;
    const individual = customers.length - business;
    const now = new Date();
    const newThisMonth = customers.filter((c) => {
      const d = new Date(c.since);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const active = customers.filter((c) => c.status === "active").length;
    return { total: customers.length, business, individual, newThisMonth, active };
  }, [customers]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return customers.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (status !== "all" && c.status !== status) return false;
      if (
        term &&
        !(
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term)
        )
      )
        return false;
      return true;
    });
  }, [customers, q, type, status]);

  const columns: Column<Customer>[] = [
    { key: "name", header: "Name", cell: (c) => <span className="text-foreground">{c.name}</span>, sortValue: (c) => c.name },
    { key: "type", header: "Type", cell: (c) => titleCase(c.type), sortValue: (c) => c.type },
    { key: "email", header: "Email", cell: (c) => <Mono>{c.email}</Mono>, sortValue: (c) => c.email },
    { key: "phone", header: "Phone", cell: (c) => <Mono>{c.phone}</Mono>, sortValue: (c) => c.phone },
    { key: "since", header: "Customer since", cell: (c) => dateShort(c.since), sortValue: (c) => c.since },
    {
      key: "orders",
      header: "Orders / lifetime spend",
      align: "right",
      cell: (c) => {
        const s = orderStatsByCustomer.get(c.id);
        return (
          <span className="mono tabular-nums">
            {s?.count ?? 0} · {money(s?.spend ?? 0)}
          </span>
        );
      },
      sortValue: (c) => orderStatsByCustomer.get(c.id)?.spend ?? 0,
    },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status },
  ];

  const submit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    const c = createCustomer({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      type: form.type,
      address: form.address.trim(),
      notes: form.notes.trim() || undefined,
    });
    toast.success(`Customer ${c.name} created.`);
    setOpen(false);
    setForm({ name: "", email: "", phone: "", type: "individual", address: "", notes: "" });
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Customers"
        description="Customer directory with purchase and service history."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-3.5" /> New customer
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total customers" numericValue={stats.total} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Business / individual" value={`${stats.business} / ${stats.individual}`} accent="neutral" />
        <StatCard label="New this month" numericValue={stats.newThisMonth} format={(n) => Math.round(n).toString()} accent="success" />
        <StatCard label="Active" numericValue={stats.active} format={(n) => Math.round(n).toString()} accent="success" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search name, email, phone…" />
          <FilterSelect value={type} onChange={setType} options={TYPES} label="Type" />
          <FilterSelect value={status} onChange={setStatus} options={STATUSES} label="Status" />
          <ResultCount shown={filtered.length} total={customers.length} noun="customers" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(c) => navigate({ to: "/customers/$customerId", params: { customerId: c.id } })}
          initialSort={{ key: "since", dir: "desc" }}
          empty={<EmptyState title="No customers match your filters" description="Try adjusting search terms or clearing filters." />}
        />
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="c-phone">Phone</Label>
                <Input id="c-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as Customer["type"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="c-address">Address</Label>
              <Input id="c-address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="c-notes">Notes</Label>
              <Textarea id="c-notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Create customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
