import type { ComponentProps, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------- panels */

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface/80 backdrop-blur-[1px]",
        className,
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  hint,
  action,
  className,
}: {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2.5",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium text-foreground">{title}</h2>
        {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </header>
  );
}

/* --------------------------------------------------------------- mono + ids */

export function Mono({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("mono text-xs text-muted-foreground", className)} {...props} />;
}

export function TechLabel({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("label-tech", className)} {...props} />;
}

type IdLinkProps = {
  children: ReactNode;
  className?: string;
  to: string;
  params?: Record<string, string>;
};

/** Cross-linked technical identifier (order, build, serial, ticket...). */
export function IdLink({ children, className, to, params }: IdLinkProps) {
  const LinkAny = Link as unknown as (props: {
    to: string;
    params?: Record<string, string> | undefined;
    className?: string | undefined;
    children: ReactNode;
  }) => ReactNode;
  return (
    <LinkAny
      to={to}
      params={params}
      className={cn(
        "mono text-xs text-info underline-offset-4 transition-colors hover:underline",
        className,
      )}
    >
      {children}
    </LinkAny>
  );
}


/* ------------------------------------------------------------------- states */

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: typeof Inbox;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-md border border-border bg-elevated text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong.",
  description = "We couldn't load this data.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}

export function RowsSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-3.5 w-28 bg-elevated" />
          <Skeleton className="h-3.5 flex-1 bg-elevated" />
          <Skeleton className="h-3.5 w-16 bg-elevated" />
          <Skeleton className="h-3.5 w-20 bg-elevated" />
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-4">
          <Skeleton className="h-3 w-20 bg-elevated" />
          <Skeleton className="mt-3 h-6 w-28 bg-elevated" />
          <Skeleton className="mt-3 h-3 w-16 bg-elevated" />
        </div>
      ))}
    </div>
  );
}
