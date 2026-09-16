/**
 * DPC NEXUS — WordPress authentication via the WP REST API.
 *
 * Users sign in with their WordPress username + an Application Password
 * (wp-admin → Users → Profile → Application Passwords), validated against
 * /wp-json/wp/v2/users/me using HTTP Basic Auth. No MySQL access needed.
 */
import { woocommerceConfig } from "./woocommerce-config";
import type { Role, User } from "./types";

export interface WpAuthResult {
  ok: boolean;
  user?: User;
  wpUserId?: number;
  wpRoles?: string[];
  error?: string;
}

/** Base URL of the WordPress site. Reuses the WooCommerce site URL. */
export function wpSiteUrl(): string {
  const candidates = [
    woocommerceConfig.url,
    import.meta.env?.["VITE_WORDPRESS_URL"] as string | undefined,
    import.meta.env?.["VITE_WOOCOMMERCE_URL"] as string | undefined,
  ];
  for (const c of candidates) {
    if (c && c !== "https://your-store.com") return c.replace(/\/+$/, "");
  }
  return "";
}

/**
 * Map a WordPress user's roles to a POS role.
 * Prefers explicit `nexus_*` roles if present, then falls back to common
 * built-in roles so DWON admin/shop-manager accounts can sign in immediately.
 */
export function mapWpRolesToPosRole(roles: string[] | undefined): Role | null {
  if (!roles || roles.length === 0) return null;
  const normalized = roles.map((r) => r.toLowerCase().replace(/[\s-]+/g, "_"));

  const custom: Record<string, Role> = {
    nexus_owner: "owner",
    nexus_admin: "admin",
    nexus_cashier: "cashier",
    nexus_inventory: "inventory",
    nexus_staff: "inventory",
    dpc_owner: "owner",
    dpc_admin: "admin",
    dpc_cashier: "cashier",
    dpc_inventory: "inventory",
    dpc_staff: "inventory",
  };
  for (const r of normalized) {
    const hit = custom[r];
    if (hit) return hit;
  }

  const builtin: Record<string, Role> = {
    administrator: "owner",
    shop_manager: "admin",
    editor: "inventory",
  };
  for (const r of normalized) {
    const hit = builtin[r];
    if (hit) return hit;
  }

  return null;
}

/**
 * Validate a WordPress username + application password against WP, returning a
 * POS User (mapped role) on success.
 */
export async function authenticateWordPress(
  username: string,
  appPassword: string,
): Promise<WpAuthResult> {
  const url = wpSiteUrl();
  if (!url) {
    return {
      ok: false,
      error:
        "WordPress is not configured. Set the store URL in Settings → WooCommerce (or VITE_WOOCOMMERCE_URL / VITE_WORDPRESS_URL).",
    };
  }
  const login = username.trim();
  if (!login || !appPassword) {
    return { ok: false, error: "Enter your WordPress username and application password." };
  }

  let res: Response;
  try {
    res = await fetch(`${url}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: `Basic ${btoa(`${login}:${appPassword}`)}` },
    });
  } catch {
    return {
      ok: false,
      error:
        "Could not reach WordPress. Check your connection and that the site URL is correct and served over HTTPS.",
    };
  }

  if (res.status === 401) {
    return { ok: false, error: "Invalid WordPress username or application password." };
  }
  if (res.status === 403) {
    return {
      ok: false,
      error:
        "WordPress rejected the credentials. Application Passwords may be disabled, or REST API access is restricted.",
    };
  }
  if (!res.ok) {
    return { ok: false, error: `WordPress responded with a ${res.status} error.` };
  }

  let raw: {
    id?: number;
    name?: string;
    slug?: string;
    email?: string;
    roles?: string[];
  };
  try {
    raw = await res.json();
  } catch {
    return { ok: false, error: "WordPress returned an unreadable response." };
  }

  const role = mapWpRolesToPosRole(raw.roles);
  if (!role) {
    return {
      ok: false,
      error: `No POS role is mapped for WordPress role(s): ${raw.roles?.join(", ") ?? "none"}. Ask an admin to assign administrator, shop_manager, or a nexus_* role.`,
    };
  }

  const name = (raw.name || raw.slug || login).trim().replace(/\s+/g, " ") || login;
  const email = raw.email || `${login}@wp.local`;
  const initials =
    name
      .split(/\s+/)
      .map((p) => p[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || login.slice(0, 2).toUpperCase();

  return {
    ok: true,
    user: {
      id: `wp-${raw.id ?? login}`,
      name,
      email,
      role,
      initials,
    },
    ...(raw.id !== undefined ? { wpUserId: raw.id } : {}),
    ...(raw.roles ? { wpRoles: raw.roles } : {}),
  };
}
