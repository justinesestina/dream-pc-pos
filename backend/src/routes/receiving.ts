/**
 * Goods receiving. Completing a receipt is what actually increments stock and
 * registers serials (Phase P5).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { GoodsReceipt } from "../types/dto.js";

export function receivingRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const receipts: GoodsReceipt[] = []; // TODO(P5): read receipts.
    return c.json(ok(receipts, { total: receipts.length }));
  });

  app.post("/", requireAuth, async (c) => {
    throw new ApiError(501, "NOT_IMPLEMENTED", "Goods receiving lands in Phase P5");
  });

  return app;
}