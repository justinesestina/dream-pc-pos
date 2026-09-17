import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, ChevronsLeft, ChevronsRight, LogOut, Settings } from "lucide-react";
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
import { useStore } from "@/lib/store";
import { can, roleLabels } from "@/lib/permissions";

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
  nested,
}: {
  items: NavItem[];
  pathname: string;
  nested?: boolean;
}) {
  const body = items.map((child) => {
    if (child.children?.length) {
      return (
        <DropdownMenuSub key={child.label}>
          <DropdownMenuSubTrigger className="gap-2 py-1.5 pr-1 text-[13px]">
            <span className="flex-1 truncate">{child.label}</span>
          </DropdownMenuSubTrigger>
          <Flyout items={child.children} pathname={pathname} nested />
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
    const active = child.to ? isNavActive(child, pathname) : false;
    return (
      <DropdownMenuItem
        asChild
        key={child.to ?? child.label}
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
    <DropdownMenuSubContent sideOffset={6} className={className}>
      {body}
    </DropdownMenuSubContent>
  ) : (
    <DropdownMenuContent side="right" align="start" sideOffset={6} className={className}>
      {body}
    </DropdownMenuContent>
  );
}

export function AppSidebar() {
  const store = useStore();
  const collapsed = store.sidebarCollapsed;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = store.user?.role ?? "owner";

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
              aria-label="DPC Nexus home"
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
            <Link to="/dashboard" aria-label="DPC Nexus home">
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
          return (
            <div key={group.label} className="mb-4">
              {!collapsed && <p className="label-tech px-2 pb-1.5">{group.label}</p>}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isNavActive(item, pathname);

                  if (item.children?.length) {
                    const content = (
                      <>
                        <ActiveBar active={active} />
                        {item.icon && <item.icon className="size-4 shrink-0" />}
                        {!collapsed && (
                          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                        )}
                        {!collapsed && <ChevronRight className="size-3.5 shrink-0 opacity-60" />}
                      </>
                    );
                    return (
                      <li key={item.label}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            {item.to ? (
                              <Link
                                to={item.to}
                                search={item.search as never}
                                aria-current={active ? "page" : undefined}
                                className={rowCls(active, collapsed)}
                              >
                                {content}
                              </Link>
                            ) : (
                              <button
                                type="button"
                                aria-haspopup="menu"
                                aria-current={active ? "page" : undefined}
                                className={cn(rowCls(active, collapsed), "w-full")}
                              >
                                {content}
                              </button>
                            )}
                          </DropdownMenuTrigger>
                          <Flyout items={item.children} pathname={pathname} />
                        </DropdownMenu>
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
                            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
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
          <span className="mono flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-[11px] text-foreground">
            {user.initials}
          </span>
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
