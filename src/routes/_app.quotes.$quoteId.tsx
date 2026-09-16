import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, PanelHeader } from "@/components/nexus/primitives";
import { DemoNote } from "@/components/nexus/detail";
import { StatusBadge } from "@/components/nexus/status-badge";
import { DocumentPreview, PrintButton } from "@/components/nexus/document";
import { QuoteEditorDialog } from "@/components/quotes/quote-editor-dialog";
import { QuotePdfDialog } from "@/components/quotes/quote-pdf-dialog";
import { QuoteClientMessage } from "@/components/quotes/quote-message";
import { FileText, History, CreditCard, Banknote, Smartphone, Building2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { dateShort, daysUntil, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

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
  const { quotes, customerById, setQuoteStatus, convertQuoteToOrder, duplicateQuote } = useStore();
  const navigate = useNavigate();
  const quote = quotes.find((q) => q.id === quoteId);
  const [editOpen, setEditOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [dpAmount, setDpAmount] = useState("");
  const [dpMethod, setDpMethod] = useState<PaymentMethod>("cash");

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
  const canResend = quote.status === "sent" || quote.status === "pending";
  const canApprove = quote.status === "sent" || quote.status === "pending";
  const canReject = quote.status === "sent" || quote.status === "pending";
  const canConvert = quote.status === "approved";

  const handleSetStatus = (status: "approved" | "rejected") => {
    setQuoteStatus(quote.id, status);
    toast.success(`Quote ${quote.id} marked ${status}`);
  };

  const handleConvert = () => {
    const amount = Number(dpAmount) || 0;
    const downpayment = amount > 0 ? { amount, method: dpMethod } : undefined;
    const order = convertQuoteToOrder(quote.id, downpayment);
    if (order) {
      toast.success(`Converted to order ${order.id}${downpayment ? ` with ₱${amount.toLocaleString()} downpayment` : ""}`);
      navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    } else {
      toast.error("Could not convert quote to order.");
    }
    setConvertOpen(false);
  };

  const handleDuplicate = () => {
    const duplicated = duplicateQuote(quote.id);
    if (duplicated) {
      toast.success(`Quote duplicated to ${duplicated.id}`);
      navigate({ to: "/quotes/$quoteId", params: { quoteId: duplicated.id } });
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
            {(quote.version ?? 1) > 1 && (
              <span className="ml-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                v{quote.version}
              </span>
            )}
          </span>
        }
        actions={
          <>
            <PrintButton label="Print quotation" />
            <Button size="sm" variant="outline" onClick={() => setPdfOpen(true)}>
              <FileText className="size-3.5" /> View PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handleDuplicate}>
              <Copy className="size-3.5" /> Duplicate
            </Button>
            {(canSend || canResend) && (
              <Button size="sm" onClick={() => setEditOpen(true)}>
                {canSend ? "Send to customer" : "Resend / edit message"}
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
              <Button size="sm" onClick={() => { setDpAmount(""); setDpMethod("cash"); setConvertOpen(true); }}>
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
        {quote.sentAt && (
          <span>
            Sent to customer <span className="mono">{dateShort(quote.sentAt)}</span>
          </span>
        )}
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
          ...(quote.shippingFee ? [{ label: "Shipping", value: quote.shippingFee }] : []),
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

      {quote.message && (
        <Panel>
          <PanelHeader
            title="Message sent to the client"
            hint={
              quote.subject
                ? `${quote.subject}${quote.sentAt ? ` · sent ${dateShort(quote.sentAt)}` : ""}`
                : undefined
            }
          />
          <div className="p-4 sm:p-5">
            <QuoteClientMessage quote={quote} />
          </div>
        </Panel>
      )}

      <DemoNote>
        {quote.items.length === 0 && quote.serviceTotal > 0 ? (
          <>
            This quote currently contains <strong>setup services only</strong> — it has no parts yet. Add
            components to the linked build, then <strong>Generate quote</strong> there to rebuild this
            quotation with the parts and their totals included.
          </>
        ) : (
          "Sending, approval and rejection are simulated status changes — no e-mail or e-signature integration is triggered."
        )}
      </DemoNote>

      {/* Revision history */}
      {(quote.revisions?.length ?? 0) > 0 && (
        <Panel>
          <PanelHeader
            title={<span className="flex items-center gap-1.5"><History className="size-3.5" /> Revision history</span>}
            hint={`${quote.revisions.length} previous version${quote.revisions.length > 1 ? "s" : ""}`}
          />
          <div className="divide-y divide-border">
            {[...quote.revisions].reverse().map((rev) => (
              <div key={rev.version} className="flex items-center justify-between px-4 py-3 sm:px-5">
                <div>
                  <p className="text-xs font-medium">
                    Version {rev.version}
                    <span className="ml-2 text-muted-foreground">{dateShort(rev.at)}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {rev.items.length} item{rev.items.length !== 1 ? "s" : ""} · Total: {money(rev.total)}
                  </p>
                </div>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  v{rev.version}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <QuoteEditorDialog open={editOpen} onOpenChange={setEditOpen} quote={quote} />

      <QuotePdfDialog open={pdfOpen} onOpenChange={setPdfOpen} quote={quote} customer={customer} />

      {/* Convert to Order dialog with downpayment */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convert {quote.id} to order</DialogTitle>
            <DialogDescription>
              Record a downpayment now, or convert without payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-surface/40 p-3">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-muted-foreground">Quote total</dt>
                <dd className="mono font-medium text-right">{money(quote.total)}</dd>
              </dl>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="dp-amount" className="label-tech">Downpayment amount (₱)</label>
              <Input
                id="dp-amount"
                type="number"
                min={0}
                max={quote.total}
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value)}
                placeholder="0 = no downpayment"
                className="h-9"
              />
              {Number(dpAmount) > 0 && Number(dpAmount) < quote.total && (
                <p className="text-[11px] text-muted-foreground">
                  Balance due: <span className="mono font-medium">{money(quote.total - Number(dpAmount))}</span>
                </p>
              )}
              {Number(dpAmount) >= quote.total && (
                <p className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                  ✓ Full payment — order will be marked as paid
                </p>
              )}
            </div>
            {Number(dpAmount) > 0 && (
              <div className="space-y-1.5">
                <label htmlFor="dp-method" className="label-tech">Payment method</label>
                <Select value={dpMethod} onValueChange={(v) => setDpMethod(v as PaymentMethod)}>
                  <SelectTrigger id="dp-method" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash"><span className="flex items-center gap-1.5"><Banknote className="size-3.5" /> Cash</span></SelectItem>
                    <SelectItem value="gcash"><span className="flex items-center gap-1.5"><Smartphone className="size-3.5" /> GCash</span></SelectItem>
                    <SelectItem value="bank"><span className="flex items-center gap-1.5"><Building2 className="size-3.5" /> Bank transfer</span></SelectItem>
                    <SelectItem value="card"><span className="flex items-center gap-1.5"><CreditCard className="size-3.5" /> Credit / Debit card</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
            <Button onClick={handleConvert}>
              {Number(dpAmount) > 0
                ? Number(dpAmount) >= quote.total
                  ? "Convert with full payment"
                  : `Convert with ₱${Number(dpAmount).toLocaleString()} downpayment`
                : "Convert without payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
