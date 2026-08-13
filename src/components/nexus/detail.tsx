import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Panel, PanelHeader } from "./primitives";

/** Label/value pair used across every detail page. */
export function KeyValue({
  label,
  value,
  className,
  mono,
}: {
  label: string;
  value: ReactNode;
  className?: string | undefined;
  mono?: boolean | undefined;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="label-tech">{label}</p>
      <div className={cn("mt-1 truncate text-[13px] text-foreground", mono && "mono text-xs")}>
        {value ?? "—"}
      </div>
    </div>
  );
}

export function KeyValueGrid({
  items,
  cols = 3,
  className,
}: {
  items: { label: string; value: ReactNode; mono?: boolean | undefined }[];
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 p-4",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((i) => (
        <KeyValue key={i.label} label={i.label} value={i.value} mono={i.mono} />
      ))}
    </div>
  );
}

/** Panel + header wrapper for detail sections. */
export function Section({
  title,
  hint,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Panel className={className}>
      <PanelHeader title={title} hint={hint} action={action} />
      <div className={bodyClassName}>{children}</div>
    </Panel>
  );
}

/** Right-aligned money summary rows (subtotal / VAT / total). */
export function TotalsRows({
  rows,
  className,
}: {
  rows: { label: string; value: ReactNode; strong?: boolean; muted?: boolean }[];
  className?: string;
}) {
  return (
    <dl className={cn("space-y-1.5 text-[13px]", className)}>
      {rows.map((r) => (
        <div
          key={r.label}
          className={cn(
            "flex items-baseline justify-between gap-6",
            r.strong && "border-t border-border pt-2 text-[15px] font-semibold text-foreground",
          )}
        >
          <dt className={cn(r.strong ? "" : "text-muted-foreground", r.muted && "text-subtle")}>
            {r.label}
          </dt>
          <dd className={cn("mono tabular-nums", r.strong ? "" : "text-foreground")}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Demo-scope disclaimer, used wherever a workflow is simulated. */
export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md border border-warning/25 bg-warning/5 px-3 py-2 text-[11.5px] text-muted-foreground",
        className,
      )}
    >
      <span className="mono shrink-0 text-[10px] tracking-wide text-warning">DEMO</span>
      <span>{children}</span>
    </p>
  );
}

/** Thin progress bar with an optional label. */
export function ProgressBar({
  value,
  className,
  tone = "info",
}: {
  value: number;
  className?: string;
  tone?: "info" | "success" | "warning";
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-elevated", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "info" && "bg-info",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning",
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
