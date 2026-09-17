/**
 * Warehouses CRUD — custom table (WooCommerce has no warehouse entity).
 *   GET    /api/v1/warehouses            list
 *   GET    /api/v1/warehouses/:id        one
 *   POST   /api/v1/warehouses            create { name, code, type, ... }
 *   PUT    /api/v1/warehouses/:id        edit
 *   DELETE /api/v1/warehouses/:id        delete
 *
 * Persistence: backend/data/warehouses.json (see lib/warehouse-store.ts).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouse,
  getWarehouseByCode,
  listWarehouses,
  updateWarehouse,
} from "../lib/warehouse-store.js";

const WAREHOUSE_TYPES = ["main", "branch", "storage", "service"];

export function warehousesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const rows = await listWarehouses();
    const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    return c.json(ok(sorted, { total: sorted.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const row = await getWarehouse(id);
    if (!row) throw new NotFoundError("Warehouse not found");
    return c.json(ok(row));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const code = String(body.code ?? "").trim();
    if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");
    if (!code) throw new ApiError(400, "BAD_REQUEST", "code is required");
    if (body.type && !WAREHOUSE_TYPES.includes(String(body.type))) {
      throw new ApiError(400, "BAD_REQUEST", "invalid type");
    }
    const existing = await getWarehouseByCode(code);
    if (existing) throw new ApiError(409, "CONFLICT", `code "${code}" is already in use`);
    const created = await createWarehouse(body);
    return c.json(ok(created), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const current = await getWarehouse(id);
    if (!current) throw new NotFoundError("Warehouse not found");
    if (body.code !== undefined) {
      const code = String(body.code).trim();
      if (!code) throw new ApiError(400, "BAD_REQUEST", "code is required");
      const dup = await getWarehouseByCode(code);
      if (dup && dup.id !== id) {
        throw new ApiError(409, "CONFLICT", `code "${code}" is already in use`);
      }
    }
    const updated = await updateWarehouse(id, body);
    return c.json(ok(updated));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const okDel = await deleteWarehouse(id);
    if (!okDel) throw new NotFoundError("Warehouse not found");
    return c.json(ok({ id, deleted: true }));
  });

  return app;
}
