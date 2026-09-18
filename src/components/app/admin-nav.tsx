import { Link } from "@tanstack/react-router";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isNavActive, type NavItem } from "./nav-config";

function SoonTag() {
  return (
    <span className="mono rounded border border-border bg-elevated px-1 py-px text-[9.5px] tracking-wide text-subtle uppercase">
      Soon
    </span>
  );
}

const panelCls = "w-[224px] max-w-[240px] p-1.5";

interface HoverHandlers {
  onPointerEnter?: (() => void) | undefined;
  onPointerLeave?: (() => void) | undefined;
}

/**
 * Recursive list of Administration nodes. Renders an expandable submenu with a
 * right-arrow whenever a node has children, otherwise a navigable link (or a
 * disabled "Soon" row while the page does not exist yet). Supports unlimited
 * nesting depth.
 */
function AdminNavList({
  items,
  pathname,
  search,
  handlers,
}: {
  items: NavItem[];
  pathname: string;
  search: Record<string, unknown>;
  handlers: HoverHandlers;
}) {
  return (
    <>
      {items.map((item) => {
        const active = isNavActive(item, pathname, search);

        if (item.children?.length) {
          return (
            <DropdownMenuSub key={item.label}>
              <DropdownMenuSubTrigger
                className={cn(
                  "gap-2 py-1.5 pr-1 text-[13px]",
                  active && "bg-sidebar-accent/60 font-medium text-foreground",
                )}
              >
                {item.icon && <item.icon className="size-4 shrink-0" />}
                <span className="flex-1 truncate">{item.label}</span>
              </DropdownMenuSubTrigger>
              <AdminNavPanel
                items={item.children}
                pathname={pathname}
                search={search}
                nested
                onPointerEnter={handlers.onPointerEnter}
                onPointerLeave={handlers.onPointerLeave}
              />
            </DropdownMenuSub>
          );
        }

        if (item.soon || !item.to) {
          return (
            <DropdownMenuItem key={item.label} disabled className="gap-2 py-1.5 text-[13px]">
              {item.icon && <item.icon className="size-4 shrink-0" />}
              <span className="flex-1 truncate">{item.label}</span>
              <SoonTag />
            </DropdownMenuItem>
          );
        }

        return (
          <DropdownMenuItem
            asChild
            key={`${item.label}-${String(item.to)}-${JSON.stringify(item.search ?? {})}`}
            className={cn(
              "gap-2 py-1.5 text-[13px]",
              active && "bg-sidebar-accent/60 font-medium text-foreground",
            )}
          >
            <Link to={item.to} search={item.search as never}>
              {item.icon && <item.icon className="size-4 shrink-0" />}
              {item.label}
            </Link>
          </DropdownMenuItem>
        );
      })}
    </>
  );
}

/**
 * One flyout level of the Administration tree. The root level is a
 * `DropdownMenuContent`; every deeper level is a `DropdownMenuSubContent`
 * anchored to its parent, so each level stays compact and independently
 * positioned instead of producing one giant submenu.
 */
export function AdminNavPanel({
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
  const list = (
    <AdminNavList
      items={items}
      pathname={pathname}
      search={search}
      handlers={{ onPointerEnter, onPointerLeave }}
    />
  );

  return nested ? (
    <DropdownMenuSubContent
      sideOffset={6}
      className={panelCls}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {list}
    </DropdownMenuSubContent>
  ) : (
    <DropdownMenuContent
      side="right"
      align="start"
      sideOffset={6}
      className={panelCls}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {list}
    </DropdownMenuContent>
  );
}
