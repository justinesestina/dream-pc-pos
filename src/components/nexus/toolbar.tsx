import { type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { titleCase } from "@/lib/format";

/** Filter/search bar used above every list surface. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
} & Record<string, unknown>) {
  return (
    <div className={cn("relative min-w-0 flex-1 sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 pr-7 pl-8 text-[13px]"
        {...rest}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-subtle transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** Compact select used for status/category filters. `all` is always first. */
export function FilterSelect({
  value,
  onChange,
  options,
  label,
  allLabel = "All",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
  allLabel?: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-8 w-auto min-w-[7.5rem] gap-2 text-[13px]", className)}
      >
        <span className="label-tech shrink-0">{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {titleCase(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Small segmented control for view switching. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-md border border-border bg-elevated p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded px-2.5 py-1 text-xs transition-colors",
            value === o.value
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ResultCount({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <span className="mono ml-auto text-[11px] text-subtle">
      {shown === total ? `${total} ${noun}` : `${shown} / ${total} ${noun}`}
    </span>
  );
}
