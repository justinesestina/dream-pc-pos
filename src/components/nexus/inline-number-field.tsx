import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Always-on inline numeric editor: input + save icon stay mounted in every
 * row state, so the cell's width never changes and the table never reflows.
 * The save icon only lights up (and becomes clickable) once the value differs
 * from what's saved.
 */
export function InlineNumberField({
  value,
  onSave,
  step = 1,
  width = "w-20",
  align = "center",
  prefix,
  disabled = false,
}: {
  value: number;
  onSave: (next: number) => void;
  step?: number;
  width?: string;
  align?: "left" | "center" | "right";
  prefix?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const parsed = Number(draft);
  const dirty =
    draft.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 && parsed !== value && !disabled;

  const save = () => {
    if (!dirty) return;
    onSave(parsed);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        align === "left" && "justify-start",
      )}
    >
      {prefix ? <span className="mono text-[11px] text-subtle">{prefix}</span> : null}
      <Input
        type="number"
        min="0"
        step={step}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          else if (e.key === "Escape") setDraft(String(value));
        }}
        onClick={(e) => e.stopPropagation()}
        className={cn("h-7 text-xs text-right", width)}
      />
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0"
        disabled={!dirty}
        onClick={(e) => {
          e.stopPropagation();
          save();
        }}
      >
        <Check className={cn("size-3.5", dirty ? "text-green-500" : "text-muted-foreground/30")} />
      </Button>
    </div>
  );
}
