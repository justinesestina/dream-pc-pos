/**
 * Warehouses + their physical stock.
 *
 *   GET    /api/v1/warehouses                list (with product/quantity totals)
 *   GET    /api/v1/warehouses/:id            one
 *   POST   /api/v1/warehouses                create
 *   PUT    /api/v1/warehouses/:id            edit (incl. type + WooCommerce sync)
 *   DELETE /api/v1/warehouses/:id            delete
 *   GET    /api/v1/warehouses/:id/stock      products held here
 *   POST   /api/v1/warehouses/:id/stock      Add Stock (increases qty + logs movement)
 *   GET    /api/v1/warehouses/:id/movements  stock movement log
 *   GET    /api/v1/warehouses/:id/transfers  transfer history touching this warehouse
 *
 * Persistence: tagged WooCommerce orders / product meta (lib/warehouse-store.ts,
 * lib/inventory-store.ts). No local database — survives Vercel cold-starts.
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
  WAREHOUSE_TYPES,
} from "../lib/warehouse-store.js";
import {
  addStock,
  ensureSellingWarehouse,
  listMovements,
  listTransfers,
  warehouseStockRows,
  warehouseTotals,
} from "../lib/inventory-store.js";
import type { WarehouseType } from "../types/dto.js";

function assertType(value: unknown): asserts value is WarehouseType {
  if (!WAREHOUSE_TYPES.includes(value as WarehouseType)) {
    throw new ApiError(400, "BAD_REQUEST", `type must be one of: ${WAREHOUSE_TYPES.join(", ")}`);
  }
}

export function warehousesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    // First listing also creates + seeds the default WooCommerce selling
    // warehouse, so the storefront stock is visible as a normal warehouse.
    await ensureSellingWarehouse();
    const [rows, totals] = await Promise.all([listWarehouses(), warehouseTotals()]);
    const enriched = rows.map((w) => {
      const t = totals.get(w.id);
      return { ...w, totalProducts: t?.totalProducts ?? 0, totalQuantity: t?.totalQuantity ?? 0 };
    });
    return c.json(ok(enriched, { total: enriched.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    const row = await getWarehouse(c.req.param("id"));
    if (!row) throw new NotFoundError("Warehouse not found");
    const totals = await warehouseTotals();
    const t = totals.get(row.id);
    return c.json(ok({ ...row, totalProducts: t?.totalProducts ?? 0, totalQuantity: t?.totalQuantity ?? 0 }));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const code = String(body.code ?? "").trim();
    if (!name) throw new ApiError(400, "BAD_REQUEST", "name is required");
    if (!code) throw new ApiError(400, "BAD_REQUEST", "code is required");
    if (body.type !== undefined) assertType(body.type);
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
    if (body.type !== undefined) assertType(body.type);
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
    const removed = await deleteWarehouse(id);
    if (!removed) throw new NotFoundError("Warehouse not found");
    return c.json(ok({ id, deleted: true }));
  });

  app.get("/:id/stock", requireAuth, async (c) => {
    const id = c.req.param("id");
    const warehouse = await getWarehouse(id);
    if (!warehouse) throw new NotFoundError("Warehouse not found");
    const rows = await warehouseStockRows(id);
    return c.json(ok(rows, { total: rows.length }));
  });

  app.post("/:id/stock", requireAuth, async (c) => {
    const warehouseId = c.req.param("id");
    const warehouse = await getWarehouse(warehouseId);
    if (!warehouse) throw new NotFoundError("Warehouse not found");
    const body = await c.req.json().catch(() => ({}));
    const productId = String(body.productId ?? "").trim();
    if (!productId) throw new ApiError(400, "BAD_REQUEST", "productId is required");
    const result = await addStock({
      productId,
      warehouseId,
      quantity: Number(body.quantity),
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
      supplier: body.supplier ? String(body.supplier) : undefined,
      reference: body.reference ? String(body.reference) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      actor: c.get("user").sub,
    });
    return c.json(ok(result), 201);
  });

  app.get("/:id/movements", requireAuth, async (c) => {
    const id = c.req.param("id");
    const warehouse = await getWarehouse(id);
    if (!warehouse) throw new NotFoundError("Warehouse not found");
    const rows = await listMovements(id);
    return c.json(ok(rows, { total: rows.length }));
  });

  app.get("/:id/transfers", requireAuth, async (c) => {
    const id = c.req.param("id");
    const warehouse = await getWarehouse(id);
    if (!warehouse) throw new NotFoundError("Warehouse not found");
    const rows = await listTransfers(id);
    return c.json(ok(rows, { total: rows.length }));
  });

  return app;
}
