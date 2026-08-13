import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateTime } from "@/lib/format";
import type { TimelineEvent } from "@/lib/types";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-0">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <li key={`${e.label}-${i}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  e.state === "done" && "border-success/40 bg-success/15 text-success",
                  e.state === "active" && "border-info/50 bg-info/15 text-info",
                  e.state === "pending" && "border-border bg-elevated text-subtle",
                )}
              >
                {e.state === "done" ? (
                  <Check className="size-3" />
                ) : e.state === "active" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Circle className="size-2" />
                )}
              </span>
              {!last && (
                <span
                  className={cn(
                    "w-px flex-1",
                    e.state === "done" ? "bg-success/25" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className={cn("min-w-0 pb-4", last && "pb-0")}>
              <p
                className={cn(
                  "text-[13px]",
                  e.state === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {e.label}
              </p>
              <p className="mono mt-0.5 text-[11px] text-subtle">
                {e.at ? dateTime(e.at) : "—"}
                {e.actor ? ` · ${e.actor}` : ""}
              </p>
              {e.note && <p className="mt-1 text-xs text-muted-foreground">{e.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
