import type { User, Product, Order, Quote, Category, Customer } from "./types";

/**
 * DPC NEXUS — Frontend API client for the backend service.
 *
 * Handles authenticated requests to the Hono backend (backend/src/server.ts).
 */

/** Base URL of the backend API. Defaults to localhost:8787 in dev. */
const API_BASE =
  (import.meta.env?.["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/+$/, "") ||
  (typeof window !== "undefined" && window.location.hostname === "dpcmain.dreampcbuild.com"
    ? "https://backend-shard55.vercel.app"
    : "http://localhost:8787");

let backendPausedUntil = 0;
let backendPauseReason: string | null = null;

function pauseBackend(message: string) {
  backendPausedUntil = Date.now() + 60_000;
  backendPauseReason = message;
}

export function isBackendPaused(): boolean {
  return Date.now() < backendPausedUntil;
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem("dpc-nexus-auth-token");
    return raw || null;
  } catch {
    return null;
  }
}

function getWpCredentials(): { username: string; appPassword: string } | null {
  try {
    const raw = localStorage.getItem("dpc-nexus-wp-credentials");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.username && parsed?.appPassword) return parsed;
    return null;
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown,
  opts: { auth?: boolean; contentType?: "json" | "text" } = {},
): Promise<{ ok: boolean; data?: T; error?: string }> {
  if (opts.auth !== false && isBackendPaused()) {
    return { ok: false, error: backendPauseReason ?? "Backend temporarily unavailable." };
  }

  const headers: Record<string, string> = {};
  const contentType = opts.contentType ?? "json";
  if (body !== undefined) {
    headers["Content-Type"] = contentType === "text" ? "text/plain" : "application/json";
  }
  const token = opts.auth === false ? null : getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      redirect: "follow", // Follow redirects
    });
    
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // Ignored
    }

    if (!res.ok) {
      const errMsg = json?.error?.message || json?.message || `HTTP ${res.status}`;
      return { ok: false, error: errMsg };
    }

    return { ok: true, data: json?.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error("API request failed:", err);
    pauseBackend(`Could not reach backend. Is it running? (${message})`);
    return {
      ok: false,
      error: `Could not reach backend. Is it running? (${message})`,
    };
  }
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export interface LoginResult {
  ok: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export async function loginToBackend(username: string, appPassword: string): Promise<LoginResult> {
  const res = await apiRequest<{ token: string; user: User }>("/api/v1/auth/login", "POST", {
    username,
    appPassword,
  }, { auth: false, contentType: "text" });
  
  if (res.ok && res.data) {
    localStorage.setItem("dpc-nexus-auth-token", res.data.token);
    localStorage.setItem("dpc-nexus-wp-credentials", JSON.stringify({ username, appPassword }));
    localStorage.setItem("dpc-nexus-user", JSON.stringify(res.data.user));
    return { ok: true, user: res.data.user, token: res.data.token };
  }
  
  return { ok: false, error: res.error };
}

// ---------------------------------------------------------------------------
// Core Data CRUD
// ---------------------------------------------------------------------------

export async function fetchBackendProducts(): Promise<Product[]> {
  const res = await apiRequest<Product[]>("/api/v1/products");
  return res.ok && res.data ? res.data : [];
}

export async function canReachBackend(): Promise<boolean> {
  if (isBackendPaused()) return false;
  const res = await apiRequest<{ status: string }>("/api/v1/health", "GET", undefined, { auth: false });
  return res.ok;
}

export async function createBackendProduct(product: Partial<Product>): Promise<Product | null> {
  const res = await apiRequest<Product>("/api/v1/products", "POST", product);
  return res.ok ? (res.data || null) : null;
}

export async function updateBackendProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  const res = await apiRequest<Product>(`/api/v1/products/${id}`, "PUT", product);
  return res.ok ? (res.data || null) : null;
}

export async function updateBackendProductStock(id: string, stockQuantity: number): Promise<Product | null> {
  const res = await apiRequest<Product>(`/api/v1/products/${id}/stock`, "PUT", { stock_quantity: stockQuantity });
  return res.ok ? (res.data || null) : null;
}

export async function deleteBackendProduct(id: string): Promise<boolean> {
  const res = await apiRequest(`/api/v1/products/${id}`, "DELETE");
  return res.ok;
}

export async function fetchBackendCategories(): Promise<Category[]> {
  const res = await apiRequest<Category[]>("/api/v1/categories");
  return res.ok && res.data ? res.data : [];
}

export async function fetchBackendCustomers(): Promise<Customer[]> {
  const res = await apiRequest<Customer[]>("/api/v1/customers");
  return res.ok && res.data ? res.data : [];
}

export async function fetchBackendOrders(): Promise<Order[]> {
  const res = await apiRequest<Order[]>("/api/v1/orders");
  return res.ok && res.data ? res.data : [];
}

export async function createBackendOrder(order: Partial<Order>): Promise<Order | null> {
  const res = await apiRequest<Order>("/api/v1/orders", "POST", order);
  return res.ok ? (res.data || null) : null;
}

export async function fetchBackendQuotes(): Promise<Quote[]> {
  const res = await apiRequest<Quote[]>("/api/v1/quotes");
  return res.ok && res.data ? res.data : [];
}

export async function createBackendQuote(quote: Partial<Quote>): Promise<Quote | null> {
  const res = await apiRequest<Quote>("/api/v1/quotes", "POST", quote);
  return res.ok ? (res.data || null) : null;
}

export async function updateBackendQuote(id: string, quote: Partial<Quote>): Promise<Quote | null> {
  const res = await apiRequest<Quote>(`/api/v1/quotes/${id}`, "PUT", quote);
  return res.ok ? (res.data || null) : null;
}


// ---------------------------------------------------------------------------
// Media upload
// ---------------------------------------------------------------------------

export interface MediaUploadResult {
  ok: boolean;
  url?: string;
  mediaId?: string;
  error?: string;
}

export async function uploadImageToBackend(file: File): Promise<MediaUploadResult> {
  // Validate file
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB frontend limit
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Image file size must be less than 5MB" };
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: "Unsupported image type. Use PNG, JPG, WebP, or GIF." };
  }

  // Read file as base64 data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const body: Record<string, string> = {
    filename: file.name,
    data: dataUrl,
  };

  const wpCreds = getWpCredentials();
  if (wpCreds) {
    body.username = wpCreds.username;
    body.appPassword = wpCreds.appPassword;
  }

  const res = await apiRequest<{ url: string; mediaId: string }>("/api/v1/media", "POST", body);
  
  if (res.ok && res.data) {
    return { ok: true, url: res.data.url, mediaId: res.data.mediaId };
  }
  
  return { ok: false, error: res.error };
}
