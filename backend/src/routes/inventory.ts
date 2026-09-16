/**
 * Inventory stock + serialized tracking. Stock corrections push to WooCommerce
 * via lib/woocommerce.ts.setStock() in Phase P5.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { InventoryItem, InventoryMovement } from "../types/dto.js";

export function inventoryRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    // TODO(P1): read inventory_levels joined with products.
    const items: InventoryItem[] = [];
    return c.json(ok(items, { total: items.length }));
  });

  app.get("/:productId/movements", requireAuth, async (c) => {
    const { productId } = c.req.param();
    const movements: InventoryMovement[] = []; // TODO(P1): ledger reads.
    return c.json(ok(movements, { total: movements.length }));
  });

  app.post("/:productId/adjust", requireAuth, async (c) => {
    // TODO(P1): record movement + adjust on_hand. Demo: BAD_REQUEST when unbuilt.
    throw new ApiError(501, "NOT_IMPLEMENTED", "Stock adjustments land in Phase P1");
  });

  return app;
}