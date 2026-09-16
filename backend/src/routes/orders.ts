/**
 * Sales orders — real view + creation against WooCommerce (P2 bridge).
 *   GET  /api/v1/orders   list (mapped to frontend Order DTO)
 *   POST /api/v1/orders   create storefront order
 *
 * Local POS payments/serials tracking stays scheduled for the Postgres phase;
 * for now the storefront order IS the record of truth.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import { woocommerce, type WcOrder } from "../lib/woocommerce.js";
import { isQuoteOrder } from "./quotes.js";
import type { Order, OrderStatus } from "../types/dto.js";

const WC_STATUS_TO_ORDER: Record<string, OrderStatus> = {
  pending: "pending",
  processing: "processing",
  "on-hold": "processing",
  completed: "completed",
  cancelled: "cancelled",
  refunded: "refunded",
  failed: "cancelled",
};

export function mapWcOrderToDto(raw: WcOrder): Order {
  const name = [raw.billing?.first_name, raw.billing?.last_name].filter(Boolean).join(" ");
  const status: OrderStatus = WC_STATUS_TO_ORDER[raw.status] ?? "pending";

  return {
    id: String(raw.id),
    customerId: raw.customer_id ? String(raw.customer_id) : null,
    customerName: name || raw.billing?.email || "Guest",
    type: "retail",
    status,
    items: (raw.line_items ?? []).map((line) => ({
      productId: String(line.product_id),
      name: line.name,
      sku: String(line.sku ?? ""),
      qty: line.quantity,
      unitPrice: Number(line.total) || 0,
    })),
    subtotal: Number(raw.total) || 0,
    discount: Number(raw.discount_total) || 0,
    tax: Number(raw.total_tax) || 0,
    serviceTotal: 0,
    shippingFee: Number(raw.shipping_total) || 0,
    total: Number(raw.total) || 0,
    amountPaid: 0,
    balanceDue: Number(raw.total) || 0,
    payment: null,
    createdAt: raw.date_created,
    cashier: "wordpress",
    timeline: [],
  };
}

export function ordersRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const search = c.req.query("search") ?? "";
    const params = search ? `&search=${encodeURIComponent(search)}` : "";
    const raw = await woocommerce.ordersAll(params);
    const orders = raw.filter((o) => !isQuoteOrder(o)).map(mapWcOrderToDto);
    return c.json(ok(orders, { total: orders.length }));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const lineItems: { product_id: number; quantity: number }[] = [];

    const items = Array.isArray(body.items) ? body.items : [];
    for (const item of items) {
      const productId = Number(item.productId ?? item.product_id);
      const qty = Number(item.qty ?? item.quantity ?? 1);
      if (!Number.isFinite(productId)) {
        throw new ApiError(400, "BAD_REQUEST", "each item needs a productId");
      }
      lineItems.push({ product_id: productId, quantity: Math.max(1, Math.floor(qty)) });
    }
    if (lineItems.length === 0) {
      throw new ApiError(400, "BAD_REQUEST", "order needs at least one line item");
    }

    const payload: Record<string, unknown> = {
      payment_method: String(body.paymentMethod ?? "bacs"),
      payment_method_title: String(body.paymentMethod ?? "Direct bank transfer"),
      set_paid: Boolean(body.setPaid ?? false),
      line_items: lineItems,
    };
    if (body.customerName) {
      const [first = "", last = ""] = String(body.customerName).split(" ");
      // Ensure last_name is not empty - WooCommerce requires both first_name and last_name
      const billingFirst = first || "Guest";
      const billingLast = last || "Customer";
      payload["billing"] = {
        first_name: billingFirst,
        last_name: billingLast,
        email: String(body.email ?? ""),
      };
    }
    if (body.notes) payload["customer_note"] = String(body.notes);

    const created = await woocommerce.createOrder(payload);
    return c.json(ok(mapWcOrderToDto(created)), 201);
  });

  return app;
}