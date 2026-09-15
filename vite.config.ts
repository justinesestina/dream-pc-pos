// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// `vite dev` / `vite serve` is a local-only command. Enable TanStack Start's
// SPA mode there so the dev server returns the client shell instead of doing a
// full server-side render on every refresh (slow on Windows). Production
// `vite build` is unaffected and keeps SSR.
const isLocalDevServer =
  process.argv[2] === "dev" || process.argv[2] === "serve";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    spa: isLocalDevServer ? { enabled: true } : undefined,
  },
  nitro: {
    preset: process.env["NITRO_PRESET"] || "vercel",
  },
});
