/**
 * DPC NEXUS backend — API server.
 *
 * Vercel/hosted Node target, mounted under /api/v1. Every response uses the
 * envelope from lib/errors.ts unless the route returns raw `{ data }`.
 */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config, wpConfigured } from "./config.js";
import { ApiError, ok } from "./lib/errors.js";
import { authRoutes } from "./routes/auth.js";
import { productsRoutes } from "./routes/products.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { serialsRoutes } from "./routes/serials.js";
import { ordersRoutes } from "./routes/orders.js";
import { quotesRoutes } from "./routes/quotes.js";
import { customersRoutes } from "./routes/customers.js";
import { buildsRoutes } from "./routes/builds.js";
import { servicesRoutes } from "./routes/services.js";
import { warrantyRoutes } from "./routes/warranty.js";
import { returnsRoutes } from "./routes/returns.js";
import { purchasingRoutes } from "./routes/purchasing.js";
import { receivingRoutes } from "./routes/receiving.js";
import { shiftsRoutes } from "./routes/shifts.js";
import { releasesRoutes } from "./routes/releases.js";
import { auditRoutes } from "./routes/audit.js";
import { notificationsRoutes } from "./routes/notifications.js";

const app = new Hono();

app.use("*", cors());

app.get("/api/v1/health", (c) => {
  return c.json({
    status: "ok",
    wpConfigured,
    supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
    domains: [
      "auth", "products", "inventory", "serials", "orders", "quotes", "customers",
      "builds", "services", "warranty", "returns", "purchasing", "receiving",
      "shifts", "releases", "audit", "notifications",
    ],
  });
});

app.route("/api/v1/auth", authRoutes());
app.route("/api/v1/products", productsRoutes());
app.route("/api/v1/inventory", inventoryRoutes());
app.route("/api/v1/serials", serialsRoutes());
app.route("/api/v1/orders", ordersRoutes());
app.route("/api/v1/quotes", quotesRoutes());
app.route("/api/v1/customers", customersRoutes());
app.route("/api/v1/builds", buildsRoutes());
app.route("/api/v1/services", servicesRoutes());
app.route("/api/v1/warranty", warrantyRoutes());
app.route("/api/v1/returns", returnsRoutes());
app.route("/api/v1/purchasing", purchasingRoutes());
app.route("/api/v1/receiving", receivingRoutes());
app.route("/api/v1/shifts", shiftsRoutes());
app.route("/api/v1/releases", releasesRoutes());
app.route("/api/v1/audit", auditRoutes());
app.route("/api/v1/notifications", notificationsRoutes());

app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "No such route" } }, 404));

app.onError((err, c) => {
  const known = err instanceof ApiError ? err : null;
  console.error(`[api] ${known?.status ?? 500} ${err.message}`);
  return c.json(
    {
      error: {
        code: known?.code ?? "INTERNAL",
        message: known?.message ?? "Internal server error",
        details: known?.details,
      },
    },
    (known?.status as 400 | 401 | 403 | 404 | 409 | 422 | 500) ?? 500,
  );
});

const port = config.port;

if (config.nodeEnv !== "test") {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`[dpc-nexus] API listening on http://localhost:${info.port}/api/v1`);
  });
}

export default app;