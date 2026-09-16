/**
 * Purchasing: suppliers + purchase orders (draft → submitted → confirmed →
 * partial → received).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { Supplier, PurchaseOrder } from "../types/dto.js";

export function purchasingRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/suppliers", requireAuth, async (c) => {
    const suppliers: Supplier[] = []; // TODO(P5): read suppliers.
    return c.json(ok(suppliers, { total: suppliers.length }));
  });

  app.get("/purchase-orders", requireAuth, async (c) => {
    const orders: PurchaseOrder[] = [];
    return c.json(ok(orders, { total: orders.length }));
  });

  app.post("/purchase-orders", requireAuth, async (c) => {
    throw new ApiError(501, "NOT_IMPLEMENTED", "Purchase orders land in Phase P5");
  });

  return app;
}