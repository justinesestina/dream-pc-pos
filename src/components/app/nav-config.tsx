import {
  ArrowLeftRight,
  BadgeDollarSign,
  BarChart3,
  BadgePercent,
  Calculator,
  ClipboardList,
  FileText,
  FolderKanban,
  History,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
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
    items: [{ label: "Projects (locked)", icon: FolderKanban, soon: true, cap: "settings" }],
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
              { label: "All Users", to: "/admin/users", cap: "settings" },
              { label: "Add User", to: "/admin/users", search: { tab: "add" }, cap: "settings" },
              {
                label: "User Profiles",
                to: "/admin/users",
                search: { tab: "profile" },
                cap: "settings",
              },
              {
                label: "Password Reset",
                to: "/admin/users",
                search: { tab: "password" },
                cap: "settings",
              },
              {
                label: "Assign Roles",
                to: "/admin/users",
                search: { tab: "roles" },
                cap: "settings",
              },
              { label: "Assign Branches", soon: true, cap: "settings" },
              {
                label: "Login History",
                to: "/admin/users",
                search: { tab: "login-history" },
                cap: "settings",
              },
              {
                label: "User Activity",
                to: "/admin/users",
                search: { tab: "activity" },
                cap: "settings",
              },
              {
                label: "Account Status",
                to: "/admin/users",
                search: { tab: "status" },
                cap: "settings",
              },
            ],
          },
          {
            label: "Roles & Permissions",
            cap: "settings",
            children: [
              { label: "All Roles", to: "/admin/roles", cap: "settings" },
              { label: "Add Role", to: "/admin/roles", search: { tab: "add" }, cap: "settings" },
              {
                label: "Permission Matrix",
                to: "/admin/roles",
                search: { tab: "matrix" },
                cap: "settings",
              },
              {
                label: "Module Permissions",
                to: "/admin/roles",
                search: { tab: "modules" },
                cap: "settings",
              },
              {
                label: "CRUD Permissions",
                to: "/admin/roles",
                search: { tab: "crud" },
                cap: "settings",
              },
              { label: "Branch Restrictions", soon: true, cap: "settings" },
              {
                label: "Role Assignments",
                to: "/admin/roles",
                search: { tab: "assignments" },
                cap: "settings",
              },
            ],
          },
          {
            label: "Branch Management",
            cap: "settings",
            children: [
              { label: "All Branches", soon: true, cap: "settings" },
              { label: "Add Branch", soon: true, cap: "settings" },
              { label: "Edit Branch", soon: true, cap: "settings" },
              { label: "Assign Users", soon: true, cap: "settings" },
              { label: "Branch Warehouses", soon: true, cap: "settings" },
              { label: "Branch Sales", soon: true, cap: "settings" },
              { label: "Branch Expenses", soon: true, cap: "settings" },
              { label: "Branch Reports", soon: true, cap: "settings" },
            ],
          },
          {
            label: "Approval Workflows",
            cap: "settings",
            children: [
              { label: "Purchase Orders", soon: true, cap: "settings" },
              { label: "Expense Requests", soon: true, cap: "settings" },
              { label: "Stock Transfers", soon: true, cap: "settings" },
              { label: "Inventory Adjustments", soon: true, cap: "settings" },
              { label: "Pending Approvals", soon: true, cap: "settings" },
              { label: "Approved Requests", soon: true, cap: "settings" },
              { label: "Rejected Requests", soon: true, cap: "settings" },
            ],
          },
          {
            label: "Audit Logs",
            cap: "settings",
            children: [
              { label: "Login Logs", to: "/admin/audit", search: { tab: "auth" }, cap: "settings" },
              {
                label: "User Changes",
                to: "/admin/audit",
                search: { tab: "users" },
                cap: "settings",
              },
              {
                label: "Permission Changes",
                to: "/admin/audit",
                search: { tab: "roles" },
                cap: "settings",
              },
              { label: "Product Changes", soon: true, cap: "settings" },
              { label: "Inventory Changes", soon: true, cap: "settings" },
              { label: "Financial Changes", soon: true, cap: "settings" },
              {
                label: "Security Events",
                to: "/admin/audit",
                search: { tab: "security" },
                cap: "settings",
              },
            ],
          },
          {
            label: "Activity Logs",
            cap: "settings",
            children: [
              {
                label: "Sales Activities",
                to: "/admin/activity",
                search: { tab: "sales" },
                cap: "settings",
              },
              {
                label: "Inventory Activities",
                to: "/admin/activity",
                search: { tab: "inventory" },
                cap: "settings",
              },
              {
                label: "CRM Activities",
                to: "/admin/activity",
                search: { tab: "customers" },
                cap: "settings",
              },
              {
                label: "Accounts Activities",
                to: "/admin/activity",
                search: { tab: "accounts" },
                cap: "settings",
              },
              {
                label: "Project Activities",
                to: "/admin/activity",
                search: { tab: "projects" },
                cap: "settings",
              },
              {
                label: "System Activities",
                to: "/admin/activity",
                search: { tab: "settings" },
                cap: "settings",
              },
              { label: "Notifications Feed", soon: true, cap: "settings" },
            ],
          },
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
