import {
  ArrowLeftRight,
  BarChart3,
  BadgePercent,
  ClipboardList,
  FileText,
  FolderKanban,
  FolderPlus,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Megaphone,
  Package,
  Receipt,
  RotateCcw,
  Settings,
  ShoppingCart,
  Target,
  Ticket,
  Truck,
  UserRound,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { Capability } from "@/lib/permissions";

export interface NavItem {
  label: string;
  to?: string;
  search?: Record<string, unknown>;
  icon?: LucideIcon;
  cap: Capability;
  shortcut?: string;
  /** Navigation target does not exist yet — show as a disabled "Soon" item. */
  soon?: boolean;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, cap: "orders" }],
  },
  {
    label: "Sales",
    items: [
      { label: "Point of Sale", to: "/pos", icon: ShoppingCart, cap: "pos" },
      { label: "Orders", to: "/orders", icon: Receipt, cap: "orders" },
      { label: "Quotations", to: "/quotes", icon: FileText, cap: "quotes" },
    ],
  },
  {
    label: "Stock",
    items: [
      {
        label: "Products",
        to: "/products",
        icon: Package,
        cap: "products",
        children: [
          { label: "All Products", to: "/products", cap: "products" },
          { label: "Add Product", to: "/products", search: { new: "1" }, cap: "products" },
          { label: "Brands", soon: true, cap: "products" },
          { label: "Categories", to: "/products", cap: "products" },
          { label: "Tags", soon: true, cap: "products" },
          { label: "Attributes", soon: true, cap: "products" },
        ],
      },
      { label: "Warehouses", icon: Warehouse, soon: true, cap: "inventory" },
      { label: "Stock Transfer", icon: ArrowLeftRight, soon: true, cap: "inventory" },
      {
        label: "Purchase Orders",
        icon: ClipboardList,
        cap: "purchasing",
        children: [
          { label: "Add Purchase Order", to: "/purchasing", cap: "purchasing" },
          { label: "Manage Purchase Orders", to: "/purchasing", cap: "purchasing" },
        ],
      },
      {
        label: "Stock Returns",
        icon: RotateCcw,
        cap: "returns",
        children: [
          { label: "Add Stock Return", to: "/returns", cap: "returns" },
          { label: "Manage Stock Returns", to: "/returns", cap: "returns" },
        ],
      },
      {
        label: "Suppliers",
        icon: Truck,
        cap: "purchasing",
        children: [
          { label: "Add Supplier", to: "/suppliers", search: { new: "1" }, cap: "purchasing" },
          { label: "Manage Suppliers", to: "/suppliers", cap: "purchasing" },
        ],
      },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        label: "Customers",
        icon: Users,
        cap: "customers",
        children: [
          { label: "All Customers", to: "/customers", cap: "customers" },
          { label: "Add Customer", to: "/customers", search: { new: "1" }, cap: "customers" },
        ],
      },
      { label: "Leads", icon: Target, soon: true, cap: "customers" },
      { label: "Support Tickets", to: "/services", icon: LifeBuoy, cap: "services" },
      { label: "Customer Groups", icon: Users, soon: true, cap: "customers" },
      { label: "Activity Logs", icon: History, soon: true, cap: "customers" },
    ],
  },
  {
    label: "Projects",
    items: [
      { label: "All Projects", icon: FolderKanban, soon: true, cap: "settings" },
      { label: "Create Project", icon: FolderPlus, soon: true, cap: "settings" },
      { label: "Tasks", icon: ListChecks, soon: true, cap: "settings" },
      { label: "Team Members", icon: UserRound, soon: true, cap: "settings" },
      { label: "Reports", icon: BarChart3, soon: true, cap: "settings" },
    ],
  },
  {
    label: "Promo Codes",
    items: [
      { label: "All Promo Codes", icon: Ticket, soon: true, cap: "settings" },
      { label: "Create Promo Code", icon: BadgePercent, soon: true, cap: "settings" },
      { label: "Campaigns", icon: Megaphone, soon: true, cap: "settings" },
      { label: "Usage Reports", icon: BarChart3, soon: true, cap: "settings" },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", to: "/settings", icon: Settings, cap: "settings" }],
  },
];

/** Recursively collect every navigable (non-"Soon") item underneath a node. */
export function flattenNav(item: NavItem): NavItem[] {
  if (item.soon) return [];
  const own = item.to ? [item] : [];
  return [...own, ...(item.children ?? []).flatMap(flattenNav)];
}

/** True when the item or any descendant targets the given pathname. */
export function isNavActive(item: NavItem, pathname: string): boolean {
  if (item.to && (pathname === item.to || pathname.startsWith(`${item.to}/`))) return true;
  return item.children?.some((c) => isNavActive(c, pathname)) ?? false;
}
