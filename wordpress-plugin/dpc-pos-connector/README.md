# DPC POS Connector

The DPC POS Connector is a WordPress plugin that provides the secure
administration and API backend for the **DPC POS** frontend. It owns DPC POS
users, roles & permissions, branches, sessions, audit/activity logs, approval
workflows and WordPress Admin single sign-on. All data is stored in `wp_dpc_*`
tables inside the **existing WordPress database** — no separate database is
required.

- **REST namespace:** `dpc/v1` (under `/wp-json/`)
- **Current version:** `0.7.0`
- **Requires:** WordPress 6.2+, PHP 7.4+
- **Phase 0 scope:** schema, RBAC, sessions, audit/activity, user management,
  role editing, WordPress Admin SSO, integrations.
- **Designed in (later phases):** branches, approval workflows. The tables
  already exist.

---

## Contents

- [Overview](#overview)
- [Installation](#installation)
- [First-time setup](#first-time-setup)
- [Configuration](#configuration)
- [Security model](#security-model)
- [REST API](#rest-api)
- [Data model](#data-model)
- [Frontend integration](#frontend-integration)
- [WP-CLI & debugging](#wp-cli--debugging)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

Extended documentation:

- [`docs/API-REFERENCE.md`](docs/API-REFERENCE.md) — every endpoint, request
  and response.
- [`docs/SCHEMA.md`](docs/SCHEMA.md) — every table and column.

---

## Overview

| Area                | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| Authentication      | Separate DPC POS credentials (Argon2id/bcrypt), sessions, lockout    |
| Sessions            | Opaque 256-bit tokens in HttpOnly cookies, with CSRF protection      |
| RBAC                | 17 modules × 9 actions, 6 seeded roles, DB-driven                    |
| User management     | Create/edit/status/password/roles with Owner protection              |
| Audit logs          | Append-only security/compliance events with before/after values      |
| Activity logs       | Append-only operational timeline                                     |
| WordPress Admin SSO | One-time, 60-second handoff to wp-admin                              |
| Integrations        | Encrypted WooCommerce / WordPress media / Supabase credentials       |
| Branches            | Tables + user assignment (Phase 3 UI)                                |

DPC POS credentials are **completely separate** from WordPress credentials. The
connector never receives or stores a WordPress password. WordPress Admin SSO is
an explicit, permission-gated handoff.

---

## Installation

### From the WordPress admin

1. Zip the `dpc-pos-connector` folder.
2. Go to **Plugins → Add New → Upload Plugin**, choose the zip, then
   **Install** and **Activate**.
3. Activation creates the tables, seeds roles/permissions and links the first
   WordPress administrator as the bootstrap **Owner**.

### Manually

1. Copy the `dpc-pos-connector` folder to `wp-content/plugins/`.
2. Activate **DPC POS Connector** in the WordPress admin.

On activation the plugin:

- creates/updates all `wp_dpc_*` tables via `dbDelta`;
- seeds the permission registry and default roles;
- creates a DPC user linked to the first WordPress administrator and assigns
  the protected **Owner** role (with an empty password).

Data is **preserved** on deactivation and uninstall. See
[Uninstalling](#uninstalling).

---

## First-time setup

1. Open **DPC POS** in the WordPress admin sidebar.
2. Under **DPC POS accounts**, set a password for the bootstrap Owner.
   (The Owner starts with no DPC password so nothing ships with a default.)
3. Under **Application**, set the **App URL** to the DPC POS frontend origin,
   e.g. `https://pos.example.com`. This value is used for:
   - credentialed CORS (which origins may send cookies),
   - password-reset links,
   - automatic `SameSite=None; Secure` cookie selection when the app is on a
     different host.
4. Configure integrations (optional in Phase 0):
   - **WooCommerce** — store URL + consumer key/secret,
   - **WordPress Media** — application username + application password.
5. Press **Save** on each section, then `GET /wp-json/dpc/v1/health` to confirm
   the REST API is reachable.

### Verify

```bash
curl https://YOUR-SITE/wp-json/dpc/v1/health
# {"ok":true,"plugin":"dpc-pos-connector","version":"0.2.0","db":"0.1.0"}
```

---

## Configuration

### Settings

Settings live in the `wp_dpc_settings` table (not `wp_options`). The admin
screen writes the ones below. Advanced values can be set with
`DPC_POS_Security::set_setting()`.

| Setting key                 | Default | Purpose                                         |
| --------------------------- | ------- | ----------------------------------------------- |
| `session_timeout_minutes`   | `480`   | Idle session timeout (slid on activity)         |
| `login_attempt_limit`       | `5`     | Failed attempts before lockout                  |
| `lockout_minutes`           | `15`    | Lockout duration                                |
| `password_min_length`       | `10`    | Minimum password length (floor 8)               |
| `cookie_samesite`           | auto    | `Lax`, `Strict` or `None` (auto = cross-site)   |
| `integration_app_url`       | site    | Frontend origin                                 |
| `integration_app_origins`   | `[]`    | Extra CORS origins                              |
| `integration_woocommerce_*` | —       | WooCommerce URL/key/secret (encrypted secrets)  |
| `integration_wordpress_*`   | —       | WP media username/password (encrypted)          |
| `integration_supabase_*`    | —       | Optional Supabase URL/service key (encrypted)   |

### Filters

| Filter                        | Default            | Purpose                          |
| ----------------------------- | ------------------ | -------------------------------- |
| `dpc_pos_allowed_origins`     | `[]`               | Add CORS origins                 |
| `dpc_pos_cookie_samesite`     | auto               | Override SameSite                |
| `dpc_pos_cookie_secure`       | `is_ssl()`         | Force the `Secure` flag          |
| `dpc_pos_cookie_domain`       | `''`               | Cookie domain                    |
| `dpc_pos_session_cookie_name` | `dpc_session`      | Cookie name                      |
| `dpc_pos_app_url`             | `home_url()`       | Base for reset links             |
| `dpc_pos_sso_ttl`             | `60`               | SSO handoff token lifetime (s)   |
| `dpc_pos_sso_redirect`        | `admin_url()`      | Redirect after SSO               |
| `dpc_pos_login_attempt`       | `do_action`        | Fired on every login attempt     |

### Cross-site cookies (frontend on another domain)

If the app and WordPress are on different hosts, browsers require the session
cookie to be `SameSite=None; Secure`. The plugin selects this automatically
when the **App URL** host differs from the WordPress host. Requirements:

- HTTPS on both ends,
- the app origin must be listed as an allowed origin (the App URL is added
  automatically),
- the browser must allow third-party cookies for the site (Safari/ITP and
  Chrome third-party-cookie restrictions may block them).

> **Tip:** the most robust deployment is to serve the frontend on a subdomain
> of the WordPress site (e.g. `pos.dreampcbuild.com`), which allows
> `SameSite=Lax` and avoids third-party-cookie blocking.

### Uninstalling

Uninstall keeps data by default. To drop every `wp_dpc_*` table on uninstall,
either set the option:

```php
update_option( 'dpc_pos_delete_data_on_uninstall', true );
```

or add the constant to `wp-config.php`:

```php
define( 'DPC_POS_DELETE_DATA_ON_UNINSTALL', true );
```

---

## Security model

| Concern              | Implementation                                                       |
| -------------------- | -------------------------------------------------------------------- |
| Password storage     | Argon2id where available, otherwise bcrypt. Never reversible.        |
| Sessions             | 256-bit random token; only SHA-256 hash stored; HttpOnly cookie.     |
| CSRF                 | Per-session token; required on cookie-authenticated writes.           |
| Lockout              | Consecutive failed attempts → temporary lock (`locked_until`).        |
| Integration secrets  | Encrypted with a key derived from `AUTH_KEY` (libsodium/OpenSSL).     |
| Secret exposure      | Secrets are returned masked (`••••1234`) and never in full.           |
| Owner protection     | Last active Owner cannot be deleted, suspended or demoted.            |
| Owner grants         | Only an Owner can grant or revoke the Owner role.                     |
| Audit                | Every mutation records actor, IP, user agent, before/after values.    |
| CORS                 | Explicit allow-list; WordPress's reflected-origin header is removed.  |
| Equal-time compares  | `hash_equals()` for tokens/hashes.                                    |

Session tokens are accepted from the `dpc_session` cookie, or as
`Authorization: Bearer <token>` for API clients. CSRF is enforced **only** for
cookie-authenticated writes; bearer clients are not CSRF-eligible.

---

## REST API

Base URL: `https://YOUR-SITE/wp-json/dpc/v1`

| Group        | Endpoints                                                                    |
| ------------ | ---------------------------------------------------------------------------- |
| Health       | `GET /health`                                                                 |
| Auth         | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/password`, `POST /auth/password/forgot`, `POST /auth/password/reset`, `GET /auth/sessions`, `DELETE /auth/sessions/{id}`, `POST /auth/sso-token` |
| Users        | `GET/POST /users`, `GET/PATCH/DELETE /users/{id}`, `POST /users/{id}/status`, `POST /users/{id}/password`, `POST /users/{id}/roles`, `GET /users/{id}/sessions`, `GET /users/{id}/login-history` |
| Roles        | `GET /roles`, `GET /permissions`                                              |
| Logs         | `GET /audit-logs`, `GET /activity-logs`                                       |
| Integrations | `GET /integrations`, `POST /integrations/{type}`, `POST /integrations/{type}/test`, `POST /integrations/{type}/revoke` |

Full request/response documentation:
[`docs/API-REFERENCE.md`](docs/API-REFERENCE.md).

### Quick example

```bash
# 1. Log in (cookie is set on success)
curl -i -c cookies.txt -X POST https://YOUR-SITE/wp-json/dpc/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"secret"}'

# response: {"user":{...},"csrf_token":"<raw>","expires_at":1700000000}

# 2. Use the CSRF token on writes
curl -b cookies.txt -X POST https://YOUR-SITE/wp-json/dpc/v1/users/2/status \
  -H "Content-Type: application/json" \
  -H "X-DPC-CSRF: <raw>" \
  -d '{"status":"suspended"}'
```

---

## Data model

All tables use the real WordPress prefix (`$wpdb->prefix`), e.g.
`wp_dpc_users`. See [`docs/SCHEMA.md`](docs/SCHEMA.md) for every column.

| Table                      | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `dpc_users`                | DPC POS accounts + password hashes        |
| `dpc_roles`                | Roles                                     |
| `dpc_permissions`          | Permission registry (`module.action`)     |
| `dpc_role_permissions`     | Role → permission grants                  |
| `dpc_user_roles`           | User → role assignments                   |
| `dpc_branches`             | Branches (Phase 3 UI)                     |
| `dpc_user_branches`        | User → branch assignments                 |
| `dpc_sessions`             | Active/revoked sessions                   |
| `dpc_login_history`        | Login attempts (success/failure/lockout)  |
| `dpc_audit_logs`           | Compliance events with before/after       |
| `dpc_activity_logs`        | Operational timeline                      |
| `dpc_approval_workflows`   | Approval rules (Phase 3 UI)               |
| `dpc_approval_requests`    | Approval requests (Phase 3 UI)            |
| `dpc_settings`             | Connector settings                        |

---

## Frontend integration

The frontend connects with `VITE_DPC_API_URL`. Set it to the WordPress site and
the connector derives the REST base automatically:

```env
# Any of these forms are accepted:
VITE_DPC_API_URL=https://YOUR-SITE
# or
VITE_DPC_API_URL=https://YOUR-SITE/wp-json/dpc/v1
```

Flow:

1. `POST /auth/login` with `{ username, password }` and
   `credentials: "include"`.
2. Keep `csrf_token` **in memory/sessionStorage** and send it as `X-DPC-CSRF`
   on every non-GET request.
3. Restore the session on boot with `GET /auth/me`.
4. `POST /auth/logout` to revoke the session.
5. `POST /auth/sso-token` (Owner / `users.manage`) to obtain a one-time
   wp-admin URL.

The existing WordPress application-password path remains as a fallback during
migration. When the connector is enabled, the frontend stops persisting the
application password in `localStorage`.

---

## WP-CLI & debugging

```bash
# Confirm tables exist
wp db query "SHOW TABLES LIKE '%dpc_%'"

# Inspect the installed schema version
wp option get dpc_pos_db_version

# Re-run install/upgrade (safe: dbDelta + idempotent seeds)
wp eval 'DPC_POS_Activator::install();'

# List DPC users
wp db query "SELECT id, username, email, status FROM wp_dpc_users"

# Reset a DPC password (Argon2id/bcrypt)
wp eval 'global $wpdb; $wpdb->update(DPC_POS_RBAC::table("users"), array("password_hash"=>DPC_POS_Security::hash_password("new-pass")), array("id"=>1));'
```

Enable REST logging by watching `debug.log` (`WP_DEBUG_LOG`) — every mutation
also writes to `wp_dpc_audit_logs`.

---

## Troubleshooting

| Symptom                                    | Likely cause / fix                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `/health` returns 404                      | Plugin inactive, or permalinks broken. Re-save **Settings → Permalinks**.          |
| Login succeeds but next request is 401     | Cookie blocked. Confirm App URL is allowed, HTTPS is on, and SameSite=None is used. |
| Cookie not sent cross-site (Safari/Chrome)  | Third-party cookies blocked. Serve the app on a subdomain of the WP site.          |
| `dpc_forbidden` on a valid account         | The user's role lacks the permission. Check **Roles & Permissions**.               |
| `dpc_account_locked`                        | Too many failed attempts. Wait for the lockout window or clear `locked_until`.     |
| `dpc_password_not_set`                      | The DPC account has no password yet — set one in the **DPC POS** admin screen.     |
| Integration test fails with HTTP 401/403   | Credentials wrong or lacking scope. Re-save and re-test.                           |
| SSO link says invalid/expired               | Tokens are one-time and last 60 seconds. Request a new one.                        |

---

## Changelog

### 0.7.0

- **Branch management surface:** new `GET /branches`, `POST /users/{id}/branches`
  (replaces assignments and the primary branch) and
  `POST /users/{id}/sessions/revoke` (signs out every session, audited).
- The User object now returns `branches`, `primary_branch_id`, `failed_attempts`
  and `locked_until` so the app can render branch access and lockout state.
- `sync_branches` accepts an explicit primary branch; `POST /users` and
  `PATCH /users/{id}` accept `primary_branch_id`.
- `POST /users` accepts an optional `status` (defaults to `active`).
- **Global login history:** `GET /login-history` lists attempts across all
  accounts with `search`, `result`, `user_id`, `from`/`to` filters.
- Activity reads (`GET /activity-logs`) gained `action`, `search` and
  `from`/`to` filters.
- Role changes (`POST /users/{id}/roles`) now write audit records in addition to
  activity timeline entries.

### 0.6.1

- **System roles can now be edited:** `PUT /roles/{id}` and
  `POST /roles/{id}/permissions` accept `owner` and `administrator` grants and
  names. `administrator` always keeps `users.manage` + `roles.manage` so account
  and role administration cannot be locked out. Both roles still cannot be
  deleted. The `owner` role keeps full access regardless of stored grants.
- Role reads now return the stored permission rows for all roles, so the Roles
  matrix in the app reflects current grants.

### 0.6.0

- **Role editing is now live:** `POST /roles`, `PUT /roles/{id}`,
  `DELETE /roles/{id}` and `POST /roles/{id}/permissions`, with system-role
  protections (Owner/Administrator immutable, no deletion while assigned).
- Role changes write audit records (`role.*`) and activity timeline entries.
- Activity events recorded for sign-ins and user-management actions so the
  Activity Logs feed is populated.

### 0.5.0

- Complete WooCommerce API surface on the same `/api/v1/*` contract: products,
  categories, customers, orders, quotes, suppliers, brands/tags/attributes,
  warehouses, inventory, transfers, global search and media upload.

### 0.2.0

- Auto-select `SameSite=None; Secure` when the app origin differs from WordPress.
- Complete documentation set.

### 0.1.0

- Initial Phase 0 foundation: schema, RBAC, sessions, audit/activity, SSO, user
  management and integrations.

---

## License

Proprietary — Dream PC Build & IT Solutions.
