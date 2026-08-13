import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink } from "@/components/nexus/primitives";
import { DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { DocumentPreview, PrintButton } from "@/components/nexus/document";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { useStore } from "@/lib/store";
import { dateShort, daysUntil } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/quotes/$quoteId")({
  head: () => ({
    meta: [
      { title: "Quote detail — DPC Nexus" },
      { name: "description", content: "Quoted configuration, totals and approval state." },
      { property: "og:title", content: "Quote detail — DPC Nexus" },
      { property: "og:description", content: "Quoted configuration, totals and approval state." },
    ],
  }),
  component: QuotesQuoteidPage,
});

function QuotesQuoteidPage() {
  const { quoteId } = Route.useParams();
  const { quotes, customerById, setQuoteStatus, convertQuoteToOrder } = useStore();
  const navigate = useNavigate();
  const quote = quotes.find((q) => q.id === quoteId);

  if (!quote) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader title="Quote detail" description="Quoted configuration, totals and approval state." />
        <Panel>
          <EmptyState
            title="Quote not found"
            description={`No quote matches "${quoteId}". It may have been removed from the demo dataset.`}
            action={
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/quotes" })}>
                Back to quotes
              </Button>
            }
          />
        </Panel>
      </div>
    );
  }

  const customer = customerById(quote.customerId);
  const days = daysUntil(quote.expiresAt);
  const expired = quote.status !== "converted" && days < 0;

  const canSend = quote.status === "draft";
  const canApprove = quote.status === "sent" || quote.status === "pending";
  const canReject = quote.status === "sent" || quote.status === "pending";
  const canConvert = quote.status === "approved";

  const handleSetStatus = (status: "sent" | "approved" | "rejected") => {
    setQuoteStatus(quote.id, status);
    toast.success(`Quote ${quote.id} marked ${status}`);
  };

  const handleConvert = () => {
    const order = convertQuoteToOrder(quote.id);
    if (order) {
      toast.success(`Converted to order ${order.id}`);
      navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    } else {
      toast.error("Could not convert quote to order.");
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={<span className="mono">{quote.id}</span>}
        status={<StatusBadge status={expired ? "expired" : quote.status} />}
        description={
          <span>
            Prepared by {quote.preparedBy} for{" "}
            {quote.customerId ? (
              <IdLink to="/customers/$customerId" params={{ customerId: quote.customerId }}>
                {quote.customerName}
              </IdLink>
            ) : (
              quote.customerName
            )}{" "}
            · issued {dateShort(quote.createdAt)}
          </span>
        }
        actions={
          <>
            <PrintButton label="Print quotation" />
            {canSend && (
              <Button size="sm" variant="outline" onClick={() => handleSetStatus("sent")}>
                Send to customer
              </Button>
            )}
            {canApprove && (
              <Button size="sm" onClick={() => handleSetStatus("approved")}>
                Approve
              </Button>
            )}
            {canReject && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject {quote.id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The quote will be marked rejected and can no longer be converted to an order.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep quote</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSetStatus("rejected")}>
                      Reject quote
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {canConvert && (
              <Button size="sm" onClick={handleConvert}>
                Convert to order
              </Button>
            )}
          </>
        }
      />

      <div className={cn("flex flex-wrap gap-4 text-xs", expired ? "text-destructive" : "text-muted-foreground")}>
        <span>
          Valid until <span className="mono">{dateShort(quote.expiresAt)}</span>
          {!["converted"].includes(quote.status) &&
            (expired ? " — expired" : days <= 7 ? ` — ${days}d remaining` : "")}
        </span>
        {quote.buildId && (
          <span>
            Linked build{" "}
            <IdLink to="/builds/$buildId" params={{ buildId: quote.buildId }}>
              {quote.buildId}
            </IdLink>
          </span>
        )}
        {quote.orderId && (
          <span>
            Converted to order{" "}
            <IdLink to="/orders/$orderId" params={{ orderId: quote.orderId }}>
              {quote.orderId}
            </IdLink>
          </span>
        )}
      </div>

      <DocumentPreview
        kind="Quotation"
        reference={quote.id}
        issuedAt={quote.createdAt}
        status={quote.status}
        party={{
          title: "Quoted to",
          name: quote.customerName,
          lines: [customer?.address, customer?.phone, customer?.email],
        }}
        lines={quote.items.map((i) => ({
          description: i.name,
          sku: i.sku,
          qty: i.qty,
          unitPrice: i.unitPrice,
        }))}
        totals={[
          { label: "Subtotal", value: quote.subtotal },
          { label: "Discount", value: -quote.discount },
          { label: "Service total", value: quote.serviceTotal },
          { label: "VAT (12%)", value: quote.tax },
          { label: "Total", value: quote.total, strong: true },
        ]}
        footer={
          <div className="space-y-1">
            {quote.notes && <p>Notes: {quote.notes}</p>}
            <p>Prepared by {quote.preparedBy} · Valid until {dateShort(quote.expiresAt)}</p>
          </div>
        }
      />

      <DemoNote>
        Sending, approval and rejection are simulated status changes — no e-mail or e-signature
        integration is triggered.
      </DemoNote>
    </div>
  );
}
