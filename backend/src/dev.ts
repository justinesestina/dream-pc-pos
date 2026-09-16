/**
 * Local dev runner — NOT used by Vercel (see src/server.ts).
 *
 * Start it with `npm run dev` (or bun run dev). Vercel never imports this
 * file, so @hono/node-server stays out of the deployed bundle.
 *
 * Serves public/** statically too, so the tester is reachable at
 * http://localhost:8787/test.html (same origin — no CORS/localStorage quirks
 * like the file:// path).
 */
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "node:path";
import { app } from "./server.js";
import { config } from "./config.js";

const publicDir = path.resolve(import.meta.dirname, "../public");
app.use("/test.html", serveStatic({ root: publicDir }));

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[dpc-nexus] API listening on http://localhost:${info.port}/api/v1`);
  console.log(`[dpc-nexus] Tester: http://localhost:${info.port}/test.html`);
});