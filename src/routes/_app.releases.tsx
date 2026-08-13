import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink } from "@/components/nexus/primitives";
import { Toolbar, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { DemoNote } from "@/components/nexus/detail";
import { Button } from "@/components/ui/button";
import { useOps } from "@/lib/ops-store";
import { dateShort, titleCase } from "@/lib/format";
import type { ReleaseRecord } from "@/lib/ops-types";

export const Route = createFileRoute("/_app/releases")({
  head: () => ({
    meta: [
      { title: "Delivery & Release — DPC Nexus" },
      { name: "description", content: "Pickup and delivery handover for builds and services." },
      { property: "og:title", content: "Delivery & Release — DPC Nexus" },
      { property: "og:description", content: "Pickup and delivery handover for builds and services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReleasesPage,
});

const STATUSES = ["scheduled", "released", "completed"];
const REF_ROUTE: Record<ReleaseRecord["kind"], string> = {
  build: "/builds/$buildId",
  service: "/services/$ticketId",
  order: "/orders/$orderId",
};
const REF_PARAM: Record<ReleaseRecord["kind"], string> = {
  build: "buildId",
  service: "ticketId",
  order: "orderId",
};

function ReleasesPage() {
  const { releases, actor, completeRelease } = useOps();
  const [status, setStatus] = useState("all");

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const scheduledToday = releases.filter((r) => new Date(r.scheduledAt).toDateString() === today).length;
    const pickups = releases.filter((r) => r.method === "pickup" && r.status !== "completed").length;
    const deliveries = releases.filter((r) => r.method === "delivery" && r.status !== "completed").length;
    const completed = releases.filter((r) => r.status === "completed").length;
    return { scheduledToday, pickups, deliveries, completed };
  }, [releases]);

  const filtered = useMemo(
    () => (status === "all" ? releases : releases.filter((r) => r.status === status)),
    [releases, status],
  );

  const columns: Column<ReleaseRecord>[] = [
    {
      key: "ref",
      header: "Reference",
      cell: (r) => (
        <IdLink to={REF_ROUTE[r.kind]} params={{ [REF_PARAM[r.kind]]: r.refId }}>
          {r.refId}
        </IdLink>
      ),
      sortValue: (r) => r.refId,
    },
    { key: "kind", header: "Kind", cell: (r) => titleCase(r.kind), sortValue: (r) => r.kind },
    { key: "customer", header: "Customer", cell: (r) => r.customerName, sortValue: (r) => r.customerName },
    { key: "method", header: "Method", cell: (r) => titleCase(r.method), sortValue: (r) => r.method },
    { key: "scheduled", header: "Scheduled", cell: (r) => dateShort(r.scheduledAt), sortValue: (r) => r.scheduledAt },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) =>
        r.status !== "completed" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              completeRelease(r.id, r.customerName, actor);
              toast.success(`${r.id} marked completed.`);
            }}
          >
            Mark completed
          </Button>
        ) : (
          <span className="mono text-[11px] text-subtle">{r.releasedAt ? dateShort(r.releasedAt) : "—"}</span>
        ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Delivery & Release" description="Pickup and delivery handover for builds and services." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Scheduled today" numericValue={stats.scheduledToday} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Pickups pending" numericValue={stats.pickups} format={(n) => Math.round(n).toString()} accent="warning" />
        <StatCard label="Deliveries pending" numericValue={stats.deliveries} format={(n) => Math.round(n).toString()} accent="warning" />
        <StatCard label="Completed" numericValue={stats.completed} format={(n) => Math.round(n).toString()} accent="success" />
      </div>

      <Panel>
        <Toolbar>
          <FilterSelect value={status} onChange={setStatus} options={STATUSES} label="Status" />
          <ResultCount shown={filtered.length} total={releases.length} noun="releases" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          initialSort={{ key: "scheduled", dir: "desc" }}
          empty={<EmptyState title="No releases match your filters" description="Try adjusting the status filter." />}
        />
      </Panel>

      <DemoNote>Marking a release as completed updates local demo state only — no courier dispatch or SMS/email notifications occur.</DemoNote>
    </div>
  );
}
