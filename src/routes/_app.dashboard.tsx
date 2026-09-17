import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Boxes,
  Clock,
  FileText,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/nexus/page-header";
import { StatCard } from "@/components/nexus/stat-card";
import {
  Panel,
  PanelHeader,
  EmptyState,
  CardsSkeleton,
  RowsSkeleton,
  IdLink,
} from "@/components/nexus/primitives";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Reveal } from "@/components/nexus/motion";
import { useStore, useSimulatedLoad } from "@/lib/store";
import { money, num, greeting, relative, dateShort } from "@/lib/format";
import { SalesChart } from "@/components/nexus/sales-chart";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — DPC POS" },
      {
        name: "description",
        content:
          "Today's sales, live orders, quotations, stock alerts and recent activity for Dream PC Build & IT Solutions.",
      },
      { property: "og:title", content: "Operations Dashboard — DPC POS" },
      {
        property: "og:description",
        content: "Live operational overview: sales, orders, quotes, inventory alerts and activity.",
      },
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

const QUOTE_PHASES = [
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent / pending" },
  { id: "approved", label: "Approved" },
  { id: "converted", label: "Converted" },
] as const;

function DashboardPage() {
  const store = useStore();
  const loading = useSimulatedLoad();
  const today = new Date().toDateString();
  const todays = store.orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const todaySales = todays.reduce((s, o) => s + (o.payment ? o.total : 0), 0);
  const pendingOrders = store.orders.filter((o) => ["pending", "paid"].includes(o.status));
  const openQuotes = store.quotes.filter((q) =>
    ["draft", "sent", "pending", "approved"].includes(q.status),
  );
  const convertedQuotes = store.quotes.filter((q) => q.status === "converted").length;
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

  const thirtyDaysAgo = Date.now() - 30 * 86400000;
  const recentPaid = store.orders.filter(
    (o) => o.payment && new Date(o.createdAt).getTime() >= thirtyDaysAgo,
  );
  const avgOrderValue = recentPaid.length
    ? recentPaid.reduce((s, o) => s + o.total, 0) / recentPaid.length
    : 0;

  const topProducts = (() => {
    const counts = new Map<string, number>();
    store.orders.forEach((o) => {
      if (!o.payment || new Date(o.createdAt).getTime() < thirtyDaysAgo) return;
      o.items.forEach((it) => {
        counts.set(it.productId, (counts.get(it.productId) ?? 0) + it.qty);
      });
    });
    return [...counts.entries()]
      .map(([productId, qty]) => {
        const p = store.productById(productId);
        return p ? { name: p.name, sku: p.sku, qty } : null;
      })
      .filter((x): x is { name: string; sku: string; qty: number } => x !== null)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  })();

  const lowStock = store.inventory.filter((i) => {
    const avail = i.onHand - i.reserved;
    return avail <= i.reorderPoint;
  });

  const quoteCounts = QUOTE_PHASES.map((ph) => ({
    phase: ph,
    count:
      ph.id === "sent"
        ? store.quotes.filter((q) => ["sent", "pending"].includes(q.status)).length
        : store.quotes.filter((q) => q.status === ph.id).length,
  }));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* ── Command-center hero ─────────────────────────────────────────── */}
      <Reveal>
        <div className="chassis-corners relative overflow-hidden rounded-xl border border-border bg-surface/60">
          <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" />
          <div className="pointer-events-none absolute inset-0 ambient-glow" />
          <div className="relative p-4 sm:p-6">
            <PageHeader
              title={`${greeting()}, ${store.user?.name.split(" ")[0] ?? "there"}`}
              description={new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              meta={
                <>
                  <span className="label-tech">
                    SYNC <span className="text-muted-foreground">Local demo</span>
                  </span>
                  <span className="label-tech">
                    DATA <span className="text-warning">DEMO</span>
                  </span>
                </>
              }
              actions={
                <Button asChild>
                  <Link to="/quotes">
                    <Plus className="size-4" /> New Quote
                  </Link>
                </Button>
              }
            />

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
              <Telemetry label="Today">
                {todays.length} txns · {money(todaySales)}
              </Telemetry>
              <Telemetry label="Orders">{store.orders.length} total</Telemetry>
              <Telemetry label="Quotes">{openQuotes.length} open</Telemetry>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── KPI grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <CardsSkeleton count={6} />
      ) : (
        <Reveal stagger={0.06} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Today's revenue"
            numericValue={todaySales}
            format={money}
            hint={`${todays.length} transactions today`}
            accent="info"
            icon={ShoppingCart}
          />
          <StatCard
            label="Orders today"
            numericValue={todays.length}
            hint="Completed & pending"
            icon={Receipt}
          />
          <StatCard
            label="Pending orders"
            numericValue={pendingOrders.length}
            accent="warning"
            hint="Awaiting payment / processing"
            icon={Clock}
          />
          <StatCard
            label="Open quotes"
            numericValue={openQuotes.length}
            accent="success"
            hint="Draft / sent / approved"
            icon={FileText}
          />
          <StatCard
            label="Quotes converted"
            numericValue={convertedQuotes}
            accent="success"
            hint="Converted to orders"
            icon={BadgePercent}
          />
          <StatCard
            label="Avg. order value"
            numericValue={avgOrderValue}
            format={money}
            accent="neutral"
            hint="Last 30 days"
            icon={Target}
          />
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
                <Link to="/orders">
                  <Receipt className="size-4" /> Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-1.5 text-xs">
                <Link to="/quotes">
                  <FileText className="size-4" /> Quotes
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-1.5 text-xs">
                <Link to="/products" search={{ openNew: false }}>
                  <Package className="size-4" /> Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-1.5 text-xs">
                <Link to="/inventory" search={{ openNew: false }}>
                  <Boxes className="size-4" /> Inventory
                </Link>
              </Button>
            </div>
            <div className="border-t border-border px-4 py-3">
              <p className="label-tech mb-2">Latest quotations</p>
              {openQuotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No open quotes right now.</p>
              ) : (
                <ul className="space-y-2">
                  {openQuotes.slice(0, 4).map((q) => (
                    <li key={q.id} className="flex items-center gap-2 text-[12.5px]">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          q.status === "approved" ? "bg-success" : "bg-warning",
                        )}
                      />
                      <IdLink
                        to="/quotes/$quoteId"
                        params={{ quoteId: q.id }}
                        className="min-w-0 flex-1 truncate"
                      >
                        {q.id} · {q.customerName}
                      </IdLink>
                      <span className="mono shrink-0 text-[10.5px] text-subtle">
                        {money(q.total)}
                      </span>
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
              hint="Products at or below reorder point"
              action={
                <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                  <Link to="/products" search={{ openNew: false }}>
                    View products <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              }
            />
            {loading ? (
              <RowsSkeleton rows={4} />
            ) : lowStock.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="Stock levels healthy"
                description="No products are below their reorder point."
              />
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.slice(0, 6).map((i) => {
                  const p = store.productById(i.productId);
                  if (!p) return null;
                  const avail = i.onHand - i.reserved;
                  const pct =
                    i.onHand > 0 ? Math.max(0, Math.min(100, (avail / i.onHand) * 100)) : 0;
                  return (
                    <li key={i.productId} className="flex items-center gap-3 px-4 py-2.5">
                      <AlertTriangle
                        className={
                          avail === 0
                            ? "size-3.5 shrink-0 text-destructive"
                            : "size-3.5 shrink-0 text-warning"
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <IdLink
                          to="/products/$productId"
                          params={{ productId: p.id }}
                          className="block truncate text-[13.5px] font-medium text-foreground"
                        >
                          {p.name}
                        </IdLink>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1 w-24 overflow-hidden rounded-full bg-elevated">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                avail === 0 ? "bg-destructive" : "bg-warning",
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="mono text-[11px] font-medium text-subtle">
                            {avail}/{i.onHand}
                          </span>
                        </div>
                      </div>
                      <StatusBadge
                        status={avail === 0 ? "out_of_stock" : "low_stock"}
                        label={`${avail} avail`}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </Reveal>

        <Reveal delay={0.08} className="min-w-0">
          <Panel>
            <PanelHeader
              title="Quote pipeline"
              hint="Quotations by stage"
              action={
                <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                  <Link to="/quotes">All quotes</Link>
                </Button>
              }
            />
            {openQuotes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No open quotes"
                description="New or pending quotations will appear here."
              />
            ) : (
              <div className="p-4">
                <div className="flex items-center gap-1.5">
                  {quoteCounts.map(({ phase, count }, i) => (
                    <Fragment key={phase.id}>
                      {i > 0 && <span className="mono text-[11px] text-subtle">→</span>}
                      <div
                        className={cn(
                          "flex min-w-0 flex-1 flex-col gap-1 rounded-md border px-2.5 py-2 transition-colors",
                          count > 0
                            ? "border-border-strong bg-elevated"
                            : "border-border opacity-45",
                        )}
                      >
                        <span className="label-tech truncate font-semibold">{phase.label}</span>
                        <span className="mono text-lg font-medium leading-none tabular-nums">
                          {count}
                        </span>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <p className="label-tech mt-3 mb-2">Waiting on customer</p>
                <ul className="space-y-1.5">
                  {openQuotes
                    .filter((q) => ["draft", "sent", "pending", "approved"].includes(q.status))
                    .slice(0, 4)
                    .map((q) => (
                      <li
                        key={q.id}
                        className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-2.5 py-2"
                      >
                        <IdLink to="/quotes/$quoteId" params={{ quoteId: q.id }}>
                          {q.id}
                        </IdLink>
                        <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted-foreground">
                          {q.customerName}
                        </span>
                        <StatusBadge status={q.status} className="shrink-0" />
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </Panel>
        </Reveal>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Reveal className="min-w-0">
          <Panel>
            <PanelHeader
              title="Recent transactions"
              action={
                <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                  <Link to="/orders">All orders</Link>
                </Button>
              }
            />
            <ul className="divide-y divide-border">
              {store.orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <IdLink to="/orders/$orderId" params={{ orderId: o.id }}>
                      {o.id}
                    </IdLink>
                    <p className="truncate text-[13.5px] font-medium">
                      {o.items?.[0]?.name ?? "—"}
                      {o.items && o.items.length > 1 ? ` +${o.items.length - 1}` : ""}
                    </p>
                    <p className="mono mt-0.5 text-[11px] font-medium text-subtle">
                      {o.customerName} · {relative(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono text-[13.5px] font-medium tabular-nums">{money(o.total)}</p>
                    <StatusBadge status={o.status} className="mt-1" />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>

        <Reveal delay={0.08} className="min-w-0">
          <Panel>
            <PanelHeader
              title="Recent notifications"
              hint="System activity feed"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => store.markAllNotificationsRead()}
                >
                  Mark all read
                </Button>
              }
            />
            {store.notifications.length === 0 ? (
              <EmptyState title="No notifications" description="You're all caught up." />
            ) : (
              <ul className="divide-y divide-border">
                {store.notifications.slice(0, 6).map((n) => (
                  <li key={n.id} className="flex items-start gap-3 px-4 py-2.5">
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${n.read ? "bg-subtle" : "bg-info"}`}
                    />
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
                <p className="truncate text-[13px]">
                  <span className="text-foreground">{a.actor}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>
                </p>
                <span className="mono shrink-0 text-[11px] text-subtle">{relative(a.at)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      <p className="mono text-[10.5px] text-subtle">
        ALL FIGURES ARE DEMO DATA · {num(store.products.length)} SKUS LOADED ·{" "}
        {dateShort(new Date().toISOString())}
      </p>
    </div>
  );
}
