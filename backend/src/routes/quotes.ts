/**
 * Quotations — TEMPORARY in-memory store (server reboot/cold start clears it).
 * Replaced by Postgres/Supabase in Phase P3; the API shape below does NOT
 * change, only the storage does.
 *
 *   GET  /api/v1/quotes         list
 *   POST /api/v1/quotes         create (or revise → bumps version, records revision)
 *   PUT  /api/v1/quotes/:id     update status / fields
 *   DELETE /api/v1/quotes/:id   remove
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import type { Quote } from "../types/dto.js";

const NEW_QUOTE_ID = () => `Q-${Date.now().toString(36).toUpperCase()}`;

function seedQuotes(): Quote[] {
  const now = Date.now();
  return [
    {
      id: "Q-SEED-001",
      customerId: null,
      customerName: "Juan Dela Cruz",
      status: "pending",
      items: [
        { productId: "1", name: "Sample RTX 4060 Build", sku: "1", qty: 1, unitPrice: 64900 },
      ],
      discount: 0,
      serviceTotal: 0,
      shippingFee: 0,
      subtotal: 64900,
      tax: 0,
      total: 64900,
      version: 1,
      revisions: [],
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 14 * 86400000).toISOString(),
      preparedBy: "demo",
    },
  ];
}

let quoteStore: Quote[] = seedQuotes();

export function quotesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    return c.json(ok(quoteStore, { total: quoteStore.length }));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const preparedBy = c.get("user").sub;
    const customerName = String(body.customerName ?? "").trim() || "Guest";
    const items = Array.isArray(body.items) ? body.items : [];

    const subtotal = items.reduce(
      (sum: number, it: { qty?: number; unitPrice?: number }) =>
        sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
      0,
    );
    const total = Number(body.total) || subtotal - (Number(body.discount) || 0);

    const quote: Quote = {
      id: NEW_QUOTE_ID(),
      customerId: body.customerId ? String(body.customerId) : null,
      customerName,
      status: "draft",
      items: items.map((it: { productId?: unknown; name?: unknown; sku?: unknown; qty?: unknown; unitPrice?: unknown }) => ({
        productId: String(it.productId ?? ""),
        name: String(it.name ?? ""),
        sku: String(it.sku ?? ""),
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.unitPrice) || 0,
      })),
      discount: Number(body.discount) || 0,
      serviceTotal: Number(body.serviceTotal) || 0,
      shippingFee: Number(body.shippingFee) || 0,
      subtotal,
      tax: Number(body.tax) || 0,
      total,
      version: 1,
      revisions: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      notes: body.notes ? String(body.notes) : undefined,
      preparedBy,
    };

    quoteStore = [quote, ...quoteStore];
    return c.json(ok(quote), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const found = quoteStore.find((q) => q.id === id);
    if (!found) throw new NotFoundError("Quote not found");

    const status = typeof body.status === "string" ? body.status : found.status;
    const items = Array.isArray(body.items) ? body.items : found.items;

    let updated: Quote = { ...found, status, items, notes: body.notes ?? found.notes };
    if (Array.isArray(body.items)) {
      // A new item set is a revision.
      updated.version = found.version + 1;
      updated.revisions = [
        ...found.revisions,
        {
          version: found.version,
          at: new Date().toISOString(),
          items: found.items,
          subtotal: found.subtotal,
          discount: found.discount,
          serviceTotal: found.serviceTotal,
          shippingFee: found.shippingFee,
          tax: found.tax,
          total: found.total,
          notes: found.notes,
        },
      ];
      updated.subtotal = items.reduce(
        (sum: number, it: { qty?: number; unitPrice?: number }) =>
          sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
        0,
      );
      updated.total = Number(body.total) ?? updated.subtotal - (updated.discount || 0);
    }
    if (body.sentAt) updated.sentAt = String(body.sentAt);

    quoteStore = quoteStore.map((q) => (q.id === id ? updated : q));
    return c.json(ok(updated));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const before = quoteStore.length;
    quoteStore = quoteStore.filter((q) => q.id !== id);
    if (quoteStore.length === before) throw new NotFoundError("Quote not found");
    return c.json(ok({ id, deleted: true }));
  });

  return app;
}