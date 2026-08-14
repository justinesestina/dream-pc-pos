import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { DemoNote } from "@/components/nexus/detail";
import { DocumentPreview, PrintButton, type DocKind, type DocLine } from "@/components/nexus/document";
import { useStore } from "@/lib/store";
import { useOps } from "@/lib/ops-store";
import { dateShort, money, moneyExact, titleCase, VAT_RATE } from "@/lib/format";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({
    meta: [
      { title: "Documents — DPC Nexus" },
      { name: "description", content: "Receipts, invoices, quotations and release documents." },
      { property: "og:title", content: "Documents — DPC Nexus" },
      { property: "og:description", content: "Receipts, invoices, quotations and release documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocumentsPage,
});

interface DocEntry {
  id: string;
  kind: DocKind;
  reference: string;
  issuedAt: string;
  status: string;
  party: { title: string; name: string; lines?: (string | undefined)[] };
  lines: DocLine[];
  totals: { label: string; value: number; strong?: boolean }[];
  footer: string;
  amount: number;
}

const KINDS: DocKind[] = [
  "Sales Receipt",
  "Invoice",
  "Quotation",
  "Purchase Order",
  "Service Receipt",
  "Delivery / Release",
];

function DocumentsPage() {
  const { orders, quotes, services, builds, customerById } = useStore();
  const { purchaseOrders, releases, supplierById } = useOps();

  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const entries = useMemo<DocEntry[]>(() => {
    const list: DocEntry[] = [];

    for (const o of orders) {
      const c = customerById(o.customerId);
      list.push({
        id: `doc-${o.id}`,
        kind: o.payment !== null ? "Sales Receipt" : "Invoice",
        reference: o.id,
        issuedAt: o.createdAt,
        status: o.status,
        party: { title: "Billed to", name: o.customerName, lines: [c?.address, c?.email, c?.phone] },
        lines: o.items.map((i) => ({ description: i.name, sku: i.sku, qty: i.qty, unitPrice: i.unitPrice })),
        totals: [
          { label: "Subtotal", value: o.subtotal },
          ...(o.discount ? [{ label: "Discount", value: -o.discount }] : []),
          ...(o.serviceTotal ? [{ label: "Services", value: o.serviceTotal }] : []),
          { label: `VAT (${Math.round(VAT_RATE * 100)}%)`, value: o.tax },
          ...(o.payment?.method === "cash" && o.payment.tendered
            ? [{ label: "Tendered", value: o.payment.tendered }]
            : []),
          ...(o.payment?.method === "cash" && o.payment.change
            ? [{ label: "Change", value: -o.payment.change }]
            : []),
          { label: "Total", value: o.total, strong: true },
        ],
        footer: o.payment
          ? `Paid via ${titleCase(o.payment.method)}${o.payment.reference ? ` · ref ${o.payment.reference}` : ""}${o.payment.tendered !== undefined ? ` · tendered ${moneyExact(o.payment.tendered)}` : ""}${o.payment.change ? ` · change ${moneyExact(o.payment.change)}` : ""} · cashier ${o.cashier}`
          : `Awaiting payment · prepared by ${o.cashier}`,
        amount: o.total,
      });
    }

    for (const qt of quotes) {
      const c = customerById(qt.customerId);
      list.push({
        id: `doc-${qt.id}`,
        kind: "Quotation",
        reference: qt.id,
        issuedAt: qt.createdAt,
        status: qt.status,
        party: { title: "Prepared for", name: qt.customerName, lines: [c?.address, c?.email, c?.phone] },
        lines: qt.items.map((i) => ({ description: i.name, sku: i.sku, qty: i.qty, unitPrice: i.unitPrice })),
        totals: [
          { label: "Subtotal", value: qt.subtotal },
          ...(qt.discount ? [{ label: "Discount", value: -qt.discount }] : []),
          ...(qt.serviceTotal ? [{ label: "Services", value: qt.serviceTotal }] : []),
          { label: `VAT (${Math.round(VAT_RATE * 100)}%)`, value: qt.tax },
          { label: "Total", value: qt.total, strong: true },
        ],
        footer: `Valid until ${dateShort(qt.expiresAt)} · prepared by ${qt.preparedBy}`,
        amount: qt.total,
      });
    }

    for (const po of purchaseOrders) {
      const s = supplierById(po.supplierId);
      list.push({
        id: `doc-${po.id}`,
        kind: "Purchase Order",
        reference: po.id,
        issuedAt: po.createdAt,
        status: po.status,
        party: { title: "Supplier", name: po.supplierName, lines: [s?.address, s?.email, s?.phone] },
        lines: po.lines.map((l) => ({ description: l.name, sku: l.sku, qty: l.qty, unitPrice: l.unitCost })),
        totals: [{ label: "Total cost", value: po.total, strong: true }],
        footer: `Expected ${dateShort(po.expectedAt)} · terms ${s?.terms ?? "—"} · raised by ${po.createdBy}`,
        amount: po.total,
      });
    }

    for (const t of services) {
      const c = customerById(t.customerId);
      const parts = t.parts.reduce((sum, p) => sum + p.qty * p.price, 0);
      const total = t.actualCost ?? t.estimatedCost;
      list.push({
        id: `doc-${t.id}`,
        kind: "Service Receipt",
        reference: t.id,
        issuedAt: t.createdAt,
        status: t.status,
        party: { title: "Customer", name: t.customerName, lines: [t.device, c?.email, c?.phone] },
        lines: [
          ...t.parts.map((p) => ({ description: p.name, qty: p.qty, unitPrice: p.price })),
          { description: `Labor — ${t.issue}`, qty: 1, unitPrice: t.labor },
        ],
        totals: [
          { label: "Parts", value: parts },
          { label: "Labor", value: t.labor },
          { label: t.actualCost === null ? "Estimated total" : "Total", value: total, strong: true },
        ],
        footer: `Technician ${t.technician}${t.diagnosis ? ` · ${t.diagnosis}` : ""}`,
        amount: total,
      });
    }

    for (const r of releases) {
      const order = r.kind === "order" ? orders.find((o) => o.id === r.refId) : undefined;
      const build = r.kind === "build" ? builds.find((b) => b.id === r.refId) : undefined;
      const ticket = r.kind === "service" ? services.find((s) => s.id === r.refId) : undefined;
      const buildOrder = build?.orderId ? orders.find((o) => o.id === build.orderId) : undefined;
      const buildQuote = build?.quoteId ? quotes.find((x) => x.id === build.quoteId) : undefined;
      const amount = order
        ? order.total
        : ticket
          ? (ticket.actualCost ?? ticket.estimatedCost)
          : (buildOrder?.total ?? buildQuote?.total ?? build?.budget ?? 0);
      list.push({
        id: `doc-${r.id}`,
        kind: "Delivery / Release",
        reference: r.id,
        issuedAt: r.releasedAt ?? r.scheduledAt,
        status: r.status,
        party: {
          title: "Released to",
          name: r.customerName,
          lines: [`${titleCase(r.method)} · scheduled ${dateShort(r.scheduledAt)}`],
        },
        lines: [
          {
            description: build
              ? `Custom build ${build.id} — ${build.purpose}`
              : ticket
                ? `Service ${ticket.id} — ${ticket.device}`
                : `Order ${r.refId}`,
            sku: r.refId,
            qty: 1,
            unitPrice: amount,
          },
        ],
        totals: [{ label: "Declared value", value: amount, strong: true }],
        footer: `Released by ${r.releasedBy ?? "—"} · received by ${r.receivedBy ?? "pending"}`,
        amount,
      });
    }

    return list.sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
  }, [orders, quotes, services, builds, purchaseOrders, releases, customerById, supplierById]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (kind !== "all" && e.kind !== kind) return false;
      if (!needle) return true;
      return (
        e.reference.toLowerCase().includes(needle) ||
        e.party.name.toLowerCase().includes(needle) ||
        e.kind.toLowerCase().includes(needle)
      );
    });
  }, [entries, q, kind]);

  const active = useMemo(() => filtered.find((e) => e.id === selected) ?? filtered[0], [filtered, selected]);

  const stats = useMemo(() => {
    const count = (k: DocKind) => entries.filter((e) => e.kind === k).length;
    return {
      total: entries.length,
      receipts: count("Sales Receipt") + count("Invoice"),
      quotations: count("Quotation"),
      purchase: count("Purchase Order"),
    };
  }, [entries]);

  const columns: Column<DocEntry>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (e) => (
        <span className="mono inline-flex items-center gap-2 text-[12.5px] text-foreground">
          <FileText className="size-3.5 text-subtle" />
          {e.reference}
        </span>
      ),
      sortValue: (e) => e.reference,
    },
    { key: "kind", header: "Document", cell: (e) => e.kind, sortValue: (e) => e.kind },
    { key: "party", header: "Party", cell: (e) => e.party.name, sortValue: (e) => e.party.name },
    { key: "issued", header: "Issued", cell: (e) => dateShort(e.issuedAt), sortValue: (e) => e.issuedAt },
    { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status} />, sortValue: (e) => e.status },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (e) => <span className="mono tabular-nums">{money(e.amount)}</span>,
      sortValue: (e) => e.amount,
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Documents"
        description="Receipts, invoices, quotations and release documents."
        actions={active ? <PrintButton label="Print document" /> : null}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
        <StatCard label="Documents on file" numericValue={stats.total} format={(n) => Math.round(n).toString()} accent="info" />
        <StatCard label="Receipts & invoices" numericValue={stats.receipts} format={(n) => Math.round(n).toString()} accent="success" />
        <StatCard label="Quotations" numericValue={stats.quotations} format={(n) => Math.round(n).toString()} accent="neutral" />
        <StatCard label="Purchase orders" numericValue={stats.purchase} format={(n) => Math.round(n).toString()} accent="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Panel className="min-w-0 print:hidden">
          <Toolbar>
            <SearchInput value={q} onChange={setQ} placeholder="Search reference, party or type…" />
            <FilterSelect value={kind} onChange={setKind} options={KINDS} label="Type" />
            <ResultCount shown={filtered.length} total={entries.length} noun="documents" />
          </Toolbar>
          <DataTable
            rows={filtered}
            columns={columns}
            pageSize={10}
            onRowClick={(e) => setSelected(e.id)}
            initialSort={{ key: "issued", dir: "desc" }}
            empty={<EmptyState title="No documents match your filters" description="Try a different type or search term." />}
          />
        </Panel>

        <div className="min-w-0 xl:sticky xl:top-4 xl:self-start">
          {active ? (
            <DocumentPreview
              kind={active.kind}
              reference={active.reference}
              issuedAt={active.issuedAt}
              status={titleCase(active.status)}
              party={active.party}
              lines={active.lines}
              totals={active.totals}
              footer={active.footer}
            />
          ) : (
            <Panel>
              <EmptyState title="Nothing to preview" description="Select a document from the register to preview it." />
            </Panel>
          )}
        </div>
      </div>

      <DemoNote className="print:hidden">
        Documents are rendered from local demo data and printed through the browser — no BIR-accredited receipt,
        e-invoicing or thermal printer integration is performed.
      </DemoNote>
    </div>
  );
}
