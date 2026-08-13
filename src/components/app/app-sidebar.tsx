import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, LogOut, Repeat, Settings, ShieldCheck } from "lucide-react";
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
import { NexusMark, NexusWordmark } from "@/components/brand/nexus-logo";
import { navGroups } from "./nav-config";
import { useStore } from "@/lib/store";
import { can, roleLabels } from "@/lib/permissions";
import type { Role } from "@/lib/types";

export function AppSidebar() {
  const store = useStore();
  const collapsed = store.sidebarCollapsed;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = store.user?.role ?? "owner";

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-[68px]" : "w-[236px]",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {collapsed ? (
          <NexusMark />
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
                  const active =
                    pathname === item.to || pathname.startsWith(`${item.to}/`);
                  const link = (
                    <Link
                      to={item.to}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {active && (
                        <span className="absolute top-1.5 bottom-1.5 -left-2 w-[2px] rounded-full bg-info" />
                      )}
                      <item.icon className="size-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                  return (
                    <li key={item.to}>
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
        {collapsed && (
          <Button
            size="icon"
            variant="ghost"
            className="mb-1 w-full text-muted-foreground"
            aria-label="Expand sidebar"
            onClick={() => store.setSidebarCollapsed(false)}
          >
            <ChevronsLeft className="size-4 rotate-180" />
          </Button>
        )}
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Repeat className="size-4" /> Switch demo role
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(Object.keys(roleLabels) as Role[]).map((r) => (
              <DropdownMenuItem key={r} onSelect={() => store.switchRole(r)}>
                <ShieldCheck
                  className={cn("size-4", r === user.role ? "text-info" : "text-subtle")}
                />
                {roleLabels[r]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
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
