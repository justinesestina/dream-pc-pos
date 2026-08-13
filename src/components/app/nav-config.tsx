import {
  BadgeCheck,
  BarChart3,
  Boxes,
  Cpu,
  FileText,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";
import type { Capability } from "@/lib/permissions";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Cpu;
  cap: Capability;
  shortcut?: string;
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
      { label: "Quotes", to: "/quotes", icon: FileText, cap: "quotes" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Products", to: "/products", icon: Package, cap: "products" },
      { label: "Inventory", to: "/inventory", icon: Boxes, cap: "inventory" },
      { label: "Custom Builds", to: "/builds", icon: Cpu, cap: "builds" },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", to: "/customers", icon: Users, cap: "customers" },
      { label: "Services", to: "/services", icon: Wrench, cap: "services" },
      { label: "Warranty", to: "/warranty", icon: BadgeCheck, cap: "warranty" },
    ],
  },
  {
    label: "Analytics",
    items: [{ label: "Reports", to: "/reports", icon: BarChart3, cap: "reports" }],
  },
  {
    label: "System",
    items: [{ label: "Settings", to: "/settings", icon: Settings, cap: "settings" }],
  },
];
