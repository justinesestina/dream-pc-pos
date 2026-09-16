/**
 * Server-side WordPress authentication.
 *
 * Replaces the browser-direct call the demo currently makes in the frontend
 * (src/lib/wp-auth.ts). The client sends username + application password to
 * POST /api/v1/auth/login; this module verifies against the live WP REST API
 * (`wp-json/wp/v2/users/me`) and maps WP roles to POS roles. The bridge account
 * is replaced by Supabase Auth in Phase P4.
 */
import { config } from "../config.js";
import type { Role } from "../types/dto.js";

export interface WpUser {
  id: number;
  name: string;
  email?: string;
  roles: string[];
}

/** WordPress roles → POS roles. Proposals may carry multiple custom roles. */
export function mapWpRolesToPosRole(wpRoles: string[]): Role {
  const r = new Set(wpRoles.map((x) => x.toLowerCase()));

  if (r.has("administrator") || r.has("nexus_owner") || r.has("dpc_owner")) return "owner";
  if (r.has("shop_manager") || r.has("nexus_admin") || r.has("dpc_admin")) return "admin";
  if (r.has("nexus_cashier") || r.has("dpc_cashier")) return "cashier";
  if (
    r.has("editor") ||
    r.has("nexus_inventory") ||
    r.has("dpc_inventory") ||
    r.has("nexus_staff")
  ) {
    return "inventory";
  }
  return "cashier"; // least-privilege default for arbitrary WP users
}

export class WordpressAuthError extends Error {}

/**
 * Verifies a WordPress username + application password by calling the live
 * site. Returns the mapped POS role so the server can issue a POS JWT.
 */
export async function verifyWordPressUser(
  username: string,
  appPassword: string,
): Promise<{ wpUser: WpUser; role: Role }> {
  if (!config.wp.url) throw new WordpressAuthError("WordPress site URL is not configured");

  const url = `${config.wp.url}/wp-json/wp/v2/users/me`;
  // The application password is the "password" side of HTTP Basic auth against
  // wp/users/me. The username part is the real WP login.
  const credentials = Buffer.from(`${username}:${appPassword}`).toString("base64");

  let res: Response;
  try {
    res = await fetch(url, { headers: { Authorization: `Basic ${credentials}` } });
  } catch (cause) {
    throw new WordpressAuthError(`Cannot reach WordPress at ${config.wp.url}: ${String(cause)}`);
  }

  // Surface WordPress's real error so the tester/page says WHY it failed.
  let wpCode = "";
  let wpMessage = "";
  try {
    const body = await res.clone().json();
    if (body && typeof body === "object") {
      wpCode = String((body as { code?: unknown }).code ?? "");
      wpMessage = String((body as { message?: unknown }).message ?? "");
    }
  } catch {
    /* non-JSON error body */
  }

  if (res.status === 401 || res.status === 403) {
    if (wpCode === "rest_not_logged_in") {
      throw new WordpressAuthError(
        "WordPress saw no valid credentials. If you typed your normal WP password, that won't work " +
        "for the REST API — create an APPLICATION PASSWORD instead: WP Admin → Users → Profile → " +
        "Application Passwords → Add new (name e.g. \"DPC POS\"), then use that 24-char code as the " +
        "password here (username = your WP login). " +
        `(WP: ${wpMessage})`,
      );
    }
    if (wpCode.startsWith("rest_invalid_application_password")) {
      throw new WordpressAuthError(
        "Application password not recognized. To create one: WP Admin → Users → Profile → " +
        "Application Passwords → Add new (24-char password, different from your login password). " +
        `(WP: ${wpMessage})`,
      );
    }
    if (wpCode.startsWith("rest_user_invalid_username") || wpCode === "incorrect_password") {
      throw new WordpressAuthError(
        "WordPress says these credentials are wrong — use your WP LOGIN username (not email/display " +
        `name) + the app password. (WP: ${wpMessage})`,
      );
    }
    if (res.status === 403) {
      throw new WordpressAuthError(
        `WordPress REST blocked the request (403) — a security plugin may be blocking Basic auth. ` +
        `(WP: ${wpMessage || wpCode})`,
      );
    }
    throw new WordpressAuthError(
      `WordPress rejected the login (HTTP ${res.status}). ` +
        `(WP${wpCode ? ` ${wpCode}` : ""}: ${wpMessage || "no detail returned"})`,
    );
  }
  if (!res.ok) {
    throw new WordpressAuthError(
      `WordPress returned HTTP ${res.status} for ${url} — check WOOCOMMERCE_URL in backend/.env ` +
        `(WP: ${wpMessage || wpCode || "no detail"})`,
    );
  }

  const body = (await res.json()) as { id?: number; name?: string; email?: string; roles?: string[] };
  const wpUser: WpUser = {
    id: body.id ?? 0,
    name: body.name ?? username,
    email: body.email,
    roles: body.roles ?? [],
  };

  return { wpUser, role: mapWpRolesToPosRole(wpUser.roles) };
}