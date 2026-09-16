/**
 * Build/service/order handover (pickup + delivery scheduling).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { ReleaseRecord } from "../types/dto.js";

export function releasesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const releases: ReleaseRecord[] = []; // TODO(P4): read releases.
    return c.json(ok(releases, { total: releases.length }));
  });

  app.post("/", requireAuth, async (c) => {
    throw new ApiError(501, "NOT_IMPLEMENTED", "Releases land in Phase P4");
  });

  return app;
}