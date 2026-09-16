/**
 * Categories CRUD — backed by WooCommerce `products/categories`.
 *   GET /api/v1/categories            list
 *   GET /api/v1/categories/:id        one
 *   POST   /api/v1/categories         create  { name, slug?, parent? }
 *   PUT    /api/v1/categories/:id     edit
 *   DELETE /api/v1/categories/:id     delete (force)
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import { woocommerce, type WcTaxonomy } from "../lib/woocommerce.js";

function toCategoryDto(raw: WcTaxonomy) {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug ?? "",
    parentId: raw.parent ? String(raw.parent) : undefined,
    count: raw.count ?? 0,
  };
}

export function categoriesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const raw = await woocommerce.listTaxonomy("products/categories");
    const data = raw.map(toCategoryDto);
    return c.json(ok(data, { total: data.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    return c.json(ok(toCategoryDto(await woocommerce.getTaxonomy(`products/categories/${id}`))));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");
    const created = await woocommerce.createTaxonomy("products/categories", {
      name,
      slug: body.slug ? String(body.slug) : undefined,
      parent: body.parentId ? Number(body.parentId) : undefined,
    });
    return c.json(ok(toCategoryDto(created)), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json().catch(() => ({}));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    const updated = await woocommerce.updateTaxonomy(`products/categories/${id}`, {
      name: body.name ? String(body.name) : undefined,
      slug: body.slug !== undefined ? String(body.slug) : undefined,
    });
    return c.json(ok(toCategoryDto(updated)));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    await woocommerce.deleteTaxonomy(`products/categories/${id}`);
    return c.json(ok({ id: String(id), deleted: true }));
  });

  return app;
}