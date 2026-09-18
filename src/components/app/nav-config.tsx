import {
  ArrowLeftRight,
  BadgeDollarSign,
  BarChart3,
  BadgePercent,
  Calculator,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderKanban,
  History,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Megaphone,
  Package,
  Percent,
  Receipt,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Target,
  Ticket,
  Truck,
  UserRound,
  Users,
  Wallet,
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
  /** Render this subtree with the dedicated recursive Administration navigator. */
  adminNav?: boolean;
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
          { label: "Brands", to: "/brands", cap: "products" },
          { label: "Categories", to: "/categories", cap: "products" },
          { label: "Tags", to: "/tags", cap: "products" },
          { label: "Attributes", to: "/attributes", cap: "products" },
        ],
      },
      {
        label: "Warehouses",
        to: "/warehouses",
        icon: Warehouse,
        cap: "inventory",
        children: [
          {
            label: "Add Warehouse",
            to: "/warehouses",
            search: { new: "1" },
            cap: "inventory",
          },
          { label: "Manage Warehouses", to: "/warehouses", cap: "inventory" },
        ],
      },
      { label: "Stock Transfer", to: "/transfers", icon: ArrowLeftRight, cap: "inventory" },
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
      { label: "All Projects", to: "/projects", search: { tab: "projects" }, icon: FolderKanban, cap: "settings" },
      { label: "Tasks Board", to: "/projects", search: { tab: "tasks" }, icon: ListChecks, cap: "settings" },
      { label: "Calendar", to: "/projects", search: { tab: "calendar" }, icon: CalendarDays, cap: "settings" },
      { label: "Team Workload", to: "/projects", search: { tab: "team" }, icon: UserRound, cap: "settings" },
      { label: "Reports", to: "/projects", search: { tab: "reports" }, icon: BarChart3, cap: "settings" },
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
    label: "Accounts",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, soon: true, cap: "settings" },
      {
        label: "Sales",
        icon: BadgeDollarSign,
        cap: "settings",
        children: [
          { label: "Sales Invoices", soon: true, cap: "settings" },
          { label: "Customer Payments", soon: true, cap: "settings" },
          { label: "Sales Returns", soon: true, cap: "settings" },
          { label: "Credit Notes", soon: true, cap: "settings" },
        ],
      },
      {
        label: "Purchases",
        icon: ShoppingBag,
        cap: "settings",
        children: [
          { label: "Purchase Bills", soon: true, cap: "settings" },
          { label: "Supplier Payments", soon: true, cap: "settings" },
          { label: "Purchase Returns", soon: true, cap: "settings" },
          { label: "Debit Notes", soon: true, cap: "settings" },
        ],
      },
      {
        label: "Expenses",
        icon: Wallet,
        cap: "settings",
        children: [
          { label: "All Expenses", soon: true, cap: "settings" },
          { label: "Add Expense", soon: true, cap: "settings" },
          { label: "Expense Categories", soon: true, cap: "settings" },
          { label: "Recurring Expenses", soon: true, cap: "settings" },
        ],
      },
      {
        label: "Banking",
        icon: Landmark,
        cap: "settings",
        children: [
          { label: "Bank Accounts", soon: true, cap: "settings" },
          { label: "Cash Accounts", soon: true, cap: "settings" },
          { label: "Deposits", soon: true, cap: "settings" },
          { label: "Withdrawals", soon: true, cap: "settings" },
          { label: "Fund Transfers", soon: true, cap: "settings" },
        ],
      },
      {
        label: "Accounting",
        icon: Calculator,
        cap: "settings",
        children: [
          { label: "Chart of Accounts", soon: true, cap: "settings" },
          { label: "Journal Entries", soon: true, cap: "settings" },
          { label: "General Ledger", soon: true, cap: "settings" },
          { label: "Trial Balance", soon: true, cap: "settings" },
          { label: "Fiscal Years", soon: true, cap: "settings" },
          { label: "Opening Balances", soon: true, cap: "settings" },
        ],
      },
      {
        label: "Taxes",
        icon: Percent,
        cap: "settings",
        children: [
          { label: "Tax Rates", soon: true, cap: "settings" },
          { label: "Tax Groups", soon: true, cap: "settings" },
          { label: "VAT Reports", soon: true, cap: "settings" },
          { label: "Tax Settings", soon: true, cap: "settings" },
        ],
      },
      {
        label: "Reports",
        icon: BarChart3,
        cap: "settings",
        children: [
          { label: "Profit & Loss", soon: true, cap: "settings" },
          { label: "Balance Sheet", soon: true, cap: "settings" },
          { label: "Cash Flow Statement", soon: true, cap: "settings" },
          { label: "Sales Reports", soon: true, cap: "settings" },
          { label: "Purchase Reports", soon: true, cap: "settings" },
          { label: "Expense Reports", soon: true, cap: "settings" },
          { label: "Inventory Valuation", soon: true, cap: "settings" },
        ],
      },
      {
        label: "Administration",
        icon: ShieldCheck,
        cap: "settings",
        adminNav: true,
        children: [
          {
            label: "User Management",
            cap: "settings",
            children: [
              { label: "All Users", to: "/administration/users", cap: "settings" },
              { label: "Add User", to: "/administration/users/new", cap: "settings" },
            ],
          },
          {
            label: "Roles & Permissions",
            cap: "settings",
            children: [
              { label: "All Roles", to: "/admin/roles", cap: "settings" },
              {
                label: "Permission Matrix",
                to: "/admin/roles",
                search: { tab: "matrix" },
                cap: "settings",
              },
            ],
          },
          {
            label: "Branch Management",
            cap: "settings",
            children: [{ label: "All Branches", to: "/administration/branches", cap: "settings" }],
          },
          {
            label: "Approval Workflows",
            cap: "settings",
            children: [
              {
                label: "Pending Approvals",
                to: "/administration/approvals/pending",
                cap: "settings",
              },
              {
                label: "Workflow Settings",
                to: "/administration/approvals/settings",
                cap: "settings",
              },
            ],
          },
          { label: "Audit Logs", to: "/admin/audit", cap: "settings" },
          { label: "Activity Logs", to: "/admin/activity", cap: "settings" },
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
export function isNavActive(
  item: NavItem,
  pathname: string,
  search: Record<string, unknown> = {},
): boolean {
  if (item.to && (pathname === item.to || pathname.startsWith(`${item.to}/`))) {
    if (!item.search) return true;
    return Object.entries(item.search).every(
      ([key, value]) => String(search[key] ?? "") === String(value),
    );
  }
  return item.children?.some((child) => isNavActive(child, pathname, search)) ?? false;
}
