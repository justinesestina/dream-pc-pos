import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, Command, Menu, Search, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NexusWordmark } from "@/components/brand/nexus-logo";
import { navGroups, flattenNav, isNavActive, type NavItem } from "./nav-config";
import { UserMenu } from "./app-sidebar";
import { useNavSections } from "./nav-sections";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { relative } from "@/lib/format";

function useCrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);
  const seg0 = `/${segments[0] ?? ""}`;
  const root = (() => {
    for (const g of navGroups) {
      for (const top of g.items) {
        const leaves = flattenNav(top);
        const leaf = leaves.find((l) => l.to === seg0);
        if (leaf) return { title: top.label, to: leaf.to ?? "/dashboard" };
      }
    }
    return null;
  })();
  const title = root?.title ?? "Dashboard";
  const detail = segments.length > 1 ? decodeURIComponent(segments[1] ?? "") : null;
  return { title, detail, rootTo: root?.to ?? "/dashboard" };
}

function SoonTag() {
  return (
    <span className="mono rounded border border-border bg-elevated px-1 py-px text-[9.5px] tracking-wide text-subtle uppercase">
      Soon
    </span>
  );
}

function MobileNavItem({
  item,
  pathname,
  onNavigate,
  depth = 0,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const active = isNavActive(item, pathname);
  const pad = { paddingLeft: `${8 + depth * 14}px` };
  const base =
    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] transition-colors hover:bg-sidebar-accent hover:text-foreground";
  const icon = item.icon ? (
    <item.icon className="size-4 shrink-0" />
  ) : (
    <span className="w-4 shrink-0" />
  );

  if (item.children?.length && !item.soon) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={cn(base, active && "bg-sidebar-accent text-sidebar-accent-foreground")}
          style={pad}
        >
          {icon}
          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 opacity-60 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {open && (
          <ul className="mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <MobileNavItem
                key={child.label}
                item={child}
                pathname={pathname}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (item.soon) {
    return (
      <div
        className={cn(base, "cursor-default text-muted-foreground/60 hover:bg-transparent")}
        style={pad}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <SoonTag />
      </div>
    );
  }

  return (
    <Link
      to={item.to as string}
      search={item.search as never}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        base,
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
      )}
      style={pad}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

export function AppTopbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const store = useStore();
  const { title, detail, rootTo } = useCrumbs();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNav, setMobileNav] = useState(false);
  const { isCollapsed, setCollapsed, toggle } = useNavSections();

  // Auto-expand the section that contains the active page.
  const activeSection = navGroups.find((g) => g.items.some((i) => isNavActive(i, pathname)))?.label;
  useEffect(() => {
    if (activeSection) setCollapsed(activeSection, false);
  }, [activeSection, setCollapsed]);
  const unread = store.notifications.filter((n) => !n.read).length;
  const role = store.user?.role ?? "owner";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-3 backdrop-blur-md print:hidden sm:px-4">
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Open navigation">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center border-b border-sidebar-border px-4">
            <NexusWordmark />
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)] px-2 py-3">
            {navGroups.map((g) => {
              const items = g.items.filter((i) => can(role, i.cap));
              if (!items.length) return null;
              const open = !isCollapsed(g.label);
              return (
                <div key={g.label} className="mb-4">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => toggle(g.label)}
                    className="label-tech flex w-full items-center justify-between gap-1 px-2 pt-0.5 pb-1.5 text-left transition-colors hover:text-foreground"
                  >
                    <span>{g.label}</span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 opacity-60 transition-transform duration-200",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-0.5">
                        {items.map((item) => (
                          <MobileNavItem
                            key={item.label}
                            item={item}
                            pathname={pathname}
                            onNavigate={() => setMobileNav(false)}
                          />
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
          <div className="border-t border-sidebar-border p-2">
            <UserMenu />
          </div>
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
          <Link to={rootTo} className="truncate font-medium text-foreground hover:underline">
            {title}
          </Link>
          {detail && (
            <>
              <span className="text-subtle">/</span>
              <span className="mono truncate text-xs text-muted-foreground">{detail}</span>
            </>
          )}
        </nav>
      </div>

      <button
        onClick={onOpenPalette}
        className="hidden h-8 w-64 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-border-strong md:flex xl:w-80"
      >
        <Search className="size-3.5" />
        <span className="flex-1 truncate">Search products, orders, customers…</span>
        <kbd className="mono rounded border border-border bg-elevated px-1 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      <Button
        size="icon"
        variant="ghost"
        className="md:hidden"
        aria-label="Open command palette"
        onClick={onOpenPalette}
      >
        <Command className="size-4" />
      </Button>

      <span className="mono hidden items-center gap-1.5 rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] tracking-wide text-warning uppercase sm:inline-flex">
        Demo mode
      </span>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => store.setTheme(store.theme === "dark" ? "light" : "dark")}
        title={`Switch to ${store.theme === "dark" ? "light" : "dark"} mode`}
        className="hidden sm:inline-flex"
      >
        {store.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost" className="relative" aria-label="Notifications">
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-info" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[340px] p-0">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-medium">Notifications</p>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => store.markAllNotificationsRead()}
            >
              Mark all read
            </Button>
          </div>
          <ScrollArea className="max-h-[320px]" data-lenis-prevent>
            <ul className="divide-y divide-border">
              {store.notifications.slice(0, 8).map((n) => (
                <li key={n.id} className="flex gap-2.5 px-3 py-2.5">
                  <span
                    className={cn(
                      "mt-1 size-1.5 shrink-0 rounded-full",
                      n.priority === "critical"
                        ? "bg-destructive"
                        : n.priority === "high"
                          ? "bg-warning"
                          : "bg-info",
                      n.read && "opacity-30",
                    )}
                  />
                  <div className="min-w-0">
                    <p className={cn("text-[13px]", n.read && "text-muted-foreground")}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mono mt-1 text-[10.5px] text-subtle">{relative(n.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <div className="hidden lg:block">
        <div className="w-9">
          <UserMenu collapsed />
        </div>
      </div>
    </header>
  );
}
