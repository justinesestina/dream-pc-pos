/**
 * Vercel entrypoint.
 *
 * Vercel's Hono preset (zero-config) detects a default-exported Hono app at
 * src/server.ts — keep this file free of any `serve()`/`listen()` call.
 * See https://vercel.com/docs/frameworks/backend/hono
 */
import { app } from "./app.js";

export default app;