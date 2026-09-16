/**
 * Vercel entrypoint.
 *
 * Vercel's framework detector looks for a DEFAULT-exported Hono app in one of:
 * app / index / server / src/app / src/index / src/server. So `app-core.ts`
 * deliberately does NOT match those names (a no-default-export `src/app.ts`
 * makes Vercel fail with "Invalid export"). Only this file exports default.
 */
import { app } from "./app-core.js";

export default app;