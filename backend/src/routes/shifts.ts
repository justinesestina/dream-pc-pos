/**
 * Cash drawer shifts: open/close per cashier with adjustments + tender counts.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { Shift } from "../types/dto.js";

export function shiftsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const shifts: Shift[] = []; // TODO(P5): read shifts.
    return c.json(ok(shifts, { total: shifts.length }));
  });

  app.post("/", requireAuth, async (c) => {
    throw new ApiError(501, "NOT_IMPLEMENTED", "Shift open/close lands in Phase P5");
  });

  return app;
}