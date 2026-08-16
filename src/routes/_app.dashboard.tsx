import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  Cpu,
  Package,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DreamLogo } from "@/components/brand/nexus-logo";
import { PageHeader } from "@/components/nexus/page-header";
import { StatCard } from "@/components/nexus/stat-card";
import { Panel, PanelHeader, EmptyState, CardsSkeleton, RowsSkeleton, IdLink } from "@/components/nexus/primitives";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Reveal } from "@/components/nexus/motion";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { useOps } from "@/lib/ops-store";
import { money, num, greeting, relative, dateShort } from "@/lib/format";
import { SalesChart } from "@/components/nexus/sales-chart";
import { ASSEMBLY_STAGES } from "@/lib/ops-types";
import { cn } from "@/lib/utils";

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

/** Small mono telemetry chip used in the command-center status strip. */
function Telemetry({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="mono inline-flex items-baseline gap-1.5 text-[11px] tracking-wide uppercase">
      <span className="text-subtle">{label}</span>
      <span className="text-foreground">{children}</span>
    </span>
  );
}

const PIPELINE_PHASES = [
  { id: "sales", label: "Quote" },
  { id: "assembly", label: "Bench" },
  { id: "validation", label: "Test" },
  { id: "handover", label: "Release" },
] as const;

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
  const hourly = Array.from({ length: 12 }).map((_, i) => {
    const start = new Date();
    start.setHours(i + 8, 0, 0, 0);
    const end = new Date(start);
    end.setHours(i + 9, 0, 0, 0);
    const bucketOrders = store.orders.filter((o) => {
      if (!o.payment) return false;
      const t = new Date(o.createdAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    return {
      label: `${(i + 8).toString().padStart(2, "0")}:00`,
      revenue: bucketOrders.reduce((s, o) => s + o.total, 0),
      orders: bucketOrders.length,
    };
  });

  const stageOf = (buildId: string) => ops.opsForBuild(buildId).stage;
  const phaseCounts = PIPELINE_PHASES.map((ph) => ({
    phase: ph,
    count: openBuilds.filter((b) => {
      const stage = ASSEMBLY_STAGES.find((s) => s.id === stageOf(b.id));
      return stage?.group === ph.id;
    }).length,
  }));
  const activePhases = phaseCounts.filter((p) => p.count > 0);
  const benchBuilds = openBuilds
    .map((b) => ({ b, stage: ASSEMBLY_STAGES.find((s) => s.id === stageOf(b.id)) }))
    .filter((x) => x.stage && ["assembly", "validation"].includes(x.stage.group))
    .slice(0, 4);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* ── Command-center hero ─────────────────────────────────────────── */}
      <Reveal>
        <div className="chassis-corners relative overflow-hidden rounded-xl border border-border bg-surface/60">
          <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" />
          <div className="pointer-events-none absolute inset-0 ambient-glow" />
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
              {/* Brand emblem */}
              <div className="flex shrink-0 items-center gap-3.5">
                <div className="relative">
                  <div
                    className="pointer-events-none absolute -inset-1.5 rounded-2xl bg-info/15 blur-xl"
                    aria-hidden="true"
                  />
                  <div className="relative flex size-16 items-center justify-center rounded-xl border border-border-strong bg-elevated shadow-[0_0_0_1px_oklch(0.76_0.11_210/0.12)]">
                    <DreamLogo className="size-10" />
                  </div>
                  <span className="status-dot absolute -top-0.5 -right-0.5 size-2 rounded-full" />
                </div>
                <div className="leading-none">
                  <p className="mono text-[10px] tracking-[0.18em] uppercase text-subtle">
                    Dream PC Build
                  </p>
                  <p className="mt-1 text-[17px] font-semibold tracking-tight text-foreground">
                    DPC <span className="text-info">NEXUS</span>
                  </p>
                  <p className="mono mt-1 text-[9.5px] tracking-[0.14em] uppercase text-subtle">
                    PC Retail · IT Solutions
                  </p>
                </div>
              </div>

              {/* Greeting + actions */}
              <div className="min-w-0 flex-1">
                <PageHeader
                  title={`${greeting()}, ${store.user?.name.split(" ")[0] ?? "there"}`}
                  description={new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  meta={
                    <>
                      <span className="label-tech">SYNC <span className="text-muted-foreground">Local demo</span></span>
                      <span className="label-tech">DATA <span className="text-warning">DEMO</span></span>
                    </>
                  }
                  actions={
                    <Button asChild>
                      <Link to="/pos"><Plus className="size-4" /> New Sale</Link>
                    </Button>
                  }
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-border pt-4">
              <span className="mono inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
                <span className="status-dot" />
                <span className="text-subtle">System</span>
                <span className="text-success">Operational</span>
              </span>
              <Telemetry label="Env">
                <span className="text-warning">Demo</span>
              </Telemetry>
              <Telemetry label="Skus">{num(store.products.length)}</Telemetry>
              <Telemetry label="Today">{todays.length} txns · {money(todaySales)}</Telemetry>
              <Telemetry label="Builds">{openBuilds.length} active</Telemetry>
              <Telemetry label="Tickets">{openServices.length} open</Telemetry>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── KPI grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <CardsSkeleton count={6} />
      ) : (
        <Reveal stagger={0.06} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Today's revenue" numericValue={todaySales} format={money} hint={`${todays.length} transactions today`} accent="info" icon={ShoppingCart} />
          <StatCard label="Orders today" numericValue={todays.length} hint="Completed & pending" icon={Receipt} />
          <StatCard label="Open service tickets" numericValue={openServices.length} accent="warning" hint="In diagnosis / repair" icon={Wrench} />
          <StatCard label="Builds in progress" numericValue={openBuilds.length} accent="success" hint="Active pipeline" icon={Cpu} />
          <StatCard label="Pending returns" numericValue={pendingReturns} accent="danger" hint="Requested / inspection / approved" icon={RotateCcw} />
          <StatCard label="Low-stock alerts" numericValue={lowStock.length} accent="danger" hint="At or below reorder point" icon={AlertTriangle} />
        </Reveal>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Reveal className="min-w-0">
          <Panel>
            <SalesChart daily={daily} hourly={hourly} />
          </Panel>
        </Reveal>

        <Reveal delay={0.08} className="min-w-0">
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
              <p className="label-tech mb-2">Builds on the bench</p>
              {benchBuilds.length === 0 ? (
                <p className="text-xs text-muted-foreground">No builds in assembly or testing right now.</p>
              ) : (
                <ul className="space-y-2">
                  {benchBuilds.map((x) => (
                    <li key={x.b.id} className="flex items-center gap-2 text-[12.5px]">
                      <span className="size-1.5 shrink-0 rounded-full bg-warning" />
                      <IdLink to="/builds/$buildId" params={{ buildId: x.b.id }} className="min-w-0 flex-1 truncate">
                        {x.b.id} · {x.b.customerName}
                      </IdLink>
                      <span className="mono shrink-0 text-[10.5px] text-subtle">{x.stage?.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        </Reveal>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Reveal className="min-w-0">
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
                  const pct = i.onHand > 0 ? Math.max(0, Math.min(100, (avail / i.onHand) * 100)) : 0;
                  return (
                    <li key={i.productId} className="flex items-center gap-3 px-4 py-2.5">
                      <AlertTriangle className={avail === 0 ? "size-3.5 shrink-0 text-destructive" : "size-3.5 shrink-0 text-warning"} />
                      <div className="min-w-0 flex-1">
                        <IdLink to="/products/$productId" params={{ productId: p.id }} className="block truncate text-[13px] text-foreground">
                          {p.name}
                        </IdLink>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1 w-24 overflow-hidden rounded-full bg-elevated">
                            <div
                              className={cn("h-full rounded-full", avail === 0 ? "bg-destructive" : "bg-warning")}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="mono text-[10.5px] text-subtle">{avail}/{i.onHand}</span>
                        </div>
                      </div>
                      <StatusBadge status={avail === 0 ? "out_of_stock" : "low_stock"} label={`${avail} avail`} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </Reveal>

        <Reveal delay={0.08} className="min-w-0">
          <Panel>
            <PanelHeader title="Build pipeline" hint="Active custom builds by bench phase" action={
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to="/builds">All builds</Link></Button>
            } />
            {openBuilds.length === 0 ? (
              <EmptyState icon={Cpu} title="No active builds" description="New custom builds will appear here." />
            ) : (
              <div className="p-4">
                <div className="flex items-center gap-1.5">
                  {phaseCounts.map(({ phase, count }, i) => (
                    <Fragment key={phase.id}>
                      {i > 0 && <span className="mono text-[11px] text-subtle">→</span>}
                      <div
                        className={cn(
                          "flex min-w-0 flex-1 flex-col gap-1 rounded-md border px-2.5 py-2 transition-colors",
                          count > 0 ? "border-border-strong bg-elevated" : "border-border opacity-45",
                        )}
                      >
                        <span className="label-tech truncate">{phase.label}</span>
                        <span className="mono text-lg leading-none tabular-nums">{count}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <p className="label-tech mt-3 mb-2">
                  On the bench · {activePhases.length ? activePhases.map((p) => `${p.phase.label}:${p.count}`).join(" · ") : "none"}
                </p>
                {benchBuilds.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No builds currently in assembly or testing.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {benchBuilds.map(({ b, stage }) => (
                      <li key={b.id} className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-2.5 py-2">
                        <IdLink to="/builds/$buildId" params={{ buildId: b.id }}>{b.id}</IdLink>
                        <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted-foreground">{b.customerName}</span>
                        <StatusBadge status={stage?.id ?? b.status} className="shrink-0" {...(stage ? { label: stage.label } : {})} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Panel>
        </Reveal>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Reveal className="min-w-0">
          <Panel>
            <PanelHeader title="Recent transactions" action={
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to="/orders">All orders</Link></Button>
            } />
            <ul className="divide-y divide-border">
              {store.orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <IdLink to="/orders/$orderId" params={{ orderId: o.id }}>{o.id}</IdLink>
                    <p className="truncate text-[13px]">{o.items?.[0]?.name ?? "—"}{o.items && o.items.length > 1 ? ` +${o.items.length - 1}` : ""}</p>
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
        </Reveal>

        <Reveal delay={0.08} className="min-w-0">
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
        </Reveal>
      </div>

      <Reveal>
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
      </Reveal>

      <p className="mono text-[10.5px] text-subtle">
        ALL FIGURES ARE DEMO DATA · {num(store.products.length)} SKUS LOADED · {dateShort(new Date().toISOString())}
      </p>
    </div>
  );
}
