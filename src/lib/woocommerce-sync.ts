/**
 * DPC NEXUS — WooCommerce Sync Functions
 *
 * Handles synchronization between POS and WooCommerce
 * Integrates with the existing store to sync products, categories, customers, and orders
 */

import {
  fetchBackendProducts,
  fetchBackendCategories,
  fetchBackendCustomers,
  fetchBackendOrders,
  createBackendProduct,
  updateBackendProduct,
  createBackendOrder,
  canReachBackend,
  // updateBackendOrder, // Add this if needed in the future
} from "./api-client";
import type { Product, Category, Customer, Order } from "./types";

/* ------------------------------------------------------------- Sync Functions */

/**
 * Sync products from WooCommerce to POS
 * Returns the number of products synced
 */
export async function syncProductsFromWooCommerce(
  onProgress?: (current: number, total: number) => void,
): Promise<Product[]> {
  try {
    const products = await fetchBackendProducts();
    onProgress?.(products.length, products.length);
    return products;
  } catch (error) {
    console.error("Error syncing products from backend:", error);
    throw error;
  }
}

export async function syncCategoriesFromWooCommerce(): Promise<Category[]> {
  try {
    const categories = await fetchBackendCategories();
    return categories;
  } catch (error) {
    console.error("Error syncing categories from backend:", error);
    throw error;
  }
}

export async function syncCustomersFromWooCommerce(): Promise<Customer[]> {
  try {
    const customers = await fetchBackendCustomers();
    return customers;
  } catch (error) {
    console.error("Error syncing customers from backend:", error);
    throw error;
  }
}

export async function syncOrdersFromWooCommerce(): Promise<Order[]> {
  try {
    const orders = await fetchBackendOrders();
    return orders;
  } catch (error) {
    console.error("Error syncing orders from backend:", error);
    throw error;
  }
}

export async function pushProductToWooCommerce(product: Product): Promise<string> {
  try {
    const newProduct = await createBackendProduct(product);
    if (!newProduct) throw new Error("Failed to create product");
    return newProduct.id.toString();
  } catch (error) {
    console.error("Error pushing product to backend:", error);
    throw error;
  }
}

export async function updateProductInWooCommerce(productId: string, product: Product): Promise<void> {
  try {
    await updateBackendProduct(productId, product);
  } catch (error) {
    console.error("Error updating product in backend:", error);
    throw error;
  }
}

export async function pushOrderToWooCommerce(order: Order): Promise<string> {
  try {
    const newOrder = await createBackendOrder(order);
    if (!newOrder) throw new Error("Failed to create order");
    return newOrder.id.toString();
  } catch (error) {
    console.error("Error pushing order to backend:", error);
    throw error;
  }
}

export async function updateOrderInWooCommerce(orderId: string, order: Order): Promise<void> {
  try {
    // Note: The backend API currently might not have a dedicated PUT /orders/:id yet,
    // but we stub it out or bypass. Currently we can just log a warning.
    console.warn("Backend order update not fully implemented, skipping API call for now.");
    // await updateBackendOrder(orderId, order);
  } catch (error) {
    console.error("Error updating order in backend:", error);
    throw error;
  }
}

export async function testConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const connected = await canReachBackend();
    return connected ? { connected: true } : { connected: false, error: "Backend unavailable" };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Full sync from WooCommerce to POS
 * Syncs categories, products, customers, and orders
 */
export async function fullSyncFromWooCommerce(
  onProgress?: (stage: string, current: number, total: number) => void,
): Promise<{
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
}> {
  try {
    onProgress?.("categories", 0, 4);
    const categories = await syncCategoriesFromWooCommerce();

    onProgress?.("products", 1, 4);
    const products = await syncProductsFromWooCommerce();

    onProgress?.("customers", 2, 4);
    const customers = await syncCustomersFromWooCommerce();

    onProgress?.("orders", 3, 4);
    const orders = await syncOrdersFromWooCommerce();

    onProgress?.("complete", 4, 4);

    return { categories, products, customers, orders };
  } catch (error) {
    console.error("Error during full sync from WooCommerce:", error);
    throw error;
  }
}
