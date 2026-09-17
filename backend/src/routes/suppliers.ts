/** Supplier CRUD and direct product assignments, persisted in WooCommerce order metadata. */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  getSupplierByName,
  listSuppliers,
  updateSupplier,
} from "../lib/supplier-store.js";
import type { Supplier } from "../types/dto.js";

export function suppliersRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const rows = await listSuppliers();
    return c.json(ok(rows, { total: rows.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    const row = await getSupplier(c.req.param("id"));
    if (!row) throw new NotFoundError("Supplier not found");
    return c.json(ok(row));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const contact = String(body.contact ?? "").trim();
    if (!name || !contact) throw new ApiError(400, "BAD_REQUEST", "name and contact are required");
    if (await getSupplierByName(name)) throw new ApiError(409, "CONFLICT", "supplier name already exists");
    const productIds = Array.isArray(body.productIds) ? body.productIds.map(String).filter(Boolean) : [];
    const created = await createSupplier({
      name,
      contact,
      email: String(body.email ?? "").trim(),
      phone: String(body.phone ?? "").trim(),
      address: String(body.address ?? "").trim(),
      terms: String(body.terms ?? "Net 30").trim() || "Net 30",
      leadTimeDays: Math.max(1, Math.floor(Number(body.leadTimeDays) || 1)),
      categories: Array.isArray(body.categories) ? body.categories.map(String).filter(Boolean) : [],
      productIds,
      status: body.status === "inactive" ? "inactive" : "active",
      rating: Number(body.rating) || 0,
      notes: body.notes ? String(body.notes) : undefined,
    });
    return c.json(ok(created), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    if (body.productIds !== undefined && !Array.isArray(body.productIds)) {
      throw new ApiError(400, "BAD_REQUEST", "productIds must be an array");
    }
    const patch: Partial<Supplier> = { ...body };
    if (body.productIds) patch.productIds = body.productIds.map(String).filter(Boolean);
    const updated = await updateSupplier(id, patch);
    if (!updated) throw new NotFoundError("Supplier not found");
    return c.json(ok(updated));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    if (!(await deleteSupplier(id))) throw new NotFoundError("Supplier not found");
    return c.json(ok({ id, deleted: true }));
  });

  return app;
}