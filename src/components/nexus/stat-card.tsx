import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Animated count-up for numeric KPIs. Respects reduced-motion. */
function useCountUp(target: number, duration = 520) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const startVal = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(startVal + (target - startVal) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function StatCard({
  label,
  value,
  numericValue,
  format,
  delta,
  hint,
  accent = "neutral",
  icon: Icon,
  footer,
  className,
}: {
  label: string;
  value?: ReactNode;
  numericValue?: number;
  format?: (n: number) => string;
  delta?: number;
  hint?: string;
  accent?: "neutral" | "info" | "success" | "warning" | "danger";
  icon?: React.ComponentType<{ className?: string }>;
  footer?: ReactNode;
  className?: string;
}) {
  const animated = useCountUp(numericValue ?? 0);
  const display =
    numericValue !== undefined ? (format ? format(animated) : Math.round(animated)) : value;

  const accentLine = {
    neutral: "bg-border-strong",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  }[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong",
        className,
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-px opacity-60", accentLine)} />
      <div className="flex items-start justify-between gap-2">
        <p className="label-tech">{label}</p>
        {Icon ? (
          <span className="flex size-6 shrink-0 items-center justify-center rounded border border-border bg-elevated text-muted-foreground transition-colors group-hover:text-foreground">
            <Icon className="size-3.5" />
          </span>
        ) : delta !== undefined ? (
          <span
            className={cn(
              "mono inline-flex items-center gap-0.5 text-[11px]",
              delta >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {display}
      </p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      {footer}
    </div>
  );
}
