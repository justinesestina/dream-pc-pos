# DPC POS Connector

WordPress plugin that provides the secure backend/API for the DPC POS frontend.
It stores its data in `wp_dpc_*` tables inside the existing WordPress database
and exposes a namespaced REST API at `dpc/v1`.

- **Phase 0 (this build):** schema, RBAC, sessions, audit/activity logs,
  user management, WordPress Admin SSO, integrations.
- **Phase 3 (designed in, later):** branches and branch assignment are already
  present in the schema (`dpc_branches`, `dpc_user_branches`).

## Install

1. Copy the `dpc-pos-connector` folder into `wp-content/plugins/`.
2. Activate **DPC POS Connector** in the WordPress admin.
   Activation creates the tables, seeds roles/permissions and links the first
   WordPress administrator as the bootstrap **Owner**.
3. Open **DPC POS** in the admin sidebar:
   - set a password for the Owner account (it starts without one);
   - set the **Application URL** (the DPC POS frontend origin);
   - configure the WooCommerce / WordPress media credentials.
4. If the frontend runs on a different origin, add it to the allowed origins
   (the app URL is allowed automatically).

### Cross-site cookies

If the frontend is on a different domain than WordPress, sessions use
`SameSite=None; Secure` and the origin must be listed as an allowed origin.
Filters:

- `dpc_pos_cookie_samesite` — `Lax` (default), `Strict`, `None`
- `dpc_pos_session_cookie_name` — default `dpc_session`
- `dpc_pos_allowed_origins` — extra CORS origins
- `dpc_pos_app_url` — frontend base for reset links

## Security model

| Concern            | Implementation                                                    |
| ------------------ | ----------------------------------------------------------------- |
| Password storage   | Argon2id (fallback bcrypt), never reversible                      |
| Sessions           | 256-bit random token, only SHA-256 stored, HttpOnly cookie        |
| CSRF               | Per-session token, required on cookie-authenticated writes        |
| Lockout            | Configurable failed-attempt limit + lockout window                |
| Integration secrets| Encrypted with a key derived from `AUTH_KEY`                      |
| Owner protection   | Last active Owner cannot be deleted, suspended or demoted         |
| Audit              | Every mutation recorded with before/after values and actor        |

## REST API (`dpc/v1`)

All authenticated endpoints accept either the session cookie (with the
`X-DPC-CSRF` header on writes) or `Authorization: Bearer <token>`.

### Auth

| Method | Path                       | Auth        | Notes                     |
| ------ | -------------------------- | ----------- | ------------------------- |
| GET    | `/health`                  | public      | Liveness/version          |
| POST   | `/auth/login`              | public      | Returns user + CSRF token |
| POST   | `/auth/logout`             | session     | Revokes current session   |
| GET    | `/auth/me`                 | session     | Current user + permissions|
| POST   | `/auth/password`           | session     | Change own password       |
| POST   | `/auth/password/forgot`    | public      | Emails a reset link       |
| POST   | `/auth/password/reset`     | public      | Consumes the reset token  |
| GET    | `/auth/sessions`           | session     | Active sessions           |
| DELETE | `/auth/sessions/{id}`      | session     | Revoke a session          |
| POST   | `/auth/sso-token`          | `users.manage` | One-time wp-admin URL  |

### Users

| Method          | Path                        | Permission        |
| --------------- | --------------------------- | ----------------- |
| GET             | `/users`                    | `users.read`      |
| POST            | `/users`                    | `users.create`    |
| GET             | `/users/{id}`               | `users.read`      |
| PATCH / PUT     | `/users/{id}`               | `users.update`    |
| DELETE          | `/users/{id}`               | `users.delete`    |
| POST            | `/users/{id}/status`        | `users.update`    |
| POST            | `/users/{id}/password`      | `users.update`    |
| POST            | `/users/{id}/roles`         | `users.update`    |
| GET             | `/users/{id}/sessions`      | `users.read`      |
| GET             | `/users/{id}/login-history` | `users.read`      |

### Roles & permissions

| Method | Path            | Permission    |
| ------ | --------------- | ------------- |
| GET    | `/roles`        | `roles.read`  |
| GET    | `/permissions`  | `roles.read`  |

### Logs

| Method | Path              | Permission        |
| ------ | ----------------- | ----------------- |
| GET    | `/audit-logs`     | `audit.read`      |
| GET    | `/activity-logs`  | `activity.read`   |

### Integrations

| Method | Path                          | Permission             |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/integrations`               | `integrations.read`    |
| POST   | `/integrations/{type}`        | `integrations.update`  |
| POST   | `/integrations/{type}/test`   | `integrations.update`  |
| POST   | `/integrations/{type}/revoke` | `integrations.update`  |

`{type}` is one of `wordpress`, `woocommerce`, `supabase`, `app`.

## Frontend migration notes

The current frontend stores the WordPress application password in
`localStorage`. Once this plugin is deployed, switch to:

1. `POST /dpc/v1/auth/login` with `{ username, password }` and
   `credentials: 'include'`.
2. Keep the returned `csrf_token` in memory only and send it as `X-DPC-CSRF`
   on every non-GET request.
3. Call `GET /dpc/v1/auth/me` on boot to restore the session.
4. Use `GET /dpc/v1/auth/sso-token` to open WordPress Admin.
