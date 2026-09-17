import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { Button } from "@/components/ui/button";
import { QuoteEditorDialog } from "@/components/quotes/quote-editor-dialog";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { money, dateShort, daysUntil } from "@/lib/format";
import type { Quote, QuoteStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/quotes/")({
  head: () => ({
    meta: [
      { title: "Quotes — DPC Nexus" },
      { name: "description", content: "Quotations, validity windows and conversion to orders." },
      { property: "og:title", content: "Quotes — DPC Nexus" },
      { property: "og:description", content: "Quotations, validity windows and conversion to orders." },
    ],
  }),
  component: QuotesIndexPage,
});

const QUOTE_STATUSES: QuoteStatus[] = [
  "draft",
  "sent",
  "pending",
  "approved",
  "rejected",
  "expired",
  "converted",
];

function QuotesIndexPage() {
  const { quotes, createQuote } = useStore();
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [editorId, setEditorId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const editorQuote = quotes.find((qt) => qt.id === editorId);

  const stats = useMemo(() => {
    const open = quotes.filter((q) => ["draft", "sent", "pending"].includes(q.status));
    const totalQuoted = open.reduce((s, q) => s + q.total, 0);
    const decided = quotes.filter((q) => q.status === "approved" || q.status === "rejected" || q.status === "converted");
    const converted = quotes.filter((q) => q.status === "approved" || q.status === "converted");
    const conversionRate = decided.length ? (converted.length / decided.length) * 100 : 0;
    const expiringSoon = quotes.filter(
      (q) => ["sent", "pending"].includes(q.status) && daysUntil(q.expiresAt) <= 7 && daysUntil(q.expiresAt) >= 0,
    ).length;
    return { open: open.length, totalQuoted, conversionRate, expiringSoon };
  }, [quotes]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return quotes.filter((quote) => {
      if (status !== "all" && quote.status !== status) return false;
      if (expiringOnly && daysUntil(quote.expiresAt) > 7) return false;
      if (term && !(quote.id.toLowerCase().includes(term) || quote.customerName.toLowerCase().includes(term)))
        return false;
      return true;
    });
  }, [quotes, q, status, expiringOnly]);

  const columns: Column<Quote>[] = [
    {
      key: "id",
      header: "Quote ID",
      cell: (qt) => <Mono className="text-[13px] text-foreground">{qt.id}</Mono>,
      sortValue: (qt) => qt.id,
    },
    { key: "date", header: "Date", cell: (qt) => dateShort(qt.createdAt), sortValue: (qt) => qt.createdAt },
    { key: "customer", header: "Customer", cell: (qt) => qt.customerName, sortValue: (qt) => qt.customerName },
    {
      key: "items",
      header: "Items",
      cell: (qt) => <span className="mono">{qt.items.reduce((s, i) => s + i.qty, 0)}</span>,
      align: "right",
      sortValue: (qt) => qt.items.reduce((s, i) => s + i.qty, 0),
    },
    {
      key: "total",
      header: "Total",
      cell: (qt) => <span className="mono tabular-nums">{money(qt.total)}</span>,
      align: "right",
      sortValue: (qt) => qt.total,
    },
    {
      key: "expires",
      header: "Valid until",
      cell: (qt) => {
        const days = daysUntil(qt.expiresAt);
        const near = ["sent", "pending"].includes(qt.status) && days <= 7;
        return (
          <span className={cn("mono", near && (days < 0 ? "text-destructive" : "text-warning"))}>
            {dateShort(qt.expiresAt)}
            {near && ` (${days < 0 ? "expired" : `${days}d left`})`}
          </span>
        );
      },
      sortValue: (qt) => qt.expiresAt,
    },
    {
      key: "status",
      header: "Status",
      cell: (qt) => <StatusBadge status={qt.status} />,
      sortValue: (qt) => qt.status,
    },
    {
      key: "edit",
      header: "",
      align: "right",
      cell: (qt) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setEditorId(qt.id);
            setEditorOpen(true);
          }}
        >
          <Pencil className="size-3" /> Editor
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader 
        title="Quotes" 
        description="Quotations, validity windows and conversion to orders."
        actions={
          <Button size="sm" onClick={() => {
            setIsCreatingNew(true);
            const newQuote = createQuote({
              customerId: null,
              items: [],
              discount: 0,
              serviceTotal: 0,
              shippingFee: 0,
              expiresInDays: 14,
            });
            setEditorId(newQuote.id);
            setEditorOpen(true);
          }}>
            <Plus className="size-4 mr-2" /> New Quote
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open quotes" numericValue={stats.open} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Total quoted value" numericValue={stats.totalQuoted} format={money} accent="neutral" />
        <StatCard label="Approval conversion" numericValue={stats.conversionRate} format={(n) => `${n.toFixed(0)}%`} accent="success" />
        <StatCard label="Expiring within 7d" numericValue={stats.expiringSoon} format={(n) => Math.round(n).toString()} accent="warning" />
      </div>

      <Panel>
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search quote ID or customer…" />
          <FilterSelect value={status} onChange={setStatus} options={QUOTE_STATUSES} label="Status" />
          <Button
            size="sm"
            variant={expiringOnly ? "default" : "outline"}
            onClick={() => setExpiringOnly((v) => !v)}
            className="h-8 text-xs"
          >
            Expiring ≤ 7 days
          </Button>
          <ResultCount shown={filtered.length} total={quotes.length} noun="quotes" />
        </Toolbar>
        <DataTable
          rows={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(qt) => navigate({ to: "/quotes/$quoteId", params: { quoteId: qt.id } })}
          initialSort={{ key: "date", dir: "desc" }}
          empty={
            <EmptyState
              title="No quotes match your filters"
              description="Try adjusting search terms or clearing filters."
            />
          }
        />
      </Panel>

      {editorQuote && (
        <QuoteEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          quote={editorQuote}
        />
      )}
    </div>
  );
}
