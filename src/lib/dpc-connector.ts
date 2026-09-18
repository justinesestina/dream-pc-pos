import type { Role, User } from "./types";

/**
 * DPC POS Connector client.
 *
 * Talks to the `dpc/v1` REST API provided by the `dpc-pos-connector` WordPress
 * plugin. It is disabled unless `VITE_DPC_API_URL` is set, so the existing
 * backend flow keeps working during the migration.
 *
 * Auth uses an HttpOnly session cookie (sent with `credentials: "include"`) and
 * a CSRF token that is kept in sessionStorage and sent as `X-DPC-CSRF` on every
 * non-GET request. No WordPress application password is ever stored.
 */

const RAW_BASE = ((import.meta.env?.["VITE_DPC_API_URL"] as string | undefined) ?? "").trim();

/** Normalized REST base ending in `/wp-json/dpc/v1`, or "" when disabled. */
export function dpcApiBase(): string {
  const raw = RAW_BASE.replace(/\/+$/, "");
  if (!raw) return "";
  if (/\/wp-json\/dpc\/v1$/i.test(raw)) return raw;
  if (/\/wp-json$/i.test(raw)) return `${raw}/dpc/v1`;
  return `${raw}/wp-json/dpc/v1`;
}

/** True when the connector is configured via `VITE_DPC_API_URL`. */
export function isDpcConnectorEnabled(): boolean {
  return dpcApiBase() !== "";
}

// ---------------------------------------------------------------------------
// CSRF
// ---------------------------------------------------------------------------

const CSRF_KEY = "dpc-nexus-csrf";

function setCsrf(token: string): void {
  try {
    sessionStorage.setItem(CSRF_KEY, token);
  } catch {
    /* storage unavailable — writes will fail CSRF and re-login is required */
  }
}

function getCsrf(): string | null {
  try {
    return sessionStorage.getItem(CSRF_KEY);
  } catch {
    return null;
  }
}

function clearCsrf(): void {
  try {
    sessionStorage.removeItem(CSRF_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DpcRoleRef {
  slug: string;
  name: string;
}

export interface DpcUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  status: string;
  wordpress_user_id: number | null;
  wordpress_connected: boolean;
  wordpress_username: string | null;
  role: string;
  roles: DpcRoleRef[];
  permissions: string[];
  last_login_at: string | null;
  created_at: string;
  initials: string;
}

interface DpcErrorBody {
  code?: string;
  message?: string;
}

interface DpcLoginData {
  user: DpcUser;
  csrf_token: string;
  expires_at: number;
}

interface DpcRequestResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface DpcLoginResult {
  ok: boolean;
  user?: User;
  error?: string;
  status?: number;
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

/** Maps a DPC role slug to the frontend UI role. */
export function mapDpcRoleToPosRole(slug: string): Role {
  switch (slug) {
    case "owner":
      return "owner";
    case "administrator":
    case "manager":
      return "admin";
    case "inventory_staff":
      return "inventory";
    case "accountant":
    case "sales":
    default:
      return "cashier";
  }
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "?";
}

/** Converts a DPC connector user into the frontend `User` shape. */
export function dpcUserToUser(dpc: DpcUser): User {
  const name = (dpc.display_name || dpc.username).trim().replace(/\s+/g, " ") || dpc.username;
  return {
    id: `dpc-${dpc.id}`,
    name,
    email: dpc.email || `${dpc.username}@dpc.local`,
    role: mapDpcRoleToPosRole(dpc.role || dpc.roles[0]?.slug || ""),
    initials: (dpc.initials || initialsFrom(name)).toUpperCase(),
  };
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

async function dpcFetch<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<DpcRequestResult<T>> {
  const base = dpcApiBase();
  if (!base) {
    return { ok: false, error: "DPC connector is not configured." };
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const csrf = getCsrf();
    if (csrf) headers["X-DPC-CSRF"] = csrf;
  }

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      credentials: "include",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return {
      ok: false,
      error: `Could not reach the DPC connector (${message}). If you're on a dev origin, add it under DPC POS → Application → Additional allowed origins.`,
    };
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    const errBody = json as DpcErrorBody | null;
    return {
      ok: false,
      error: errBody?.message ?? `HTTP ${res.status}`,
      status: res.status,
    };
  }

  return { ok: true, data: json as T, status: res.status };
}

/** Signs in through the connector. Stores the CSRF token in sessionStorage. */
export async function dpcLogin(username: string, password: string): Promise<DpcLoginResult> {
  const res = await dpcFetch<DpcLoginData>("/auth/login", "POST", { username, password });
  if (res.ok && res.data) {
    setCsrf(res.data.csrf_token);
    return { ok: true, user: dpcUserToUser(res.data.user) };
  }
  const result: DpcLoginResult = { ok: false };
  result.error = res.ok
    ? "The DPC connector returned an unexpected response."
    : (res.error ?? "DPC connector sign in failed.");
  if (res.status !== undefined) result.status = res.status;
  return result;
}

/** Returns the current connector user, or null when there is no session. */
export async function dpcMe(): Promise<DpcUser | null> {
  const res = await dpcFetch<DpcUser>("/auth/me", "GET");
  return res.ok && res.data ? res.data : null;
}

/** Returns the current frontend user mapped from the connector session. */
export async function dpcCurrentUser(): Promise<User | null> {
  const dpc = await dpcMe();
  return dpc ? dpcUserToUser(dpc) : null;
}

/** Revokes the connector session and clears the CSRF token. */
export async function dpcLogout(): Promise<void> {
  await dpcFetch<{ ok: boolean }>("/auth/logout", "POST", {});
  clearCsrf();
}

/** Issues a one-time WordPress Admin SSO URL (Owner / `users.manage`). */
export async function dpcSsoUrl(): Promise<string | null> {
  const res = await dpcFetch<{ url: string }>("/auth/sso-token", "POST", {});
  return res.ok && res.data ? res.data.url : null;
}
