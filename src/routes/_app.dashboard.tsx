import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Boxes, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/nexus/page-header";
import { StatCard } from "@/components/nexus/stat-card";
import { Panel, PanelHeader, EmptyState, CardsSkeleton, RowsSkeleton, IdLink } from "@/components/nexus/primitives";
import { StatusBadge } from "@/components/nexus/status-badge";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { money, num, greeting, relative, timeOnly } from "@/lib/format";
import { salesSeries, hourlySeries } from "@/lib/demo-data";
import { SalesChart } from "@/components/nexus/sales-chart";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — DPC Nexus" },
      { name: "description", content: "Today's sales, build pipeline, stock alerts and recent activity for Dream PC Build & IT Solutions." },
      { property: "og:title", content: "Operations Dashboard — DPC Nexus" },
      { property: "og:description", content: "Live operational overview: sales, builds, inventory alerts and activity." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const store = useStore();
  const loading = useSimulatedLoad();
  const today = new Date().toDateString();
  const todays = store.orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const todaySales = todays.reduce((s, o) => s + (o.payment ? o.total : 0), 0);
  const lowStock = store.inventory.filter((i) => i.onHand - i.reserved <= i.reorderPoint);
  const openBuilds = store.builds.filter((b) => !["released", "cancelled"].includes(b.status));
  const pendingQuotes = store.quotes.filter((q) => ["draft", "sent", "pending"].includes(q.status));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={`${greeting()}, ${store.user?.name.split(" ")[0] ?? "there"}`}
        description={new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        meta={
          <>
            <span className="label-tech">LAST SYNC <span className="text-muted-foreground">{timeOnly(new Date().toISOString())}</span></span>
            <span className="label-tech">DATA <span className="text-warning">DEMO</span></span>
          </>
        }
        actions={
          <Button asChild>
            <Link to="/pos"><Plus className="size-4" /> New Sale</Link>
          </Button>
        }
      />

      {loading ? (
        <CardsSkeleton count={5} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Today's sales" numericValue={todaySales} format={money} delta={8.4} hint={`${todays.length} transactions today`} accent="info" />
          <StatCard label="Orders" numericValue={store.orders.length} delta={4.1} hint="All time (demo)" />
          <StatCard label="Low stock" numericValue={lowStock.length} accent="warning" hint="At or below reorder point" />
          <StatCard label="Open builds" numericValue={openBuilds.length} accent="success" hint="In pipeline" />
          <StatCard label="Pending quotes" numericValue={pendingQuotes.length} accent="neutral" hint="Awaiting customer" />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel>
          <SalesChart daily={salesSeries} hourly={hourlySeries} />
        </Panel>

        <Panel>
          <PanelHeader
            title="Inventory alerts"
            hint="Components at or below reorder point"
            action={
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                <Link to="/inventory">View inventory <ArrowRight className="size-3.5" /></Link>
              </Button>
            }
          />
          {loading ? (
            <RowsSkeleton rows={4} />
          ) : lowStock.length === 0 ? (
            <EmptyState icon={Boxes} title="Stock levels healthy" description="No components are below their reorder point." />
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 6).map((i) => {
                const p = store.productById(i.productId)!;
                const avail = i.onHand - i.reserved;
                return (
                  <li key={i.productId} className="flex items-center gap-3 px-4 py-2.5">
                    <AlertTriangle className={avail === 0 ? "size-3.5 shrink-0 text-destructive" : "size-3.5 shrink-0 text-warning"} />
                    <div className="min-w-0 flex-1">
                      <IdLink to="/products/$productId" params={{ productId: p.id }} className="block truncate text-[13px] text-foreground">
                        {p.name}
                      </IdLink>
                      <p className="mono mt-0.5 text-[11px] text-subtle">{p.sku}</p>
                    </div>
                    <StatusBadge status={avail === 0 ? "out_of_stock" : "low_stock"} label={`${avail} avail`} />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <PanelHeader title="Build pipeline" hint="Active custom PC builds" action={
            <Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to="/builds">All builds</Link></Button>
          } />
          {openBuilds.length === 0 ? (
            <EmptyState title="No active builds" description="New custom builds will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {openBuilds.slice(0, 6).map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <IdLink to="/builds/$buildId" params={{ buildId: b.id }}>{b.id}</IdLink>
                    <p className="truncate text-[13px]">{b.customerName} — {b.purpose}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Recent transactions" action={
            <Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to="/orders">All orders</Link></Button>
          } />
          <ul className="divide-y divide-border">
            {store.orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <IdLink to="/orders/$orderId" params={{ orderId: o.id }}>{o.id}</IdLink>
                  <p className="truncate text-[13px]">{o.items[0]?.name ?? "—"}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""}</p>
                  <p className="mono mt-0.5 text-[11px] text-subtle">{o.customerName} · {relative(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="mono text-[13px] tabular-nums">{money(o.total)}</p>
                  <StatusBadge status={o.status} className="mt-1" />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Activity log" hint="Demo audit trail" />
        <ul className="divide-y divide-border">
          {store.auditLogs.slice(0, 7).map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2">
              <p className="truncate text-[13px]"><span className="text-foreground">{a.actor}</span> <span className="text-muted-foreground">{a.action}</span></p>
              <span className="mono shrink-0 text-[11px] text-subtle">{relative(a.at)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <p className="mono text-[10.5px] text-subtle">
        ALL FIGURES ARE DEMO DATA · {num(store.products.length)} SKUS LOADED
      </p>
    </div>
  );
}
