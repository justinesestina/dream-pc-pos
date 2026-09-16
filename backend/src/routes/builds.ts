/**
 * Custom builds (bundle → quote → parts → assembly → QA → release pipeline).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { Build } from "../types/dto.js";

export function buildsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const builds: Build[] = []; // TODO(P3): read builds.
    return c.json(ok(builds, { total: builds.length }));
  });

  app.post("/", requireAuth, async (c) => {
    // TODO(P3): create build.
    throw new ApiError(501, "NOT_IMPLEMENTED", "Build creation lands in Phase P3");
  });

  return app;
}