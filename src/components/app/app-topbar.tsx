import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Command, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NexusWordmark } from "@/components/brand/nexus-logo";
import { navGroups } from "./nav-config";
import { UserMenu } from "./app-sidebar";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { relative } from "@/lib/format";

function useCrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);
  const all = navGroups.flatMap((g) => g.items);
  const root = all.find((i) => i.to === `/${segments[0] ?? ""}`);
  const title = root?.label ?? "Dashboard";
  const detail = segments.length > 1 ? decodeURIComponent(segments[1] ?? "") : null;
  return { title, detail, rootTo: root?.to ?? "/dashboard" };
}

export function AppTopbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const store = useStore();
  const { title, detail, rootTo } = useCrumbs();
  const [mobileNav, setMobileNav] = useState(false);
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
              return (
                <div key={g.label} className="mb-4">
                  <p className="label-tech px-2 pb-1.5">{g.label}</p>
                  {items.map((i) => (
                    <Link
                      key={i.to}
                      to={i.to}
                      onClick={() => setMobileNav(false)}
                      className="flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    >
                      <i.icon className="size-4" />
                      {i.label}
                    </Link>
                  ))}
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
        <span className="flex-1 truncate">Search products, orders, serials…</span>
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
          <ScrollArea className="max-h-[320px]">
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
