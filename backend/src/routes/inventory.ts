/**
 * Inventory — cross-warehouse stock views and manual adjustments.
 *
 *   GET  /api/v1/inventory/stock              every product's total + per-warehouse split
 *   GET  /api/v1/inventory/stock/:productId   one product
 *   GET  /api/v1/inventory/movements          global movement log (?warehouseId=, ?productId=)
 *   POST /api/v1/inventory/stock/:productId/adjust   signed adjustment (logged)
 *
 * Physical quantities live on product meta and movements/transfers are tagged
 * WooCommerce orders (lib/inventory-store.ts). WooCommerce sellable stock is
 * always recomputed from the selling + sync warehouses — never set by hand.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import {
  adjustStock,
  ensureSellingWarehouse,
  listMovements,
  listProductStock,
  productStockInfo,
} from "../lib/inventory-store.js";

export function inventoryRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    await ensureSellingWarehouse();
    const rows = await listProductStock();
    return c.json(ok(rows, { total: rows.length }));
  });

  app.get("/stock", requireAuth, async (c) => {
    await ensureSellingWarehouse();
    const rows = await listProductStock();
    return c.json(ok(rows, { total: rows.length }));
  });

  app.get("/stock/:productId", requireAuth, async (c) => {
    const row = await productStockInfo(c.req.param("productId"));
    return c.json(ok(row));
  });

  app.get("/movements", requireAuth, async (c) => {
    const warehouseId = c.req.query("warehouseId");
    const productId = c.req.query("productId");
    let rows = await listMovements(warehouseId);
    if (productId) rows = rows.filter((r) => r.productId === productId);
    return c.json(ok(rows, { total: rows.length }));
  });

  app.post("/stock/:productId/adjust", requireAuth, async (c) => {
    const productId = c.req.param("productId");
    const body = await c.req.json().catch(() => ({}));
    const warehouseId = String(body.warehouseId ?? "").trim();
    if (!warehouseId) throw new ApiError(400, "BAD_REQUEST", "warehouseId is required");
    const movement = await adjustStock({
      productId,
      warehouseId,
      delta: Number(body.delta ?? body.quantity),
      reference: body.reference ? String(body.reference) : undefined,
      note: body.note ? String(body.note) : undefined,
      actor: c.get("user").sub,
      idempotencyKey: body.idempotencyKey ? String(body.idempotencyKey) : undefined,
    });
    return c.json(ok(movement), 201);
  });

  return app;
}
