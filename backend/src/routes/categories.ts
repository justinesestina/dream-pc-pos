/**
 * Categories CRUD — backed by WooCommerce `products/categories`.
 *   GET /api/v1/categories            list
 *   GET /api/v1/categories/:id        one
 *   POST   /api/v1/categories         create  { name, slug?, parent?, description?, display?, image? }
 *   PUT    /api/v1/categories/:id     edit
 *   DELETE /api/v1/categories/:id     delete (force)
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import { woocommerce, type WcTaxonomy } from "../lib/woocommerce.js";
import type { Category } from "../types/dto.js";

function toCategoryDto(raw: WcTaxonomy): Category {
  const image = raw.image;
  const imageUrl = typeof image === "string" ? image : image?.src || undefined;

  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug ?? "",
    parentId: raw.parent ? String(raw.parent) : undefined,
    description: raw.description || undefined,
    display: (raw.display as "default" | "products" | "subcategories" | "both") || "default",
    image: imageUrl,
    archived: false,
    createdAt: new Date().toISOString(),
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
      description: body.description ? String(body.description) : undefined,
      display: body.display ? String(body.display) : undefined,
      image: body.image ? { src: String(body.image) } : undefined,
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
      parent: body.parentId !== undefined ? (body.parentId ? Number(body.parentId) : 0) : undefined,
      description: body.description !== undefined ? String(body.description) : undefined,
      display: body.display ? String(body.display) : undefined,
      image: body.image !== undefined ? { src: String(body.image) } : undefined,
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
