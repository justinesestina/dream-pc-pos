import { cn } from "@/lib/utils";

/** Company logo from /public — Dream PC Build & IT Solutions. */
export function DreamLogo({ className }: { className?: string }) {
  return (
    <img
      src="/dpc-logo.png"
      alt="Dream PC Build & IT Solutions"
      draggable={false}
      className={cn("shrink-0 object-contain select-none bg-white p-1", className)}
    />
  );
}

/** Minimal DPC monogram — technical mark, no gaming aesthetics. */
export function NexusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
      fill="none"
    >
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="7"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M10 9.5h5.4c3.9 0 6.6 2.6 6.6 6.5s-2.7 6.5-6.6 6.5H10V9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="15.4" cy="16" r="1.9" fill="currentColor" />
      <path d="M22 16h5" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M5 16h5" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
    </svg>
  );
}

export function NexusWordmark({
  className,
  showSubtitle = true,
}: {
  className?: string;
  showSubtitle?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <DreamLogo className="size-8 rounded-md" />
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-tight">
          DPC <span className="text-muted-foreground">POS</span>
        </div>
        {showSubtitle && (
          <div className="mono mt-1 text-[10px] tracking-[0.14em] text-subtle uppercase">
            PC Retail &amp; Operations
          </div>
        )}
      </div>
    </div>
  );
}
