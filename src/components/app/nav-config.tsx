import {
  Boxes,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Ticket,
  Users,
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
      { label: "Quotation", to: "/quotes", icon: FileText, cap: "quotes" },
    ],
  },
  {
    label: "Products",
    items: [
      {
        label: "Products",
        to: "/products",
        icon: Package,
        cap: "products",
        children: [
          { label: "All Products", to: "/products", cap: "products" },
          { label: "Add New Product", to: "/products", search: { new: "1" }, cap: "products" },
          { label: "Brands", soon: true, cap: "products" },
          { label: "Categories", to: "/products", cap: "products" },
          { label: "Tags", soon: true, cap: "products" },
          { label: "Attributes", soon: true, cap: "products" },
        ],
      },
    ],
  },
  {
    label: "Stock",
    items: [
      {
        label: "Stock",
        to: "/inventory",
        icon: Boxes,
        cap: "inventory",
        children: [
          { label: "Products", to: "/inventory", cap: "inventory" },
          { label: "Warehouses", soon: true, cap: "inventory" },
          { label: "Stock Transfer", soon: true, cap: "inventory" },
          {
            label: "Purchase Orders",
            cap: "purchasing",
            children: [
              { label: "Add Purchase Order", to: "/purchasing", cap: "purchasing" },
              { label: "Manage Purchase Orders", to: "/purchasing", cap: "purchasing" },
            ],
          },
          {
            label: "Stock Return",
            cap: "returns",
            children: [
              { label: "Add Stock Return", to: "/returns", cap: "returns" },
              { label: "Manage Stock Returns", to: "/returns", cap: "returns" },
            ],
          },
          {
            label: "Suppliers",
            cap: "purchasing",
            children: [
              { label: "Add Supplier", to: "/suppliers", search: { new: "1" }, cap: "purchasing" },
              { label: "Manage Suppliers", to: "/suppliers", cap: "purchasing" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        label: "CRM",
        icon: Users,
        cap: "customers",
        children: [
          {
            label: "Customers",
            cap: "customers",
            children: [
              { label: "All Customers", to: "/customers", cap: "customers" },
              { label: "Add Customer", to: "/customers", search: { new: "1" }, cap: "customers" },
            ],
          },
          { label: "Customer Groups", soon: true, cap: "customers" },
          { label: "Leads", soon: true, cap: "customers" },
          { label: "Follow-ups", soon: true, cap: "customers" },
          { label: "Customer Support Tickets", to: "/services", cap: "services" },
          { label: "Customer Activity Log", soon: true, cap: "customers" },
        ],
      },
    ],
  },
  {
    label: "Projects",
    items: [
      {
        label: "Projects",
        icon: FolderKanban,
        cap: "settings",
        children: [
          { label: "All Projects", soon: true, cap: "settings" },
          { label: "Create Project", soon: true, cap: "settings" },
          { label: "Project Tasks", soon: true, cap: "settings" },
          { label: "Project Categories", soon: true, cap: "settings" },
          { label: "Team Members", soon: true, cap: "settings" },
          { label: "Project Reports", soon: true, cap: "settings" },
        ],
      },
    ],
  },
  {
    label: "Promo Codes",
    items: [
      {
        label: "Promo Codes",
        icon: Ticket,
        cap: "settings",
        children: [
          { label: "All Promo Codes", soon: true, cap: "settings" },
          { label: "Create Promo Code", soon: true, cap: "settings" },
          { label: "Coupon Categories", soon: true, cap: "settings" },
          { label: "Discount Campaigns", soon: true, cap: "settings" },
          { label: "Voucher Management", soon: true, cap: "settings" },
          { label: "Usage Reports", soon: true, cap: "settings" },
        ],
      },
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
