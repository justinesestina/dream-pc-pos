/**
 * Warranties + claims. Warranty status is derived from purchased/expiry dates.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { Warranty, WarrantyClaim } from "../types/dto.js";

export function warrantyRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const warranties: Warranty[] = []; // TODO(P4): read warranties.
    return c.json(ok(warranties, { total: warranties.length }));
  });

  app.get("/:warrantyId/claims", requireAuth, async (c) => {
    const claims: WarrantyClaim[] = [];
    return c.json(ok(claims, { total: claims.length }));
  });

  app.post("/:warrantyId/claims", requireAuth, async (c) => {
    throw new ApiError(501, "NOT_IMPLEMENTED", "Warranty claims land in Phase P4");
  });

  return app;
}