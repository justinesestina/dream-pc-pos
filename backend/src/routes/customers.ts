/**
 * Customer directory (individuals + businesses).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok } from "../lib/errors.js";
import { woocommerce } from "../lib/woocommerce.js";
import type { Customer } from "../types/dto.js";

export function customersRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    // TODO(P2): read customers from Postgres; WC proxy until then.
    const raw = await woocommerce.customers().catch(() => []);
    const customers: Customer[] = raw.map((customer) => ({
      id: String(customer.id),
      name: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
      email: customer.email,
      phone: customer.billing?.phone ?? "",
      type: "individual",
      address: [customer.billing?.address_1, customer.billing?.city].filter(Boolean).join(", "),
      since: customer.date_created,
      status: "active",
    }));
    return c.json(ok(customers, { total: customers.length }));
  });

  app.post("/", requireAuth, async (c) => {
    // TODO(P2): create local customer.
    return c.json(ok(await c.req.json().catch(() => ({}))), 201);
  });

  return app;
}