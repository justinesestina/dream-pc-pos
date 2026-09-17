/**
 * Global search across the live operational objects used by the app.
 *
 * This is intentionally lightweight: it collects the latest products, orders,
 * quotes, and customers from WooCommerce, filters them on the server, and
 * returns routeable results for the command palette.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok } from "../lib/errors.js";
import { woocommerce } from "../lib/woocommerce.js";
import { isQuoteOrder } from "./quotes.js";

export interface SearchResult {
  id: string;
  type: "dashboard" | "products" | "orders" | "quotes" | "customers" | "page";
  label: string;
  subtitle: string;
  route: string;
  /** Thumbnail for products (and any other type that carries an image). */
  imageUrl?: string | undefined;
}

function norm(value: string | undefined | null): string {
  return String(value ?? "").trim().toLowerCase();
}

function productSearchText(product: Awaited<ReturnType<typeof woocommerce.products>>[number]): string {
  const brand = Array.isArray(product.brand)
    ? product.brand.map((item) => (typeof item === "object" && item !== null ? item.name : item)).join(" ")
    : typeof product.brand === "object" && product.brand !== null
      ? String((product.brand as { name?: unknown }).name ?? "")
      : String(product.brand ?? "");
  const attributes = (product.attributes ?? []).flatMap((attribute) => [
    attribute.name,
    ...(attribute.options ?? []),
  ]);
  return norm([product.id, product.name, product.sku, product.slug, brand, ...attributes].join(" "));
}

export function searchRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const q = (c.req.query("q") ?? "").trim();
    if (!q) return c.json(ok<SearchResult[]>([]));

    const query = norm(q);
    const results: SearchResult[] = [];

    const navPages = [
      { id: "dashboard", type: "dashboard", label: "Dashboard", subtitle: "Overview and KPIs", route: "/dashboard" },
      { id: "orders", type: "page", label: "Orders", subtitle: "Sale history and fulfilment", route: "/orders" },
      { id: "customers", type: "page", label: "Customers", subtitle: "People and accounts", route: "/customers" },
      { id: "products", type: "page", label: "Products", subtitle: "Catalog and inventory", route: "/products" },
      { id: "quotes", type: "page", label: "Quotes", subtitle: "Customer quotes and approvals", route: "/quotes" },
      { id: "pos", type: "page", label: "Point of Sale", subtitle: "New sale checkout", route: "/pos" },
    ] satisfies SearchResult[];
    const matchingNavPages = navPages.filter((item) => {
      const haystack = `${item.label} ${item.subtitle} ${item.type}`.toLowerCase();
      return haystack.includes(query) || item.route.toLowerCase().includes(query);
    });

    results.push(...matchingNavPages);

    try {
      let products = await woocommerce.products(`search=${encodeURIComponent(q)}`).catch(() => [] as Awaited<ReturnType<typeof woocommerce.products>>);
      if (products.length === 0) {
        products = await woocommerce.products().catch(() => [] as Awaited<ReturnType<typeof woocommerce.products>>);
      }

      const [allOrders, customers] = await Promise.all([
        woocommerce.ordersAll(),
        woocommerce.customers(),
      ]);

      for (const product of products) {
        if (!productSearchText(product).includes(query)) continue;
        results.push({
          id: `product-${product.id}`,
          type: "products",
          label: product.name,
          subtitle: `${product.sku || product.id} • ${product.brand ?? "General"}`,
          route: `/products/${product.id}`,
          ...(product.images?.[0]?.src ? { imageUrl: product.images[0].src } : {}),
        });
      }

      for (const order of allOrders.filter((o) => !isQuoteOrder(o))) {
        const customerName = [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(" ") || order.billing?.email || "Guest";
        const haystack = `${order.id} ${customerName} ${order.status} ${order.line_items?.map((item) => item.name).join(" ") ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) continue;
        results.push({
          id: `order-${order.id}`,
          type: "orders",
          label: `Order ${order.id}`,
          subtitle: `${customerName} • ${order.status}`,
          route: `/orders/${order.id}`,
        });
      }

      for (const quote of allOrders.filter((o) => isQuoteOrder(o))) {
        const customerName = [quote.billing?.first_name, quote.billing?.last_name].filter(Boolean).join(" ") || quote.billing?.email || "Guest";
        const haystack = `${quote.id} ${customerName} ${quote.status} ${quote.line_items?.map((item) => item.name).join(" ") ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) continue;
        results.push({
          id: `quote-${quote.id}`,
          type: "quotes",
          label: `Quote ${quote.id}`,
          subtitle: `${customerName} • ${quote.status}`,
          route: `/quotes/${quote.id}`,
        });
      }

      for (const customer of customers) {
        const customerName = `${customer.first_name} ${customer.last_name}`.trim() || customer.email || "Customer";
        const haystack = `${customerName} ${customer.email} ${customer.billing?.phone ?? ""} ${customer.id}`.toLowerCase();
        if (!haystack.includes(query)) continue;
        results.push({
          id: `customer-${customer.id}`,
          type: "customers",
          label: customerName,
          subtitle: `${customer.email || "No email"} • ${customer.billing?.phone || "No phone"}`,
          route: `/customers/${customer.id}`,
        });
      }
    } catch {
      // Fallback to empty results if the live WooCommerce bridge is not available.
      return c.json(ok<SearchResult[]>(results.slice(0, 12)));
    }

    const deduped = results.filter((item, index, arr) => {
      const key = `${item.type}:${item.id}`;
      return arr.findIndex((candidate) => `${candidate.type}:${candidate.id}` === key) === index;
    });

    return c.json(ok<SearchResult[]>(deduped.slice(0, 16)));
  });

  return app;
}
