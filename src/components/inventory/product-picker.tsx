import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { Product } from "@/lib/types";

function Thumb({ product, size = "size-7" }: { product: Product; size?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted/40",
        size,
      )}
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt="" className="h-full w-full object-contain" />
      ) : (
        <span className="text-[8px] text-muted-foreground/50">N/A</span>
      )}
    </span>
  );
}

/** Searchable product combobox — matches name, SKU or id while you type. */
export function ProductPicker({
  products,
  value,
  onChange,
  placeholder = "Select a product…",
  invalid,
}: {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = products.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 w-full justify-between px-3 font-normal",
            invalid && "border-destructive focus-visible:ring-destructive",
          )}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <Thumb product={selected} />
              <span className="truncate">{selected.name}</span>
              {selected.sku && (
                <span className="mono shrink-0 text-[11px] text-muted-foreground">
                  {selected.sku}
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command
          filter={(itemValue, search) => {
            const needle = search.trim().toLowerCase();
            if (!needle) return 1;
            return itemValue.toLowerCase().includes(needle) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Type a name, SKU or id…" />
          <CommandEmpty>No product found.</CommandEmpty>
          <CommandList className="max-h-64">
            {products.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.name} ${p.sku} ${p.id}`}
                onSelect={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                className="gap-2"
              >
                <Thumb product={p} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">{p.name}</span>
                  <span className="mono block truncate text-[11px] text-muted-foreground">
                    {p.sku || p.id}
                  </span>
                </span>
                {p.id === value && <Check className="ml-auto size-4 shrink-0" />}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
