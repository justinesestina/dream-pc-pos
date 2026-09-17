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
  | "assembly"
  | "services"
  | "warranty"
  | "reports"
  | "settings"
  | "costs"
  | "purchasing"
  | "receiving"
  | "returns"
  | "shifts"
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
    "assembly",
    "services",
    "warranty",
    "reports",
    "settings",
    "costs",
    "purchasing",
    "receiving",
    "returns",
    "shifts",
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
    "assembly",
    "services",
    "warranty",
    "reports",
    "settings",
    "costs",
    "purchasing",
    "receiving",
    "returns",
    "shifts",
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
    "documents",
    "releases",
  ],
  inventory: [
    "products",
    "inventory",
    "inventory.adjust",
    "orders",
    "purchasing",
    "receiving",
    "returns",
    "documents",
  ],
};

export function can(role: Role, cap: Capability) {
  return (matrix[role] ?? []).includes(cap);
}

/** Landing page after sign-in — where each role actually works. */
export function homeFor(role: Role): "/pos" | "/inventory" | "/dashboard" {
  if (role === "cashier") return "/pos";
  if (role === "inventory") return "/inventory";
  return "/dashboard";
}

/**
 * Maps a URL path to the capability it belongs to, so direct URL access can be
 * checked against the signed-in role. Longest prefixes first; dynamic segments
 * (e.g. /builds/BLD-1001) match their section.
 */
const PATH_CAPS: Array<[RegExp, Capability]> = [
  [/^\/dashboard/, "orders"],
  [/^\/pos/, "pos"],
  [/^\/orders/, "orders"],
  [/^\/quotes/, "quotes"],
  [/^\/returns/, "returns"],
  [/^\/shifts/, "shifts"],
  [/^\/products/, "products"],
  [/^\/brands/, "products"],
  [/^\/tags/, "products"],
  [/^\/attributes/, "products"],
  [/^\/categories/, "products"],
  [/^\/warehouses/, "inventory"],
  [/^\/transfers/, "inventory"],
  [/^\/inventory/, "inventory"],
  [/^\/serials/, "inventory"],
  [/^\/builds/, "builds"],
  [/^\/assembly/, "assembly"],
  [/^\/purchasing/, "purchasing"],
  [/^\/suppliers/, "purchasing"],
  [/^\/receiving/, "receiving"],
  [/^\/customers/, "customers"],
  [/^\/services/, "services"],
  [/^\/warranty/, "warranty"],
  [/^\/releases/, "releases"],
  [/^\/documents/, "documents"],
  [/^\/reports/, "reports"],
  [/^\/settings/, "settings"],
  [/^\/audit/, "audit"],
];

/** Returns the capability required to open a path, or null for unrestricted paths. */
export function capForPath(pathname: string): Capability | null {
  for (const [re, cap] of PATH_CAPS) {
    if (re.test(pathname)) return cap;
  }
  return null;
}

export const roleLabels: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  cashier: "Cashier",
  inventory: "Inventory Staff",
};
