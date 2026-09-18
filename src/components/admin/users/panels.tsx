import type { ReactNode } from "react";

/** Bordered card with a title/description used inside form and detail pages. */
export function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
