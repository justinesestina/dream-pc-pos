=== DPC POS Connector ===
Contributors: dreampcbuild
Tags: pos, woocommerce, rbac, sso, api
Requires at least: 6.2
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 0.4.0
License: Proprietary

Secure backend/API connector between the DPC POS interface and WordPress + WooCommerce.

== Description ==

DPC POS Connector is the administration and API layer for the DPC POS
application. It owns DPC POS users, roles and permissions, branches, sessions,
audit/activity logs, approval workflows and WordPress Admin SSO.

* DPC POS credentials are fully separate from WordPress credentials.
* Passwords are hashed with Argon2id where available, otherwise bcrypt.
* Sessions are opaque tokens in HttpOnly cookies with CSRF protection.
* Integration secrets are encrypted at rest with a key derived from the site salt.
* All data lives in `wp_dpc_*` tables inside the existing WordPress database.
* The REST API is namespaced at `dpc/v1` with credentialed CORS for the app.
* The last active Owner is protected from deletion, suspension or demotion.

== Installation ==

1. Upload the `dpc-pos-connector` folder to `/wp-content/plugins/`.
2. Activate the plugin through the Plugins screen.
3. Open **DPC POS** in the admin menu and set a password for the bootstrap Owner.
4. Configure the Application URL and integration credentials (WooCommerce,
   WordPress media) on the same screen.

== Frequently Asked Questions ==

= Where is the data stored? =

In `wp_dpc_*` tables in the existing WordPress database. The real table prefix
is used, so custom prefixes are respected.

= Does this replace WordPress authentication? =

No. It adds a separate credential store for DPC POS users. WordPress Admin SSO
is a one-time, short-lived handoff that signs the linked WordPress user in.

== Changelog ==

= 0.4.0 =
* Serve customers, orders, quotations and suppliers from WooCommerce:
  `GET dpc/v1/customers`, `/orders`, `/quotes` and `/suppliers`. Quotes and
  suppliers reuse their WooCommerce order-meta records.

= 0.3.1 =
* Fix a fatal error on authenticated requests: WordPress has no
  `WP_REST_Request::get_attribute()`, so the auth context is now kept on the
  REST class instead. Login and every authenticated route were affected.
* Send CORS headers before dispatch so error responses are readable in the
  browser instead of failing as an opaque CORS error.

= 0.3.0 =
* Serve the WooCommerce catalog straight from the connector:
  `GET dpc/v1/products`, `GET dpc/v1/products/{id}` and
  `GET dpc/v1/categories`, mapped to the POS data shapes.
* Fix REST handlers registered directly as class methods (users, integrations)
  never receiving their auth context, which raised an ArgumentCountError.

= 0.2.1 =
* Fix audit records failing to insert (NULL `result`) which corrupted REST
  responses when `WP_DEBUG` was on.
* Fix the Application screen save (App URL + additional allowed origins).
* Detect cross-site cookies from the actual request origin, so local dev
  origins get `SameSite=None` without changing the production App URL.

= 0.2.0 =
* Auto-select `SameSite=None; Secure` for the session cookie when the app
  origin is on a different host than WordPress.
* Full documentation (README, API reference, schema guide).

= 0.1.0 =
* Initial Phase 0 foundation: schema, RBAC, sessions, audit/activity, SSO,
  user management and integrations.
