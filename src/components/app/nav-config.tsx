import { FileText, LayoutDashboard, Receipt } from "lucide-react";
import type { Capability } from "@/lib/permissions";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof FileText;
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
      { label: "Orders", to: "/orders", icon: Receipt, cap: "orders" },
      { label: "Quotation", to: "/quotes", icon: FileText, cap: "quotes" },
    ],
  },
];
