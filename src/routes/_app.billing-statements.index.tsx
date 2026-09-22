import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatCard } from "@/components/nexus/stat-card";
import { Button } from "@/components/ui/button";
import { BillingStatusBadge } from "@/components/billing/billing-status-badge";
import { BillingEditorDialog } from "@/components/billing/billing-editor-dialog";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { money, dateShort, daysUntil } from "@/lib/format";
import { customerTypeLabel } from "@/lib/billing";
import type { BillingStatement, BillingStatementStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/billing-statements/")({
  head: () => ({
    meta: [
      { title: "Billing Statements — DPC POS" },
      { name: "description", content: "Statement of accounts, balances and collection tracking." },
      { property: "og:title", content: "Billing Statements — DPC POS" },
      {
        property: "og:description",
        content: "Statement of accounts, balances and collection tracking.",
      },
    ],
  }),
  component: BillingIndexPage,
});

const BILLING_STATUSES: BillingStatementStatus[] = [
  "draft",
  "pending",
  "unpaid",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "voided",
];

const ACTIVE_STATUSES: BillingStatementStatus[] = [
  "draft",
  "pending",
  "unpaid",
  "partially_paid",
  "overdue",
];

function isOverdue(bs: BillingStatement): boolean {
  return bs.status === "unpaid" && bs.dueAt < new Date().toISOString().slice(0, 10);
}

function BillingIndexPage() {
  const { billingStatements, createBillingStatement } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [dueSoonOnly, setDueSoonOnly] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [freshId, setFreshId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const open = billingStatements.filter((bs) => ACTIVE_STATUSES.includes(bs.status));
    const outstanding = billingStatements.reduce(
      (s, bs) => s + (ACTIVE_STATUSES.includes(bs.status) ? bs.balance : 0),
      0,
    );
    const collected = billingStatements.reduce(
      (s, bs) => s + (bs.status === "paid" ? bs.total : bs.amountPaid),
      0,
    );
    const totalDue = billingStatements.reduce((s, bs) => s + bs.total, 0);
    const collectionRate = totalDue > 0 ? (collected / totalDue) * 100 : 0;
    const overdue = billingStatements.filter(
      (bs) => isOverdue(bs) || bs.status === "overdue",
    ).length;
    return { open: open.length, outstanding, collectionRate, overdue };
  }, [billingStatements]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return billingStatements.filter((bs) => {
      if (status !== "all" && bs.status !== status) return false;
      if (dueSoonOnly && (daysUntil(bs.dueAt) > 7 || !ACTIVE_STATUSES.includes(bs.status)))
        return false;
      if (
        term &&
        !(
          bs.id.toLowerCase().includes(term) ||
          bs.customerName.toLowerCase().includes(term) ||
          bs.referenceNumber.toLowerCase().includes(term)
        )
      )
        return false;
      return true;
    });
  }, [billingStatements, q, status, dueSoonOnly]);

  const columns: Column<BillingStatement>[] = [
    {
      key: "id",
      header: "Statement No.",
      cell: (bs) => <Mono className="text-[13px] text-foreground">{bs.id}</Mono>,
      sortValue: (bs) => bs.id,
    },
    {
      key: "issued",
      header: "Date Issued",
      cell: (bs) => dateShort(bs.issuedAt),
      sortValue: (bs) => bs.issuedAt,
    },
    {
      key: "customer",
      header: "Customer",
      cell: (bs) => bs.customerName,
      sortValue: (bs) => bs.customerName,
    },
    {
      key: "type",
      header: "Customer Type",
      cell: (bs) => (
        <span className="text-xs text-muted-foreground">{customerTypeLabel(bs.customerType)}</span>
      ),
      sortValue: (bs) => bs.customerType,
    },
    {
      key: "items",
      header: "Items",
      cell: (bs) => <span className="mono">{bs.items.reduce((n, i) => n + i.qty, 0)}</span>,
      align: "right",
      sortValue: (bs) => bs.items.reduce((n, i) => n + i.qty, 0),
    },
    {
      key: "amount",
      header: "Amount Due",
      cell: (bs) => <span className="mono tabular-nums">{money(bs.total)}</span>,
      align: "right",
      sortValue: (bs) => bs.total,
    },
    {
      key: "balance",
      header: "Balance",
      cell: (bs) => (
        <span
          className={cn(
            "mono tabular-nums",
            bs.balance > 0 ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {money(bs.balance)}
        </span>
      ),
      align: "right",
      sortValue: (bs) => bs.balance,
    },
    {
      key: "due",
      header: "Due Date",
      cell: (bs) => {
        const days = daysUntil(bs.dueAt);
        const past = days < 0;
        return (
          <span
            className={cn(
              "mono",
              past && ACTIVE_STATUSES.includes(bs.status) && "text-destructive",
            )}
          >
            {dateShort(bs.dueAt)}
            {past && ACTIVE_STATUSES.includes(bs.status) && ` (${Math.abs(days)}d)`}
          </span>
        );
      },
      sortValue: (bs) => bs.dueAt,
    },
    {
      key: "status",
      header: "Payment Status",
      cell: (bs) => <BillingStatusBadge statement={bs} />,
      sortValue: (bs) => bs.status,
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Billing Statements"
        description="Statement of accounts, balances and collection tracking."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const fresh = createBillingStatement({
                customerId: null,
                customerType: "walk-in",
                items: [],
                additionalCharges: [],
                discount: 0,
                taxSetting: "vat",
                previousBalance: 0,
                referenceNumber: "",
                salesRep: "",
                issuedAt: new Date().toISOString().slice(0, 10),
                dueAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
              });
              setFreshId(fresh.id);
              setEditorOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" /> New Billing Statement
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open statements"
          numericValue={stats.open}
          format={(n) => Math.round(n).toString()}
          accent="info"
        />
        <StatCard
          label="Total outstanding"
          numericValue={stats.outstanding}
          format={money}
          accent="neutral"
        />
        <StatCard
          label="Collection rate"
          numericValue={stats.collectionRate}
          format={(n) => `${n.toFixed(1)}%`}
          accent="success"
        />
        <StatCard
          label="Overdue"
          numericValue={stats.overdue}
          format={(n) => Math.round(n).toString()}
          accent="danger"
        />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search statement no., customer or reference…"
          />
          <FilterSelect
            value={status}
            onChange={setStatus}
            options={BILLING_STATUSES}
            label="Status"
          />
          <Button
            size="sm"
            variant={dueSoonOnly ? "default" : "outline"}
            onClick={() => setDueSoonOnly((v) => !v)}
            className="h-8 text-xs"
          >
            Due ≤ 7 days
          </Button>
          <ResultCount shown={filtered.length} total={billingStatements.length} noun="statements" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(bs) =>
            navigate({ to: "/billing-statements/$statementId", params: { statementId: bs.id } })
          }
          initialSort={{ key: "issued", dir: "desc" }}
          empty={
            <EmptyState
              title="No statements match your filters"
              description="Try adjusting search terms or clearing filters."
            />
          }
        />
      </Panel>

      {freshId && (
        <BillingEditorDialog open={editorOpen} onOpenChange={setEditorOpen} statementId={freshId} />
      )}
    </div>
  );
}
