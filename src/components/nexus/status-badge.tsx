import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/format";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "active";

const toneClass: Record<Tone, string> = {
  neutral: "border-border bg-elevated text-muted-foreground",
  info: "border-info/30 bg-info/10 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-destructive/35 bg-destructive/10 text-destructive",
  active: "border-border-strong bg-foreground/10 text-foreground",
};

const map: Record<string, Tone> = {
  // orders
  pending: "warning",
  paid: "info",
  processing: "info",
  assembly: "info",
  testing: "info",
  ready: "success",
  completed: "success",
  cancelled: "neutral",
  refunded: "danger",
  // quotes
  draft: "neutral",
  sent: "info",
  approved: "success",
  rejected: "danger",
  expired: "neutral",
  converted: "active",
  // builds
  consultation: "neutral",
  quoted: "info",
  parts_reserved: "info",
  released: "active",
  // services (intake "received" is overridden to neutral where shown)
  diagnosing: "info",
  waiting_customer: "warning",
  waiting_parts: "warning",
  in_repair: "info",
  // warranty / stock
  active: "success",
  expiring: "warning",
  void: "danger",
  in_stock: "success",
  reserved: "warning",
  installed: "info",
  sold: "neutral",
  rma: "danger",
  low_stock: "warning",
  out_of_stock: "danger",
  // claims
  open: "warning",
  in_review: "info",
  closed: "neutral",
  pass: "success",
  fail: "danger",
  // returns
  requested: "warning",
  inspection: "info",
  replaced: "info",
  // consultations
  new: "neutral",
  requirements: "info",
  recommended: "warning",
  won: "success",
  lost: "neutral",
  // purchasing
  submitted: "info",
  confirmed: "info",
  partial: "warning",
  received: "success",
  // receiving
  in_progress: "info",
  discrepancy: "danger",
  // releases
  scheduled: "info",
  // staff
  available: "success",
  busy: "warning",
  off: "neutral",
  inactive: "neutral",
  // tasks
  todo: "neutral",
  blocked: "danger",
  done: "success",
};

export function StatusBadge({
  status,
  label,
  tone,
  className,
}: {
  status: string;
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  const t = tone ?? map[status] ?? "neutral";
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10.5px] tracking-wide whitespace-nowrap uppercase",
        toneClass[t],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {label ?? titleCase(status)}
    </span>
  );
}
