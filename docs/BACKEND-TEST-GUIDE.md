# DPC NEXUS — Backend test guide & progress

Everything you need to run, test, and extend the API in `backend/` — and what
each endpoint returns. Architecture decisions live in
[`BACKEND-INTEGRATION-PLAN.md`](./BACKEND-INTEGRATION-PLAN.md); this file is the
"how do I try it" companion.

---

## 1. Progress so far

| Area | Status | Backing store | Endpoints |
| --- | --- | --- | --- |
| Auth (WordPress login) | ✅ works | WordPress live site | `POST /auth/login`, `GET /auth/me` |
| Health / meta | ✅ works | — | `GET /health` |
| Products — list/detail | ✅ works | WooCommerce (live) | `GET /products`, `GET /products/:id` |
| Products — create / edit | ✅ works | WooCommerce (live) | `POST /products`, `PUT /products/:id` |
| Products — stock set | ✅ works | WooCommerce (live) | `PUT /products/:id/stock` |
| Products — delete | ✅ works | WooCommerce (live) | `DELETE /products/:id` |
| Products — image + stock-status | ✅ works | WooCommerce (live) | `imageUrl` / `stock_status` on `POST` / `PUT` |
| Categories CRUD | ✅ works | WooCommerce (live) | `GET/POST/PUT/DELETE /categories` |
| Brands CRUD | ✅ works | WooCommerce (live, brand plugin) | `GET/POST/PUT/DELETE /brands` |
| Tags CRUD | ✅ works | WooCommerce (live) | `GET/POST/PUT/DELETE /tags` |
| Attributes + terms CRUD | ✅ works | WooCommerce (live) | `/attributes`, `/attributes/:id/terms`… |
| Media upload (local image) | ✅ API ready* | WordPress media (live) | `POST /media` |
| Orders — list / create | ✅ works | WooCommerce (live) | `GET /orders`, `POST /orders` |
| Quotations — list / create / update / delete | ✅ works | WooCommerce (tagged orders) | `GET /quotes`, `POST /quotes`, `PUT /quotes/:id`, `DELETE /quotes/:id` |
| Inventory ledger, serials | ⏳ stub (401/empty) | Supabase (planned P1) | `GET /inventory`, `GET /serials` |
| Customers, builds, services, warranty, returns, shifts, releases, audit, notifications | ⏳ stub | Supabase (planned P2–P5) | mounted, return stubs |

\* **Media upload** reuses the app password you logged in with — no setup. The
optional env pair `WP_MEDIA_USERNAME` + `WP_MEDIA_APP_PASSWORD` (a dedicated
backend account) is only a fallback for JWT-only clients.

**Quotations are persistent** — each quote is stored as a WooCommerce *order*
tagged with the `_dpc_is_quote` meta key, so quotes survive restarts and Vercel
cold-starts without any separate database. They're filtered out of the Orders
tab so they never look like sales orders. (Postgres/Supabase remains the
long-term home; moving there later is a pure storage swap — the API shape stays
the same.)

**Source of truth today:** WooCommerce (`dreampcbuild.com`). The API reads and
writes straight to the storefront catalog and orders.

---

## 2. Run locally (2 minutes)

```bash
cd backend
cp .env.example .env        # fill in the values
npm install                  # first time only
npm run dev
```

You should see:

```
[dpc-nexus] API listening on http://localhost:8787/api/v1
[dpc-nexus] Tester: http://localhost:8787/test.html
```

Open **http://localhost:8787/test.html** in a browser. You will need a
WordPress **application password** (not your regular password):

1. Log in to `dreampcbuild.com` → **Users → Profile**
2. **Application Passwords** → **Add New** (name it `DPC POS`) → copy the 24-char code
3. In the tester: **username = WP login**, **password = the 24-char code** → **Log in**

The tester has tabs that mirror the store:
- **Products** — list, search, **Edit** (full-detail modal with a category
  dropdown and a valid `stock_status` dropdown), **+ New product** (category,
  image URL), delete.
- **Catalog** — CRUD for **Categories / Brands / Tags / Attributes** straight
  to WooCommerce (uses the category list for the product dropdowns).
- **Orders / Quotations** — create and manage orders and quotes.

Plus an *"Last API call"* panel that shows exactly what the server returned for
every button you press.

> If login says `rest_not_logged_in` even with the app password, your hosting
> is stripping the `Authorization` header — tell the dev team (we'd switch to
> cookie-based auth).

---

## 3. Deploy on Vercel

1. Vercel → **Add project** → pick `Vanflame/dreampc-pos` (or the mirror).
2. **Root Directory → `backend`** (Framework Preset auto-detects **Hono**).
3. **Environment Variables** (same names as `backend/.env`):
   `JWT_SECRET`, `WOOCOMMERCE_URL`, `WOOCOMMERCE_CONSUMER_KEY`,
   `WOOCOMMERCE_CONSUMER_SECRET`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
   `WP_MEDIA_USERNAME` + `WP_MEDIA_APP_PASSWORD` are **optional** — media upload
   can reuse each user's login app password instead.
4. **Deployment Protection → off** so the app + tester are publicly reachable.
5. Tester lives at `https://<your-project>.vercel.app/test.html`, API at
   `https://<your-project>.vercel.app/api/v1`.

> Vercel's entry is `backend/src/server.ts` (only file with a default export).
> `src/dev.ts` is the local listener; do not run Vercel with the file:// URL.

---

## 4. API reference

Base URL: locally `http://localhost:8787/api/v1`, in prod
`https://<your-project>.vercel.app/api/v1`.

**Auth:** every route except `/health`, `/auth/login` requires:
```
Authorization: Bearer <token-from-login>
```

**Response envelope (lists):**
```json
{ "data": [ ... ], "meta": { "page": 1, "perPage": 2, "total": 2 } }
```

**Error envelope (any 4xx/5xx):**
```json
{ "error": { "code": "WP_AUTH_FAILED", "message": "…", "details": … } }
```
The tester prints `code: message` inline so you can debug live.

### 4.1 Auth

`POST /auth/login` — body:
```json
{ "username": "jeo", "appPassword": "xxxx xxxx xxxx xxxx xxxx xxxx" }
```
Returns:
```json
{ "data": {
  "token": "eyJ…",
  "expiresIn": 28800,
  "user": { "id": "1", "name": "Jeo", "email": "…", "role": "owner", "initials": "JE" }
} }
```

`GET /auth/me` — returns the token claims (`sub`, `role`, `wpUserId`, `wpRoles`).

### 4.2 Health

`GET /health` →
```json
{ "status": "ok", "wpLoginAvailable": true, "wpConfigured": true,
  "supabaseConfigured": false,
  "domains": [ "auth", "products", "inventory", "…", "notifications" ] }
```

### 4.3 Products

`GET /products?search=rtx` → array of product detail objects:

```json
{ "data": [ {
  "id": "123", "sku": "GPU-RTX4060", "name": "RTX 4060", "brand": "Gigabyte",
  "categoryId": "17", "categoryName": "Graphics Cards", "productType": "simple",
  "description": "…", "price": 17950, "salePrice": 16950, "cost": 16000,
  "serialTracked": false, "warrantyMonths": 36, "location": "A-1", "supplier": "PC Express",
  "specs": { "Chipset": "AD107" }, "status": "publish",
  "stock_quantity": 8, "stock_status": "instock", "manage_stock": true,
  "imageUrl": "https://…/image.jpg", "dateCreated": "…", "dateModified": "…"
} ],
  "meta": { "page": 1, "perPage": 1, "total": 1 } }
```

`GET /products/:id` → the same object (full detail, what the Edit popup shows).

`POST /products` — body (all optional except `name`):
```json
{ "name": "RTX 5080", "sku": "GPU-RTX5080", "price": 47950,
  "stock_quantity": 3, "stock_status": "instock",
  "imageUrl": "https://…/image.jpg", "description": "…", "categoryId": "17",
  "cost": 45000, "brand": "MSI", "warrantyMonths": 36,
  "serialTracked": true, "location": "A-1", "supplier": "PC Express" }
```
Creates the product in WooCommerce → `201` with the created product.

`PUT /products/:id` — same body represents an **edit**; fields you don't send are
kept by WooCommerce. `imageUrl` is stored as the WC product image (`images`),
`stock_status` must be one of `instock | outofstock | onbackorder` (anything
else → `400`). `cost`, `brand`, `serialTracked`, `warrantyMonths`,
`location`, `supplier` are saved as WC custom fields (`_dpc_*`) so they survive.

`PUT /products/:id/stock` — body `{ "stock_quantity": 12 }` → sets stock (and
enables manage-stock) in WooCommerce.

`DELETE /products/:id` → force-deletes in WooCommerce →
`{ "data": { "id": "123", "deleted": true } }`.
(WC may refuse if the product already has orders.)

### 4.4 Catalog taxonomies

All four are full CRUD straight into WooCommerce and share the same shape
(auth required):

| Route | Lists | Creates `{ name }` | Edits | Deletes |
| --- | --- | --- | --- | --- |
| `/categories` | `GET` | `POST` | `PUT /:id` | `DELETE /:id` |
| `/brands` | `GET` | `POST` | `PUT /:id` | `DELETE /:id` |
| `/tags` | `GET` | `POST` | `PUT /:id` | `DELETE /:id` |
| `/attributes` | `GET` | `POST` | — | — |
| `/attributes/:id/terms` | `GET` | `POST` | `PUT /:id/terms/:termId` | `DELETE /:id/terms/:termId` |

Item shape: `{ "id": "46", "name": "Akko", "slug": "akko", "count": 3 }`
(attributes add `type`: `text | color | select | button`; categories add
`parentId`; create returns `201`).

> Verified against the live store: brands come from a brand plugin
> (`products/brands`), so they CRUD exactly like categories. The **Catalog** tab
> in the tester exercises all of these.

### 4.5 Media upload (local image → product)

`POST /media` — upload a real file from the computer. Product images in
WooCommerce can only be URLs, so this uploads into the WP media library and
returns the hosted URL to put in the product's `imageUrl`:

```json
{ "filename": "rtx-5080.png", "data": "data:image/png;base64,iVBORw0KGgo…",
  "username": "jeo", "appPassword": "xxxx xxxx xxxx xxxx xxxx xxxx" }
```

Response → `201 { "data": { "mediaId": "123", "url": "https://dreampcbuild.com/wp-content/uploads/2026/09/rtx-5080.png" } }`

Rules: `png / jpg / jpeg / webp / gif`, max 10 MB. **Uses the same WordPress
app password the user logged in with** (sent in the body) — nothing to set up.
The tester's Edit modal has an "…or upload from this computer" button that does
this automatically. If you'd rather the server not trust the client's password,
set `WP_MEDIA_USERNAME` + `WP_MEDIA_APP_PASSWORD` (a dedicated WP app password,
Users → Profile → Application Passwords → "DPC backend") and the upload works
with just the Bearer token.

### 4.6 Orders

`GET /orders?search=…` → array mapped to the frontend Order shape:
```json
{ "data": [ {
  "id": "4011", "customerId": "9", "customerName": "Juan Dela Cruz",
  "type": "retail", "status": "processing",
  "items": [ { "productId": "123", "name": "RTX 4060", "sku": "…", "qty": 1, "unitPrice": 16950 } ],
  "subtotal": 17950, "discount": 0, "tax": 0, "serviceTotal": 0, "shippingFee": 0,
  "total": 17950, "amountPaid": 0, "balanceDue": 17950, "payment": null,
  "createdAt": "2026-09-16T…", "cashier": "wordpress", "timeline": []
} ], "meta": { "page": 1, "perPage": 1, "total": 1 } }
```

`POST /orders` — body:
```json
{ "items": [ { "productId": "123", "qty": 1 } ],
  "customerName": "Juan Dela Cruz", "email": "juan@…",
  "paymentMethod": "cod", "setPaid": false, "notes": "…" }
```
Creates a **real WooCommerce order** → `201`. (POS payment/serials logic comes
in the P2 Supabase phase.)

### 4.7 Quotations

`GET /quotes` → array of Quote objects (see `dto.ts`).

`POST /quotes` — body:
```json
{ "customerName": "Maria", "discount": 500,
  "items": [ { "productId": "123", "name": "RTX 4060", "sku": "…", "qty": 1, "unitPrice": 16950 } ] }
```
Creates a draft quote, computes subtotal/total server-side → `201` with the quote.

`PUT /quotes/:id` — `{ "status": "approved" }` (or any quote status), or send
`items` again → bumps the version and records a revision.

`DELETE /quotes/:id` → `{ "data": { "id": "Q-…", "deleted": true } }`.

---

## 5. What to test after each change

1. `npx tsc --noEmit` (in `backend/`) — must pass.
2. `npm run dev` → `/api/v1/health` shows `"status": "ok"`.
3. Tester at `http://localhost:8787/test.html`:
   - Log in (app password) → products should load from the live storefront.
   - Click **Edit** on a product → full detail modal → change price/stock/category
     (dropdown) / stock-status (dropdown) → pick a photo with "…or upload from
     this computer" (or paste an image URL) → **Save** → confirm the "Last API
     call" panel shows `200/201`.
   - Catalog tab → **Brands/Tags/Categories/Attributes** → add + delete an item
     → confirm it appears/disappears on the storefront too.
   - Set stock in the Products table → stock column updates after refresh.
   - Delete a throwaway product → confirm it disappears from the storefront too.
   - Orders tab → **+ New order** → pick a product → creates a WC order.
   - Quotations tab → **+ New quotation** → change status → **Delete**.
4. Push → Vercel redeploys automatically → repeat step 3 against the `.vercel.app` URL.

---

## 6. Known limitations (next steps)

- Quotations live in server memory — will move to Supabase (P3) so they persist.
- Products/orders are WooCommerce-backed; the future Postgres ledger supersedes
  the WC proxy for internal stock/serials (P1/P5).
- `cost`/`brand`/etc. are WC custom fields — readable in wp-admin under the
  product's "Custom fields" section. Product **brand** may also come from the
  store's brand taxonomy when assigned.
- `stock_status` is validated server-side (`instock | outofstock | onbackorder`);
  the tester enforces it with a dropdown.
- Delete is a force-delete; WC refuses products already attached to orders.
- Serial tracking and cash-drawer reconciliation are not wired yet.