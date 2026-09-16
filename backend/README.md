# DPC NEXUS — backend

The server-side half of DreamPC POS. Lives in its own folder (never under `src/`)
so it cannot collide with the TanStack Start frontend — see
[`docs/BACKEND-INTEGRATION-PLAN.md`](../docs/BACKEND-INTEGRATION-PLAN.md) §1.

## What this folder is for

| File | Purpose |
| --- | --- |
| `src/routes/*.ts` | One API module per frontend `src/lib/api/*` domain |
| `src/lib/woocommerce.ts` | Server-side WooCommerce REST bridge (keys never reach the browser) |
| `src/lib/wordpress-auth.ts` | WordPress login → POS role mapping (replaced by Supabase Auth in P4) |
| `src/lib/token.ts` | HS256 JWTs for the POS session (replaced by Supabase Auth JWTs in P4) |
| `src/middleware/auth.ts` | Validates the Bearer token and sets `c.var.user` |
| `src/types/dto.ts` | **The contract the frontend needs** — mirrors `src/lib/types.ts` + `src/lib/ops-types.ts` |
| `src/config.ts` | Server-only env (`.env` in this folder — **no** `VITE_` vars) |

## Run it

```bash
cd backend
cp .env.example .env        # add WooCommerce keys + a strong JWT_SECRET
bun install
npm run dev                 # API at http://localhost:8787/api/v1
```

Discovered routes: hit `GET /api/v1/health` to see the domain list and whether
WooCommerce/Supabase are configured. The `/auth/login` endpoint verifies a
WordPress username + application password against the live site and returns a
Bearer JWT you can use against every other route.

## Deploy on Vercel (root directory = `backend`)

Vercel auto-detects the Hono app via the default export in `src/server.ts`
(zero-config Hono preset — no `vercel.json` needed).

1. In Vercel, add this repo and set **Root Directory → `backend`** (Project
   Settings → General). Framework Preset auto-detects **Hono**.
2. Add these **Environment Variables** in Project Settings (they are the
   server-only `backend/.env` values — the hosted app does not read the file):
   - `JWT_SECRET` (generate: `openssl rand -hex 32`)
   - `WOOCOMMERCE_URL`, `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (when Phase P4 lands)
3. Deploy. The API base URL will be `https://<your-project>.vercel.app/api/v1`.
4. Point the frontend at it: set `VITE_API_BASE_URL` in the frontend's
   production `.env` (the `src/lib/api/*` seam reads this — plan §3.2).

The `src/index.ts` local listener was split into `src/dev.ts` (local only) so
`app.ts` + `src/server.ts` stay Vercel-safe and never open a stray port.

## Test page (temporary, single-page)

Vercel serves `public/**` from the CDN, so a quick tester ships with the app:

```
https://<your-project>.vercel.app/test.html
```

What it does today (real, WC-backed):
- **Products** — list, search, create, edit (name/price/stock), inline stock
  setter, force-delete. All synced to WooCommerce via `lib/woocommerce.ts`.
- **Orders** — list storefront orders + create a new order (product picker,
  qty, customer, payment method, mark paid).
- **Quotations** — create/list/edit status/delete; stored in-memory on the
  server (NOTE: resets on cold start until the Postgres phase P3).

Login with a WordPress username + application password (client never sees the
WooCommerce keys). Route inventory: see the top of `src/routes/products.ts`,
`orders.ts`, `quotes.ts`.

## Contract (what the frontend expects)

- Every list route returns `{ data: T[], meta: { page, perPage, total } }`.
- Every error returns `{ error: { code, message, details? } }` — the frontend
  `src/lib/api/*` functions unwrap this envelope.
- Domain DTO shapes live in `src/types/dto.ts`. **The frontend owns the shape**;
  if `src/lib/types.ts` changes, `dto.ts` must change with it (plan §1).
- Until Phase P0/P1 they return typed empty arrays/501s so the frontend can
  wire up config, error handling and loading states with zero backend surprises.

## Phase mapping (see plan §5)

| Phase | What starts returning real data |
| --- | --- |
| P1 | products, categories, inventory, serials, audit, notifications |
| P2 | orders, payments, customers, returns |
| P3 | quotes, builds, services |
| P4 | warranty, releases, Supabase Auth swap |
| P5 | purchasing, receiving, shifts + WooCommerce push/pull |
| P6 | reporting, retention, cleanup of the demo seam |

Rotation note: rotate `WOOCOMMERCE_CONSUMER_KEY`/`SECRET` (they were committed in
`.env.example`) before this backend goes live (plan §9).