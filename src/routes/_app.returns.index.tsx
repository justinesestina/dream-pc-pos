import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { NewReturnDialog } from "@/components/returns/new-return-dialog";
import { useOps } from "@/lib/ops-store";
import { useSimulatedLoad } from "@/lib/store";
import { money, num, titleCase } from "@/lib/format";
import type { ReturnRequest } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/returns/")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds — DPC Nexus" },
      { name: "description", content: "Return requests, inspection outcomes and refunds." },
      { property: "og:title", content: "Returns & Refunds — DPC Nexus" },
      { property: "og:description", content: "Return requests, inspection outcomes and refunds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReturnsIndexPage,
});

function ReturnsIndexPage() {
  const { returns } = useOps();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [resolution, setResolution] = useState("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return returns.filter((r) => {
      if (query) {
        const hay = `${r.id} ${r.orderId} ${r.customerName} ${r.productName}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (status !== "all" && r.status !== status) return false;
      if (resolution !== "all" && r.resolution !== resolution) return false;
      return true;
    });
  }, [returns, q, status, resolution]);

  const stats = useMemo(() => {
    let open = 0;
    let awaitingInspection = 0;
    let refundedValue = 0;
    let restocked = 0;
    for (const r of returns) {
      if (!["refunded", "replaced", "rejected"].includes(r.status)) open++;
      if (r.status === "requested" || r.status === "inspection") awaitingInspection++;
      if (r.status === "refunded") refundedValue += r.refundAmount;
      if (r.restock) restocked += r.qty;
    }
    return { open, awaitingInspection, refundedValue, restocked };
  }, [returns]);

  const columns: Column<ReturnRequest>[] = [
    { key: "id", header: "RMA ID", cell: (r) => <Mono className="text-foreground">{r.id}</Mono>, sortValue: (r) => r.id },
    {
      key: "order",
      header: "Order",
      cell: (r) => (
        <IdLink to="/sales/$orderId" params={{ orderId: r.orderId }}>
          {r.orderId}
        </IdLink>
      ),
    },
    { key: "customer", header: "Customer", cell: (r) => r.customerName, sortValue: (r) => r.customerName },
    { key: "product", header: "Product", cell: (r) => r.productName, className: "min-w-[10rem]" },
    { key: "qty", header: "Qty", cell: (r) => <span className="mono tabular-nums">{num(r.qty)}</span>, align: "right" },
    { key: "reason", header: "Reason", cell: (r) => <span className="truncate text-xs text-muted-foreground">{r.reason}</span>, className: "max-w-[12rem]" },
    { key: "resolution", header: "Resolution", cell: (r) => <span className="text-xs">{titleCase(r.resolution)}</span> },
    { key: "refund", header: "Refund amount", cell: (r) => <span className="mono tabular-nums">{r.refundAmount ? money(r.refundAmount) : "—"}</span>, sortValue: (r) => r.refundAmount, align: "right" },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, align: "right" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Returns & Refunds"
        description="Return requests, inspection outcomes and refunds."
        actions={<NewReturnDialog />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open RMAs" numericValue={stats.open} format={(n) => num(Math.round(n))} accent="info" />
        <StatCard label="Awaiting inspection" numericValue={stats.awaitingInspection} format={(n) => num(Math.round(n))} accent="warning" />
        <StatCard label="Refunded value" numericValue={stats.refundedValue} format={(n) => money(Math.round(n))} accent="danger" />
        <StatCard label="Restocked units" numericValue={stats.restocked} format={(n) => num(Math.round(n))} accent="success" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search RMA, order or customer…" />
          <FilterSelect
            value={status}
            onChange={setStatus}
            label="Status"
            options={["requested", "inspection", "approved", "rejected", "refunded", "replaced"]}
          />
          <FilterSelect value={resolution} onChange={setResolution} label="Resolution" options={["refund", "replacement", "repair", "none"]} />
          <ResultCount shown={filtered.length} total={returns.length} noun="returns" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(r) => navigate({ to: "/returns/$returnId", params: { returnId: r.id } })}
          empty={<EmptyState title="No returns match" description="Try clearing the search or filters." />}
        />
      </Panel>
    </div>
  );
}
