/**
 * Server-side WooCommerce REST bridge.
 *
 * The transitional browser-direct calls in the frontend
 * (src/lib/woocommerce-*.ts, src/lib/wp-auth.ts) move HERE in Phase P5 so keys
 * live only on the server. Field mapping is intentionally minimal; extend the
 * mappers as the P0/P1 phases land rather than importing frontend logic.
 */
import { config, wpConfigured } from "../config.js";
import { ApiError } from "./errors.js";

type WcEndpoint = "products" | "products/categories" | "orders" | "customers" | string;

async function wcFetch(route: WcEndpoint, init?: RequestInit): Promise<unknown> {
  if (!wpConfigured) {
    throw new ApiError(503, "WOOCOMMERCE_NOT_CONFIGURED", "WooCommerce is not configured");
  }
  const url = `${config.wp.url}/wp-json/wc/v3/${route}`;
  const credentials = Buffer.from(
    `${config.wp.consumerKey}:${config.wp.consumerSecret}`,
  ).toString("base64");

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (cause) {
    throw new ApiError(502, "WOOCOMMERCE_UNREACHABLE", `Cannot reach WooCommerce: ${String(cause)}`);
  }

  if (!res.ok) {
    throw new ApiError(502, "WOOCOMMERCE_ERROR", `WooCommerce HTTP ${res.status}`);
  }
  return res.json();
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
}

export interface WcProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  type: string;
  status: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  stock_status: string;
  manage_stock: boolean;
  categories: { id: number; name: string }[];
  brand: unknown;
  attributes: { name: string; options?: string[] }[];
}

export interface WcOrder {
  id: number;
  status: string;
  total: string;
  customer_id: number;
  line_items: { product_id: number; name: string; quantity: number; total: string }[];
  date_created: string;
}

export interface WcCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  billing: { phone?: string; address_1?: string; city?: string };
  date_created: string;
}

export const woocommerce = {
  async categories(): Promise<WcCategory[]> {
    return (await wcFetch("products/categories?per_page=100")) as WcCategory[];
  },

  async products(params = ""): Promise<WcProduct[]> {
    return (await wcFetch(`products?per_page=100&orderby=id&order=desc&${params}`)) as WcProduct[];
  },

  async orders(params = ""): Promise<WcOrder[]> {
    return (await wcFetch(`orders?per_page=100&orderby=date&order=desc&${params}`)) as WcOrder[];
  },

  async customers(params = ""): Promise<WcCustomer[]> {
    return (await wcFetch(`customers?per_page=100${params}`)) as WcCustomer[];
  },

  /** Create/update a product synchronously with the storefront catalog. */
  async createProduct(body: Record<string, unknown>): Promise<WcProduct> {
    return (await wcFetch("products", { method: "POST", body: JSON.stringify(body) })) as WcProduct;
  },

  /** Push a stock correction to WooCommerce after receiving/selling. */
  async setStock(productId: number, stockQuantity: number): Promise<WcProduct> {
    return (await wcFetch(`products/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ stock_quantity: stockQuantity, manage_stock: true }),
    })) as WcProduct;
  },
};

/** Minimal direction-of-travel mapping for the P0 product import. */
export function mapWcProduct(raw: WcProduct) {
  return {
    sku: raw.sku || String(raw.id),
    name: raw.name,
    price: Number(raw.regular_price || raw.sale_price || 0),
    cost: 0,
    supplier: "initial",
    // categoryId/ids resolved against the local catalog during import.
  };
}