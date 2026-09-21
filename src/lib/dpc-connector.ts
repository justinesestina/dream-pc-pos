import type { Role, User } from "./types";

/**
 * DPC POS Connector client.
 *
 * Talks to the `dpc/v1` REST API provided by the `dpc-pos-connector` WordPress
 * plugin. It is disabled unless `VITE_DPC_API_URL` is set, so the existing
 * backend flow keeps working during the migration.
 *
 * Auth uses an HttpOnly session cookie (sent with `credentials: "include"`) and
 * a CSRF token that is kept in sessionStorage, mirrored to localStorage, and
 * sent as `X-DPC-CSRF` on every non-GET request. No WordPress application
 * password is ever stored.
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

/**
 * Stores the CSRF token in sessionStorage and mirrors it to localStorage so it
 * survives new tabs and browser restarts. The raw token is useless without the
 * HttpOnly `dpc_session` cookie, so persisting it locally does not weaken the
 * session; it only prevents "logged in but writes 401" flakiness after a tab
 * restore clears the per-tab sessionStorage.
 */
function setCsrf(token: string): void {
  try {
    sessionStorage.setItem(CSRF_KEY, token);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(CSRF_KEY, token);
  } catch {
    /* ignore */
  }
}

function getCsrf(): string | null {
  try {
    const inTab = sessionStorage.getItem(CSRF_KEY);
    if (inTab) return inTab;
  } catch {
    /* ignore */
  }
  try {
    return localStorage.getItem(CSRF_KEY);
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
  try {
    localStorage.removeItem(CSRF_KEY);
  } catch {
    /* ignore */
  }
}

// Guard that keeps the app from auto-restoring a session right after a logout,
// while the server-side revoke is still in flight. Cleared by the next login.
const LOGGED_OUT_KEY = "dpc-nexus-logged-out";

export function setLoggedOutFlag(): void {
  try {
    localStorage.setItem(LOGGED_OUT_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearLoggedOutFlag(): void {
  try {
    localStorage.removeItem(LOGGED_OUT_KEY);
  } catch {
    /* ignore */
  }
}

export function hasLoggedOutFlag(): boolean {
  try {
    return localStorage.getItem(LOGGED_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DpcRoleRef {
  slug: string;
  name: string;
}

export interface DpcBranchRef {
  id: number;
  code: string;
  name: string;
  address: string;
}

export interface DpcUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  status: string;
  wordpress_user_id: number | null;
  wordpress_connected: boolean;
  wordpress_username: string | null;
  role: string;
  roles: DpcRoleRef[];
  permissions: string[];
  branches: DpcBranchRef[];
  primary_branch_id: number | null;
  failed_attempts: number;
  locked_until: string | null;
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
  const user: User = {
    id: `dpc-${dpc.id}`,
    name,
    email: dpc.email || `${dpc.username}@dpc.local`,
    role: mapDpcRoleToPosRole(dpc.role || dpc.roles[0]?.slug || ""),
    initials: (dpc.initials || initialsFrom(name)).toUpperCase(),
  };
  if (dpc.avatar_url) {
    user.avatar_url = dpc.avatar_url;
  }
  if (Array.isArray(dpc.permissions) && dpc.permissions.length > 0) {
    user.permissions = dpc.permissions;
  }
  return user;
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
export async function dpcLogin(
  username: string,
  password: string,
  remember = false,
): Promise<DpcLoginResult> {
  const res = await dpcFetch<DpcLoginData>("/auth/login", "POST", { username, password, remember });
  if (res.ok && res.data) {
    clearLoggedOutFlag();
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

export interface DpcForgotResult {
  ok: boolean;
  error?: string;
}

/**
 * Requests a password reset link by username or email. The connector always
 * answers success regardless of whether the account exists (no enumeration).
 */
export async function dpcForgotPassword(login: string): Promise<DpcForgotResult> {
  const res = await dpcFetch<{ ok: boolean }>("/auth/password/forgot", "POST", {
    username: login,
  });
  if (res.ok) return { ok: true };
  return { ok: false, error: res.error ?? "Could not request a password reset." };
}

/** Applies a new password using the emailed reset token. */
export async function dpcResetPassword(
  userId: number,
  token: string,
  newPassword: string,
): Promise<DpcForgotResult> {
  const res = await dpcFetch<{ ok: boolean }>("/auth/password/reset", "POST", {
    user_id: userId,
    token,
    new_password: newPassword,
  });
  if (res.ok) return { ok: true };
  return { ok: false, error: res.error ?? "Could not reset the password." };
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

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export interface DpcDataResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Authenticated data request against the connector.
 *
 * Connector data routes mirror the legacy backend and wrap their payload in the
 * same `{ data, meta }` envelope, so the envelope is unwrapped here. Pass a path
 * relative to the namespace (e.g. `/products`, not `/api/v1/products`).
 */
export async function dpcDataRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<DpcDataResult<T>> {
  const res = await dpcFetch<{ data?: T }>(path, method, body);
  if (!res.ok) {
    const failed: DpcDataResult<T> = { ok: false };
    if (res.error !== undefined) failed.error = res.error;
    if (res.status !== undefined) failed.status = res.status;
    return failed;
  }

  const envelope = res.data;
  const result: DpcDataResult<T> = { ok: true };
  if (envelope && typeof envelope === "object" && "data" in envelope) {
    if (envelope.data !== undefined) result.data = envelope.data;
  } else {
    result.data = envelope as unknown as T;
  }
  if (res.status !== undefined) result.status = res.status;
  return result;
}
