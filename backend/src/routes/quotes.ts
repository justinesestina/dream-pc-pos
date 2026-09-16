/**
 * Quotations — persistent store backed by WooCommerce ORDERS (tagged with the
 * `_dpc_is_quote` meta key). No separate database needed: every quote becomes a
 * real order row in the WordPress DB, so quotes survive restarts and Vercel
 * cold-starts. The Orders tab filters these tagged orders out.
 *
 *   GET    /api/v1/quotes             list
 *   POST   /api/v1/quotes             create (or revise → bumps version, records revision)
 *   PUT    /api/v1/quotes/:id         update status / fields / items
 *   DELETE /api/v1/quotes/:id         remove (force-deletes the tagged order)
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import { woocommerce, type WcOrder, type WcMetaDatum } from "../lib/woocommerce.js";
import type { Quote, QuoteItem, QuoteRevision, QuoteStatus } from "../types/dto.js";

const QUOTE_STATUSES: QuoteStatus[] = ["draft", "sent", "pending", "approved", "rejected", "expired", "converted"];
const META = {
  isQuote: "_dpc_is_quote",
  status: "_dpc_quote_status",
  version: "_dpc_quote_version",
  lineItems: "_dpc_quote_line_items",
  discount: "_dpc_quote_discount",
  serviceTotal: "_dpc_quote_service_total",
  shippingFee: "_dpc_quote_shipping",
  tax: "_dpc_quote_tax",
  subtotal: "_dpc_quote_subtotal",
  total: "_dpc_quote_total",
  notes: "_dpc_quote_notes",
  revisions: "_dpc_quote_revisions",
  customerName: "_dpc_quote_customer",
  customerId: "_dpc_quote_customer_id",
  preparedBy: "_dpc_quote_prepared_by",
  expiresAt: "_dpc_quote_expires",
  subject: "_dpc_quote_subject",
  message: "_dpc_quote_message",
  sentAt: "_dpc_quote_sent_at",
};

function metaOf(order: WcOrder, key: string): unknown {
  return order.meta_data?.find((m: WcMetaDatum) => m.key === key)?.value;
}
function metaBool(order: WcOrder, key: string): string {
  const v = metaOf(order, key);
  return v === undefined || v === null ? "" : String(v);
}
function metaNum(order: WcOrder, key: string): number {
  return Number(metaOf(order, key)) || 0;
}
function parseRevisions(order: WcOrder): QuoteRevision[] {
  try {
    const raw = metaOf(order, META.revisions);
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function parseItems(order: WcOrder): QuoteItem[] {
  try {
    const raw = metaOf(order, META.lineItems);
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.map((it: Record<string, unknown>) => ({
      productId: String(it.productId ?? ""),
      name: String(it.name ?? ""),
      sku: String(it.sku ?? ""),
      qty: Number(it.qty) || 1,
      unitPrice: Number(it.unitPrice) || 0,
    }));
  } catch {
    return [];
  }
}

/** A WC order is a quotation when it carries the _dpc_is_quote meta flag. */
export function isQuoteOrder(order: WcOrder): boolean {
  return metaOf(order, META.isQuote) === "yes";
}

function orderIdFromQuoteId(id: string): number {
  const n = Number(id.startsWith("Q-") ? id.slice(2) : id);
  if (!Number.isFinite(n)) throw new ApiError(400, "BAD_REQUEST", "invalid quote id");
  return n;
}

function mapOrderToQuote(order: WcOrder): Quote {
  const items = parseItems(order);
  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const discount = metaNum(order, META.discount);
  const serviceTotal = metaNum(order, META.serviceTotal);
  const shippingFee = metaNum(order, META.shippingFee);
  const tax = metaNum(order, META.tax);
  const totalFromMeta = metaNum(order, META.total) || subtotal - discount + serviceTotal + shippingFee + tax;

  const status = metaBool(order, META.status);
  const name = metaBool(order, META.customerName) || [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(" ") || "Guest";

  return {
    id: `Q-${order.id}`,
    customerId: metaBool(order, META.customerId) || null,
    customerName: name,
    status: (QUOTE_STATUSES.includes(status as QuoteStatus) ? status : "draft") as QuoteStatus,
    items,
    discount,
    serviceTotal,
    shippingFee,
    subtotal,
    tax,
    total: totalFromMeta,
    version: metaNum(order, META.version) || 1,
    revisions: parseRevisions(order),
    createdAt: order.date_created,
    expiresAt: metaBool(order, META.expiresAt) || new Date(Date.now() + 14 * 86400000).toISOString(),
    notes: metaBool(order, META.notes) || undefined,
    subject: metaBool(order, META.subject) || undefined,
    message: metaBool(order, META.message) || undefined,
    sentAt: metaBool(order, META.sentAt) || undefined,
    preparedBy: metaBool(order, META.preparedBy) || "wordpress",
  };
}

function toMetaData(values: Record<string, unknown>): WcMetaDatum[] {
  return Object.entries(values)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([key, value]) => ({
      key,
      value: typeof value === "object" ? JSON.stringify(value) : (value as string | number | boolean),
    }));
}

function itemToLine(item: QuoteItem): { product_id: number; quantity: number; name: string } {
  return { product_id: Number(item.productId) || 0, quantity: item.qty, name: item.name };
}

export function quotesRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const orders = await woocommerce.ordersAll();
    const quotes = orders.filter(isQuoteOrder).map(mapOrderToQuote);
    return c.json(ok(quotes, { total: quotes.length }));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const preparedBy = c.get("user").sub;
    const customerName = String(body.customerName ?? "").trim() || "Guest";
    const customerId = body.customerId ? String(body.customerId) : "";
    const items: QuoteItem[] = Array.isArray(body.items)
      ? body.items.map((it: Record<string, unknown>) => ({
          productId: String(it.productId ?? ""),
          name: String(it.name ?? ""),
          sku: String(it.sku ?? ""),
          qty: Number(it.qty) || 1,
          unitPrice: Number(it.unitPrice) || 0,
        }))
      : [];

    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const discount = Number(body.discount) || 0;
    const serviceTotal = Number(body.serviceTotal) || 0;
    const shippingFee = Number(body.shippingFee) || 0;
    const tax = Number(body.tax) || 0;
    const total = subtotal - discount + serviceTotal + shippingFee + tax;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();

    const [first = "", last = ""] = customerName.split(" ");
    // Ensure last_name is not empty - WooCommerce requires both first_name and last_name
    const billingFirst = first || "Guest";
    const billingLast = last || "Customer";
    const created = await woocommerce.createOrder({
      status: "pending",
      payment_method: "dpc_quote",
      payment_method_title: "Quotation (DPC NEXUS)",
      customer_note: "Quotation — not a sales order",
      billing: { first_name: billingFirst, last_name: billingLast, email: String(body.email ?? "") },
      set_paid: false,
      line_items: items.map(itemToLine),
      meta_data: toMetaData({
        [META.isQuote]: "yes",
        [META.status]: "draft",
        [META.version]: 1,
        [META.lineItems]: items,
        [META.discount]: discount,
        [META.serviceTotal]: serviceTotal,
        [META.shippingFee]: shippingFee,
        [META.tax]: tax,
        [META.subtotal]: subtotal,
        [META.total]: total,
        [META.notes]: body.notes,
        [META.customerName]: customerName,
        [META.customerId]: customerId,
        [META.preparedBy]: preparedBy,
        [META.expiresAt]: expiresAt,
        [META.subject]: body.subject,
        [META.message]: body.message,
      }),
    });

    return c.json(ok(mapOrderToQuote(created)), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const orderId = orderIdFromQuoteId(c.req.param("id"));
    const body = await c.req.json().catch(() => ({}));

    let order: WcOrder;
    try {
      order = await woocommerce.order(orderId);
    } catch {
      throw new NotFoundError("Quote not found");
    }
    if (!isQuoteOrder(order)) throw new NotFoundError("Quote not found");
    const quote = mapOrderToQuote(order);

    const status = typeof body.status === "string" && QUOTE_STATUSES.includes(body.status as QuoteStatus)
      ? body.status
      : quote.status;

    let items = quote.items;
    let version = quote.version;
    let revisions = quote.revisions;
    let sentAt = quote.sentAt;
    if (Array.isArray(body.items)) {
      items = body.items.map((it: Record<string, unknown>) => ({
        productId: String(it.productId ?? ""),
        name: String(it.name ?? ""),
        sku: String(it.sku ?? ""),
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.unitPrice) || 0,
      }));
      version = quote.version + 1;
      revisions = [
        ...quote.revisions,
        {
          version: quote.version,
          at: new Date().toISOString(),
          items: quote.items,
          subtotal: quote.subtotal,
          discount: quote.discount,
          serviceTotal: quote.serviceTotal,
          shippingFee: quote.shippingFee,
          tax: quote.tax,
          total: quote.total,
          notes: quote.notes,
        },
      ].slice(-20); // keep the recent history only
    }
    if (body.sentAt !== undefined) sentAt = String(body.sentAt);

    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const discount = body.discount !== undefined ? Number(body.discount) || 0 : quote.discount;
    const serviceTotal = body.serviceTotal !== undefined ? Number(body.serviceTotal) || 0 : quote.serviceTotal;
    const shippingFee = body.shippingFee !== undefined ? Number(body.shippingFee) || 0 : quote.shippingFee;
    const tax = body.tax !== undefined ? Number(body.tax) || 0 : quote.tax;
    const total = subtotal - discount + serviceTotal + shippingFee + tax;

    const updated = await woocommerce.updateOrder(orderId, {
      status: "pending",
      line_items: items.map(itemToLine),
      meta_data: toMetaData({
        [META.isQuote]: "yes",
        [META.status]: status,
        [META.version]: version,
        [META.lineItems]: items,
        [META.discount]: discount,
        [META.serviceTotal]: serviceTotal,
        [META.shippingFee]: shippingFee,
        [META.tax]: tax,
        [META.subtotal]: subtotal,
        [META.total]: total,
        [META.notes]: body.notes !== undefined ? String(body.notes) : quote.notes,
        [META.customerId]: quote.customerId,
        [META.preparedBy]: quote.preparedBy,
        [META.sentAt]: sentAt,
        [META.subject]: body.subject !== undefined ? String(body.subject) : quote.subject,
        [META.message]: body.message !== undefined ? String(body.message) : quote.message,
        [META.revisions]: revisions,
      }),
    });

    return c.json(ok(mapOrderToQuote(updated)));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const orderId = orderIdFromQuoteId(c.req.param("id"));
    const deleted = await woocommerce.deleteOrder(orderId);
    if (!deleted || Array.isArray(deleted)) throw new NotFoundError("Quote not found");
    return c.json(ok({ id: `Q-${orderId}`, deleted: true }));
  });

  return app;
}