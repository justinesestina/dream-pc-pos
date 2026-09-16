/**
 * Serial number registry (SN → product → status → order/build/customer).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok } from "../lib/errors.js";
import type { SerialNumber } from "../types/dto.js";

export function serialsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const serials: SerialNumber[] = []; // TODO(P1): registry reads.
    return c.json(ok(serials, { total: serials.length }));
  });

  app.post("/", requireAuth, async (c) => {
    // TODO(P1): register serials on receiving.
    return c.json(ok(await c.req.json().catch(() => ({}))), 201);
  });

  return app;
}