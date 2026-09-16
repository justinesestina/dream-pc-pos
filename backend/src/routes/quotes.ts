/**
 * Quotations with revision history. Converted quotes become builds/orders.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { Quote } from "../types/dto.js";

export function quotesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const quotes: Quote[] = []; // TODO(P3): read quotes.
    return c.json(ok(quotes, { total: quotes.length }));
  });

  app.post("/", requireAuth, async (c) => {
    // TODO(P3): save quote revision.
    throw new ApiError(501, "NOT_IMPLEMENTED", "Quote persistence lands in Phase P3");
  });

  return app;
}