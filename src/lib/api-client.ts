import type {
  User,
  Product,
  Order,
  Quote,
  Category,
  Customer,
  CatalogTerm,
  AttributeMeta,
  AttributeTerm,
  Warehouse,
  WarehouseStockRow,
  StockMovement,
  StockTransfer,
  TransferStatus,
  ProductStockInfo,
} from "./types";
import type { Supplier } from "./ops-types";
import {
  dpcCurrentUser,
  dpcDataRequest,
  dpcLogin,
  dpcLogout,
  isDpcConnectorEnabled,
} from "./dpc-connector";

/**
 * DPC POS — Frontend API client for the backend service.
 *
 * Handles authenticated requests to the Hono backend (backend/src/server.ts).
 * When the DPC connector is enabled (VITE_DPC_API_URL), authentication is
 * delegated to the dpc-pos-connector WordPress plugin instead.
 */

/** Base URL of the backend API. Defaults to localhost:8787 in dev. */
const API_BASE =
  (import.meta.env?.["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/+$/, "") ||
  (typeof window !== "undefined" && window.location.hostname === "dpcmain.dreampcbuild.com"
    ? "https://backend-shard55.vercel.app"
    : "http://localhost:8787");

let backendPausedUntil = 0;
let backendPauseReason: string | null = null;

/** Message from the most recent failed request (used for precise toasts). */
let lastApiError: string | null = null;

/** Human-readable reason the last API call failed, if any. */
export function getLastApiError(): string | null {
  return lastApiError;
}

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
  // When the DPC connector is configured it is the sole data source: the legacy
  // backend session no longer exists, so route every `/api/v1` call through the
  // connector and unwrap its envelope.
  if (isDpcConnectorEnabled() && path.startsWith("/api/v1/")) {
    const res = await dpcDataRequest<T>(path.slice("/api/v1".length), method, body);
    if (res.ok) {
      lastApiError = null;
      return { ok: true, data: res.data as T };
    }
    lastApiError = res.error ?? "Connector request failed.";
    return { ok: false, error: lastApiError };
  }

  if (opts.auth !== false && isBackendPaused()) {
    lastApiError = backendPauseReason ?? "Backend temporarily unavailable.";
    return { ok: false, error: lastApiError };
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
      body: body ? JSON.stringify(body) : null,
      redirect: "follow", // Follow redirects
    });

    let json: { data?: T; error?: { message?: string }; message?: string } | null = null;
    try {
      json = await res.json();
    } catch {
      // Ignored
    }

    if (!res.ok) {
      const errMsg = json?.error?.message || json?.message || `HTTP ${res.status}`;
      lastApiError = errMsg;
      return { ok: false, error: errMsg };
    }

    lastApiError = null;
    return { ok: true, data: json?.data as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error("API request failed:", err);
    pauseBackend(`Could not reach backend. Is it running? (${message})`);
    lastApiError = `Could not reach backend (${message})`;
    return {
      ok: false,
      error: lastApiError,
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
  // Prefer the DPC POS connector when configured. On failure we fall through to
  // the legacy backend so existing WordPress users keep working during migration.
  if (isDpcConnectorEnabled()) {
    const dpc = await dpcLogin(username, appPassword);
    if (dpc.ok && dpc.user) {
      try {
        localStorage.setItem("dpc-nexus-user", JSON.stringify(dpc.user));
        localStorage.removeItem("dpc-nexus-auth-token");
        localStorage.removeItem("dpc-nexus-wp-credentials");
      } catch {
        /* storage unavailable; in-memory session still works */
      }
      return { ok: true, user: dpc.user };
    }
    // Connector enabled: surface its error instead of silently retrying the
    // legacy WordPress app-password flow, which would hide CORS/session issues.
    return { ok: false, error: dpc.error ?? "DPC connector sign in failed." };
  }

  const res = await apiRequest<{ token: string; user: User }>(
    "/api/v1/auth/login",
    "POST",
    {
      username,
      appPassword,
    },
    { auth: false, contentType: "text" },
  );

  if (res.ok && res.data) {
    localStorage.setItem("dpc-nexus-auth-token", res.data.token);
    localStorage.setItem("dpc-nexus-wp-credentials", JSON.stringify({ username, appPassword }));
    localStorage.setItem("dpc-nexus-user", JSON.stringify(res.data.user));
    return { ok: true, user: res.data.user, token: res.data.token };
  }

  return { ok: false, error: res.error || "Login failed" };
}

/**
 * Restores a DPC connector session on boot. Returns null when the connector is
 * disabled or there is no active session.
 */
export async function restoreDpcSession(): Promise<User | null> {
  if (!isDpcConnectorEnabled()) return null;
  return dpcCurrentUser();
}

/**
 * Signs out: revokes the DPC connector session when enabled, then clears any
 * locally cached auth artifacts.
 */
export async function logoutBackend(): Promise<void> {
  if (isDpcConnectorEnabled()) {
    await dpcLogout();
  }
  try {
    localStorage.removeItem("dpc-nexus-auth-token");
    localStorage.removeItem("dpc-nexus-wp-credentials");
    localStorage.removeItem("dpc-nexus-user");
  } catch {
    /* ignore */
  }
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
  const res = await apiRequest<{ status: string }>("/api/v1/health", "GET", undefined, {
    auth: false,
  });
  return res.ok;
}

export async function createBackendProduct(product: Partial<Product>): Promise<Product | null> {
  const res = await apiRequest<Product>("/api/v1/products", "POST", product);
  return res.ok ? res.data || null : null;
}

export async function updateBackendProduct(
  id: string,
  product: Partial<Product>,
): Promise<Product | null> {
  const res = await apiRequest<Product>(`/api/v1/products/${id}`, "PUT", product);
  return res.ok ? res.data || null : null;
}

export async function updateBackendProductStock(
  id: string,
  stockQuantity: number,
): Promise<Product | null> {
  const res = await apiRequest<Product>(`/api/v1/products/${id}/stock`, "PUT", {
    stock_quantity: stockQuantity,
  });
  return res.ok ? res.data || null : null;
}

export async function deleteBackendProduct(id: string): Promise<boolean> {
  const res = await apiRequest(`/api/v1/products/${id}`, "DELETE");
  return res.ok;
}

export async function fetchBackendCategories(): Promise<Category[]> {
  const res = await apiRequest<Category[]>("/api/v1/categories");
  return res.ok && res.data ? res.data : [];
}

export async function createBackendCategory(category: Partial<Category>): Promise<Category | null> {
  const res = await apiRequest<Category>("/api/v1/categories", "POST", category);
  return res.ok ? res.data || null : null;
}

export async function updateBackendCategory(
  id: string,
  category: Partial<Category>,
): Promise<Category | null> {
  const res = await apiRequest<Category>(`/api/v1/categories/${id}`, "PUT", category);
  return res.ok ? res.data || null : null;
}

export async function deleteBackendCategory(id: string): Promise<boolean> {
  const res = await apiRequest(`/api/v1/categories/${id}`, "DELETE");
  return res.ok;
}

// ---------------------------------------------------------------------------
// Taxonomy CRUD (brands / tags / attributes / terms — WooCommerce backed)
// ---------------------------------------------------------------------------

function taxonomyCrud(kind: "brands" | "tags", base: string) {
  const fetchList = async (): Promise<CatalogTerm[]> => {
    const res = await apiRequest<CatalogTerm[]>(base);
    return res.ok && res.data ? res.data : [];
  };
  const create = async (term: Partial<CatalogTerm>): Promise<CatalogTerm | null> => {
    const res = await apiRequest<CatalogTerm>(base, "POST", term);
    return res.ok ? res.data || null : null;
  };
  const update = async (id: string, term: Partial<CatalogTerm>): Promise<CatalogTerm | null> => {
    const res = await apiRequest<CatalogTerm>(`${base}/${id}`, "PUT", term);
    return res.ok ? res.data || null : null;
  };
  const remove = async (id: string): Promise<boolean> => {
    const res = await apiRequest(`${base}/${id}`, "DELETE");
    return res.ok;
  };
  return { kind, fetchList, create, update, remove };
}

export const brandsApi = taxonomyCrud("brands", "/api/v1/brands");
export const tagsApi = taxonomyCrud("tags", "/api/v1/tags");

export async function fetchBackendAttributes(): Promise<AttributeMeta[]> {
  const res = await apiRequest<AttributeMeta[]>("/api/v1/attributes");
  return res.ok && res.data ? res.data : [];
}

export async function createBackendAttribute(
  attribute: Partial<AttributeMeta>,
): Promise<AttributeMeta | null> {
  const res = await apiRequest<AttributeMeta>("/api/v1/attributes", "POST", {
    name: attribute.name,
    slug: attribute.slug,
    type: attribute.type,
  });
  return res.ok ? res.data || null : null;
}

export async function updateBackendAttribute(
  id: string,
  attribute: Partial<AttributeMeta>,
): Promise<AttributeMeta | null> {
  const res = await apiRequest<AttributeMeta>(`/api/v1/attributes/${id}`, "PUT", {
    name: attribute.name,
  });
  return res.ok ? res.data || null : null;
}

export async function deleteBackendAttribute(id: string): Promise<boolean> {
  const res = await apiRequest(`/api/v1/attributes/${id}`, "DELETE");
  return res.ok;
}

export async function fetchBackendAttributeTerms(attributeId: string): Promise<AttributeTerm[]> {
  const res = await apiRequest<AttributeTerm[]>(`/api/v1/attributes/${attributeId}/terms`);
  return res.ok && res.data ? res.data : [];
}

export async function createBackendAttributeTerm(
  attributeId: string,
  term: Partial<AttributeTerm>,
): Promise<AttributeTerm | null> {
  const res = await apiRequest<AttributeTerm>(`/api/v1/attributes/${attributeId}/terms`, "POST", {
    name: term.name,
    slug: term.slug,
  });
  return res.ok ? res.data || null : null;
}

export async function updateBackendAttributeTerm(
  attributeId: string,
  termId: string,
  term: Partial<AttributeTerm>,
): Promise<AttributeTerm | null> {
  const res = await apiRequest<AttributeTerm>(
    `/api/v1/attributes/${attributeId}/terms/${termId}`,
    "PUT",
    {
      name: term.name,
      slug: term.slug,
    },
  );
  return res.ok ? res.data || null : null;
}

export async function deleteBackendAttributeTerm(
  attributeId: string,
  termId: string,
): Promise<boolean> {
  const res = await apiRequest(`/api/v1/attributes/${attributeId}/terms/${termId}`, "DELETE");
  return res.ok;
}

// ---------------------------------------------------------------------------
// Warehouses + multi-warehouse inventory (WooCommerce-backed — see backend
// lib/warehouse-store.ts and lib/inventory-store.ts)
// ---------------------------------------------------------------------------

export async function fetchBackendWarehouses(): Promise<Warehouse[]> {
  const res = await apiRequest<Warehouse[]>("/api/v1/warehouses");
  return res.ok && res.data ? res.data : [];
}

export async function fetchBackendWarehouse(id: string): Promise<Warehouse | null> {
  const res = await apiRequest<Warehouse>(`/api/v1/warehouses/${id}`);
  return res.ok ? res.data || null : null;
}

export async function createBackendWarehouse(
  warehouse: Partial<Warehouse>,
): Promise<Warehouse | null> {
  const res = await apiRequest<Warehouse>("/api/v1/warehouses", "POST", warehouse);
  return res.ok ? res.data || null : null;
}

export async function updateBackendWarehouse(
  id: string,
  warehouse: Partial<Warehouse>,
): Promise<Warehouse | null> {
  const res = await apiRequest<Warehouse>(`/api/v1/warehouses/${id}`, "PUT", warehouse);
  return res.ok ? res.data || null : null;
}

export async function deleteBackendWarehouse(id: string): Promise<boolean> {
  const res = await apiRequest(`/api/v1/warehouses/${id}`, "DELETE");
  return res.ok;
}

// Suppliers (WooCommerce-backed records with direct product assignments)
export async function fetchBackendSuppliers(): Promise<Supplier[] | null> {
  const res = await apiRequest<Supplier[]>("/api/v1/suppliers");
  return res.ok && res.data ? res.data : res.ok ? [] : null;
}

export async function createBackendSupplier(
  supplier: Omit<Supplier, "id" | "rating" | "status">,
): Promise<Supplier | null> {
  const res = await apiRequest<Supplier>("/api/v1/suppliers", "POST", supplier);
  return res.ok ? res.data || null : null;
}

export async function updateBackendSupplier(
  id: string,
  patch: Partial<Supplier>,
): Promise<Supplier | null> {
  const res = await apiRequest<Supplier>(`/api/v1/suppliers/${id}`, "PUT", patch);
  return res.ok ? res.data || null : null;
}

export async function fetchWarehouseStock(id: string): Promise<WarehouseStockRow[]> {
  const res = await apiRequest<Omit<WarehouseStockRow, "id">[]>(`/api/v1/warehouses/${id}/stock`);
  return res.ok && res.data ? res.data.map((r) => ({ ...r, id: r.productId })) : [];
}

export interface AddStockInput {
  productId: string;
  quantity: number;
  costPrice?: number;
  supplier?: string;
  reference?: string;
  notes?: string;
  idempotencyKey?: string;
}

/**
 * Generate a one-shot key for a mutating action. Reusing it on a retry tells the
 * backend to apply the change at most once (protects add/deduct/edit/transfers
 * against spam-clicks and network retries).
 */
export function newIdempotencyKey(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function addWarehouseStock(
  warehouseId: string,
  input: AddStockInput,
): Promise<{ movement: StockMovement; product: ProductStockInfo } | null> {
  const res = await apiRequest<{ movement: StockMovement; product: ProductStockInfo }>(
    `/api/v1/warehouses/${warehouseId}/stock`,
    "POST",
    input,
  );
  return res.ok ? res.data || null : null;
}

export async function fetchWarehouseMovements(id: string): Promise<StockMovement[]> {
  const res = await apiRequest<StockMovement[]>(`/api/v1/warehouses/${id}/movements`);
  return res.ok && res.data ? res.data : [];
}

export async function fetchWarehouseTransfers(id: string): Promise<StockTransfer[]> {
  const res = await apiRequest<StockTransfer[]>(`/api/v1/warehouses/${id}/transfers`);
  return res.ok && res.data ? res.data : [];
}

export async function fetchBackendTransfers(warehouseId?: string): Promise<StockTransfer[]> {
  const qs = warehouseId ? `?warehouseId=${encodeURIComponent(warehouseId)}` : "";
  const res = await apiRequest<StockTransfer[]>(`/api/v1/transfers${qs}`);
  return res.ok && res.data ? res.data : [];
}

export interface CreateTransferInput {
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  notes?: string;
}

export async function createBackendTransfer(
  input: CreateTransferInput,
): Promise<StockTransfer | null> {
  const res = await apiRequest<StockTransfer>("/api/v1/transfers", "POST", input);
  return res.ok ? res.data || null : null;
}

export async function updateBackendTransferStatus(
  id: string,
  status: TransferStatus,
  idempotencyKey?: string,
): Promise<StockTransfer | null> {
  const body = idempotencyKey ? { status, idempotencyKey } : { status };
  const res = await apiRequest<StockTransfer>(`/api/v1/transfers/${id}`, "PUT", body);
  return res.ok ? res.data || null : null;
}

export interface SetWarehouseStockInput {
  quantity?: number;
  costPrice?: number;
  note?: string;
  idempotencyKey?: string;
}

/** Inline row edit: set a product's absolute quantity / unit cost in a warehouse. */
export async function setWarehouseStock(
  warehouseId: string,
  productId: string,
  input: SetWarehouseStockInput,
): Promise<{ movement?: StockMovement; row: WarehouseStockRow } | null> {
  const res = await apiRequest<{ movement?: StockMovement; row: WarehouseStockRow }>(
    `/api/v1/warehouses/${warehouseId}/stock/${productId}`,
    "PUT",
    input,
  );
  return res.ok ? res.data || null : null;
}

export async function deleteBackendTransfer(id: string): Promise<boolean> {
  const res = await apiRequest(`/api/v1/transfers/${id}`, "DELETE");
  return res.ok;
}

export async function fetchBackendProductStock(): Promise<ProductStockInfo[]> {
  const res = await apiRequest<ProductStockInfo[]>("/api/v1/inventory/stock");
  return res.ok && res.data ? res.data : [];
}

export async function fetchBackendInventoryMovements(params?: {
  warehouseId?: string;
  productId?: string;
}): Promise<StockMovement[]> {
  const qs = new URLSearchParams();
  if (params?.warehouseId) qs.set("warehouseId", params.warehouseId);
  if (params?.productId) qs.set("productId", params.productId);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await apiRequest<StockMovement[]>(`/api/v1/inventory/movements${suffix}`);
  return res.ok && res.data ? res.data : [];
}

export async function adjustBackendStock(
  productId: string,
  input: {
    warehouseId: string;
    delta: number;
    reference?: string;
    note?: string;
    idempotencyKey?: string;
  },
): Promise<StockMovement | null> {
  const res = await apiRequest<StockMovement>(
    `/api/v1/inventory/stock/${productId}/adjust`,
    "POST",
    input,
  );
  return res.ok ? res.data || null : null;
}

export async function fetchBackendCustomers(): Promise<Customer[]> {
  const res = await apiRequest<Customer[]>("/api/v1/customers");
  return res.ok && res.data ? res.data : [];
}

export async function createBackendCustomer(
  customer: Omit<Customer, "id" | "since" | "status">,
): Promise<Customer | null> {
  const res = await apiRequest<Customer>("/api/v1/customers", "POST", customer);
  return res.ok ? res.data || null : null;
}

export async function fetchBackendOrders(): Promise<Order[]> {
  const res = await apiRequest<Order[]>("/api/v1/orders");
  return res.ok && res.data ? res.data : [];
}

export async function createBackendOrder(order: Partial<Order>): Promise<Order | null> {
  const res = await apiRequest<Order>("/api/v1/orders", "POST", order);
  return res.ok ? res.data || null : null;
}

export async function updateBackendOrderStatus(
  id: string,
  status: Order["status"],
): Promise<Order | null> {
  const res = await apiRequest<Order>(`/api/v1/orders/${id}`, "PUT", { status });
  return res.ok ? res.data || null : null;
}

export async function fetchBackendQuotes(): Promise<Quote[]> {
  const res = await apiRequest<Quote[]>("/api/v1/quotes");
  return res.ok && res.data ? res.data : [];
}

export interface GlobalSearchResult {
  id: string;
  type: "dashboard" | "products" | "orders" | "quotes" | "customers" | "page";
  label: string;
  subtitle: string;
  route: string;
  imageUrl?: string | undefined;
}

export async function searchBackendGlobal(query: string): Promise<GlobalSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await apiRequest<GlobalSearchResult[]>(`/api/v1/search?q=${encodeURIComponent(q)}`);
  return res.ok && res.data ? res.data : [];
}

export async function createBackendQuote(quote: Partial<Quote>): Promise<Quote | null> {
  const res = await apiRequest<Quote>("/api/v1/quotes", "POST", quote);
  return res.ok ? res.data || null : null;
}

export async function updateBackendQuote(id: string, quote: Partial<Quote>): Promise<Quote | null> {
  const res = await apiRequest<Quote>(`/api/v1/quotes/${id}`, "PUT", quote);
  return res.ok ? res.data || null : null;
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
    body["username"] = wpCreds.username;
    body["appPassword"] = wpCreds.appPassword;
  }

  const res = await apiRequest<{ url: string; mediaId: string }>("/api/v1/media", "POST", body);

  if (res.ok && res.data) {
    return { ok: true, url: res.data.url, mediaId: res.data.mediaId };
  }

  return { ok: false, error: res.error || "Upload failed" };
}
