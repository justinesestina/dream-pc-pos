/**
 * Audit log — every mutation records who/what/entity/when server-side.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok } from "../lib/errors.js";
import type { AuditLog } from "../types/dto.js";

export function auditRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const logs: AuditLog[] = []; // TODO(P1): read audit log.
    return c.json(ok(logs, { total: logs.length }));
  });

  return app;
}