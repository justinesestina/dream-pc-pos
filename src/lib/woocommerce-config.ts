/**
 * DPC POS — WooCommerce API Configuration
 *
 * Configuration for WooCommerce REST API integration
 * Store your WooCommerce credentials in environment variables or update the config below
 */

export interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  wpApi: boolean;
  version: string;
  timeout: number;
}

const STORAGE_KEY = "dpc-nexus/woocommerce-config";

function loadRuntimeOverrides(): Partial<WooCommerceConfig> | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.url === "string" && parsed.url !== "https://your-store.com") {
      return {
        url: parsed.url,
        consumerKey: parsed.consumerKey,
        consumerSecret: parsed.consumerSecret,
      };
    }
  } catch {
    /* ignore corrupted storage */
  }
  return null;
}

/**
 * WooCommerce configuration.
 * Prefers credentials entered in Settings (persisted locally, masked in the UI), then environment variables.
 */
export let woocommerceConfig: WooCommerceConfig = {
  url: (import.meta.env && import.meta.env["VITE_WOOCOMMERCE_URL"]) || "https://your-store.com",
  consumerKey: (import.meta.env && import.meta.env["VITE_WOOCOMMERCE_CONSUMER_KEY"]) || "your_consumer_key",
  consumerSecret: (import.meta.env && import.meta.env["VITE_WOOCOMMERCE_CONSUMER_SECRET"]) || "your_consumer_secret",
  wpApi: true,
  version: "wc/v3",
  timeout: 15000,
  ...loadRuntimeOverrides(),
};

/**
 * Update the runtime WooCommerce configuration (from the Settings form).
 * Returns false if the provided values are invalid, true if saved.
 */
export function setWooCommerceConfig(values: {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}): boolean {
  const next: WooCommerceConfig = {
    ...woocommerceConfig,
    url: values.url.trim().replace(/\/+$/, ""),
    consumerKey: values.consumerKey.trim(),
    consumerSecret: values.consumerSecret.trim(),
  };
  if (!validateWooCommerceConfig(next)) return false;
  woocommerceConfig = next;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          url: next.url,
          consumerKey: next.consumerKey,
          consumerSecret: next.consumerSecret,
        }),
      );
    } catch {
      /* storage full / private mode */
    }
  }
  return true;
}

/**
 * Return the persisted override values (for pre-filling the Settings form), if any.
 */
export function getSavedWooCommerceConfig(): { url: string; consumerKey: string; consumerSecret: string } | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.url === "string") {
      return {
        url: parsed.url,
        consumerKey: parsed.consumerKey || "",
        consumerSecret: parsed.consumerSecret || "",
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Clear persisted runtime credentials, reverting to environment variables.
 */
export function clearSavedWooCommerceConfig(): void {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Validate WooCommerce configuration
 */
export function validateWooCommerceConfig(config: WooCommerceConfig): boolean {
  return !!(
    config.url &&
    config.url !== "https://your-store.com" &&
    config.consumerKey &&
    config.consumerKey !== "your_consumer_key" &&
    config.consumerSecret &&
    config.consumerSecret !== "your_consumer_secret"
  );
}

/**
 * Get WooCommerce configuration with validation
 */
export function getWooCommerceConfig(): WooCommerceConfig | null {
  if (!validateWooCommerceConfig(woocommerceConfig)) {
    console.warn("WooCommerce configuration is not properly set. Please configure your credentials.");
    return null;
  }
  return woocommerceConfig;
}
