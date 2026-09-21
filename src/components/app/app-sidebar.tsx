import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NexusWordmark } from "@/components/brand/nexus-logo";
import { navGroups, isNavActive, type NavItem } from "./nav-config";
import { AdminNavPanel } from "./admin-nav";
import { useNavSections } from "./nav-sections";
import { useStore } from "@/lib/store";
import { can, roleLabels } from "@/lib/permissions";
import { UserAvatar } from "@/components/admin/users/user-bits";

const rowBase =
  "group relative flex items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] transition-colors";

function rowCls(active: boolean, collapsed: boolean) {
  return cn(
    rowBase,
    collapsed && "justify-center px-0",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
  );
}

function ActiveBar({ active }: { active: boolean }) {
  if (!active) return null;
  return <span className="absolute top-1.5 bottom-1.5 -left-2 w-[2px] rounded-full bg-info" />;
}

function SoonTag() {
  return (
    <span className="mono rounded border border-border bg-elevated px-1 py-px text-[9.5px] tracking-wide text-subtle uppercase">
      Soon
    </span>
  );
}

/** Flyout panel listing an item's children; supports unlimited nesting. */
function Flyout({
  items,
  pathname,
  search,
  nested,
  onPointerEnter,
  onPointerLeave,
}: {
  items: NavItem[];
  pathname: string;
  search: Record<string, unknown>;
  nested?: boolean | undefined;
  onPointerEnter?: (() => void) | undefined;
  onPointerLeave?: (() => void) | undefined;
}) {
  const body = items.map((child) => {
    if (child.children?.length) {
      return (
        <DropdownMenuSub key={child.label}>
          <DropdownMenuSubTrigger className="gap-2 py-1.5 pr-1 text-[13px]">
            <span className="flex-1 truncate">{child.label}</span>
          </DropdownMenuSubTrigger>
          <Flyout
            items={child.children}
            pathname={pathname}
            search={search}
            nested
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
          />
        </DropdownMenuSub>
      );
    }
    if (child.soon) {
      return (
        <DropdownMenuItem key={child.label} disabled className="gap-2 py-1.5 text-[13px]">
          <span className="flex-1 truncate">{child.label}</span>
          <SoonTag />
        </DropdownMenuItem>
      );
    }
    const active = child.to ? isNavActive(child, pathname, search) : false;
    return (
      <DropdownMenuItem
        asChild
        key={`${child.label}-${String(child.to ?? "")}-${JSON.stringify(child.search ?? {})}`}
        className={cn(
          "gap-2 py-1.5 text-[13px]",
          active && "bg-sidebar-accent/60 font-medium text-foreground",
        )}
      >
        <Link to={child.to ?? ""} search={child.search as never}>
          {child.label}
        </Link>
      </DropdownMenuItem>
    );
  });

  const className = "min-w-52 p-1.5";
  return nested ? (
    <DropdownMenuSubContent
      sideOffset={6}
      className={className}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {body}
    </DropdownMenuSubContent>
  ) : (
    <DropdownMenuContent
      side="right"
      align="start"
      sideOffset={6}
      className={className}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {body}
    </DropdownMenuContent>
  );
}

/**
 * Sidebar row that owns sub-items. Hybrid interaction: hovering previews the
 * flyout, and clicking pins it open so it stays after the pointer leaves.
 * Exactly one such flyout is shown per sidebar at a time (the sidebar owns the
 * shared selection state).
 */
function NavFlyout({
  id,
  item,
  pathname,
  search,
  collapsed,
  open,
  onRequestOpen,
  onRequestClose,
  onTogglePin,
  onDismiss,
}: {
  id: string;
  item: NavItem;
  pathname: string;
  search: Record<string, unknown>;
  collapsed: boolean;
  open: boolean;
  onRequestOpen: () => void;
  onRequestClose: () => void;
  onTogglePin: () => void;
  onDismiss: () => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const openNow = () => {
    cancel();
    onRequestOpen();
  };
  const closeSoon = () => {
    cancel();
    timer.current = setTimeout(onRequestClose, 140);
  };
  useEffect(() => cancel, []);

  const active = isNavActive(item, pathname, search);
  const content = (
    <>
      <ActiveBar active={active} />
      {item.icon && <item.icon className="size-4 shrink-0" />}
      {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>}
      {!collapsed && (
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 opacity-60 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      )}
    </>
  );
  const handlers = {
    onPointerEnter: openNow,
    onPointerLeave: closeSoon,
  };

  return (
    <DropdownMenu
      modal={false}
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-current={active ? "page" : undefined}
          className={cn(rowCls(active, collapsed), "w-full")}
          {...handlers}
          onClick={(e) => {
            e.preventDefault();
            onTogglePin();
          }}
        >
          {content}
        </button>
      </DropdownMenuTrigger>
      {item.adminNav ? (
        <AdminNavPanel
          items={item.children ?? []}
          pathname={pathname}
          search={search}
          onPointerEnter={openNow}
          onPointerLeave={closeSoon}
        />
      ) : (
        <Flyout
          items={item.children ?? []}
          pathname={pathname}
          search={search}
          onPointerEnter={openNow}
          onPointerLeave={closeSoon}
        />
      )}
    </DropdownMenu>
  );
}

export function AppSidebar() {
  const store = useStore();
  const collapsed = store.sidebarCollapsed;
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const search = location.search as Record<string, unknown>;
  const role = store.user?.role ?? "owner";
  const { isCollapsed, setCollapsed, toggle } = useNavSections();

  // Single shared flyout selection: hover previews a submenu, clicking pins it
  // so it stays; only one submenu is ever shown in the sidebar at a time.
  const [hoveredFlyout, setHoveredFlyout] = useState<string | null>(null);
  const [pinnedFlyout, setPinnedFlyout] = useState<string | null>(null);
  const visibleFlyout = hoveredFlyout ?? pinnedFlyout;

  const pinFlyout = (id: string) => {
    if (pinnedFlyout === id) {
      setPinnedFlyout(null);
      setHoveredFlyout((cur) => (cur === id ? null : cur));
    } else {
      setPinnedFlyout(id);
      setHoveredFlyout((cur) => (cur === id ? cur : id));
    }
  };
  const dismissFlyout = (id: string) => {
    setPinnedFlyout((cur) => (cur === id ? null : cur));
    setHoveredFlyout((cur) => (cur === id ? null : cur));
  };

  // Closing the flyout on route change keeps the sidebar tidy after a link is
  // selected from the pinned submenu.
  useEffect(() => {
    setPinnedFlyout(null);
    setHoveredFlyout(null);
  }, [pathname, search]);

  // Auto-expand the section that contains the active page.
  const activeSection = navGroups.find((g) =>
    g.items.some((i) => isNavActive(i, pathname, search)),
  )?.label;
  useEffect(() => {
    if (activeSection) setCollapsed(activeSection, false);
  }, [activeSection, setCollapsed]);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out print:hidden lg:flex",
        collapsed ? "w-[68px]" : "w-[236px]",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border",
          collapsed ? "justify-between gap-1 px-2" : "justify-between px-4",
        )}
      >
        {collapsed ? (
          <>
            <Link
              to="/dashboard"
              aria-label="DPC POS home"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <img
                src="/dpc-logo.png"
                alt="Dream PC Build & IT Solutions"
                className="size-6 rounded object-contain"
              />
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 shrink-0 text-muted-foreground"
              aria-label="Expand sidebar"
              onClick={() => store.setSidebarCollapsed(false)}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <Link to="/dashboard" aria-label="DPC POS home">
              <NexusWordmark />
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-muted-foreground"
              aria-label="Collapse sidebar"
              onClick={() => store.setSidebarCollapsed(true)}
            >
              <ChevronsLeft className="size-4" />
            </Button>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
        {navGroups.map((group) => {
          const items = group.items.filter((i) => can(role, i.cap));
          if (items.length === 0) return null;
          const open = collapsed ? true : !isCollapsed(group.label);
          return (
            <div key={group.label} className="mb-4">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(group.label)}
                className={cn(
                  "label-tech flex w-full items-center justify-between gap-1 px-2 pt-0.5 pb-1.5 transition-colors hover:text-foreground",
                  collapsed ? "hidden" : "",
                )}
              >
                <span>{group.label}</span>
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
                    {items.map((item) => {
                      const active = isNavActive(item, pathname, search);

                      if (item.children?.length) {
                        const id = `${group.label}:${item.label}`;
                        return (
                          <li key={item.label}>
                            <NavFlyout
                              id={id}
                              item={item}
                              pathname={pathname}
                              search={search}
                              collapsed={collapsed}
                              open={visibleFlyout === id}
                              onRequestOpen={() => setHoveredFlyout(id)}
                              onRequestClose={() =>
                                setHoveredFlyout((cur) => (cur === id ? null : cur))
                              }
                              onTogglePin={() => pinFlyout(id)}
                              onDismiss={() => dismissFlyout(id)}
                            />
                          </li>
                        );
                      }

                      if (item.soon) {
                        const row = (
                          <div
                            aria-disabled
                            className={cn(
                              rowCls(active, collapsed),
                              "cursor-default opacity-60 hover:bg-transparent hover:text-muted-foreground",
                            )}
                          >
                            <ActiveBar active={false} />
                            {item.icon && <item.icon className="size-4 shrink-0" />}
                            {!collapsed && (
                              <>
                                <span className="min-w-0 flex-1 truncate text-left">
                                  {item.label}
                                </span>
                                <SoonTag />
                              </>
                            )}
                          </div>
                        );
                        return (
                          <li key={item.label}>
                            {collapsed ? (
                              <Tooltip>
                                <TooltipTrigger asChild>{row}</TooltipTrigger>
                                <TooltipContent side="right">{item.label}</TooltipContent>
                              </Tooltip>
                            ) : (
                              row
                            )}
                          </li>
                        );
                      }

                      const link = (
                        <Link
                          to={item.to ?? ""}
                          search={item.search as never}
                          className={rowCls(active, collapsed)}
                          aria-current={active ? "page" : undefined}
                        >
                          <ActiveBar active={active} />
                          {item.icon && <item.icon className="size-4 shrink-0" />}
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                      );
                      return (
                        <li key={item.to ?? item.label}>
                          {collapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>{link}</TooltipTrigger>
                              <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                          ) : (
                            link
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}

export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const store = useStore();
  const user = store.user;
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0",
          )}
        >
          <UserAvatar user={user} size="sm" rounded="md" className="rounded-md" />
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-foreground">{user.name}</span>
              <span className="mono block truncate text-[10.5px] text-subtle uppercase">
                {roleLabels[user.role]}
              </span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-[13px]">{user.name}</p>
          <p className="mono mt-0.5 text-[11px] text-subtle">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="size-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => store.signOut()}>
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
