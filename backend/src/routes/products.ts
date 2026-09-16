/**
 * Catalog (products/categories) — real CRUD backed by WooCommerce (P0).
 *
 *   GET    /api/v1/products            list (live WC catalog)
 *   GET    /api/v1/products/:id        single product
 *   POST   /api/v1/products            create   (syncs to WC)
 *   PUT    /api/v1/products/:id        edit     (syncs to WC)
 *   PUT    /api/v1/products/:id/stock  set stock qty (syncs to WC)
 *   DELETE /api/v1/products/:id        remove   (force-delete in WC)
 *
 * The mapped shape below IS the frontend's `Product` DTO — keep it in sync
 * with src/lib/types.ts via backend/src/types/dto.ts.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import { woocommerce, type WcProduct } from "../lib/woocommerce.js";
import type { Product, Category } from "../types/dto.js";

export function mapWcProductToDto(raw: WcProduct): Product {
  const first = raw.categories[0];
  return {
    id: String(raw.id),
    sku: raw.sku || String(raw.id),
    name: raw.name,
    brand: "",
    categoryId: first ? String(first.id) : "",
    description: raw.name,
    price: Number(raw.regular_price || raw.sale_price || 0),
    cost: 0,
    serialTracked: false,
    warrantyMonths: 12,
    location: "",
    supplier: "",
    specs: {},
    stock_quantity: raw.stock_quantity,
    stock_status: raw.stock_status,
    manage_stock: raw.manage_stock,
  };
}

function parseProductBody(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");

  const price = Number(body.price ?? 0);
  const stock = Number(body.stock_quantity ?? 0);

  return {
    name,
    regular_price: String(price),
    stock_quantity: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0,
    manage_stock: true,
    sku: body.sku ? String(body.sku) : undefined,
    description: body.description ? String(body.description) : undefined,
  };
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
    const body = parseProductBody(await c.req.json().catch(() => ({})));
    const created = await woocommerce.createProduct({ type: "simple", status: "publish", ...body });
    return c.json(ok(mapWcProductToDto(created)), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid product id");
    const body = parseProductBody(await c.req.json().catch(() => ({})));
    const updated = await woocommerce.updateProduct(id, body);
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