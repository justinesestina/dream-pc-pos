import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  BarChart3,
  Boxes,
  Cpu,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  Receipt,
  Settings,
  ShoppingCart,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
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
  const matchedProducts = q
    ? store.products
        .filter(
          (p) =>
            !p.archived &&
            (p.name.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              store.categoryNameOf(p.categoryId).toLowerCase().includes(q)),
        )
        .slice(0, 5)
    : [];
  const matchedOrders = q
    ? store.orders
        .filter(
          (o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q),
        )
        .slice(0, 4)
    : [];
  const matchedCustomers = q
    ? store.customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const matchedSerials = q
    ? store.serials.filter((s) => s.serial.toLowerCase().includes(q)).slice(0, 3)
    : [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search or run a command — products, SKU, serial, orders, customers…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/pos")}>
            <Plus /> New Sale <CommandShortcut>F1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/quotes")}>
            <FileText /> New Quote
          </CommandItem>
          <CommandItem onSelect={() => go("/consultations?new=1")}>
            <Cpu /> New Custom Build Consultation
          </CommandItem>
          <CommandItem onSelect={() => go("/customers?new=1")}>
            <UserPlus /> New Customer
          </CommandItem>
          <CommandItem onSelect={() => go("/services?new=1")}>
            <Wrench /> New Service Ticket
          </CommandItem>
          <CommandItem onSelect={() => go("/products?new=1")}>
            <Package /> New Product
          </CommandItem>
        </CommandGroup>

        {matchedProducts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Products">
              {matchedProducts.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`product-${p.sku}-${p.name}`}
                  onSelect={() => go(`/products/${p.id}`)}
                >
                  <Package />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="mono text-[11px] text-subtle">{p.sku}</span>
                  <span className="mono text-[11px] text-muted-foreground">
                    {money(p.price)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

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

        {matchedCustomers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Customers">
              {matchedCustomers.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`customer-${c.name}`}
                  onSelect={() => go(`/customers/${c.id}`)}
                >
                  <Users />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="mono text-[11px] text-subtle">{c.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedSerials.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Serial numbers">
              {matchedSerials.map((s) => (
                <CommandItem
                  key={s.id}
                  value={`serial-${s.serial}`}
                  onSelect={() => go(`/products/${s.productId}`)}
                >
                  <Boxes />
                  <span className="mono flex-1">{s.serial}</span>
                  <span className="mono text-[11px] text-subtle uppercase">{s.status}</span>
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
          <CommandItem onSelect={() => go("/pos")}>
            <ShoppingCart /> Point of Sale
          </CommandItem>
          <CommandItem onSelect={() => go("/orders")}>
            <Receipt /> Orders
          </CommandItem>
          <CommandItem onSelect={() => go("/quotes")}>
            <FileText /> Quotes
          </CommandItem>
          <CommandItem onSelect={() => go("/inventory")}>
            <Boxes /> Inventory
          </CommandItem>
          <CommandItem onSelect={() => go("/builds")}>
            <Cpu /> Custom Builds
          </CommandItem>
          <CommandItem onSelect={() => go("/services")}>
            <Wrench /> Services
          </CommandItem>
          <CommandItem onSelect={() => go("/warranty")}>
            <BadgeCheck /> Warranty Center
          </CommandItem>
          <CommandItem onSelect={() => go("/reports")}>
            <BarChart3 /> Reports
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
