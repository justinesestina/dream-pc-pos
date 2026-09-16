# DPC NEXUS — Backend Integration Plan (Frontend ↔ Backend File Ownership)

> **Layunin ng doc na ito:** sabihin nang eksakto kung **anong files ang pag-aari ng
> frontend**, **anong files ang gagawin ng backend**, at **saan ang tanging "seam"**
> para mag-usap ang dalawa — para makapag-develop ang backend **kasabay** ng frontend
> **nang walang conflict** sa git o sa runtime.
>
> Status: **Planned** · Frontend is still demo-only (localStorage). This document is the
> roadmap + contract to go live.

---

## 1. The One Rule (Conflict-Avoidance Contract)

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (repo: dreampc-pos)  owns  EVERYTHING under src/      │
│                                                                 │
│  BACKEND owns EVERYTHING outside src/ (backend/, supabase/,     │
│  .env server-side, migrations, Edge Functions, sync workers)    │
│                                                                 │
│  The ONLY shared surface is:                                    │
│    1. The HTTP API contract (OpenAPI/endpoint table, §4)        │
│    2. The DTO types (src/lib/types.ts is CANONICAL during       │
│       transition; backend mirrors them — never imports them)    │
└─────────────────────────────────────────────────────────────────┘
```

**Hard rules:**

1. **The backend NEVER writes (or deletes) a file under `src/`.** If a backend feature
   needs a frontend change, that change is a *separate, small, reviewable frontend PR*.
2. **The frontend NEVER calls WordPress/WooCommerce directly in production.** All
   third-party calls move server-side (sync worker / Edge Function). Direct browser
   calls exist only in the current transitional demo (see §6).
3. **Credentials stay server-side.** `VITE_*` env vars are *public*. Backend secrets
   (WooCommerce keys, WP password, Supabase service role) use `NITRO_*` / `SUPABASE_*`
   vars that are never bundled to the browser.
4. **One domain migrates at a time.** During migration the same action may exist in
   both the demo store and the backend; the `api/store` bridge decides which wins per
   domain (feature flag, §7). This is what makes it "safe to integrate."

---

## 2. Where the app is today (baseline)

| Layer | Files | Owner |
|---|---|---|
| Types / domain models | `src/lib/types.ts`, `src/lib/ops-types.ts` | Frontend (canonical) |
| State / actions | `src/lib/store.tsx` (main), `src/lib/ops-store.tsx` (ops data) | Frontend |
| Demo seed | `src/lib/demo-data.ts`, `src/lib/ops-data.ts` | Frontend |
| Auth (demo) | `src/lib/store.tsx::signInAs`, `src/lib/demo-data.ts::demoUsers` | Frontend |
| Auth (WordPress) | `src/lib/wp-auth.ts` (new, browser → WP directly) | Frontend (transitional) |
| WooCommerce sync | `src/lib/woocommerce-config.ts`, `woocommerce-client.ts`, `woocommerce-sync.ts` | Frontend (transitional, browser → WP directly) |
| RBAC (UI-level) | `src/lib/permissions.ts` | Frontend |
| Routes / UI | `src/routes/**`, `src/components/**` | Frontend |
| Server entry | `src/server.ts`, `src/start.ts` (TanStack Start/Nitro) | Frontend |

All data is persisted in **localStorage** and keyed by `dpc-nexus-demo-v1`.

---

## 3. File ownership map (frontend vs backend)

### 3.1 Frontend-owned (untouchable by backend) — `src/`

| Path | Role during integration |
|---|---|
| `src/lib/types.ts` | **Canonical DTO source** for the main domains |
| `src/lib/ops-types.ts` | Canonical for operations domains (PO, suppliers, shifts…) |
| `src/lib/store.tsx` | Single state container; actions delegate to `src/lib/api/*` over time |
| `src/routes/**` | UI only; never calls WordPress/Supabase directly — only store/api |
| `src/components/**` | UI only; reads store hooks |
| `src/server.ts` / `src/start.ts` | App server entry; only used for SSR + (optionally) a thin API proxy |

### 3.2 The integration seam (NEW, frontend-owned) — `src/lib/api/`

This directory does **not exist yet**. It is the only place the UI-facade talks to a
backend. Backend devs build **against** these files' expected shapes but never edit them.

| File | Purpose |
|---|---|
| `src/lib/api/client.ts` | HTTP/WS transport: base URL, auth header, timeout, retry, error envelope decoding |
| `src/lib/api/types.ts` | Backend-side DTOs (exact mirror of `types.ts`/`ops-types.ts` for now) |
| `src/lib/api/auth.ts` | `login()`, `me()`, `logout()`, `resetPassword()` |
| `src/lib/api/products.ts` | catalog CRUD + categories |
| `src/lib/api/inventory.ts` | stock, adjustments, movements |
| `src/lib/api/serials.ts` | serial registry + lifecycle |
| `src/lib/api/orders.ts` | orders, order status transitions, payments |
| `src/lib/api/quotes.ts` | quotes + convert-to-order |
| `src/lib/api/builds.ts` | builds + assembly steps + QA |
| `src/lib/api/services.ts` | service tickets + parts + labor |
| `src/lib/api/warranty.ts` | warranties + claims |
| `src/lib/api/returns.ts` | RMA/returns + restock guard |
| `src/lib/api/purchasing.ts` | POs + suppliers |
| `src/lib/api/receiving.ts` | goods receipts |
| `src/lib/api/shifts.ts` | cash drawer/shifts + adjustments |
| `src/lib/api/releases.ts` | releases |
| `src/lib/api/audit.ts` | audit log |
| `src/lib/api/notifications.ts` | notifications + realtime subscription |
| `src/lib/api/index.ts` | re-export + `apiProvider` switch (live ↔ demo) |

Each file returns **the exact frontend types** so `store.tsx` method bodies can swap
`patch(...)` ↔ `await api.orders.create(...)` without touching any component.

### 3.3 Backend-owned (build freely, never under `src/`)

Recommended home: a **separate Supabase project** (already architected in
`DPC-NEXUS-SUPABASE-DATABASE-ARCHITECTURE.md`) **plus** a small sync service.
If the backend must live in this repo, put it in a root-level `backend/` folder so
`src/` stays clean.

| Path (if in-repo) | Purpose |
|---|---|
| `backend/` | whole backend service (Nitro / Express / Fastify / Hono) |
| `backend/src/routes/*.ts` | one route module per api file in §3.2 |
| `backend/src/services/*.ts` | business logic + Postgres access |
| `backend/src/lib/woocommerce.ts` | server-side WooCommerce REST bridge (keys here, never `VITE_`) |
| `backend/src/lib/wordpress-auth.ts` | WP Application Password / JWT verification |
| `backend/src/db/migrations/` | SQL migrations (mirrors Supabase doc) |
| `supabase/functions/*` (Supabase) | Edge Functions for auth/webhooks/sync |
| `supabase/migrations/*` | RLS policies + RPCs (existing architecture doc) |

---

## 4. HTTP API contract (what the backend must implement)

### 4.1 Conventions

```
Base URL:      /api/v1            (behind VITE_API_BASE_URL / NITRO_API_BASE_URL)
Auth:          Authorization: Bearer <token>   (JWT from login)
Content-type:  application/json; charset=utf-8
Errors:        { "error": { "code": string, "message": string, "details"?: object } }
List envelope: { "data": [], "meta": { "page", "perPage", "total" } }
Status codes:  200 · 201 · 400 · 401 · 403 · 404 · 409 · 422 · 500
```

### 4.2 Endpoint map (per domain)

| Domain | Endpoints |
|---|---|
| Auth | `POST /auth/login` · `GET /auth/me` · `POST /auth/logout` |
| Products | `GET/POST /products` · `GET/PUT/PATCH/DELETE /products/:id` · `GET/POST /categories` |
| Inventory | `GET /inventory` · `GET /inventory/:productId` · `POST /inventory/:productId/adjust` · `GET /inventory/:productId/movements` |
| Serials | `GET/POST /serials` · `PATCH /serials/:id` · `POST /serials/register` |
| Orders | `POST /orders` · `GET /orders` · `GET/PATCH /orders/:id` · `POST /orders/:id/payment` |
| Quotes | `GET/POST /quotes` · `GET/PUT /quotes/:id` · `POST /quotes/:id/send` · `POST /quotes/:id/convert` |
| Builds | `GET/POST /builds` · `GET/PATCH /builds/:id` · `POST /builds/:id/qa` |
| Services | `GET/POST /services` · `GET/PATCH /services/:id` · `POST /services/:id/parts` |
| Warranty | `GET /warranties` · `GET /warranties/:id` · `POST /warranties/:id/claims` |
| Returns | `GET/POST /returns` · `GET/PATCH /returns/:id` |
| Purchasing | `GET/POST /purchasing` · `GET/PATCH /purchasing/:id` · `GET/POST /suppliers` |
| Receiving | `GET/POST /receiving` · `POST /receiving/:id/complete` |
| Shifts | `GET/POST /shifts` · `PATCH /shifts/:id` · `POST /shifts/:id/adjust` |
| Releases | `GET/POST /releases` · `PATCH /releases/:id` |
| Audit | `GET /audit` · `GET /audit/stats` |
| Notifications | `GET /notifications` · `POST /notifications/read-all` · `WS /notifications` |

Request/response bodies are **exactly** the shapes in `src/lib/types.ts` +
`src/lib/ops-types.ts`. When a field differs, backend adds a `// mira pag…` note in
the contract and the frontend `api/*` file maps it — components never see the raw shape.

---

## 5. Environment variable convention (avoids the #1 past mistake)

| Scope | Prefix | Example | Where |
|---|---|---|---|
| Public (browser-safe) | `VITE_` | `VITE_API_BASE_URL` | `src/.env` (existing pattern) |
| App server (Nitro/TanStack) | `NITRO_` | `NITRO_WOOCOMMERCE_URL` | server only, never bundled |
| Supabase anon (public) | `VITE_SUPABASE_URL/ANON_KEY` | Supabase client | `src/` |
| Supabase service (secret) | `SUPABASE_SERVICE_ROLE_KEY` | migrations / functions | backend only |

> ⚠️ Keep `VITE_WOOCOMMERCE_CONSUMER_KEY/SECRET` **out** of `src/.env` in production.
> They currently live there (and in localStorage) purely for the transitional demo.
> The plan moves them server-side (§6).

---

## 6. WooCommerce / WordPress bridge — final home is the backend

| Today (transitional, frontend) | Target (backend) | Retire in repo |
|---|---|---|
| `src/lib/wp-auth.ts` (browser → WP) | `backend/src/lib/wordpress-auth.ts` + `POST /auth/login` validates via WP or Supabase Auth | delete after Phase 1 ✅ |
| `woocommerce-client.ts` / `woocommerce-sync.ts` (browser → WP) | `backend/src/lib/woocommerce.ts` + sync worker (cron/webhook) | delete after Phase 5 ✅ |
| `woocommerce-config.ts` (localStorage creds) | server env (`NITRO_WOOCOMMERCE_*`) | delete after Phase 5 ✅ |

Flow in production:

```
DPC Nexus UI → src/lib/api/*  →  [Supabase POSTGREST/REST]   →  Postgres (source of truth)
                                [Edge Function]  →  WordPress REST API (product/order sync)
                                [Edge Function]  →  WP Application Passwords (login)
```

---

## 7. Migration phases (each is shippable + reversible)

> Freedom: an **`apiProvider`** flag decides per domain whether the store calls
> `src/lib/api/*` or the existing localStorage demo.
> Default during transition: backend for migrated domains, demo for the rest.

| Phase | Scope | Frontend change | Backend deliverable |
|---|---|---|---|
| **P0 — Contract & seam** | none (infra) | add `src/lib/api/` with typed stubs + `apiProvider` switch | write the OpenAPI contract from §4; publish DTOs |
| **P1 — Auth** | login/session | `store.signInWithUser` + `login()` in `src/lib/api/auth.ts`; retire `wp-auth.ts` use | `POST /auth/login` (Supabase Auth or WP Application Password) + JWT |
| **P2 — Live catalog (read)** | products, categories, inventory, customers, serials | hydrate store from api on boot (replaces `demo-data` seed when live) | read endpoints + RLS + seed migration |
| **P3 — Sales ops (write)** | orders, quotes, payments, returns, reservations | swap `completeSale`, `convertQuoteToOrder`, etc. to api | write endpoints + transactions (stock decrement, serial status, warranty creation) |
| **P4 — Full ops** | builds, services, warranty, shifts, releases, purchasing, receiving | swap remaining store actions | remaining endpoints + realtime notifications |
| **P5 — Remote sync** | WooCommerce/WordPress | delete `woocommerce-*.ts`, `wp-auth.ts`; keep only settings UI | server-side sync worker + webhooks; move secrets to server env |
| **P6 — Cleanup** | demo fallback removed (optional) | remove `demo-data`/`ops-data` paths once backend is stable | — |

**Rollback rule:** every phase keeps the back half of its switch (demo path) until the
next phase ships, so a broken backend never bricks the app.

---

## 8. Concrete task list for the backend dev (start here)

1. Read `docs/DPC-NEXUS-SUPABASE-DATABASE-ARCHITECTURE.md` (33 tables, 31 RPCs, RLS).
2. Create the Supabase project + apply migrations + seed initial catalog.
3. Implement **P1 auth** first: `POST /auth/login` (accepts WP username + application
   password, verifies against WP REST, returns JWT + mapped POS role).
4. Implement **P2 read** endpoints for products/categories/inventory/customers/serials.
5. Keep responses in EXACT `src/lib/types.ts` shape; flag any mismatch in the contract.
6. Do **not** touch `src/`. Coordinate via PRs using this doc as the interface.

---

## 9. Guardrails to prevent git + runtime conflicts

1. **Golden rule (§1):** backend ↔ `src/` is a one-way street (backend may *drive* UI
   changes via the api facade, never edit UI files).
2. If backend is in this repo: use `backend/` at root, add it to TS/ESLint/Prettier
   scopes separately, never add it under `src/`.
3. `src/lib/types.ts` is canonical; generate/derive backend TS types from it (or from
   the OpenAPI spec derived from it) so the two can't silently drift.
4. Feature flag `VITE_USE_BACKEND` + `apiProvider` — runtime fallback, not compile-time.
5. No secrets in git at any point: add `backend/.env*` to `.gitignore`; keep `VITE_*`
   public only; rotate the currently-committed WooCommerce keys before going live.
6. Migrate domains one phase at a time; merge small PRs, not a big-bang rewrite.

---

## 10. Repository & contributor workflow (one codebase, two mirrors)

Right now the **same codebase lives in two GitHub repos**:

| Remote | Repo | Role |
|---|---|---|
| `origin` | `github.com/Vanflame/dreampc-pos.git` | Canonical (default) |
| `alt` | `github.com/justinesestina/dream-pc-pos.git` | Mirror (kept in sync) |

Both are owned by the same person (Justine / Vanflame); anyone added as a GitHub
collaborator can contribute. The **source of truth is one codebase** — the two repos are
just two doors into it.

### Recommended: consolidate to ONE canonical repo

**Yes, one repo is the cleaner setup.** Recommended decision:

1. Keep **`Vanflame/dreampc-pos`** as the **canonical repo** (it's the current `origin`).
2. Treat **`justinesestina/dream-pc-pos`** as a **read-only mirror**, or archive it in
   GitHub Settings once the next push confirms it's identical.
3. Push to both until archived using a shared alias (see below); delete the `alt` remote
   after archiving.

### Sync commands

```bash
git push origin main   # canonical (always)
git push alt main:main # mirror (only while both are active)
```

To push to both with one command, add an alias once:

```bash
git remote add all https://github.com/Vanflame/dreampc-pos.git       # if not set
git set-url --add --push all https://github.com/justinesestina/dream-pc-pos.git
git push all main
```

### Working rules (applies to every contributor)

1. **Always pull before you push**: `git pull --rebase origin main` (try to keep local
   commits on top).
2. Push to `main` **only via fast-forward** — never force-push, rebase, or amend pushed
   commits (Lovable + both mirrors depend on a stable history).
3. Never push secrets. `.env*`, `backend/.env*` stay git-ignored (`VITE_*` values are
   public; server secrets are not committed).
4. Feature/hidden-module branches: push to either repo, PR into `main` on the canonical
   repo.
5. If a push to `alt` is ever rejected because it fell behind, fetch + fast-forward it:
   `git fetch alt; git push alt main:main` (never rewrite).
6. Backend work that lives in-repo goes in `backend/` (never under `src/`), per §1/§9.

---

## 11. Open decisions (to confirm before P1)

- [ ] Backend host: **Supabase** (recommended, already architected) first, or a Node/Nitro
      service in this repo?
- [ ] Login source of truth: **WordPress accounts** (what we just wired) or **Supabase
      Auth** mirrored from WP? (Recommend: login against WP now, migrate to Supabase Auth
      later with a WP OAuth/SSO link.)
- [ ] Which POS role maps to which WP role in production (currently: administrator→owner,
      shop_manager→admin, editor→inventory, custom `nexus_*` roles otherwise).
- [ ] Keep the demo dataset as an offline fallback (`VITE_USE_BACKEND=false`), or remove
      it once P3 is live?
- [ ] Consolidate to a single canonical repo now, or keep the mirror alive a bit longer?

---

*Plan created September 2026 · aligns with `DPC-NEXUS-SUPABASE-DATABASE-ARCHITECTURE.md`
and `WOOCOMMERCE-INTEGRATION.md`. Frontend repo: `dreampc-pos`.*