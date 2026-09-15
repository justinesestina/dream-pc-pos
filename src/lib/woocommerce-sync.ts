/**
 * DPC NEXUS — WooCommerce Sync Functions
 *
 * Handles synchronization between POS and WooCommerce
 * Integrates with the existing store to sync products, categories, customers, and orders
 */

import {
  fetchWooCommerceProducts,
  fetchWooCommerceCategories,
  fetchWooCommerceCustomers,
  fetchWooCommerceOrders,
  createWooCommerceProduct,
  updateWooCommerceProduct,
  createWooCommerceOrder,
  updateWooCommerceOrder,
  testWooCommerceConnection,
} from "./woocommerce-client";
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
    const wooProducts = await fetchWooCommerceProducts();
    onProgress?.(wooProducts.length, wooProducts.length);
    return wooProducts;
  } catch (error) {
    console.error("Error syncing products from WooCommerce:", error);
    throw error;
  }
}

/**
 * Sync categories from WooCommerce to POS
 */
export async function syncCategoriesFromWooCommerce(): Promise<Category[]> {
  try {
    const wooCategories = await fetchWooCommerceCategories();
    return wooCategories;
  } catch (error) {
    console.error("Error syncing categories from WooCommerce:", error);
    throw error;
  }
}

/**
 * Sync customers from WooCommerce to POS
 */
export async function syncCustomersFromWooCommerce(): Promise<Customer[]> {
  try {
    const wooCustomers = await fetchWooCommerceCustomers();
    return wooCustomers;
  } catch (error) {
    console.error("Error syncing customers from WooCommerce:", error);
    throw error;
  }
}

/**
 * Sync orders from WooCommerce to POS
 */
export async function syncOrdersFromWooCommerce(): Promise<Order[]> {
  try {
    const wooOrders = await fetchWooCommerceOrders();
    return wooOrders;
  } catch (error) {
    console.error("Error syncing orders from WooCommerce:", error);
    throw error;
  }
}

/**
 * Push a new product to WooCommerce
 */
export async function pushProductToWooCommerce(product: Product): Promise<string> {
  try {
    const wooProduct = await createWooCommerceProduct(product);
    return wooProduct.id.toString();
  } catch (error) {
    console.error("Error pushing product to WooCommerce:", error);
    throw error;
  }
}

/**
 * Update existing product in WooCommerce
 */
export async function updateProductInWooCommerce(productId: string, product: Product): Promise<void> {
  try {
    await updateWooCommerceProduct(productId, product);
  } catch (error) {
    console.error("Error updating product in WooCommerce:", error);
    throw error;
  }
}

/**
 * Push a new order to WooCommerce
 */
export async function pushOrderToWooCommerce(order: Order): Promise<string> {
  try {
    const wooOrder = await createWooCommerceOrder(order);
    return wooOrder.id.toString();
  } catch (error) {
    console.error("Error pushing order to WooCommerce:", error);
    throw error;
  }
}

/**
 * Update existing order in WooCommerce
 */
export async function updateOrderInWooCommerce(orderId: string, order: Order): Promise<void> {
  try {
    await updateWooCommerceOrder(orderId, order);
  } catch (error) {
    console.error("Error updating order in WooCommerce:", error);
    throw error;
  }
}

/**
 * Test WooCommerce connection
 */
export async function testConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const connected = await testWooCommerceConnection();
    return { connected };
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
