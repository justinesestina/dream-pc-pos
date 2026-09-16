/**
 * Server-side configuration. Reads backend/.env — NEVER expose these to the
 * browser. Frontend uses its own VITE_-prefixed variables in .env.local.
 *
 * Loads backend/.env when present (Vercel injects env vars from the dashboard,
 * so process.loadEnvFile() just no-ops there).
 */
try {
  process.loadEnvFile();
} catch {
  /* no .env present — rely on real environment (e.g. Vercel dashboard) */
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8787),

  wp: {
    url: (process.env.WOOCOMMERCE_URL || "").replace(/\/+$/, ""),
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || "",
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || "",
  },

  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  tokenTtlSeconds: 60 * 60 * 8, // 8h — the POS working day

  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

export const wpConfigured = Boolean(
  config.wp.url && config.wp.consumerKey && config.wp.consumerSecret,
);