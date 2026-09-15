/**
 * DPC NEXUS — WooCommerce API Client
 *
 * Handles communication with WooCommerce REST API
 * Maps WooCommerce data structures to POS data structures
 */

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { getWooCommerceConfig } from "./woocommerce-config";
import type { Product, Category, Customer, Order, OrderItem, PaymentMethod } from "./types";

// Initialize WooCommerce API client (rebuilt if configuration changes)
let api: WooCommerceRestApi | null = null;
let apiKey = "";

function getApi() {
  const config = getWooCommerceConfig();
  if (!config) {
    throw new Error("WooCommerce configuration is not properly set");
  }
  const nextKey = `${config.url}|${config.consumerKey}|${config.consumerSecret}`;
  if (!api || apiKey !== nextKey) {
    api = new WooCommerceRestApi({
      url: config.url,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      version: config.version as any,
      timeout: config.timeout,
    });
    apiKey = nextKey;
  }
  return api;
}

/* ------------------------------------------------------------- Product Mapping */

/**
 * Map WooCommerce product to POS Product
 */
export function mapWooCommerceProductToPos(wooProduct: any): Product {
  // Extract category from WooCommerce product
  const categoryId = wooProduct.categories?.[0]?.id || "uncategorized";
  const categoryName = wooProduct.categories?.[0]?.name || "Uncategorized";

  // Extract specifications from WooCommerce product attributes
  const specs: any = {};
  if (wooProduct.attributes) {
    wooProduct.attributes.forEach((attr: any) => {
      if (attr.name && attr.options) {
        specs[attr.name.toLowerCase().replace(/\s+/g, "_")] = attr.options[0];
      }
    });
  }

  return {
    id: wooProduct.id.toString(),
    sku: wooProduct.sku || `WC-${wooProduct.id}`,
    name: wooProduct.name,
    brand: wooProduct.attributes?.find((a: any) => a.name === "Brand")?.options?.[0] || "Unknown",
    categoryId: categoryId.toString(),
    productType: wooProduct.type === "service" ? "service" : "product",
    description: wooProduct.short_description || wooProduct.description || "",
    price: parseFloat(wooProduct.regular_price) || parseFloat(wooProduct.price) || 0,
    cost: 0, // WooCommerce doesn't track cost, will need manual entry
    serialTracked: wooProduct.attributes?.find((a: any) => a.name === "Serial Tracked")?.options?.[0] === "Yes",
    warrantyMonths: parseInt(wooProduct.attributes?.find((a: any) => a.name === "Warranty")?.options?.[0]) || 12,
    location: "Main Store",
    supplier: "WooCommerce",
    specs,
    isService: wooProduct.type === "service" || wooProduct.virtual,
    archived: wooProduct.status !== "publish",
  };
}

/**
 * Map POS Product to WooCommerce product format
 */
export function mapPosProductToWooCommerce(product: Product): any {
  const attributes = [
    { name: "Brand", options: [product.brand] },
    { name: "Serial Tracked", options: [product.serialTracked ? "Yes" : "No"] },
    { name: "Warranty", options: [product.warrantyMonths.toString()] },
  ];

  // Add specs as attributes
  Object.entries(product.specs).forEach(([key, value]) => {
    if (value) {
      attributes.push({
        name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        options: [value.toString()],
      });
    }
  });

  return {
    name: product.name,
    sku: product.sku,
    regular_price: product.price.toString(),
    description: product.description,
    short_description: product.description?.substring(0, 200) || "",
    categories: [{ id: parseInt(product.categoryId) }],
    attributes,
    type: product.isService ? "service" : "simple",
    virtual: product.isService,
    status: product.archived ? "draft" : "publish",
  };
}

/* ------------------------------------------------------------- Category Mapping */

/**
 * Map WooCommerce category to POS Category
 */
export function mapWooCommerceCategoryToPos(wooCategory: any): Category {
  return {
    id: wooCategory.id.toString(),
    name: wooCategory.name,
    archived: false,
    createdAt: wooCategory.date || new Date().toISOString(),
    key: wooCategory.slug,
  };
}

/* ------------------------------------------------------------- Customer Mapping */

/**
 * Map WooCommerce customer to POS Customer
 */
export function mapWooCommerceCustomerToPos(wooCustomer: any): Customer {
  return {
    id: wooCustomer.id.toString(),
    name: `${wooCustomer.first_name} ${wooCustomer.last_name}`.trim() || wooCustomer.billing?.company || "Unknown",
    email: wooCustomer.email || "",
    phone: wooCustomer.billing?.phone || "",
    type: wooCustomer.billing?.company ? "business" : "individual",
    address: `${wooCustomer.billing?.address_1 || ""} ${wooCustomer.billing?.address_2 || ""} ${wooCustomer.billing?.city || ""} ${wooCustomer.billing?.state || ""} ${wooCustomer.billing?.postcode || ""}`.trim(),
    since: wooCustomer.date_registered || new Date().toISOString(),
    status: wooCustomer.role === "customer" ? "active" : "inactive",
    notes: wooCustomer.meta_data?.find((m: any) => m.key === "notes")?.value || "",
  };
}

/* ------------------------------------------------------------- Order Mapping */

/**
 * Map WooCommerce order to POS Order
 */
export function mapWooCommerceOrderToPos(wooOrder: any): Order {
  const paymentMethodMap: Record<string, PaymentMethod> = {
    cod: "cash",
    bacs: "bank",
    paypal: "card",
    stripe: "card",
    gcash: "gcash",
  };

  const paymentMethod = paymentMethodMap[wooOrder.payment_method] || "cash";

  const items: OrderItem[] = wooOrder.line_items.map((item: any) => ({
    productId: item.product_id.toString(),
    name: item.name,
    sku: item.sku || "",
    qty: item.quantity,
    unitPrice: parseFloat(item.price),
  }));

  return {
    id: wooOrder.id.toString(),
    customerId: wooOrder.customer_id?.toString() || null,
    customerName: wooOrder.billing?.first_name && wooOrder.billing?.last_name
      ? `${wooOrder.billing.first_name} ${wooOrder.billing.last_name}`
      : "Walk-in Customer",
    type: "retail",
    status: mapWooCommerceOrderStatus(wooOrder.status),
    items,
    subtotal: parseFloat(wooOrder.total) - parseFloat(wooOrder.total_tax),
    discount: parseFloat(wooOrder.discount_total),
    tax: parseFloat(wooOrder.total_tax),
    serviceTotal: 0,
    shippingFee: parseFloat(wooOrder.shipping_total),
    total: parseFloat(wooOrder.total),
    amountPaid: wooOrder.status === "completed" ? parseFloat(wooOrder.total) : 0,
    balanceDue: wooOrder.status === "completed" ? 0 : parseFloat(wooOrder.total),
    payment: {
      id: `pay-${wooOrder.id}`,
      method: paymentMethod,
      amount: parseFloat(wooOrder.total),
      at: wooOrder.date_created,
      reference: wooOrder.transaction_id,
    },
    createdAt: wooOrder.date_created,
    notes: wooOrder.customer_note || "",
    cashier: "WooCommerce",
    timeline: [
      { label: "Order created", at: wooOrder.date_created, state: "done" },
      { label: "Payment received", at: wooOrder.date_paid, state: wooOrder.date_paid ? "done" : "pending" },
      { label: "Order completed", at: wooOrder.date_completed, state: wooOrder.date_completed ? "done" : "pending" },
    ],
  };
}

/**
 * Map POS Order to WooCommerce order format
 */
export function mapPosOrderToWooCommerce(order: Order): any {
  const paymentMethodMap: Record<PaymentMethod, string> = {
    cash: "cod",
    gcash: "gcash",
    bank: "bacs",
    card: "stripe",
  };

  return {
    payment_method: paymentMethodMap[order.payment?.method || "cash"],
    payment_method_title: order.payment?.method || "Cash",
    set_paid: order.status === "paid",
    billing: {
      first_name: order.customerName.split(" ")[0] || "",
      last_name: order.customerName.split(" ").slice(1).join(" ") || "",
    },
    line_items: order.items.map((item) => ({
      product_id: parseInt(item.productId),
      quantity: item.qty,
    })),
    status: mapPosOrderStatusToWooCommerce(order.status),
  };
}

/**
 * Map WooCommerce order status to POS order status
 */
function mapWooCommerceOrderStatus(status: string): Order["status"] {
  const statusMap: Record<string, Order["status"]> = {
    pending: "pending",
    processing: "processing",
    on_hold: "pending",
    completed: "completed",
    cancelled: "cancelled",
    refunded: "refunded",
    failed: "cancelled",
  };
  return statusMap[status] || "pending";
}

/**
 * Map POS order status to WooCommerce order status
 */
function mapPosOrderStatusToWooCommerce(status: Order["status"]): string {
  const statusMap: Record<Order["status"], string> = {
    pending: "pending",
    paid: "processing",
    processing: "processing",
    assembly: "processing",
    testing: "processing",
    ready: "processing",
    completed: "completed",
    cancelled: "cancelled",
    refunded: "refunded",
  };
  return statusMap[status] || "pending";
}

/* ------------------------------------------------------------- API Functions */

/**
 * Fetch all products from WooCommerce
 */
export async function fetchWooCommerceProducts(): Promise<Product[]> {
  try {
    const response = await getApi().get("products", { per_page: 100 });
    return response.data.map(mapWooCommerceProductToPos);
  } catch (error) {
    console.error("Error fetching WooCommerce products:", error);
    throw error;
  }
}

/**
 * Fetch all categories from WooCommerce
 */
export async function fetchWooCommerceCategories(): Promise<Category[]> {
  try {
    const response = await getApi().get("products/categories", { per_page: 100 });
    return response.data.map(mapWooCommerceCategoryToPos);
  } catch (error) {
    console.error("Error fetching WooCommerce categories:", error);
    throw error;
  }
}

/**
 * Fetch all customers from WooCommerce
 */
export async function fetchWooCommerceCustomers(): Promise<Customer[]> {
  try {
    const response = await getApi().get("customers", { per_page: 100 });
    return response.data.map(mapWooCommerceCustomerToPos);
  } catch (error) {
    console.error("Error fetching WooCommerce customers:", error);
    throw error;
  }
}

/**
 * Fetch all orders from WooCommerce
 */
export async function fetchWooCommerceOrders(): Promise<Order[]> {
  try {
    const response = await getApi().get("orders", { per_page: 100 });
    return response.data.map(mapWooCommerceOrderToPos);
  } catch (error) {
    console.error("Error fetching WooCommerce orders:", error);
    throw error;
  }
}

/**
 * Create a product in WooCommerce
 */
export async function createWooCommerceProduct(product: Product): Promise<any> {
  try {
    const wooProduct = mapPosProductToWooCommerce(product);
    const response = await getApi().post("products", wooProduct);
    return response.data;
  } catch (error) {
    console.error("Error creating WooCommerce product:", error);
    throw error;
  }
}

/**
 * Update a product in WooCommerce
 */
export async function updateWooCommerceProduct(productId: string, product: Product): Promise<any> {
  try {
    const wooProduct = mapPosProductToWooCommerce(product);
    const response = await getApi().put(`products/${productId}`, wooProduct);
    return response.data;
  } catch (error) {
    console.error("Error updating WooCommerce product:", error);
    throw error;
  }
}

/**
 * Create an order in WooCommerce
 */
export async function createWooCommerceOrder(order: Order): Promise<any> {
  try {
    const wooOrder = mapPosOrderToWooCommerce(order);
    const response = await getApi().post("orders", wooOrder);
    return response.data;
  } catch (error) {
    console.error("Error creating WooCommerce order:", error);
    throw error;
  }
}

/**
 * Update an order in WooCommerce
 */
export async function updateWooCommerceOrder(orderId: string, order: Order): Promise<any> {
  try {
    const wooOrder = mapPosOrderToWooCommerce(order);
    const response = await getApi().put(`orders/${orderId}`, wooOrder);
    return response.data;
  } catch (error) {
    console.error("Error updating WooCommerce order:", error);
    throw error;
  }
}

/**
 * Test WooCommerce connection
 */
export async function testWooCommerceConnection(): Promise<boolean> {
  try {
    await getApi().get("system_status");
    return true;
  } catch (error) {
    console.error("WooCommerce connection test failed:", error);
    return false;
  }
}
