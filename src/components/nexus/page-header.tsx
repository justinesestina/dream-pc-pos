import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  status,
  actions,
  meta,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between", className)}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[21px] leading-tight font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {status}
        </div>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
        )}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
