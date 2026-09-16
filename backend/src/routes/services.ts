/**
 * Service tickets (repairs): received → diagnosing → … → released.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { ServiceTicket } from "../types/dto.js";

export function servicesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const tickets: ServiceTicket[] = []; // TODO(P3/P4): read services.
    return c.json(ok(tickets, { total: tickets.length }));
  });

  app.post("/", requireAuth, async (c) => {
    throw new ApiError(501, "NOT_IMPLEMENTED", "Service intake lands in Phase P3/P4");
  });

  return app;
}