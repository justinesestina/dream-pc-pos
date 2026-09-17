/**
 * DPC NEXUS backend — Vercel entrypoint AND the Hono application.
 *
 * Vercel's static detector requires the entry default-export a Hono app and
 * the entry file itself to import the `hono` package — that's why everything
 * lives here (a wrapper re-exporting a non-importing file fails with
 * "No entrypoint found which imports hono").
 *
 * No listen()/serve() here — local dev uses src/dev.ts.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config, wpConfigured, mediaConfigured } from "./config.js";
import { ApiError, ok } from "./lib/errors.js";
import { authRoutes } from "./routes/auth.js";
import { productsRoutes } from "./routes/products.js";
import { categoriesRoutes } from "./routes/categories.js";
import { tagsRoutes } from "./routes/tags.js";
import { brandsRoutes } from "./routes/brands.js";
import { attributesRoutes } from "./routes/attributes.js";
import { mediaRoutes } from "./routes/media.js";
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
import { searchRoutes } from "./routes/search.js";

export const app = new Hono();

// Add logging for debugging
app.use("*", logger());

app.use(
  "*",
  cors({
    origin: "*", // Allow all origins for now to fix CORS
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
    maxAge: 86400,
  }),
);

// Handle OPTIONS requests explicitly for CORS preflight
app.options("*", (c) => {
  return c.body(null, 204);
});

// Root route to prevent 404 errors
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "DPC Nexus API Backend",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth/login",
      products: "/api/v1/products",
      quotes: "/api/v1/quotes",
      orders: "/api/v1/orders",
    },
  });
});

app.get("/api/v1/health", (c) => {
  return c.json({
    status: "ok",
    wpConfigured,
    /** Login via WordPress only needs the site URL — the WC keys are for products/orders. */
    wpLoginAvailable: Boolean(config.wp.url),
    mediaConfigured,
    supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
    domains: [
      "auth", "products", "categories", "tags", "brands", "attributes", "media",
      "inventory", "serials", "orders", "quotes", "customers",
      "builds", "services", "warranty", "returns", "purchasing", "receiving",
      "shifts", "releases", "audit", "notifications",
    ],
  });
});

app.route("/api/v1/auth", authRoutes());
app.route("/api/v1/products", productsRoutes());
app.route("/api/v1/categories", categoriesRoutes());
app.route("/api/v1/tags", tagsRoutes());
app.route("/api/v1/brands", brandsRoutes());
app.route("/api/v1/attributes", attributesRoutes());
app.route("/api/v1/media", mediaRoutes());
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
app.route("/api/v1/search", searchRoutes());

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

export default app;
