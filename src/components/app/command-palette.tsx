import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileText, LayoutDashboard, Receipt } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const store = useStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  const q = query.trim().toLowerCase();
  const matchedOrders = q
    ? store.orders
        .filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
        .slice(0, 4)
    : [];
  const matchedQuotes = q
    ? store.quotes
        .filter((qt) => qt.id.toLowerCase().includes(q) || qt.customerName.toLowerCase().includes(q))
        .slice(0, 4)
    : [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search or run a command — orders, quotations…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]" data-lenis-prevent>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/quotes?new=1")}>
            <FileText /> New Quotation
          </CommandItem>
        </CommandGroup>

        {matchedOrders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Orders">
              {matchedOrders.map((o) => (
                <CommandItem
                  key={o.id}
                  value={`order-${o.id}-${o.customerName}`}
                  onSelect={() => go(`/orders/${o.id}`)}
                >
                  <Receipt />
                  <span className="mono">{o.id}</span>
                  <span className="flex-1 truncate text-muted-foreground">{o.customerName}</span>
                  <span className="mono text-[11px]">{money(o.total)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedQuotes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quotations">
              {matchedQuotes.map((qt) => (
                <CommandItem
                  key={qt.id}
                  value={`quote-${qt.id}-${qt.customerName}`}
                  onSelect={() => go(`/quotes/${qt.id}`)}
                >
                  <FileText />
                  <span className="mono">{qt.id}</span>
                  <span className="flex-1 truncate text-muted-foreground">{qt.customerName}</span>
                  <span className="mono text-[11px]">{money(qt.total)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/orders")}>
            <Receipt /> Orders
          </CommandItem>
          <CommandItem onSelect={() => go("/quotes")}>
            <FileText /> Quotation
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
