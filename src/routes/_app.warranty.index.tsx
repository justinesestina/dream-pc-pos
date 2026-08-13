import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { Section } from "@/components/nexus/detail";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { dateShort, daysUntil } from "@/lib/format";
import type { Warranty, WarrantyClaim, WarrantyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/warranty/")({
  head: () => ({
    meta: [
      { title: "Warranty — DPC Nexus" },
      { name: "description", content: "Warranty registry, coverage windows and claims." },
      { property: "og:title", content: "Warranty — DPC Nexus" },
      { property: "og:description", content: "Warranty registry, coverage windows and claims." },
    ],
  }),
  component: WarrantyPage,
});

const WARRANTY_STATUSES: WarrantyStatus[] = ["active", "expiring", "expired", "void"];

function WarrantyPage() {
  const { warranties, claims } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const stats = useMemo(() => {
    const active = warranties.filter((w) => w.status === "active").length;
    const expiringSoon = warranties.filter((w) => {
      const d = daysUntil(w.expiresAt);
      return d >= 0 && d <= 30;
    }).length;
    const expired = warranties.filter((w) => w.status === "expired").length;
    const openClaims = claims.filter((c) => c.status === "open" || c.status === "in_review").length;
    return { active, expiringSoon, expired, openClaims };
  }, [warranties, claims]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return warranties.filter((w) => {
      if (status !== "all" && w.status !== status) return false;
      if (
        term &&
        !(
          (w.serial ?? "").toLowerCase().includes(term) ||
          w.productName.toLowerCase().includes(term) ||
          w.customerName.toLowerCase().includes(term)
        )
      )
        return false;
      return true;
    });
  }, [warranties, q, status]);

  const columns: Column<Warranty>[] = [
    { key: "serial", header: "Serial", cell: (w) => <Mono>{w.serial ?? "—"}</Mono>, sortValue: (w) => w.serial ?? "" },
    { key: "product", header: "Product", cell: (w) => w.productName, sortValue: (w) => w.productName },
    { key: "customer", header: "Customer", cell: (w) => w.customerName, sortValue: (w) => w.customerName },
    { key: "start", header: "Start", cell: (w) => dateShort(w.purchasedAt), sortValue: (w) => w.purchasedAt },
    {
      key: "expires",
      header: "Expires",
      cell: (w) => {
        const d = daysUntil(w.expiresAt);
        return (
          <span className={cn("mono", d < 0 ? "text-destructive" : d <= 30 ? "text-warning" : "text-muted-foreground")}>
            {dateShort(w.expiresAt)} {d >= 0 ? `(${d}d)` : "(expired)"}
          </span>
        );
      },
      sortValue: (w) => w.expiresAt,
    },
    { key: "status", header: "Status", cell: (w) => <StatusBadge status={w.status} />, sortValue: (w) => w.status },
  ];


  const claimCols: Column<WarrantyClaim>[] = [
    { key: "id", header: "Claim", cell: (c) => <IdLink to="/warranty/$warrantyId" params={{ warrantyId: c.warrantyId }}>{c.id}</IdLink> },
    { key: "warranty", header: "Warranty", cell: (c) => <Mono>{c.warrantyId}</Mono> },
    { key: "reason", header: "Reason", cell: (c) => <span className="max-w-[280px] truncate block text-muted-foreground">{c.reason}</span> },
    { key: "created", header: "Filed", cell: (c) => dateShort(c.createdAt) },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Warranty" description="Warranty registry, coverage windows and claims." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active warranties" numericValue={stats.active} format={(n) => Math.round(n).toString()} accent="success" />
        <StatCard label="Expiring in 30 days" numericValue={stats.expiringSoon} format={(n) => Math.round(n).toString()} accent="warning" />
        <StatCard label="Expired" numericValue={stats.expired} format={(n) => Math.round(n).toString()} accent="danger" />
        <StatCard label="Open claims" numericValue={stats.openClaims} format={(n) => Math.round(n).toString()} accent="info" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search serial, product, customer…" />
          <FilterSelect value={status} onChange={setStatus} options={WARRANTY_STATUSES} label="Status" />
          <ResultCount shown={filtered.length} total={warranties.length} noun="warranties" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(w) => navigate({ to: "/warranty/$warrantyId", params: { warrantyId: w.id } })}
          initialSort={{ key: "expires", dir: "asc" }}
          empty={<EmptyState title="No warranties match your filters" description="Try adjusting search terms or clearing filters." />}
        />
      </Panel>

      <Section title="Warranty claims" hint={`${claims.length} total`}>
        <DataTable
          rows={claims}
          columns={claimCols}
          pageSize={8}
          empty={<EmptyState title="No claims filed" description="No warranty claims have been recorded." />}
        />
      </Section>
    </div>
  );
}
