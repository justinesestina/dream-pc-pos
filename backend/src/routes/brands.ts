/**
 * Brands CRUD — backed by WooCommerce `products/brands` (brand plugin is
 * installed on the live store — verified contract). Same shape as categories.
 *   GET /api/v1/brands         list
 *   GET /api/v1/brands/:id     one
 *   POST   /api/v1/brands      create { name, slug? }
 *   PUT    /api/v1/brands/:id  edit
 *   DELETE /api/v1/brands/:id  delete (force)
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import { woocommerce, type WcTaxonomy } from "../lib/woocommerce.js";

function toBrandDto(raw: WcTaxonomy) {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug ?? "",
    description: raw.description ?? "",
    count: raw.count ?? 0,
  };
}

export function brandsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  const list = async () => {
    const raw = await woocommerce.listTaxonomy("products/brands").catch((e) => {
      throw new ApiError(502, "WOOCOMMERCE_ERROR", `Brands endpoint unavailable (${e.message})`);
    });
    return raw;
  };

  app.get("/", requireAuth, async (c) => {
    const raw = await list();
    const data = raw.map(toBrandDto);
    return c.json(ok(data, { total: data.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    const raw = await woocommerce.getTaxonomy(`products/brands/${id}`);
    if (!raw || Array.isArray(raw)) throw new NotFoundError("Brand not found");
    return c.json(ok(toBrandDto(raw)));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");
    const created = await woocommerce.createTaxonomy("products/brands", {
      name,
      slug: body.slug ? String(body.slug) : undefined,
    });
    return c.json(ok(toBrandDto(created)), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json().catch(() => ({}));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    const updated = await woocommerce.updateTaxonomy(`products/brands/${id}`, {
      name: body.name ? String(body.name) : undefined,
    });
    return c.json(ok(toBrandDto(updated)));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    await woocommerce.deleteTaxonomy(`products/brands/${id}`);
    return c.json(ok({ id: String(id), deleted: true }));
  });

  return app;
}