import type { Role } from "./types";

/**
 * UI-LEVEL permissions only. This is a frontend demonstration — it is NOT
 * security. Real authorization must be enforced server-side (RLS / API guards)
 * once a backend is connected.
 */
export type Capability =
  | "pos"
  | "orders"
  | "quotes"
  | "customers"
  | "products"
  | "inventory"
  | "inventory.adjust"
  | "builds"
  | "builds.qa"
  | "services"
  | "warranty"
  | "reports"
  | "settings"
  | "costs"
  | "purchasing"
  | "receiving"
  | "returns"
  | "shifts"
  | "consultations"
  | "tasks"
  | "staff"
  | "audit"
  | "releases"
  | "documents";

const matrix: Record<Role, Capability[]> = {
  owner: [
    "pos",
    "orders",
    "quotes",
    "customers",
    "products",
    "inventory",
    "inventory.adjust",
    "builds",
    "builds.qa",
    "services",
    "warranty",
    "reports",
    "settings",
    "costs",
    "purchasing",
    "receiving",
    "returns",
    "shifts",
    "consultations",
    "tasks",
    "staff",
    "audit",
    "releases",
    "documents",
  ],
  admin: [
    "pos",
    "orders",
    "quotes",
    "customers",
    "products",
    "inventory",
    "inventory.adjust",
    "builds",
    "builds.qa",
    "services",
    "warranty",
    "reports",
    "settings",
    "costs",
    "purchasing",
    "receiving",
    "returns",
    "shifts",
    "consultations",
    "tasks",
    "staff",
    "audit",
    "releases",
    "documents",
  ],
  cashier: [
    "pos",
    "orders",
    "quotes",
    "customers",
    "products",
    "returns",
    "shifts",
    "consultations",
    "tasks",
    "documents",
    "releases",
  ],
  technician: [
    "builds",
    "builds.qa",
    "services",
    "products",
    "inventory",
    "warranty",
    "orders",
    "tasks",
    "staff",
    "releases",
    "consultations",
  ],
  inventory: [
    "products",
    "inventory",
    "inventory.adjust",
    "orders",
    "costs",
    "purchasing",
    "receiving",
    "returns",
    "tasks",
    "documents",
  ],
};

export function can(role: Role, cap: Capability) {
  return (matrix[role] ?? []).includes(cap);
}

export const roleLabels: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  cashier: "Cashier",
  technician: "Technician",
  inventory: "Inventory Staff",
};
