/**
 * Product attributes + terms CRUD — backed by WooCommerce `products/attributes`.
 *   GET    /api/v1/attributes                     list attributes
 *   POST   /api/v1/attributes                     create { name, slug?, type }
 *   GET    /api/v1/attributes/:id/terms           list terms
 *   POST   /api/v1/attributes/:id/terms           create term { name }
 *   PUT    /api/v1/attributes/:id/terms/:termId   edit term
 *   DELETE /api/v1/attributes/:id/terms/:termId   delete term
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import { woocommerce, type WcAttribute, type WcTaxonomy } from "../lib/woocommerce.js";

const VALID_TYPES = ["text", "color", "select", "button"];

function toAttributeDto(raw: WcAttribute) {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug,
    type: raw.type,
    orderBy: raw.order_by,
    hasArchives: raw.has_archives,
  };
}
function toTermDto(raw: WcTaxonomy) {
  return { id: String(raw.id), name: raw.name, slug: raw.slug ?? "", count: raw.count ?? 0 };
}

export function attributesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const raw = await woocommerce.listAttributes();
    const data = raw.map(toAttributeDto);
    return c.json(ok(data, { total: data.length }));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");
    const type = VALID_TYPES.includes(String(body.type)) ? String(body.type) : "text";
    const created = await woocommerce.createAttribute({ name, type, slug: body.slug ? String(body.slug) : undefined });
    return c.json(ok(toAttributeDto(created)), 201);
  });

  app.get("/:id/terms", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid attribute id");
    const raw = await woocommerce.attributeTerms(id);
    const data = raw.map(toTermDto);
    return c.json(ok(data, { total: data.length }));
  });

  app.post("/:id/terms", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    if (!Number.isFinite(id)) throw new ApiError(400, "BAD_REQUEST", "invalid attribute id");
    if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");
    const created = await woocommerce.createAttributeTerm(id, { name });
    return c.json(ok(toTermDto(created)), 201);
  });

  app.put("/:id/terms/:termId", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const termId = Number(c.req.param("termId"));
    const body = await c.req.json().catch(() => ({}));
    if (!Number.isFinite(id) || !Number.isFinite(termId)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    const updated = await woocommerce.setAttributeTerm(id, termId, {
      name: body.name ? String(body.name) : undefined,
    });
    return c.json(ok(toTermDto(updated)));
  });

  app.delete("/:id/terms/:termId", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const termId = Number(c.req.param("termId"));
    if (!Number.isFinite(id) || !Number.isFinite(termId)) throw new ApiError(400, "BAD_REQUEST", "invalid id");
    const deleted = await woocommerce.deleteAttributeTerm(id, termId);
    if (!deleted || Array.isArray(deleted)) throw new NotFoundError("Term not found");
    return c.json(ok({ attributeId: String(id), termId: String(termId), deleted: true }));
  });

  return app;
}