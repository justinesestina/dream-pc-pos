/**
 * Tags CRUD — backed by WooCommerce `products/tags`.
 *   GET /api/v1/tags             list
 *   POST   /api/v1/tags          create { name, slug? }
 *   PUT    /api/v1/tags/:id      edit
 *   DELETE /api/v1/tags/:id      delete (force)
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import { woocommerce, type WcTaxonomy } from "../lib/woocommerce.js";

function toTagDto(raw: WcTaxonomy) {
  return { id: String(raw.id), name: raw.name, slug: raw.slug ?? "", count: raw.count ?? 0 };
}

export function tagsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const raw = await woocommerce.listTaxonomy("products/tags");
    const data = raw.map(toTagDto);
    return c.json(ok(data, { total: data.length }));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");
    const created = await woocommerce.createTaxonomy("products/tags", {
      name,
      slug: body.slug ? String(body.slug) : undefined,
    });
    return c.json(ok(toTagDto(created)), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json().catch(() => ({}));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    const updated = await woocommerce.updateTaxonomy(`products/tags/${id}`, {
      name: body.name ? String(body.name) : undefined,
    });
    return c.json(ok(toTagDto(updated)));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    await woocommerce.deleteTaxonomy(`products/tags/${id}`);
    return c.json(ok({ id: String(id), deleted: true }));
  });

  return app;
}