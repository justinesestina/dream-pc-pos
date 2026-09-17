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
    const body = await c.req.json().catch(() => ({}));
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    if (!name || !email) {
      return c.json({ error: { code: "BAD_REQUEST", message: "name and email are required" } }, 400);
    }

    const [firstName, ...lastParts] = name.split(/\s+/);
    const lastName = lastParts.join(" ");
    const phone = String(body?.phone ?? "").trim();
    const address = String(body?.address ?? "").trim();
    const created = await woocommerce.createCustomer({
      email,
      first_name: firstName,
      last_name: lastName,
      billing: { phone, address_1: address },
    });
    const customer: Customer = {
      id: String(created.id),
      name: `${created.first_name} ${created.last_name}`.trim() || created.email,
      email: created.email,
      phone: created.billing?.phone ?? phone,
      type: body?.type === "business" ? "business" : "individual",
      address,
      since: created.date_created,
      status: "active",
    };
    return c.json(ok(customer), 201);
  });

  return app;
}