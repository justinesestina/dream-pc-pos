/**
 * Sales orders. Phase P2 writes orders locally, Phase P5 pushes to WooCommerce
 * (admin-created storefront orders). Payments are cash/gcash/bank/card locally.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { Order } from "../types/dto.js";

export function ordersRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const orders: Order[] = []; // TODO(P2): read orders.
    return c.json(ok(orders, { total: orders.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    // TODO(P2): single order with timeline + payment.
    return c.json(ok({ id: c.req.param("id") } as unknown as Order));
  });

  app.post("/", requireAuth, async (c) => {
    // TODO(P2): create order + payment, adjust stock, link serials.
    throw new ApiError(501, "NOT_IMPLEMENTED", "Order creation lands in Phase P2");
  });

  return app;
}