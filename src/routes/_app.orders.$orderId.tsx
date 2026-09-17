import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, Mono } from "@/components/nexus/primitives";
import { Section, KeyValueGrid, TotalsRows } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { Timeline } from "@/components/nexus/timeline";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NewReturnDialog } from "@/components/returns/new-return-dialog";
import { PrintButton } from "@/components/nexus/document";
import { useStore } from "@/lib/store";
import { money, moneyExact, dateTime, titleCase } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order detail — DPC POS" },
      { name: "description", content: "Line items, payment breakdown and receipt actions." },
      { property: "og:title", content: "Order detail — DPC POS" },
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
  const { orders, customerById, updateOrderStatus, warranties, createClaim } = useStore();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === orderId);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimWarrantyId, setClaimWarrantyId] = useState<string | null>(null);
  const [claimReason, setClaimReason] = useState("");

  if (!order) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Order detail" description="Line items, payment breakdown and receipt actions." />
        <Panel>
          <EmptyState
            title="Order not found"
            description={`No order matches "${orderId}". It may have been removed from the store data.`}
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
  const orderWarranties = warranties.filter((w) => w.orderId === order.id);
  const isReturnable = order.status !== "pending" && order.status !== "cancelled";

  const advance = (status: OrderStatus) => {
    updateOrderStatus(order.id, status);
    toast.success(`Order ${order.id} set to ${titleCase(status)}`);
  };

  const claimWarranty = claimWarrantyId ? warranties.find((w) => w.id === claimWarrantyId) : undefined;

  const fileClaim = () => {
    if (!claimWarranty || !claimReason.trim()) return;
    const claim = createClaim(claimWarranty.id, claimReason.trim());
    toast.success(`Warranty claim ${claim.id} filed for serial ${claimWarranty.serial}.`);
    setClaimReason("");
    setClaimWarrantyId(null);
    setClaimOpen(false);
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
            <PrintButton label="Print receipt" />
            {nextOptions
              .filter((s) => s !== "cancelled" && s !== "refunded")
              .map((s) => (
                <Button key={s} size="sm" onClick={() => advance(s)}>
                  Mark {titleCase(s)}
                </Button>
              ))}
            {nextOptions.includes("cancelled") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">Cancel</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel order {order.id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The order will be marked cancelled and can no longer be advanced toward fulfillment.
                      This can be undone only by moving it through a forward workflow.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep order</AlertDialogCancel>
                    <AlertDialogAction onClick={() => advance("cancelled")}>Cancel order</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {nextOptions.includes("refunded") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">Refund</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Refund order {order.id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Records a refund of {money(order.total)} against this order and marks it refunded.
                      Issued refunds are tracked in the shift and returns workflows.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep order</AlertDialogCancel>
                    <AlertDialogAction onClick={() => advance("refunded")}>Issue refund</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isReturnable && <NewReturnDialog order={order} />}
          </>
        }
      />

      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File a warranty claim</DialogTitle>
            {claimWarranty && (
              <p className="mono text-xs text-muted-foreground">
                {claimWarranty.productName} · serial {claimWarranty.serial}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="claim-reason">Reason</Label>
            <Textarea
              id="claim-reason"
              rows={3}
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              placeholder="Describe the fault or defect"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimOpen(false)}>Cancel</Button>
            <Button onClick={fileClaim} disabled={!claimReason.trim()}>File claim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                            S/N:{" "}
                            {it.serials.map((s) => (
                              <Link
                                key={s}
                                to="/serials"
                                search={{ serial: s }}
                                className="underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
                              >
                                {s}
                              </Link>
                            ))}
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
                  {
                    label: "Tendered",
                    value: order.payment.tendered !== undefined ? moneyExact(order.payment.tendered) : "—",
                    mono: true,
                  },
                  {
                    label: "Change",
                    value: order.payment.change ? moneyExact(order.payment.change) : "—",
                    mono: true,
                  },
                  { label: "Paid at", value: dateTime(order.payment.at) },
                ]}
              />
            ) : (
              <div className="p-4">
                <EmptyState title="No payment recorded" description="This order has not been paid yet." />
              </div>
            )}
          </Section>

          <Section title="Warranties">
            {orderWarranties.length > 0 ? (
              <div className="divide-y divide-border/60">
                {orderWarranties.map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <Link
                        to="/warranty/$warrantyId"
                        params={{ warrantyId: w.id }}
                        className="mono block text-xs text-foreground underline decoration-border underline-offset-2 hover:text-foreground"
                      >
                        {w.serial}
                      </Link>
                      <p className="truncate text-[11.5px] text-muted-foreground">
                        {w.productName} · expires {dateTime(w.expiresAt)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => {
                        setClaimWarrantyId(w.id);
                        setClaimOpen(true);
                      }}
                    >
                      File claim
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState
                  title="No warranties"
                  description="No covered serials were sold with this order."
                />
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
        </div>
      </div>
    </div>
  );
}
