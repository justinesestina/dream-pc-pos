/**
 * In-app notifications (stock alerts, quote/build/warranty/service/payment).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok } from "../lib/errors.js";
import type { AppNotification } from "../types/dto.js";

export function notificationsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const notifications: AppNotification[] = []; // TODO(P1): read notifications.
    return c.json(ok(notifications, { total: notifications.length }));
  });

  app.post("/:id/read", requireAuth, async (c) => {
    // TODO(P1): mark read.
    return c.json(ok({ id: c.req.param("id"), read: true }));
  });

  return app;
}