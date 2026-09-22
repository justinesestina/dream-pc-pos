import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, IdLink, PanelHeader } from "@/components/nexus/primitives";
import { DocumentPreview } from "@/components/nexus/document";
import { BillingStatusBadge } from "@/components/billing/billing-status-badge";
import { BillingEditorDialog } from "@/components/billing/billing-editor-dialog";
import { BillingPdfDialog } from "@/components/billing/billing-pdf-dialog";
import {
  Banknote,
  Building2,
  CreditCard,
  FileText,
  HandCoins,
  Pencil,
  Smartphone,
} from "lucide-react";
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
import { dateShort, dateTime, daysUntil, money, titleCase } from "@/lib/format";
import { customerTypeLabel } from "@/lib/billing";
import type { BillingStatementStatus, PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_app/billing-statements/$statementId")({
  head: () => ({
    meta: [
      { title: "Billing statement detail — DPC POS" },
      { name: "description", content: "Statement of account, balances and payment history." },
      { property: "og:title", content: "Billing statement detail — DPC POS" },
      {
        property: "og:description",
        content: "Statement of account, balances and payment history.",
      },
    ],
  }),
  component: BillingStatementDetailPage,
});

function BillingStatementDetailPage() {
  const { statementId } = Route.useParams();
  const { billingStatements, customerById, setBillingStatementStatus, recordBillingPayment } =
    useStore();
  const navigate = useNavigate();
  const statement = billingStatements.find((s) => s.id === statementId);
  const [editOpen, setEditOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [payReference, setPayReference] = useState("");

  if (!statement) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          title="Billing statement detail"
          description="Statement of account, balances and payment history."
        />
        <Panel>
          <EmptyState
            title="Billing statement not found"
            description={`No statement matches "${statementId}". It may have been removed from the store data.`}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: "/billing-statements" })}
              >
                Back to billing statements
              </Button>
            }
          />
        </Panel>
      </div>
    );
  }

  const customer = statement.customerId ? customerById(statement.customerId) : undefined;
  const days = daysUntil(statement.dueAt);
  const pastDue =
    (statement.status === "unpaid" || statement.status === "partially_paid") && days < 0;
  const displayStatus: BillingStatementStatus = pastDue ? "overdue" : statement.status;
  const canReceivePayment = ["draft", "pending", "unpaid", "partially_paid", "overdue"].includes(
    statement.status,
  );
  const additionalTotal = statement.additionalCharges.reduce((s, c) => s + c.amount, 0);

  const handleMarkStatus = (status: BillingStatementStatus) => {
    setBillingStatementStatus(statement.id, status);
    toast.success(`Statement ${statement.id} marked ${titleCase(status)}`);
  };

  const handleRecordPayment = () => {
    const amount = Number(payAmount) || 0;
    if (amount <= 0) {
      toast.error("Enter a payment amount greater than zero.");
      return;
    }
    const reference = payReference.trim();
    recordBillingPayment(
      statement.id,
      reference ? { method: payMethod, amount, reference } : { method: payMethod, amount },
    );
    toast.success(`Payment of ${money(amount)} recorded on ${statement.id}`);
    setPayOpen(false);
    setPayAmount("");
    setPayReference("");
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={<span className="mono">{statement.id}</span>}
        status={<BillingStatusBadge statement={{ ...statement, status: displayStatus }} />}
        description={
          <span>
            {statement.customerId ? (
              <IdLink to="/customers/$customerId" params={{ customerId: statement.customerId }}>
                {statement.customerName}
              </IdLink>
            ) : (
              statement.customerName
            )}{" "}
            · {customerTypeLabel(statement.customerType)} · issued {dateShort(statement.issuedAt)}
          </span>
        }
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setPdfOpen(true)}>
              <FileText className="size-3.5" /> View PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" /> Edit
            </Button>
            {canReceivePayment && (
              <Button
                size="sm"
                onClick={() => {
                  setPayAmount(statement.balance ? String(statement.balance) : "");
                  setPayMethod("cash");
                  setPayReference("");
                  setPayOpen(true);
                }}
              >
                <HandCoins className="size-3.5" /> Record payment
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>
          Due <span className="mono">{dateShort(statement.dueAt)}</span>
          {days < 0 ? ` — ${Math.abs(days)}d overdue` : days <= 7 ? ` — ${days}d left` : ""}
        </span>
        {statement.referenceNumber && (
          <span>
            Reference <span className="mono">{statement.referenceNumber}</span>
          </span>
        )}
        {statement.salesRep && <span>Sales rep: {statement.salesRep}</span>}
        <span>Prepared by {statement.preparedBy}</span>
      </div>

      <DocumentPreview
        kind="Billing Statement"
        reference={statement.id}
        issuedAt={statement.issuedAt}
        status={displayStatus}
        party={{
          title: "Billed to",
          name: statement.customerName,
          lines: [
            customerTypeLabel(statement.customerType),
            customer?.address,
            customer?.phone,
            customer?.email,
          ],
        }}
        lines={statement.items.map((i) => ({
          description: i.name,
          sku: i.sku,
          qty: i.qty,
          unitPrice: i.unitPrice,
        }))}
        totals={[
          { label: "Subtotal", value: statement.subtotal },
          { label: "Discount", value: -statement.discount },
          ...(additionalTotal ? [{ label: "Additional charges", value: additionalTotal }] : []),
          {
            label:
              statement.taxSetting === "vat"
                ? "VAT (12%)"
                : statement.taxSetting === "non-vat"
                  ? "Non-VAT"
                  : "Tax exempt",
            value: statement.tax,
          },
          ...(statement.previousBalance
            ? [{ label: "Previous balance", value: statement.previousBalance }]
            : []),
          { label: "Total amount", value: statement.total, strong: true },
          { label: "Amount paid", value: -statement.amountPaid },
          { label: "Balance due", value: statement.balance, strong: true },
        ]}
        footer={
          <div className="space-y-1">
            {statement.notes && <p>Notes: {statement.notes}</p>}
            <p>
              Prepared by {statement.preparedBy}
              {statement.salesRep ? ` · Sales rep ${statement.salesRep}` : ""}
            </p>
          </div>
        }
      />

      {/* payment history */}
      <Panel>
        <PanelHeader
          title="Payment history"
          hint={`${statement.payments.length} payment${statement.payments.length !== 1 ? "s" : ""}`}
        />
        {statement.payments.length === 0 ? (
          <div className="p-4 sm:p-5">
            <p className="text-xs text-muted-foreground">
              No payments recorded yet. Use “Record payment” to apply a payment to this statement.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[...statement.payments].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 sm:px-5">
                <div>
                  <p className="text-xs font-medium">
                    {money(p.amount)}
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                      {titleCase(p.method)}
                    </span>
                  </p>
                  <p className="mono mt-0.5 text-[10.5px] text-muted-foreground">
                    {dateTime(p.at)}
                    {p.reference ? ` · ${p.reference}` : ""}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                  Payment
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="flex flex-wrap gap-2">
        {statement.status === "draft" && (
          <Button size="sm" variant="outline" onClick={() => handleMarkStatus("pending")}>
            Mark pending
          </Button>
        )}
        {(statement.status === "draft" || statement.status === "pending") && (
          <Button size="sm" variant="outline" onClick={() => handleMarkStatus("unpaid")}>
            Mark unpaid
          </Button>
        )}
        {["draft", "pending", "unpaid"].includes(statement.status) && (
          <Button size="sm" variant="ghost" onClick={() => handleMarkStatus("cancelled")}>
            Cancel
          </Button>
        )}
        {statement.status !== "cancelled" && statement.status !== "voided" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                Void
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Void {statement.id}?</AlertDialogTitle>
                <AlertDialogDescription>
                  The statement will be marked voided and can no longer receive payments. This
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep statement</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleMarkStatus("voided")}>
                  Void statement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <BillingEditorDialog open={editOpen} onOpenChange={setEditOpen} statementId={statement.id} />

      <BillingPdfDialog
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        statement={statement}
        customer={customer}
      />

      {/* record payment dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record payment on {statement.id}</DialogTitle>
            <DialogDescription>
              Apply a payment to this statement. The balance updates automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-surface/40 p-3">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-muted-foreground">Total amount</dt>
                <dd className="mono font-medium text-right">{money(statement.total)}</dd>
                <dt className="text-muted-foreground">Amount paid</dt>
                <dd className="mono text-right">{money(statement.amountPaid)}</dd>
                <dt className="text-muted-foreground">Balance</dt>
                <dd className="mono font-medium text-right">{money(statement.balance)}</dd>
              </dl>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pay-amount" className="label-tech">
                Payment amount (₱)
              </label>
              <Input
                id="pay-amount"
                type="number"
                min={0.01}
                max={statement.balance}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
                className="h-9"
              />
              {Number(payAmount) >= statement.balance && statement.balance > 0 && (
                <p className="text-[11px] font-medium text-green-600 dark:text-green-400">
                  ✓ Full payment — statement will be marked paid
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pay-method" className="label-tech">
                Payment method
              </label>
              <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
                <SelectTrigger id="pay-method" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <span className="flex items-center gap-1.5">
                      <Banknote className="size-3.5" /> Cash
                    </span>
                  </SelectItem>
                  <SelectItem value="gcash">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="size-3.5" /> GCash
                    </span>
                  </SelectItem>
                  <SelectItem value="bank">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="size-3.5" /> Bank transfer
                    </span>
                  </SelectItem>
                  <SelectItem value="card">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="size-3.5" /> Credit / Debit card
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pay-ref" className="label-tech">
                Reference (optional)
              </label>
              <Input
                id="pay-ref"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                placeholder="OR no. / transaction reference"
                className="h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!Number(payAmount) || Number(payAmount) <= 0}
              onClick={handleRecordPayment}
            >
              Record payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
