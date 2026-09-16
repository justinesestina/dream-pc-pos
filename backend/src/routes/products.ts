/**
 * Catalog (products / categories). Phase P0 imports from WooCommerce via
 * lib/woocommerce.ts; until then these return the live catalog shape, empty.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok } from "../lib/errors.js";
import { woocommerce } from "../lib/woocommerce.js";
import type { Product, Category } from "../types/dto.js";

export function productsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    // TODO(P1): read products from Postgres (supabase). For now proxy WC raw.
    const raw = await woocommerce.products().catch(() => []);
    const products: Product[] = raw.map((p) => ({
      id: String(p.id),
      sku: p.sku || String(p.id),
      name: p.name,
      brand: "",
      categoryId: String(p.categories[0]?.id ?? ""),
      price: Number(p.regular_price || p.sale_price || 0),
      cost: 0,
      serialTracked: false,
      warrantyMonths: 12,
      location: "",
      supplier: "",
      specs: {},
      stock_quantity: p.stock_quantity,
      stock_status: p.stock_status,
      manage_stock: p.manage_stock,
    }));
    return c.json(ok(products, { total: products.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    // TODO(P1): single-product read.
    return c.json(ok({ id: c.req.param("id") } as unknown as Product));
  });

  app.post("/", requireAuth, async (c) => {
    // TODO(P1): create, sync to WooCommerce via woocommerce.createProduct().
    return c.json(ok(await c.req.json().catch(() => ({}))), 201);
  });

  app.get("/categories", requireAuth, async (c) => {
    // TODO(P1): read categories from Postgres.
    const raw = await woocommerce.categories().catch(() => []);
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