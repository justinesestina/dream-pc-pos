import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { useOps } from "@/lib/ops-store";
import { useSimulatedLoad } from "@/lib/store";
import { num, dateShort } from "@/lib/format";
import type { GoodsReceipt } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/receiving/")({
  head: () => ({
    meta: [
      { title: "Stock Receiving — DPC POS" },
      { name: "description", content: "Goods receipts against purchase orders." },
      { property: "og:title", content: "Stock Receiving — DPC POS" },
      { property: "og:description", content: "Goods receipts against purchase orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReceivingIndexPage,
});

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function ReceivingIndexPage() {
  const { receipts } = useOps();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return receipts.filter((r) => {
      if (query) {
        const hay = `${r.id} ${r.purchaseOrderId} ${r.supplierName}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (status !== "all" && r.status !== status) return false;
      return true;
    });
  }, [receipts, q, status]);

  const stats = useMemo(() => {
    let inProgress = 0;
    let completedToday = 0;
    let discrepancies = 0;
    let units = 0;
    for (const r of receipts) {
      if (r.status === "in_progress") inProgress++;
      if (r.status === "discrepancy") discrepancies++;
      if (r.status !== "in_progress" && isToday(r.receivedAt)) completedToday++;
      units += r.lines.reduce((sum, l) => sum + l.received, 0);
    }
    return { inProgress, completedToday, discrepancies, units };
  }, [receipts]);

  const columns: Column<GoodsReceipt>[] = [
    { key: "id", header: "GR ID", cell: (r) => <Mono className="text-foreground">{r.id}</Mono>, sortValue: (r) => r.id },
    {
      key: "po",
      header: "PO",
      cell: (r) => (
        <IdLink to="/purchasing/$poId" params={{ poId: r.purchaseOrderId }}>
          {r.purchaseOrderId}
        </IdLink>
      ),
    },
    { key: "supplier", header: "Supplier", cell: (r) => r.supplierName, sortValue: (r) => r.supplierName, className: "min-w-[10rem]" },
    { key: "receivedBy", header: "Received by", cell: (r) => r.receivedBy },
    { key: "date", header: "Date", cell: (r) => <span className="mono text-xs">{dateShort(r.receivedAt)}</span>, sortValue: (r) => r.receivedAt },
    { key: "lines", header: "Lines", cell: (r) => <span className="mono tabular-nums">{num(r.lines.length)}</span>, align: "right" },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, align: "right" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Stock Receiving" description="Goods receipts against purchase orders." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="In progress" numericValue={stats.inProgress} format={(n) => num(Math.round(n))} accent="info" />
        <StatCard label="Completed today" numericValue={stats.completedToday} format={(n) => num(Math.round(n))} accent="success" />
        <StatCard label="Discrepancies" numericValue={stats.discrepancies} format={(n) => num(Math.round(n))} accent="danger" />
        <StatCard label="Units received" numericValue={stats.units} format={(n) => num(Math.round(n))} accent="neutral" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search GR ID, PO or supplier…" />
          <FilterSelect value={status} onChange={setStatus} label="Status" options={["in_progress", "completed", "discrepancy"]} />
          <ResultCount shown={filtered.length} total={receipts.length} noun="receipts" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(r) => navigate({ to: "/receiving/$receiptId", params: { receiptId: r.id } })}
          empty={<EmptyState title="No goods receipts match" description="Try clearing the search or filter." />}
        />
      </Panel>
    </div>
  );
}
