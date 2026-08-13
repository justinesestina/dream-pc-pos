import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, Mono, IdLink } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, DemoNote } from "@/components/nexus/detail";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { StatCard } from "@/components/nexus/stat-card";
import { Timeline } from "@/components/nexus/timeline";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { dateShort, dateTime, num, titleCase } from "@/lib/format";
import type { SerialNumber, TimelineEvent } from "@/lib/types";

export const Route = createFileRoute("/_app/serials")({
  head: () => ({
    meta: [
      { title: "Serial Numbers — DPC Nexus" },
      { name: "description", content: "Unit-level traceability from receiving through sale, build and warranty." },
      { property: "og:title", content: "Serial Numbers — DPC Nexus" },
      {
        property: "og:description",
        content: "Unit-level traceability from receiving through sale, build and warranty.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SerialsPage,
});

const STATUSES = ["in_stock", "reserved", "installed", "sold", "rma"];

function SerialsPage() {
  const { serials, productById, customerById, orders, builds, warranties, movements } = useStore();
  const loading = useSimulatedLoad();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of serials) {
      const p = productById(s.productId);
      if (p) set.add(p.category);
    }
    return [...set].sort();
  }, [serials, productById]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return serials.filter((s) => {
      const p = productById(s.productId);
      if (status !== "all" && s.status !== status) return false;
      if (category !== "all" && p?.category !== category) return false;
      if (query) {
        const hay = `${s.serial} ${p?.name ?? ""} ${p?.sku ?? ""} ${s.orderId ?? ""} ${s.buildId ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [serials, productById, q, status, category]);

  const stats = useMemo(() => {
    const by = (st: string) => serials.filter((s) => s.status === st).length;
    return { inStock: by("in_stock"), reserved: by("reserved"), sold: by("sold") + by("installed"), rma: by("rma") };
  }, [serials]);

  const selected = useMemo(
    () => filtered.find((s) => s.id === selectedId) ?? filtered[0],
    [filtered, selectedId],
  );

  const columns: Column<SerialNumber>[] = [
    {
      key: "serial",
      header: "Serial",
      cell: (s) => <Mono className="text-foreground">{s.serial}</Mono>,
      sortValue: (s) => s.serial,
    },
    {
      key: "product",
      header: "Product",
      cell: (s) => productById(s.productId)?.name ?? s.productId,
      sortValue: (s) => productById(s.productId)?.name ?? "",
      className: "min-w-[12rem]",
    },
    {
      key: "category",
      header: "Category",
      cell: (s) => <span className="text-xs text-muted-foreground">{productById(s.productId)?.category ?? "—"}</span>,
      sortValue: (s) => productById(s.productId)?.category ?? "",
    },
    {
      key: "ref",
      header: "Reference",
      cell: (s) =>
        s.buildId ? (
          <IdLink to="/builds/$buildId" params={{ buildId: s.buildId }}>
            {s.buildId}
          </IdLink>
        ) : s.orderId ? (
          <IdLink to="/orders/$orderId" params={{ orderId: s.orderId }}>
            {s.orderId}
          </IdLink>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => <StatusBadge status={s.status} />,
      sortValue: (s) => s.status,
      align: "right",
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Serial Numbers"
        description="Unit-level traceability from receiving through sale, build and warranty."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="In stock" numericValue={stats.inStock} format={(n) => num(Math.round(n))} accent="success" />
        <StatCard label="Reserved" numericValue={stats.reserved} format={(n) => num(Math.round(n))} accent="warning" />
        <StatCard label="Sold / installed" numericValue={stats.sold} format={(n) => num(Math.round(n))} accent="info" />
        <StatCard label="In RMA" numericValue={stats.rma} format={(n) => num(Math.round(n))} accent="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <Toolbar>
            <SearchInput value={q} onChange={setQ} placeholder="Search serial, product, order…" />
            <FilterSelect value={status} onChange={setStatus} label="Status" options={STATUSES} />
            <FilterSelect value={category} onChange={setCategory} label="Category" options={categories} />
            <ResultCount shown={filtered.length} total={serials.length} noun="units" />
          </Toolbar>
          <DataTable
            rows={filtered}
            columns={columns}
            loading={loading}
            pageSize={12}
            onRowClick={(s) => setSelectedId(s.id)}
            initialSort={{ key: "serial", dir: "asc" }}
            empty={<EmptyState title="No serialised units match" description="Try clearing the search or filters." />}
          />
        </Panel>

        {selected ? (
          <SerialDetail
            unit={selected}
            product={productById(selected.productId)}
            order={orders.find((o) => o.id === selected.orderId)}
            build={builds.find((b) => b.id === selected.buildId)}
            warranty={warranties.find((w) => w.serial === selected.serial)}
            customerName={
              customerById(selected.customerId ?? null)?.name ??
              orders.find((o) => o.id === selected.orderId)?.customerName ??
              null
            }
            movements={movements.filter((m) => m.productId === selected.productId).slice(0, 6)}
          />
        ) : (
          <Panel className="grid place-items-center p-8">
            <EmptyState title="No unit selected" description="Select a serial from the register to trace its history." />
          </Panel>
        )}
      </div>

      <DemoNote>
        Serial history is reconstructed from local demo data. Real deployments should log every scan event (receive,
        reserve, install, sell, RMA) as an immutable movement record.
      </DemoNote>
    </div>
  );
}

function SerialDetail({
  unit,
  product,
  order,
  build,
  warranty,
  customerName,
  movements,
}: {
  unit: SerialNumber;
  product: ReturnType<ReturnType<typeof useStore>["productById"]>;
  order: ReturnType<typeof useStore>["orders"][number] | undefined;
  build: ReturnType<typeof useStore>["builds"][number] | undefined;
  warranty: ReturnType<typeof useStore>["warranties"][number] | undefined;
  customerName: string | null;
  movements: ReturnType<typeof useStore>["movements"];
}) {
  const lifecycle: TimelineEvent[] = [
    { label: "Received into stock", at: movements.at(-1)?.at ?? "", state: "done" },
    {
      label: "Reserved",
      at: unit.status === "reserved" ? (movements[0]?.at ?? "") : "",
      state: unit.status === "reserved" ? "active" : unit.status === "in_stock" ? "pending" : "done",
    },
    {
      label: build ? `Installed in ${build.id}` : "Installed / sold",
      at: order?.createdAt ?? "",
      state: unit.status === "installed" || unit.status === "sold" || unit.status === "rma" ? "done" : "pending",
    },
    {
      label: warranty ? `Warranty until ${dateShort(warranty.expiresAt)}` : "Warranty coverage",
      at: warranty?.purchasedAt ?? "",
      state: warranty ? (warranty.status === "active" ? "active" : "done") : "pending",
    },
    {
      label: "RMA / replacement",
      at: "",
      state: unit.status === "rma" ? "active" : "pending",
    },
  ];

  return (
    <div className="space-y-5">
      <Section title={unit.serial} hint={product?.name ?? unit.productId} action={<StatusBadge status={unit.status} />}>
        <KeyValueGrid
          cols={2}
          items={[
            {
              label: "Product",
              value: product ? (
                <IdLink to="/products/$productId" params={{ productId: product.id }}>
                  {product.sku}
                </IdLink>
              ) : (
                unit.productId
              ),
            },
            { label: "Category", value: product?.category ?? "—" },
            { label: "Customer", value: customerName ?? "Unassigned" },
            {
              label: "Order",
              value: order ? (
                <IdLink to="/orders/$orderId" params={{ orderId: order.id }}>
                  {order.id}
                </IdLink>
              ) : (
                "—"
              ),
            },
            {
              label: "Build",
              value: build ? (
                <IdLink to="/builds/$buildId" params={{ buildId: build.id }}>
                  {build.id}
                </IdLink>
              ) : (
                "—"
              ),
            },
            {
              label: "Warranty",
              value: warranty ? (
                <IdLink to="/warranty/$warrantyId" params={{ warrantyId: warranty.id }}>
                  {titleCase(warranty.status)}
                </IdLink>
              ) : (
                "Not registered"
              ),
            },
            { label: "Sold on", value: order ? dateShort(order.createdAt) : "—" },
            { label: "Warranty ends", value: warranty ? dateShort(warranty.expiresAt) : "—" },
          ]}
        />
      </Section>

      <Section title="Lifecycle">
        <div className="p-4">
          <Timeline events={lifecycle} />
        </div>
      </Section>

      <Section title="Related stock movements" hint="Product-level">
        {movements.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No movements" description="This product has no recorded stock movements yet." />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {movements.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13px] text-foreground">
                    {titleCase(m.type)} · <span className="mono text-xs">{m.qty > 0 ? `+${m.qty}` : m.qty}</span>
                  </p>
                  <p className="mono text-[11px] text-subtle">
                    {dateTime(m.at)} · {m.actor}
                    {m.reference ? ` · ${m.reference}` : ""}
                  </p>
                </div>
                <StatusBadge status={m.type} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
