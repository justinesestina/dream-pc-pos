import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { money, dateShort, titleCase } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — DPC Nexus" },
      { name: "description", content: "Transaction history with payment and fulfillment status." },
      { property: "og:title", content: "Orders — DPC Nexus" },
      { property: "og:description", content: "Transaction history with payment and fulfillment status." },
    ],
  }),
  component: OrdersIndexPage,
});

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "assembly",
  "testing",
  "ready",
  "completed",
  "cancelled",
  "refunded",
];

const ORDER_TYPES = ["retail", "custom_build", "service"];
const PAYMENT_METHODS = ["cash", "gcash", "bank", "card"];

function OrdersIndexPage() {
  const { orders } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [method, setMethod] = useState("all");

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
    const revenueToday = ordersToday.reduce((s, o) => s + o.total, 0);
    const pendingFulfillment = orders.filter((o) =>
      ["paid", "processing", "assembly", "testing"].includes(o.status),
    ).length;
    const unpaid = orders.filter((o) => o.status === "pending" || !o.payment).length;
    return { ordersToday: ordersToday.length, revenueToday, pendingFulfillment, unpaid };
  }, [orders]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (type !== "all" && o.type !== type) return false;
      if (method !== "all" && o.payment?.method !== method) return false;
      if (term && !(o.id.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term)))
        return false;
      return true;
    });
  }, [orders, q, status, type, method]);

  const columns: Column<Order>[] = [
    {
      key: "id",
      header: "Order ID",
      cell: (o) => <Mono className="text-[13px] text-foreground">{o.id}</Mono>,
      sortValue: (o) => o.id,
    },
    { key: "date", header: "Date", cell: (o) => dateShort(o.createdAt), sortValue: (o) => o.createdAt },
    { key: "customer", header: "Customer", cell: (o) => o.customerName, sortValue: (o) => o.customerName },
    { key: "type", header: "Type", cell: (o) => titleCase(o.type), sortValue: (o) => o.type },
    {
      key: "items",
      header: "Items",
      cell: (o) => <span className="mono">{o.items.reduce((s, i) => s + i.qty, 0)}</span>,
      align: "right",
      sortValue: (o) => o.items.reduce((s, i) => s + i.qty, 0),
    },
    {
      key: "total",
      header: "Total",
      cell: (o) => <span className="mono tabular-nums">{money(o.total)}</span>,
      align: "right",
      sortValue: (o) => o.total,
    },
    {
      key: "payment",
      header: "Payment",
      cell: (o) => (o.payment ? titleCase(o.payment.method) : "—"),
      sortValue: (o) => o.payment?.method ?? "",
    },
    {
      key: "status",
      header: "Status",
      cell: (o) => <StatusBadge status={o.status} />,
      sortValue: (o) => o.status,
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title="Orders" description="Transaction history with payment and fulfillment status." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders today" numericValue={stats.ordersToday} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Revenue today" numericValue={stats.revenueToday} format={money} accent="success" />
        <StatCard label="Pending fulfillment" numericValue={stats.pendingFulfillment} format={(n) => Math.round(n).toString()} accent="warning" />
        <StatCard label="Unpaid / pending" numericValue={stats.unpaid} format={(n) => Math.round(n).toString()} accent="danger" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search order ID or customer…" />
          <FilterSelect value={status} onChange={setStatus} options={ORDER_STATUSES} label="Status" />
          <FilterSelect value={type} onChange={setType} options={ORDER_TYPES} label="Type" />
          <FilterSelect value={method} onChange={setMethod} options={PAYMENT_METHODS} label="Payment" />
          <ResultCount shown={filtered.length} total={orders.length} noun="orders" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(o) => navigate({ to: "/orders/$orderId", params: { orderId: o.id } })}
          initialSort={{ key: "date", dir: "desc" }}
          empty={
            <EmptyState
              title="No orders match your filters"
              description="Try adjusting search terms or clearing filters."
            />
          }
        />
      </Panel>
    </div>
  );
}
