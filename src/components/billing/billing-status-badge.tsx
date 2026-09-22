import { StatusBadge } from "@/components/nexus/status-badge";
import type { BillingStatement } from "@/lib/types";

const BILLING_TONES: Record<
  BillingStatement["status"],
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  draft: "neutral",
  pending: "info",
  unpaid: "warning",
  partially_paid: "warning",
  paid: "success",
  overdue: "danger",
  cancelled: "neutral",
  voided: "danger",
};

/** Status badge honoring the Billing Statement color guide. */
export function BillingStatusBadge({ statement }: { statement: BillingStatement }) {
  return <StatusBadge status={statement.status} tone={BILLING_TONES[statement.status]} />;
}
