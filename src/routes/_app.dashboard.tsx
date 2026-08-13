import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Boxes, ClipboardList, Cpu, Package, Plus, ShoppingCart, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/nexus/page-header";
import { StatCard } from "@/components/nexus/stat-card";
import { Panel, PanelHeader, EmptyState, CardsSkeleton, RowsSkeleton, IdLink } from "@/components/nexus/primitives";
import { StatusBadge } from "@/components/nexus/status-badge";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { useOps } from "@/lib/ops-store";
import { money, num, greeting, relative, timeOnly, dateShort } from "@/lib/format";
import { SalesChart } from "@/components/nexus/sales-chart";
import { ASSEMBLY_STAGES } from "@/lib/ops-types";

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

function last14Days(orders: ReturnType<typeof useStore>["orders"]) {
  const days: { label: string; revenue: number; orders: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayOrders = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= d.getTime() && t < next.getTime() && o.payment;
    });
    days.push({
      label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    });
  }
  return days;
}

function DashboardPage() {
  const store = useStore();
  const ops = useOps();
  const loading = useSimulatedLoad();
  const today = new Date().toDateString();
  const todays = store.orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const todaySales = todays.reduce((s, o) => s + (o.payment ? o.total : 0), 0);
  const lowStock = store.inventory.filter((i) => i.onHand - i.reserved <= i.reorderPoint);
  const pendingReturns = ops.returns.filter((r) =>
    ["requested", "inspection", "approved"].includes(r.status),
  ).length;
  const openBuilds = store.builds.filter((b) => !["released", "cancelled"].includes(b.status));
  const openServices = store.services.filter((s) => !["released", "cancelled"].includes(s.status));
  const daily = last14Days(store.orders);
  const hourly = daily.slice(-1).length
    ? Array.from({ length: 12 }).map((_, i) => ({
        label: `${(i + 8).toString().padStart(2, "0")}:00`,
        revenue: 0,
        orders: 0,
      }))
    : [];

  const tasksToday = ops.tasks.filter((t) => {
    const due = new Date(t.dueAt).toDateString();
    return due === today && t.status !== "done";
  });

  const buildsByStage = ASSEMBLY_STAGES.map((stage) => ({
    stage,
    count: openBuilds.filter((b) => ops.opsForBuild(b.id).stage === stage.id).length,
  })).filter((s) => s.count > 0);

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
        <CardsSkeleton count={6} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Today's revenue" numericValue={todaySales} format={money} hint={`${todays.length} transactions today`} accent="info" />
          <StatCard label="Orders today" numericValue={todays.length} hint="Completed & pending" />
          <StatCard label="Open service tickets" numericValue={openServices.length} accent="warning" hint="In diagnosis / repair" />
          <StatCard label="Builds in progress" numericValue={openBuilds.length} accent="success" hint="Active pipeline" />
          <StatCard label="Pending returns" numericValue={pendingReturns} accent="danger" hint="Requested / inspection / approved" />
          <StatCard label="Low-stock alerts" numericValue={lowStock.length} accent="danger" hint="At or below reorder point" />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel>
          <SalesChart daily={daily} hourly={hourly} />
        </Panel>

        <Panel>
          <PanelHeader title="Quick actions" hint="Jump to the most-used workflows" />
          <div className="grid grid-cols-2 gap-2 p-3">
            <Button asChild variant="outline" className="h-16 flex-col gap-1.5 text-xs">
              <Link to="/pos"><ShoppingCart className="size-4" /> Point of Sale</Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col gap-1.5 text-xs">
              <Link to="/products" search={{ openNew: false }}><Package className="size-4" /> Products</Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col gap-1.5 text-xs">
              <Link to="/purchasing"><ClipboardList className="size-4" /> Purchasing</Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col gap-1.5 text-xs">
              <Link to="/services" search={{ openNew: false }}><Wrench className="size-4" /> Services</Link>
            </Button>
          </div>
          <div className="border-t border-border px-4 py-3">
            <p className="label-tech mb-2">Open tasks due today</p>
            {tasksToday.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tasks due today.</p>
            ) : (
              <ul className="space-y-2">
                {tasksToday.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-[12.5px]">
                    <span className="size-1.5 shrink-0 rounded-full bg-warning" />
                    <span className="min-w-0 flex-1 truncate">{t.title}</span>
                    <span className="mono shrink-0 text-[10.5px] text-subtle">{t.assignee}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <PanelHeader
            title="Inventory alerts"
            hint="Components at or below reorder point"
            action={
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                <Link to="/products" search={{ openNew: false }}>View products <ArrowRight className="size-3.5" /></Link>
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
                const p = store.productById(i.productId);
                if (!p) return null;
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

        <Panel>
          <PanelHeader title="Build pipeline" hint="Active builds by assembly stage" action={
            <Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to="/builds">All builds</Link></Button>
          } />
          {buildsByStage.length === 0 ? (
            <EmptyState icon={Cpu} title="No active builds" description="New custom builds will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {buildsByStage.map(({ stage, count }) => (
                <li key={stage.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="truncate text-[13px] text-foreground">{stage.label}</span>
                  <span className="mono text-[12px] text-muted-foreground">{count} build{count === 1 ? "" : "s"}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
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

        <Panel>
          <PanelHeader title="Recent notifications" hint="System activity feed" action={
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => store.markAllNotificationsRead()}>
              Mark all read
            </Button>
          } />
          {store.notifications.length === 0 ? (
            <EmptyState title="No notifications" description="You're all caught up." />
          ) : (
            <ul className="divide-y divide-border">
              {store.notifications.slice(0, 6).map((n) => (
                <li key={n.id} className="flex items-start gap-3 px-4 py-2.5">
                  <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${n.read ? "bg-subtle" : "bg-info"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-foreground">{n.title}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{n.body}</p>
                  </div>
                  <span className="mono shrink-0 text-[11px] text-subtle">{relative(n.at)}</span>
                </li>
              ))}
            </ul>
          )}
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
        ALL FIGURES ARE DEMO DATA · {num(store.products.length)} SKUS LOADED · {dateShort(new Date().toISOString())}
      </p>
    </div>
  );
}
