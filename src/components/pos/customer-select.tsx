import { useState } from "react";
import { Check, ChevronDown, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Attach a customer to the current transaction (walk-in by default). */
export function CustomerSelect({ compact }: { compact?: boolean }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const selected = store.customerById(store.cartCustomerId);

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className={cn("h-8 min-w-0 flex-1 justify-between text-[13px]", compact && "h-7")}
          >
            <span className="flex min-w-0 items-center gap-2">
              <UserPlus className="size-3.5 shrink-0 text-subtle" />
              <span className="truncate">{selected?.name ?? "Walk-in customer"}</span>
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-subtle" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <Command>
            <CommandInput placeholder="Search customers…" className="text-[13px]" />
            <CommandList>
              <CommandEmpty>No customer found.</CommandEmpty>
              <CommandGroup>
                {store.customers.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`${c.name} ${c.email} ${c.phone}`}
                    onSelect={() => {
                      store.setCartCustomer(c.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "size-3.5",
                        store.cartCustomerId === c.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px]">{c.name}</span>
                      <span className="mono block truncate text-[10.5px] text-subtle">
                        {c.phone}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0"
          aria-label="Clear customer"
          onClick={() => store.setCartCustomer(null)}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
