import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  FileText,
  LayoutDashboard,
  Receipt,
  Search as SearchIcon,
  ShoppingBag,
  User,
  Users,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { searchBackendGlobal, type GlobalSearchResult } from "@/lib/api-client";
import { navGroups, type NavItem } from "@/components/app/nav-config";
import { can } from "@/lib/permissions";
import type { Role } from "@/lib/types";

interface PaletteEntry {
  group: string;
  label: string;
  route: string;
  icon: LucideIcon;
  /** Not built yet — listed for discoverability but not navigable. */
  soon?: boolean;
}

/** Flatten the sidebar nav into searchable entries, keeping group + icon. */
function collectNav(role: Role): PaletteEntry[] {
  const out: PaletteEntry[] = [];
  const walk = (items: NavItem[], group: string, inherited?: LucideIcon) => {
    for (const item of items) {
      if (!can(role, item.cap)) continue;
      const icon = item.icon ?? inherited ?? SearchIcon;
      if (item.soon) {
        out.push({ group, label: item.label, route: "", icon, soon: true });
        continue;
      }
      if (item.to && !item.children?.length) {
        const qs = item.search
          ? `?${new URLSearchParams(item.search as Record<string, string>).toString()}`
          : "";
        out.push({ group, label: item.label, route: `${item.to}${qs}`, icon });
      }
      if (item.children) walk(item.children, group, icon);
    }
  };
  for (const group of navGroups) walk(group.items, group.label);
  return out;
}

const ACTIONS: PaletteEntry[] = [
  { group: "Actions", label: "New Quotation", route: "/quotes?new=1", icon: FileText },
  {
    group: "Actions",
    label: "New Billing Statement",
    route: "/billing-statements?new=1",
    icon: FileText,
  },
];

function ResultIcon({ item }: { item: GlobalSearchResult }) {
  const Icon =
    item.type === "products"
      ? ShoppingBag
      : item.type === "customers"
        ? Users
        : item.type === "users"
          ? User
          : item.type === "projects"
            ? FolderKanban
            : item.type === "dashboard"
              ? LayoutDashboard
              : SearchIcon;
  if (item.imageUrl) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted/40">
        <img src={item.imageUrl} alt="" className="h-full w-full object-contain" />
      </span>
    );
  }
  return <Icon className="size-4" />;
}

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
  const [searching, setSearching] = useState(false);
  const [remoteResults, setRemoteResults] = useState<GlobalSearchResult[]>([]);

  const role = store.user?.role ?? "owner";
  const navEntries = useMemo(() => collectNav(role), [role]);
  const navByGroup = useMemo(() => {
    const map = new Map<string, PaletteEntry[]>();
    for (const entry of navEntries) {
      const list = map.get(entry.group) ?? [];
      list.push(entry);
      map.set(entry.group, list);
    }
    return [...map.entries()];
  }, [navEntries]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearching(false);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setRemoteResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      void searchBackendGlobal(q)
        .then((results) => {
          if (!cancelled) setRemoteResults(results.slice(0, 10));
        })
        .catch(() => {
          if (!cancelled) setRemoteResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

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
        .filter(
          (qt) => qt.id.toLowerCase().includes(q) || qt.customerName.toLowerCase().includes(q),
        )
        .slice(0, 4)
    : [];

  const summaryResults = useMemo(() => {
    if (!q) return [];
    const byKey = new Set<string>();
    return remoteResults.filter((item) => {
      const key = `${item.type}:${item.id}`;
      if (byKey.has(key)) return false;
      byKey.add(key);
      return true;
    });
  }, [q, remoteResults]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search products, orders, warehouses or pages…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]" data-lenis-prevent>
        {!searching && <CommandEmpty>No results found.</CommandEmpty>}

        <CommandGroup heading="Actions">
          {ACTIONS.map((action) => (
            <CommandItem
              key={action.label}
              value={`${action.group} ${action.label}`}
              onSelect={() => go(action.route)}
            >
              <action.icon className="size-4" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {searching && (
          <div className="p-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Results</div>
            <div className="space-y-2 px-2 pb-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="size-7 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searching && summaryResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Results">
              {summaryResults.map((item) => (
                <CommandItem
                  key={`${item.type}:${item.id}`}
                  value={`${item.type}-${item.id}-${item.label}-${item.subtitle}`}
                  onSelect={() => go(item.route)}
                >
                  <ResultIcon item={item} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.label}</div>
                    <div className="truncate text-xs text-muted-foreground">{item.subtitle}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!searching && matchedOrders.length > 0 && (
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

        {!searching && matchedQuotes.length > 0 && (
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

        {navByGroup.map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((entry) => (
              <CommandItem
                key={`${group}:${entry.label}:${entry.route}`}
                value={`${group} ${entry.label}`}
                disabled={Boolean(entry.soon)}
                onSelect={() => {
                  if (!entry.soon) go(entry.route);
                }}
              >
                <entry.icon className="size-4" />
                <span className="flex-1">{entry.label}</span>
                {entry.soon && (
                  <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Soon
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
