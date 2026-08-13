import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, Mono } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, TotalsRows, DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Timeline } from "@/components/nexus/timeline";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { money, moneyExact, dateTime, titleCase } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order detail — DPC Nexus" },
      { name: "description", content: "Line items, payment breakdown and receipt actions." },
      { property: "og:title", content: "Order detail — DPC Nexus" },
      { property: "og:description", content: "Line items, payment breakdown and receipt actions." },
    ],
  }),
  component: OrdersOrderidPage,
});

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["assembly", "ready", "cancelled"],
  assembly: ["testing", "cancelled"],
  testing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: ["refunded"],
};

function OrdersOrderidPage() {
  const { orderId } = Route.useParams();
  const { orders, customerById, updateOrderStatus } = useStore();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Order detail" description="Line items, payment breakdown and receipt actions." />
        <Panel>
          <EmptyState
            title="Order not found"
            description={`No order matches "${orderId}". It may have been removed from the demo dataset.`}
            action={
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/orders" })}>
                Back to orders
              </Button>
            }
          />
        </Panel>
      </div>
    );
  }

  const customer = customerById(order.customerId);
  const nextOptions = NEXT_STATUS[order.status] ?? [];

  const advance = (status: OrderStatus) => {
    updateOrderStatus(order.id, status);
    toast.success(`Order ${order.id} set to ${titleCase(status)}`);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={<span className="mono">{order.id}</span>}
        status={<StatusBadge status={order.status} />}
        description={
          <span>
            {titleCase(order.type)} order for{" "}
            {order.customerId ? (
              <IdLink to="/customers/$customerId" params={{ customerId: order.customerId }}>
                {order.customerName}
              </IdLink>
            ) : (
              order.customerName
            )}{" "}
            · placed {dateTime(order.createdAt)}
          </span>
        }
        actions={
          <>
            {nextOptions
              .filter((s) => s !== "cancelled" && s !== "refunded")
              .map((s) => (
                <Button key={s} size="sm" onClick={() => advance(s)}>
                  Mark {titleCase(s)}
                </Button>
              ))}
            {nextOptions.includes("cancelled") && (
              <Button size="sm" variant="outline" onClick={() => advance("cancelled")}>
                Cancel
              </Button>
            )}
            {nextOptions.includes("refunded") && (
              <Button size="sm" variant="outline" onClick={() => advance("refunded")}>
                Refund
              </Button>
            )}
          </>
        }
      />

      {(order.buildId || order.quoteId) && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {order.quoteId && (
            <span>
              From quote{" "}
              <IdLink to="/quotes/$quoteId" params={{ quoteId: order.quoteId }}>
                {order.quoteId}
              </IdLink>
            </span>
          )}
          {order.buildId && (
            <span>
              Linked build{" "}
              <IdLink to="/builds/$buildId" params={{ buildId: order.buildId }}>
                {order.buildId}
              </IdLink>
            </span>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Line items" hint={`${order.items.length} SKU(s)`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="label-tech px-4 py-2.5 font-normal">SKU</th>
                    <th className="label-tech px-4 py-2.5 font-normal">Name</th>
                    <th className="label-tech px-4 py-2.5 text-right font-normal">Qty</th>
                    <th className="label-tech px-4 py-2.5 text-right font-normal">Unit price</th>
                    <th className="label-tech px-4 py-2.5 text-right font-normal">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.productId} className="border-b border-border/60 last:border-0">
                      <td className="mono px-4 py-2.5 text-xs text-muted-foreground">{it.sku}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-foreground">{it.name}</p>
                        {it.serials && it.serials.length > 0 && (
                          <p className="mono mt-0.5 text-[10.5px] text-subtle">
                            S/N: {it.serials.join(", ")}
                          </p>
                        )}
                      </td>
                      <td className="mono px-4 py-2.5 text-right tabular-nums">{it.qty}</td>
                      <td className="mono px-4 py-2.5 text-right tabular-nums">{moneyExact(it.unitPrice)}</td>
                      <td className="mono px-4 py-2.5 text-right tabular-nums">
                        {moneyExact(it.qty * it.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Timeline">
            <div className="p-4">
              <Timeline events={order.timeline} />
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Totals">
            <div className="p-4">
              <TotalsRows
                rows={[
                  { label: "Subtotal", value: moneyExact(order.subtotal) },
                  { label: "Discount", value: `−${moneyExact(order.discount)}`, muted: order.discount === 0 },
                  { label: "Service total", value: moneyExact(order.serviceTotal), muted: order.serviceTotal === 0 },
                  { label: "VAT (12%)", value: moneyExact(order.tax) },
                  { label: "Total", value: money(order.total), strong: true },
                ]}
              />
            </div>
          </Section>

          <Section title="Payment">
            {order.payment ? (
              <KeyValueGrid
                cols={2}
                items={[
                  { label: "Method", value: titleCase(order.payment.method) },
                  { label: "Amount", value: moneyExact(order.payment.amount), mono: true },
                  { label: "Reference", value: order.payment.reference ?? "—", mono: true },
                  { label: "Paid at", value: dateTime(order.payment.at) },
                ]}
              />
            ) : (
              <div className="p-4">
                <EmptyState title="No payment recorded" description="This order has not been paid yet." />
              </div>
            )}
          </Section>

          <Section title="Customer & cashier">
            <KeyValueGrid
              cols={2}
              items={[
                { label: "Customer", value: order.customerName },
                { label: "Contact", value: customer?.phone ?? customer?.email ?? "Walk-in" },
                { label: "Cashier", value: order.cashier },
                { label: "Order type", value: titleCase(order.type) },
              ]}
            />
          </Section>

          <DemoNote>
            Status transitions and refunds are simulated locally — no payment gateway or inventory
            reversal is triggered.
          </DemoNote>
        </div>
      </div>
    </div>
  );
}
