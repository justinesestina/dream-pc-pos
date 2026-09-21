# DPC POS Connector — API Reference

Base URL: `https://YOUR-SITE/wp-json/dpc/v1`

- **Authentication:** session cookie `dpc_session` (set by `/auth/login`) or
  `Authorization: Bearer <session-token>`.
- **CSRF:** cookie-authenticated `POST`/`PUT`/`PATCH`/`DELETE` requests must
  send `X-DPC-CSRF: <csrf_token>` (returned by `/auth/login`).
- **Content type:** `application/json` for requests with a body.
- **Errors:** a `WP_Error` serializes as

  ```json
  { "code": "dpc_forbidden", "message": "You do not have permission to do that.", "data": { "status": 403 } }
  ```

### Common error codes

| Code                        | HTTP | Meaning                                        |
| --------------------------- | ---- | ---------------------------------------------- |
| `dpc_unauthorized`          | 401  | Missing/invalid/expired session or CSRF        |
| `dpc_forbidden`             | 403  | Authenticated but lacking the permission       |
| `dpc_invalid_credentials`   | 401  | Wrong username or password                     |
| `dpc_account_inactive`      | 403  | Account is `inactive`/`suspended`/`locked`     |
| `dpc_account_locked`        | 423  | Temporary lockout after failed attempts        |
| `dpc_password_not_set`      | 403  | Account has no DPC password yet                |
| `dpc_not_found`             | 404  | Resource does not exist                        |
| `dpc_invalid_request`       | 400  | Missing/invalid input                          |
| `dpc_weak_password`         | 400  | Password below the minimum length              |
| `dpc_invalid_token`         | 400  | Reset link invalid or expired                  |
| `dpc_last_owner`            | 409  | Operation would remove the last active Owner   |
| `dpc_owner_restricted`      | 403  | Non-Owner tried to grant/revoke the Owner role |
| `dpc_self_lockout`          | 409  | Cannot suspend/deactivate your own account     |
| `dpc_self_delete`           | 409  | Cannot delete your own account                 |
| `dpc_wp_not_linked`         | 409  | Account has no linked WordPress user           |
| `dpc_integration_failed`    | 400  | Integration connection test failed             |

### User object

```json
{
  "id": 1,
  "username": "owner",
  "email": "owner@example.com",
  "display_name": "Site Owner",
  "avatar_url": "",
  "status": "active",
  "wordpress_user_id": 1,
  "wordpress_connected": true,
  "wordpress_username": "admin",
  "role": "owner",
  "roles": [{ "slug": "owner", "name": "Owner" }],
  "permissions": ["*"],
  "branches": [{ "id": 1, "code": "MAKATI", "name": "Makati Main", "address": "…" }],
  "primary_branch_id": 1,
  "failed_attempts": 0,
  "locked_until": null,
  "last_login_at": "2026-01-01 08:00:00",
  "created_at": "2025-12-01 09:00:00",
  "initials": "SO"
}
```

`permissions` is `["*"]` for Owners; otherwise the concrete `module.action`
slugs. A `module.manage` grant implies every action in that module.
`branches` lists the branch assignments; `primary_branch_id` is the default
branch. `failed_attempts` / `locked_until` reflect the current sign-in lockout
state (`locked_until` is `null` when not locked).

---

## Health

### `GET /health` — public

```json
{ "ok": true, "plugin": "dpc-pos-connector", "version": "0.2.0", "db": "0.1.0" }
```

---

## Auth

### `POST /auth/login` — public

Request:

```json
{ "username": "owner", "password": "…" }   // username may also be the email
```

Response `200`:

```json
{ "user": { …User }, "csrf_token": "…", "expires_at": 1700000000 }
```

Sets the `dpc_session` HttpOnly cookie. The `csrf_token` is only shown here and
by `/auth/me`; keep it in memory/sessionStorage.

Errors: `dpc_invalid_request`, `dpc_invalid_credentials`,
`dpc_account_inactive`, `dpc_account_locked`, `dpc_password_not_set`,
`dpc_session_failed`.

### `POST /auth/logout` — session

Revokes the current session and clears the cookie.

```json
{ "ok": true }
```

### `GET /auth/me` — session

Returns the current [`User`](#user-object). Useful to restore a session on boot.

### `POST /auth/password` — session

Change your own password.

```json
{ "current_password": "…", "new_password": "…" }
```

```json
{ "ok": true }
```

Errors: `dpc_invalid_password`, `dpc_weak_password`.

### `POST /auth/password/forgot` — public

```json
{ "username": "owner" }   // username or email
```

Always returns `{ "ok": true }` (no account enumeration). If the account exists
and is active, an email with a one-hour reset link is sent.

### `POST /auth/password/reset` — public

```json
{ "user_id": 1, "token": "…", "new_password": "…" }
```

```json
{ "ok": true }
```

Consumes the one-time token and revokes every existing session.

### `GET /auth/sessions` — session

```json
{ "items": [
  { "id": 4, "ip": "1.2.3.4", "user_agent": "…", "created_at": "…", "last_seen_at": "…", "expires_at": "…", "current": true }
] }
```

### `DELETE /auth/sessions/{id}` — session

Revoke one of your sessions (or any session with `users.manage`).

```json
{ "ok": true }
```

### `POST /auth/sso-token` — session, requires `users.manage` (or Owner)

Issues a one-time WordPress Admin handoff for the linked WP user.

```json
{ "url": "https://YOUR-SITE/?dpc_sso=1&token=…", "expires_in": 60 }
```

Errors: `dpc_forbidden`, `dpc_wp_not_linked`. The token is single-use and
expires after 60 seconds.

---

## Users

| Endpoint                     | Method        | Permission      |
| ---------------------------- | ------------- | --------------- |
| `/users`                     | GET / POST    | `users.read` / `users.create` |
| `/users/{id}`                | GET / PATCH / DELETE | `users.read` / `users.update` / `users.delete` |
| `/users/{id}/status`         | POST          | `users.update`  |
| `/users/{id}/password`       | POST          | `users.update`  |
| `/users/{id}/roles`          | POST          | `users.update`  |
| `/users/{id}/branches`       | POST          | `users.update`  |
| `/users/{id}/sessions`       | GET           | `users.read`    |
| `/users/{id}/sessions/revoke`| POST          | `users.update`  |
| `/users/{id}/login-history`  | GET           | `users.read`    |
| `/branches`                  | GET           | `users.read`    |
| `/login-history`             | GET           | `audit.read`    |

### `GET /users`

Query params: `search`, `status` (`active|inactive|suspended|locked`), `role`,
`page`, `per_page` (max 200).

```json
{ "items": [ …User ], "total": 12, "page": 1, "per_page": 50 }
```

### `POST /users`

```json
{
  "username": "jdelacruz",
  "email": "j@example.com",
  "display_name": "Juan Dela Cruz",
  "password": "optional-strong-password",
  "roles": ["sales"],
  "branch_ids": [1],
  "primary_branch_id": 1,
  "status": "active",
  "wordpress_user_id": 5
}
```

`primary_branch_id` (optional) sets the primary branch; when omitted the first
entry of `branch_ids` is used. `status` (optional) is `active` (default),
`suspended` or `deactivated`.

Returns the created [`User`](#user-object). Errors: `dpc_invalid_username`,
`dpc_invalid_email`, `dpc_username_taken`, `dpc_email_taken`,
`dpc_invalid_role`, `dpc_weak_password`, `dpc_invalid_wp_user`.

### `PATCH /users/{id}`

Any of `email`, `display_name`, `avatar_url` (a media URL; pass `""` to clear),
`wordpress_user_id`, `roles` (replaces the set), `branch_ids` (replaces the
set).

### `POST /users/{id}/status`

```json
{ "status": "suspended" }
```

Revokes sessions when moving away from `active`. Errors: `dpc_self_lockout`,
`dpc_last_owner`, `dpc_invalid_status`.

### `POST /users/{id}/password`

```json
{ "password": "…" }          // or
{ "generate": true }
```

Returns `{ "ok": true, "password": "…" }` — `password` is non-null only when
generated. Revokes the target's sessions.

### `POST /users/{id}/roles`

```json
{ "roles": ["manager", "sales"] }
```

Replaces the role set. Owner rules: only an Owner may include/omit `owner`, and
the last active Owner must keep it.

### `POST /users/{id}/branches`

```json
{ "branch_ids": [1, 2], "primary_branch_id": 2 }
```

Replaces the branch access set and the primary branch (`null` falls back to the
first branch). Audited.

### `POST /users/{id}/sessions/revoke`

Revokes every active session for the account. Audited.

### `GET /branches` — `users.read`

```json
{ "items": [ { "id": 1, "code": "MAKATI", "name": "Makati Main", "address": "…", "status": "active" } ] }
```

### `GET /login-history` — `audit.read`

Global sign-in attempts across all accounts, newest first.

Query params: `search`, `result` (`success|failed`), `user_id`, `from`, `to`
(`YYYY-MM-DD`), `page`, `per_page` (max 200).

```json
{ "items": [ { "id": 22, "user_id": 5, "username": "jdelacruz", "display_name": "Juan Dela Cruz", "ip": "…", "user_agent": "…", "result": "success", "reason": "", "created_at": "…" } ], "total": 41 }
```

### `GET /users/{id}/sessions`

```json
{ "items": [ { "id": 4, "ip": "…", "user_agent": "…", "created_at": "…", "last_seen_at": "…", "expires_at": "…" } ] }
```

### `GET /users/{id}/login-history`

Last 100 attempts.

```json
{ "items": [ { "id": 22, "username": "owner", "ip": "…", "user_agent": "…", "result": "success", "reason": "", "created_at": "…" } ] }
```

`result` is `success`, `failure` or `lockout`.

### `DELETE /users/{id}`

Deletes the DPC account and its sessions, roles and branch links (the WordPress
user is untouched). Errors: `dpc_self_delete`, `dpc_last_owner`.

---

## Roles & permissions

### `GET /roles` — `roles.read`

```json
{
  "items": [
    { "id": 1, "slug": "owner", "name": "Owner", "is_system": true, "user_count": 1, "permissions": ["*"] }
  ],
  "modules": { "users": "Users", "roles": "Roles & Permissions", "…": "…" },
  "actions": ["create", "read", "update", "delete", "approve", "reject", "export", "print", "manage"]
}
```

### `GET /permissions` — `roles.read`

```json
{
  "items": [ { "slug": "users.create", "module": "users", "action": "create", "description": "Users: create" } ],
  "modules": { … },
  "actions": [ … ]
}
```

### `POST /roles` — `roles.create`

Creates a custom role. Permissions may be a list of exact `module.action` slugs,
whole-module rules (`inventory.*`) or `*`.

```json
{
  "name": "Purchasing Clerk",
  "slug": "purchasing_clerk",
  "description": "Creates purchase orders and approves stock returns.",
  "permissions": ["purchase_orders.*", "products.read", "inventory.read"]
}
```

Response: the created role:

```json
{ "id": 7, "slug": "purchasing_clerk", "name": "Purchasing Clerk",
  "is_system": false, "user_count": 0, "permissions": ["inventory.read", "products.read"] }
```

### `PUT /roles/{id}` — `roles.update`

Updates `name`, `description` and/or replaces `permissions`. Slugs are
immutable. All roles including system roles (`owner`, `administrator`) can be
renamed and granted custom permissions. `administrator` always keeps
`users.manage` and `roles.manage` so account and role administration cannot be
locked out; the `owner` role still resolves to full access regardless of stored
grants.

```json
{ "name": "Purchasing Manager", "permissions": ["purchase_orders.*"] }
```

### `POST /roles/{id}/permissions` — `roles.update`

Replaces the grants of a role with the given rules (system roles included;
`administrator` keeps `users.manage` + `roles.manage`).

```json
{ "permissions": ["sales.create", "sales.read", "customers.*"] }
```

### `DELETE /roles/{id}` — `roles.delete`

Deletes a custom role. System roles and roles still assigned to users are
rejected (409).

---

## Logs

### `GET /audit-logs` — `audit.read`

Query params: `module`, `action`, `user_id`, `page`, `per_page`.

```json
{
  "items": [
    { "id": 10, "user_id": 1, "action": "user.status_changed", "module": "users",
      "resource": "user", "record_id": "2", "old_value": { "status": "active" },
      "new_value": { "status": "suspended" }, "result": "success", "created_at": "…" }
  ],
  "total": 1
}
```

### `GET /activity-logs` — `activity.read`

Query params: `module`, `action`, `user_id`, `search`, `from`, `to`
(`YYYY-MM-DD`), `page`, `per_page`.

```json
{ "items": [ { "id": 1, "user_id": 1, "module": "users", "action": "…", "description": "…", "record_id": "…", "created_at": "…" } ], "total": 1 }
```

---

## Integrations

`{type}` is one of `wordpress`, `woocommerce`, `supabase`, `app`.

### `GET /integrations` — `integrations.read`

```json
{
  "items": {
    "woocommerce": {
      "label": "WooCommerce",
      "configured": true,
      "fields": { "url": "https://shop.example.com" },
      "secrets": { "key": "••••abcd", "secret": "••••ef01" },
      "last_test": { "ok": true, "message": "WooCommerce connection OK.", "checked_at": "…" },
      "last_tested": "…"
    }
  }
}
```

Secrets are always masked.

### `POST /integrations/{type}` — `integrations.update`

Save/replace credentials. Omitted secrets keep their stored value.

```json
{ "url": "https://shop.example.com", "key": "ck_…", "secret": "cs_…" }
```

For `type=app`: `{ "url": "https://pos.example.com", "allowed_origins": ["https://staging.example.com"] }`.

### `POST /integrations/{type}/test` — `integrations.update`

Runs a live connection test and stores the result.

```json
{ "ok": true, "message": "WooCommerce connection OK.", "details": { "status": 200 } }
```

### `POST /integrations/{type}/revoke` — `integrations.update`

Clears stored fields and secrets for the type.

```json
{ "ok": true }
```

---

## Catalog

WooCommerce catalog mapped to the POS data shapes. List responses use the shared
envelope:

```json
{ "data": [ /* items */ ], "meta": { "page": 1, "perPage": 20, "total": 42 } }
```

### `GET /products` — `products.read`

Optional `?search=` filters by product name/SKU. Returns published, draft,
private and pending products.

```json
{
  "data": [
    {
      "id": "123",
      "sku": "CPU-7600X",
      "name": "Ryzen 5 7600X",
      "brand": "AMD",
      "categoryId": "34",
      "categoryName": "Processors",
      "productType": "product",
      "price": 199.0,
      "salePrice": null,
      "cost": 0,
      "serialTracked": false,
      "warrantyMonths": 36,
      "location": "",
      "supplier": "",
      "specs": { "Socket": "AM5" },
      "status": "publish",
      "stock_quantity": 12,
      "stock_status": "instock",
      "manage_stock": true,
      "imageUrl": "https://…",
      "dateCreated": "2026-01-01T00:00:00+00:00",
      "dateModified": "2026-01-02T00:00:00+00:00"
    }
  ],
  "meta": { "page": 1, "perPage": 1, "total": 1 }
}
```

### `POST /products` — `products.create`

Creates a simple internal WooCommerce product. Accepts the fields above
(`name` and `price` required, `sku` optional and uniqely enforced). Category is
matched by `categoryId` or `categoryName`.

```json
{ "name": "Ryzen 5 7600X", "sku": "CPU-7600X", "price": 199, "brand": "AMD",
  "categoryId": "34", "cost": 175, "warrantyMonths": 36,
  "specs": { "Socket": "AM5" }, "imageUrl": "https://…/cpu.png" }
```

Returns the mapped product as `{ "data": { … } }`.

### `GET /products/{id}` — `products.read`

Single product as `{ "data": { … } }`; `404` when it does not exist.

### `PUT /products/{id}` — `products.update`

Partial update of the same fields. `categoryId: ""` clears the category.

### `DELETE /products/{id}` — `products.delete`

Trashes the WooCommerce product. Returns `{ "data": { "id": "…", "deleted": true } }`.

### `PUT /products/{id}/stock` — `products.update`

```json
{ "stockQuantity": 12, "stockStatus": "instock" }
```

Updates WooCommerce stock directly (route exists for the catalog action; for
warehouse-aware stock use the inventory endpoints below).

### `GET /categories` — `products.read`

Maps WooCommerce `product_cat` terms.

```json
{
  "data": [
    {
      "id": "34",
      "name": "Processors",
      "slug": "processors",
      "parentId": "",
      "description": "",
      "display": "default",
      "image": "",
      "archived": false,
      "createdAt": "",
      "key": "processors",
      "count": 42
    }
  ],
  "meta": { "page": 1, "perPage": 1, "total": 1 }
}
```

### `POST` / `GET /categories/{id}` / `PUT` / `DELETE` — `products.*`

Create (`name` required, optional `parentId`, `description`, `display`,
`imageUrl`), read, update and trash WooCommerce categories.

---

## Brands, tags & attributes

Backed by WooCommerce taxonomies (`product_brand` for brands, `product_tag`
for tags) and `wc_get_attribute_taxonomies()` for attributes.

| Endpoint                              | Permissions (read/create/update/delete) |
| ------------------------------------- | --------------------------------------- |
| `/brands` + `/brands/{id}`            | `products.read` / `.create` / `.update` / `.delete` |
| `/tags` + `/tags/{id}`                | `products.read` / `.create` / `.update` / `.delete` |
| `/attributes` + `/attributes/{id}`    | `products.read` / `.create` / `.update` / `.delete` |
| `/attributes/{id}/terms` + `/…/{termId}` | `products.read` / `.create` / `.update` / `.delete` |

Brand object: `{ id, name, slug }`. Attribute object: `{ id, name, slug,
type }` with `type` one of `text`, `color`, `select`, `button`. Terms:
`{ id, name, slug }`.

---

## Sales

WooCommerce-backed reads, all using the `{ data, meta }` envelope.

### `GET /customers` — `customers.read`

Registered WooCommerce customers mapped to the POS customer shape
(`id`, `name`, `email`, `phone`, `type`, `address`, `since`, `status`).

### `POST /customers` — `customers.create`

```json
{ "name": "Juan Dela Cruz", "email": "j@example.com", "phone": "+63…", "address": "…" }
```

Creates a WooCommerce customer. A `dpc_conflict` (409) is returned when the
email already exists.

### `GET /orders` — `sales.read`

Sales orders only — quotation, supplier, warehouse, movement and transfer
records are filtered out. Includes line items, totals and the DPC build status
(`_dpc_status` meta layered over the WooCommerce status).

### `POST /orders` — `sales.create`

```json
{ "items": [{ "productId": "123", "qty": 2 }],
  "customerName": "Juan Dela Cruz", "email": "j@example.com",
  "notes": "…", "paymentMethod": "bacs", "setPaid": true }
```

Creates a WooCommerce order. `setPaid` runs `payment_complete()`.

### `PUT /orders/{id}` — `sales.update`

```json
{ "status": "assembly" }
```

Status is one of `pending`, `paid`, `processing`, `assembly`, `testing`,
`ready`, `completed`, `cancelled`, `refunded` (mapped onto WooCommerce states,
with the DPC status stored in `_dpc_status`).

### `GET /quotes` — `sales.read`

Orders tagged `_dpc_is_quote=yes`, mapped to the POS `Quote` shape (`id` is
`Q-<orderId>`, plus status, items, totals, version, revisions, expiry).

### `POST /quotes` — `sales.create`

```json
{ "items": [{ "productId": "123", "name": "…", "qty": 1, "unitPrice": 199 }],
  "discount": 0, "serviceTotal": 50, "shippingFee": 0, "tax": 0,
  "customerName": "…", "notes": "…" }
```

Starts as `draft`, version `1`, expires in 14 days.

### `PUT /quotes/{id}` / `DELETE /quotes/{id}` — `sales.update` / `sales.delete`

Updating the `items` bumps the version and appends a revision (history kept to
20). `DELETE` hard-deletes the underlying record and returns
`{ "data": { "id": "Q-…", "deleted": true } }`.

### `GET /suppliers` — `purchase_orders.read`

Orders tagged `_dpc_record=supplier`, mapped to the POS `Supplier` shape
(`id` is `SUP-<orderId>`, plus contact, terms, lead time, categories, product
assignments, rating).

### `GET /suppliers/{id}` / `POST` / `PUT` / `DELETE` — `purchase_orders.*`

```json
{ "name": "Tech Distributor", "contact": "Ana", "email": "…", "phone": "…",
  "terms": "Net 30", "leadTimeDays": 7, "categories": ["GPUs"],
  "productIds": ["123"], "status": "active", "rating": 4.5 }
```

`PUT` merges over the current record (`productIds` replaces the set). `DELETE`
returns `{ "data": { "id": "SUP-…", "deleted": true } }`.

---

## Warehouses, inventory & transfers

Internal records are tagged WooCommerce orders (warehouses `WH-…`, movements
`MV-…`, transfers `TR-…`); per-warehouse quantities live in product meta. The
default WooCommerce selling warehouse (`WOO`) is seeded automatically on first
read. All list responses use the `{ data, meta }` envelope.

| Endpoint | Method | Permission |
| -------- | ------ | ---------- |
| `/warehouses` | GET / POST | `inventory.read` / `inventory.create` |
| `/warehouses/{id}` | GET / PUT / DELETE | `inventory.read` / `.update` / `.delete` |
| `/warehouses/{id}/stock` | GET / POST | `inventory.read` / `inventory.update` |
| `/warehouses/{id}/stock/{productId}` | PUT | `inventory.update` |
| `/warehouses/{id}/movements` | GET | `inventory.read` |
| `/warehouses/{id}/transfers` | GET | `inventory.read` |
| `/inventory/stock` | GET | `inventory.read` |
| `/inventory/stock/{productId}` | GET | `inventory.read` |
| `/inventory/movements` | GET | `inventory.read` |
| `/inventory/stock/{productId}/adjust` | POST | `inventory.update` |
| `/transfers` | GET / POST | `inventory.read` / `inventory.create` |
| `/transfers/{id}` | GET / PUT | `inventory.read` / `inventory.update` |

Warehouse shape: `{ id, name, location, isDefault, isSelling, status,
createdAt }`. Stock rows keep `{ productId, name, sku, quantity, skuCost,
totalValue, cost }`. Movements: `{ id, type, productId, quantity, fromWh,
toWh, reason, date }`. Transfers: `{ id, fromWarehouseId, toWarehouseId,
items[{productId, qty, sku}], status, createdAt, date }`.

### `POST /inventory/stock/{productId}/adjust`

```json
{ "warehouseId": "WH-…", "quantity": -2, "reason": "Damaged" }
```

Adjusts stock by `quantity` (positive or negative) with a `dpc_not_found` /
`dpc_bad_request` guard when the quantity would make applied stock negative.

### `POST /transfers`

```json
{ "fromWarehouseId": "WH-A", "toWarehouseId": "WH-B",
  "items": [{ "productId": "123", "qty": 2 }] }
```

Transfers start `pending`; `PUT` with `status: "completed"` applies stock to
both sides (idempotent — completing twice is a no-op).

---

## Search

### `GET /search?q=…` — `products.read`

Runs the command-palette search across navigation pages, products (name, SKU,
brand, attributes), orders and quotes. Returns up to 16 deduplicated results:

```json
{ "data": [
  { "id": "product-123", "type": "products", "label": "Ryzen 5 7600X",
    "subtitle": "CPU-7600X | AMD", "route": "/products/123",
    "imageUrl": "https://…" }
], "meta": { "page": 1, "perPage": 1, "total": 1 } }
```

---

## Media

### `POST /media` — any authenticated session

```json
{ "filename": "cpu.png", "data": "iVBORw0KGgo…" }
```

Decodes the base64 image (`data:` URLs accepted), uploads it to the WordPress
media library and returns `{ "data": { "mediaId": "123", "url": "https://…" } }`.
Max 10 MB; `png`, `jpg`/`jpeg`, `webp` and `gif` only.

---

## Permission slugs

Modules: `users`, `roles`, `branches`, `approvals`, `audit`, `activity`,
`settings`, `integrations`, `products`, `inventory`, `purchase_orders`, `sales`,
`customers`, `projects`, `promo_codes`, `accounts`, `reports`.

Actions: `create`, `read`, `update`, `delete`, `approve`, `reject`, `export`,
`print`, `manage`.

A permission slug is `module.action`, e.g. `inventory.create`,
`inventory.read`, `users.update`. `module.manage` implies all actions in the
module; `*` (Owner) implies everything. `DPC_POS_RBAC::user_can()` is the single
authorization entry point.
