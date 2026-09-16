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

  if (res.status === 403 || res.status === 401) {
    throw new WordpressAuthError("Invalid WordPress username or application password");
  }
  if (!res.ok) {
    throw new WordpressAuthError(`WordPress returned HTTP ${res.status}`);
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