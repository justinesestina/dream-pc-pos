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
  const credentials = Buffer.from(`${config.wp.consumerKey}:${config.wp.consumerSecret}`).toString(
    "base64",
  );

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
    throw new ApiError(
      502,
      "WOOCOMMERCE_UNREACHABLE",
      `Cannot reach WooCommerce: ${String(cause)}`,
    );
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    // Surface WooCommerce's own reason (e.g. "Invalid image URL" or "Invalid
    // stock_status") instead of a bare HTTP status — that's what makes image
    // upload failures debuggable in the tester.
    const wcError =
      typeof body === "object" && body !== null && "code" in (body as Record<string, unknown>)
        ? (body as { code?: unknown; message?: unknown; data?: unknown }).code
        : undefined;
    const wcMessage =
      typeof body === "object" && body !== null && "message" in (body as Record<string, unknown>)
        ? (body as { message?: unknown }).message
        : undefined;
    const detail = wcMessage ? String(wcMessage) : `HTTP ${res.status}`;
    throw new ApiError(
      res.status >= 400 && res.status < 500 ? 400 : 502,
      "WOOCOMMERCE_ERROR",
      wcError ? `${String(wcError)}: ${detail}` : detail,
    );
  }
  return body;
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
}

/** Taxonomy entities: categories, tags, brands (and attribute terms). */
export interface WcTaxonomy {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  parent?: number;
  image?: string | { src?: string } | null;
  count?: number;
  display?: string;
}

export interface WcAttribute {
  id: number;
  name: string;
  slug: string;
  type: string;
  order_by: string;
  has_archives: boolean;
}

export interface WcMetaDatum {
  key: string;
  value: string | number | boolean | null;
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
  price: string;
  description: string;
  short_description?: string;
  stock_quantity: number | null;
  stock_status: string;
  manage_stock: boolean;
  categories: { id: number; name: string }[];
  images: { src: string; name?: string }[];
  brand: unknown;
  attributes: { name: string; options?: string[] }[];
  meta_data: WcMetaDatum[];
  date_created: string;
  date_modified: string;
}

export interface WcOrder {
  id: number;
  status: string;
  total: string;
  total_tax?: string;
  discount_total?: string;
  shipping_total?: string;
  customer_id: number;
  customer_note?: string;
  billing?: { first_name?: string; last_name?: string; email?: string };
  line_items: { product_id: number; name: string; sku?: string; quantity: number; total: string }[];
  meta_data?: WcMetaDatum[];
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

  async product(id: string | number): Promise<WcProduct> {
    return (await wcFetch(`products/${id}`)) as WcProduct;
  },

  async orders(params = ""): Promise<WcOrder[]> {
    return (await wcFetch(`orders?per_page=100&orderby=date&order=desc&${params}`)) as WcOrder[];
  },

  /** Fetch ALL orders across pages (quotes live as tagged orders, so lists need
   *  to scan pages and filter server-side — WC can't filter orders by meta). */
  async ordersAll(params = ""): Promise<WcOrder[]> {
    const all: WcOrder[] = [];
    for (let page = 1; page <= 100; page++) {
      const rows = (await wcFetch(
        `orders?per_page=100&page=${page}&orderby=date&order=desc&${params}`,
      )) as WcOrder[];
      all.push(...rows);
      if (rows.length < 100) break;
    }
    return all;
  },

  async customers(params = ""): Promise<WcCustomer[]> {
    return (await wcFetch(`customers?per_page=100${params}`)) as WcCustomer[];
  },

  async createCustomer(body: Record<string, unknown>): Promise<WcCustomer> {
    return (await wcFetch("customers", {
      method: "POST",
      body: JSON.stringify(body),
    })) as WcCustomer;
  },

  /** Create/update a product synchronously with the storefront catalog. */
  async createProduct(body: Record<string, unknown>): Promise<WcProduct> {
    return (await wcFetch("products", { method: "POST", body: JSON.stringify(body) })) as WcProduct;
  },

  /** Update existing WC product by id. */
  async updateProduct(id: string | number, body: Record<string, unknown>): Promise<WcProduct> {
    return (await wcFetch(`products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })) as WcProduct;
  },

  /** Permanently delete a product (could error if WC refuses due to orders). */
  async deleteProduct(id: string | number): Promise<WcProduct> {
    return (await wcFetch(`products/${id}?force=true`, { method: "DELETE" })) as WcProduct;
  },

  /** Push a stock correction to WooCommerce after receiving/selling. */
  async setStock(productId: string | number, stockQuantity: number): Promise<WcProduct> {
    return this.updateProduct(productId, {
      stock_quantity: stockQuantity,
      manage_stock: true,
    });
  },

  async order(id: string | number): Promise<WcOrder> {
    return (await wcFetch(`orders/${id}`)) as WcOrder;
  },

  /** Create a storefront order (the "orders" tab in the test page). */
  async createOrder(body: Record<string, unknown>): Promise<WcOrder> {
    return (await wcFetch("orders", { method: "POST", body: JSON.stringify(body) })) as WcOrder;
  },

  /** Update an order (quotes edit meta_data/line_items through this). */
  async updateOrder(id: string | number, body: Record<string, unknown>): Promise<WcOrder> {
    return (await wcFetch(`orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })) as WcOrder;
  },

  /** Permanently delete an order (quote delete). */
  async deleteOrder(id: string | number): Promise<WcOrder> {
    return (await wcFetch(`orders/${id}?force=true`, { method: "DELETE" })) as WcOrder;
  },

  /* ----------- taxonomy CRUD (categories / tags / brands / attributes) ----------- */

  async listTaxonomy(route: string): Promise<WcTaxonomy[]> {
    return (await wcFetch(`${route}?per_page=100&orderby=name&order=asc`)) as WcTaxonomy[];
  },

  async getTaxonomy(route: string): Promise<WcTaxonomy> {
    return (await wcFetch(route)) as WcTaxonomy;
  },

  async createTaxonomy(route: string, body: Record<string, unknown>): Promise<WcTaxonomy> {
    return (await wcFetch(route, { method: "POST", body: JSON.stringify(body) })) as WcTaxonomy;
  },

  async updateTaxonomy(route: string, body: Record<string, unknown>): Promise<WcTaxonomy> {
    return (await wcFetch(route, { method: "PUT", body: JSON.stringify(body) })) as WcTaxonomy;
  },

  async deleteTaxonomy(route: string): Promise<WcTaxonomy> {
    return (await wcFetch(`${route}?force=true`, { method: "DELETE" })) as WcTaxonomy;
  },

  async listAttributes(): Promise<WcAttribute[]> {
    return (await wcFetch(
      "products/attributes?per_page=100&orderby=name&order=asc",
    )) as WcAttribute[];
  },

  async createAttribute(body: Record<string, unknown>): Promise<WcAttribute> {
    return (await wcFetch("products/attributes", {
      method: "POST",
      body: JSON.stringify(body),
    })) as WcAttribute;
  },

  async updateAttribute(
    attributeId: string | number,
    body: Record<string, unknown>,
  ): Promise<WcAttribute> {
    return (await wcFetch(`products/attributes/${attributeId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })) as WcAttribute;
  },

  async deleteAttribute(attributeId: string | number): Promise<WcAttribute> {
    return (await wcFetch(`products/attributes/${attributeId}?force=true`, {
      method: "DELETE",
    })) as WcAttribute;
  },

  async attributeTerms(attributeId: string | number): Promise<WcTaxonomy[]> {
    return (await wcFetch(`products/attributes/${attributeId}/terms?per_page=100`)) as WcTaxonomy[];
  },

  async createAttributeTerm(
    attributeId: string | number,
    body: Record<string, unknown>,
  ): Promise<WcTaxonomy> {
    return (await wcFetch(`products/attributes/${attributeId}/terms`, {
      method: "POST",
      body: JSON.stringify(body),
    })) as WcTaxonomy;
  },

  async setAttributeTerm(
    attributeId: string | number,
    termId: string | number,
    body: Record<string, unknown>,
  ): Promise<WcTaxonomy> {
    return (await wcFetch(`products/attributes/${attributeId}/terms/${termId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })) as WcTaxonomy;
  },

  async deleteAttributeTerm(
    attributeId: string | number,
    termId: string | number,
  ): Promise<WcTaxonomy> {
    return (await wcFetch(`products/attributes/${attributeId}/terms/${termId}?force=true`, {
      method: "DELETE",
    })) as WcTaxonomy;
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
