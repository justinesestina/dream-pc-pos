/**
 * Return/refund requests from customers. Restock is idempotent — guarded by
 * `restockedAt` so reopening a settled return never double-adjusts stock.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { ReturnRequest } from "../types/dto.js";

export function returnsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const returns: ReturnRequest[] = []; // TODO(P3): read returns.
    return c.json(ok(returns, { total: returns.length }));
  });

  app.post("/:id/settle", requireAuth, async (c) => {
    throw new ApiError(501, "NOT_IMPLEMENTED", "Return settlement lands in Phase P3");
  });

  return app;
}