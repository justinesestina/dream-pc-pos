/**
 * Local dev runner — NOT used by Vercel (see src/server.ts).
 *
 * Start it with `npm run dev` (or bun run dev). Vercel never imports this
 * file, so @hono/node-server stays out of the deployed bundle.
 */
import { serve } from "@hono/node-server";
import { app } from "./app-core.js";
import { config } from "./config.js";

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[dpc-nexus] API listening on http://localhost:${info.port}/api/v1`);
});