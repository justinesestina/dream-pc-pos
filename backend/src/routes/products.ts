/**
 * Catalog (products/categories) — real CRUD backed by WooCommerce (P0).
 *
 *   GET    /api/v1/products            list   (live WC catalog, full DTO)
 *   GET    /api/v1/products/:id        single product (full detail)
 *   POST   /api/v1/products            create   (syncs to WC)
 *   PUT    /api/v1/products/:id        edit     (syncs to WC)
 *   PUT    /api/v1/products/:id/stock  set stock qty (syncs to WC)
 *   DELETE /api/v1/products/:id        remove   (force-delete in WC)
 *   GET    /api/v1/products/categories/live   list WC categories
 *
 * The mapped shape is the frontend `Product` DTO plus extra WC detail fields
 * (status, salePrice, imageUrl, dates, meta-backed local fields). Keep the
 * base fields in sync with src/lib/types.ts via backend/src/types/dto.ts.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import { woocommerce, type WcProduct, type WcMetaDatum } from "../lib/woocommerce.js";
import type { Product, Category } from "../types/dto.js";

/** Extra display/detail fields beyond the shared Product DTO. */
export interface ProductDetail extends Product {
  status?: string;
  salePrice?: number;
  categoryName?: string;
  imageUrl?: string;
  dateCreated?: string;
  dateModified?: string;
}

function meta(raw: WcProduct, key: string): string | number | boolean | null | undefined {
  return raw.meta_data.find((m: WcMetaDatum) => m.key === key)?.value;
}
const str = (v: unknown, fallback = "") => (v == null ? fallback : String(v));

const WC_TYPE_TO_PRODUCT: Record<string, Product["productType"]> = {
  simple: "product",
  variable: "product",
  grouped: "product",
  external: "product",
  service: "service",
  bundle: "bundle",
};

export function mapWcProductToDto(raw: WcProduct): ProductDetail {
  const first = raw.categories[0];
  const attrs: Record<string, string> = {};
  let brand = str(meta(raw, "_dpc_brand"), "");
  const rb = raw.brand;
  if (!brand && rb) {
    if (Array.isArray(rb)) brand = str(rb[0]?.name ?? "");
    else if (typeof rb === "object") brand = str((rb as { name?: unknown }).name ?? "");
    else brand = str(rb);
  }
  for (const attr of raw.attributes ?? []) {
    const label = attr.name;
    const value = (attr.options ?? []).join(", ");
    attrs[label] = value;
    if (!brand && /brand/i.test(label)) brand = value;
  }

  return {
    id: String(raw.id),
    sku: raw.sku || String(raw.id),
    name: raw.name,
    brand,
    categoryId: first ? String(first.id) : "",
    categoryName: first?.name,
    productType: raw.type ? WC_TYPE_TO_PRODUCT[raw.type] ?? "product" : undefined,
    description: raw.description ?? raw.short_description ?? "",
    price: Number(raw.regular_price || raw.price || 0),
    salePrice: raw.sale_price ? Number(raw.sale_price) : undefined,
    cost: Number(meta(raw, "_dpc_cost")) || 0,
    serialTracked: meta(raw, "_dpc_serial_tracked") === true || str(meta(raw, "_dpc_serial_tracked")) === "true",
    warrantyMonths: Number(meta(raw, "_dpc_warranty_months")) || 0,
    location: str(meta(raw, "_dpc_location")),
    supplier: str(meta(raw, "_dpc_supplier")),
    specs: attrs,
    status: raw.status,
    stock_quantity: raw.stock_quantity,
    stock_status: raw.stock_status,
    manage_stock: raw.manage_stock,
    imageUrl: raw.images?.[0]?.src,
    dateCreated: raw.date_created,
    dateModified: raw.date_modified,
  };
}

const STOCK_STATUSES = ["instock", "outofstock", "onbackorder"] as const;

/** Builds the WC update/create payload for the fields the UI can edit. */
function toWcPayload(body: Record<string, unknown>): Record<string, unknown> {
  const name = String(body.name ?? "").trim();
  if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");

  const price = Number(body.price);
  const payload: Record<string, unknown> = { name };

  if (Number.isFinite(price)) payload["regular_price"] = String(price);
  if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== "") {
    payload["sale_price"] = String(Number(body.salePrice));
  } else if (body.salePrice !== undefined) {
    payload["sale_price"] = "";
  }
  if (body.stock_quantity !== undefined && Number.isFinite(Number(body.stock_quantity))) {
    payload["stock_quantity"] = Math.max(0, Math.floor(Number(body.stock_quantity)));
    payload["manage_stock"] = body.manage_stock === false ? false : true;
  }
  if (body.manage_stock !== undefined) payload["manage_stock"] = Boolean(body.manage_stock);
  if (typeof body.stock_status === "string" && body.stock_status) {
    const s = body.stock_status;
    if (!STOCK_STATUSES.includes(s as (typeof STOCK_STATUSES)[number])) {
      throw new ApiError(400, "BAD_REQUEST", "stock_status must be one of: instock, outofstock, onbackorder");
    }
    payload["stock_status"] = s;
  }
  if (body.sku !== undefined) payload["sku"] = String(body.sku);
  if (body.description !== undefined) payload["description"] = String(body.description);
  if (typeof body.status === "string" && body.status) payload["status"] = body.status;
  if (body.categoryId) {
    const catId = Number(body.categoryId);
    if (Number.isFinite(catId)) payload["categories"] = [{ id: catId }];
  }
  if (body.imageUrl !== undefined) {
    const img = String(body.imageUrl).trim();
    payload["images"] = img ? [{ src: img }] : [];
  }

  // Local-only metadata persisted via WC custom fields.
  const meta_data: WcMetaDatum[] = [];
  const pushMeta = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== "") {
      meta_data.push({ key, value: value as string | number | boolean });
    }
  };
  pushMeta("_dpc_cost", Number(body.cost) || 0);
  pushMeta("_dpc_brand", body.brand);
  pushMeta("_dpc_warranty_months", Math.max(0, Math.floor(Number(body.warrantyMonths) || 0)));
  pushMeta("_dpc_serial_tracked", Boolean(body.serialTracked));
  pushMeta("_dpc_location", body.location);
  pushMeta("_dpc_supplier", body.supplier);
  if (meta_data.length) payload["meta_data"] = meta_data;

  return payload;
}

export function productsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const search = c.req.query("search") ?? "";
    const params = search ? `&search=${encodeURIComponent(search)}` : "";
    const raw = await woocommerce.products(params);
    const products = raw.map(mapWcProductToDto);
    return c.json(ok(products, { total: products.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid product id");
    const raw = await woocommerce.product(id);
    if (!raw || Array.isArray(raw)) throw new NotFoundError("Product not found");
    return c.json(ok(mapWcProductToDto(raw)));
  });

  app.post("/", requireAuth, async (c) => {
    const payload = { type: "simple", status: "publish", ...toWcPayload(await c.req.json().catch(() => ({}))) };
    const created = await woocommerce.createProduct(payload);
    return c.json(ok(mapWcProductToDto(created)), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid product id");
    const payload = toWcPayload(await c.req.json().catch(() => ({})));
    const updated = await woocommerce.updateProduct(id, payload);
    return c.json(ok(mapWcProductToDto(updated)));
  });

  app.put("/:id/stock", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid product id");
    const qty = Number((await c.req.json().catch(() => ({}))).stock_quantity);
    if (!Number.isFinite(qty)) throw new ApiError(400, "BAD_REQUEST", "stock_quantity is required");
    const updated = await woocommerce.setStock(id, Math.max(0, Math.floor(qty)));
    return c.json(ok(mapWcProductToDto(updated)));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid product id");
    const deleted = await woocommerce.deleteProduct(id);
    if (!deleted || Array.isArray(deleted)) throw new NotFoundError("Product not found");
    return c.json(ok({ id: String(id), deleted: true }));
  });

  app.get("/categories/live", requireAuth, async (c) => {
    const raw = await woocommerce.categories();
    const categories: Category[] = raw.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      archived: false,
      createdAt: "",
      key: cat.slug,
    }));
    return c.json(ok(categories, { total: categories.length }));
  });

  return app;
}