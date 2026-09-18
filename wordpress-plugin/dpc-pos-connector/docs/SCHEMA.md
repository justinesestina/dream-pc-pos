# DPC POS Connector — Database Schema

All tables are created with `dbDelta` and use the real WordPress table prefix
(`$wpdb->prefix`). The examples below use `wp_`; a site with a custom prefix
(e.g. `dpcwp_`) creates `dpcwp_dpc_users`, and so on.

Access tables in code with `DPC_POS_RBAC::table('users')`.

- **Installed schema version option:** `dpc_pos_db_version`
- **Current schema version:** `0.1.0`
- **Charset/collation:** `$wpdb->get_charset_collate()`

Datetime columns are stored in **UTC** unless noted. Rows created by the
connector use `gmdate()`, so comparisons use `... UTC` in `strtotime()` and
`UTC_TIMESTAMP()` in SQL.

---

## `dpc_users`

DPC POS accounts. Separate from `wp_users`. Passwords are Argon2id/bcrypt
hashes; `wordpress_user_id` optionally links to a WordPress user for SSO.

| Column              | Type                 | Notes                                             |
| ------------------- | -------------------- | ------------------------------------------------- |
| `id`                | bigint unsigned, PK  | Auto-increment                                    |
| `wordpress_user_id` | bigint unsigned NULL | Linked WP user (indexed)                          |
| `username`          | varchar(60), UNIQUE  | Login username                                    |
| `email`             | varchar(100), UNIQUE | Login email / reset target                        |
| `display_name`      | varchar(150)         | Shown in the app                                  |
| `password_hash`     | varchar(255)         | Argon2id/bcrypt; empty until set                  |
| `status`            | varchar(20)          | `active`, `inactive`, `suspended`, `locked`       |
| `failed_attempts`   | int                  | Consecutive failures                              |
| `locked_until`      | datetime NULL        | Lockout expiry (UTC)                              |
| `last_login_at`     | datetime NULL        | Last successful login (UTC)                       |
| `created_at`        | datetime             | Default `CURRENT_TIMESTAMP`                       |
| `updated_at`        | datetime             | Auto-updates                                      |

Indexes: `username`, `email`, `wordpress_user_id`, `status`.

---

## `dpc_roles`

| Column        | Type                | Notes                                          |
| ------------- | ------------------- | ---------------------------------------------- |
| `id`          | bigint unsigned, PK | Auto-increment                                 |
| `slug`        | varchar(50), UNIQUE | `owner`, `administrator`, …                    |
| `name`        | varchar(100)        | Human label                                    |
| `description` | varchar(255)        |                                                |
| `is_system`   | tinyint(1)          | 1 = seeded system role                         |
| `created_at`  | datetime            |                                                |
| `updated_at`  | datetime            |                                                |

Seeded roles: `owner`, `administrator`, `manager`, `sales`, `inventory_staff`,
`accountant`. Owners are a protected system role.

---

## `dpc_permissions`

The canonical permission registry (`module.action`).

| Column        | Type                | Notes                        |
| ------------- | ------------------- | ---------------------------- |
| `id`          | bigint unsigned, PK |                              |
| `slug`        | varchar(80), UNIQUE | e.g. `inventory.create`      |
| `module`      | varchar(50)         | Indexed                      |
| `action`      | varchar(30)         |                              |
| `description` | varchar(255)        |                              |
| `created_at`  | datetime            |                              |

---

## `dpc_role_permissions`

Grants a role a permission.

| Column          | Type                | Notes                          |
| --------------- | ------------------- | ------------------------------ |
| `id`            | bigint unsigned, PK |                                |
| `role_id`       | bigint unsigned     |                                |
| `permission_id` | bigint unsigned     | Indexed                        |

Unique: `(role_id, permission_id)`.

---

## `dpc_user_roles`

Assigns a role to a DPC user.

| Column        | Type                | Notes                    |
| ------------- | ------------------- | ------------------------ |
| `id`          | bigint unsigned, PK |                          |
| `user_id`     | bigint unsigned     |                          |
| `role_id`     | bigint unsigned     | Indexed                  |
| `assigned_by` | bigint unsigned NULL| Acting DPC user          |
| `assigned_at` | datetime            |                          |

Unique: `(user_id, role_id)`.

---

## `dpc_branches`

Branches (Phase 3 UI; schema present).

| Column        | Type                | Notes                          |
| ------------- | ------------------- | ------------------------------ |
| `id`          | bigint unsigned, PK |                                |
| `code`        | varchar(50), UNIQUE | e.g. `MAIN`                    |
| `name`        | varchar(150)        |                                |
| `address`     | varchar(255)        |                                |
| `status`      | varchar(20)         | `active` / `inactive`          |
| `created_at`  | datetime            |                                |
| `updated_at`  | datetime            |                                |

---

## `dpc_user_branches`

Assigns users to branches.

| Column        | Type                | Notes                       |
| ------------- | ------------------- | --------------------------- |
| `id`          | bigint unsigned, PK |                             |
| `user_id`     | bigint unsigned     |                             |
| `branch_id`   | bigint unsigned     | Indexed                     |
| `is_primary`  | tinyint(1)          | First assigned = primary    |
| `assigned_at` | datetime            |                             |

Unique: `(user_id, branch_id)`.

---

## `dpc_sessions`

Active and revoked sessions. Only the token **hash** is stored.

| Column          | Type                | Notes                                      |
| --------------- | ------------------- | ------------------------------------------ |
| `id`            | bigint unsigned, PK |                                            |
| `user_id`       | bigint unsigned     | Indexed                                    |
| `token_hash`    | char(64), UNIQUE    | SHA-256 of the raw token                   |
| `csrf_token`    | char(64)            | SHA-256 of the raw CSRF token              |
| `ip`            | varchar(45)         |                                            |
| `user_agent`    | varchar(255)        |                                            |
| `created_at`    | datetime            |                                            |
| `last_seen_at`  | datetime            | Slid on activity                           |
| `expires_at`    | datetime            | Idle expiry (UTC); indexed                 |
| `revoked_at`    | datetime NULL       | Set on logout/revoke                       |

The raw token lives only in the `dpc_session` HttpOnly cookie (or is returned as
a bearer token at login). Lifetime is `session_timeout_minutes` (default 480),
slid forward on each authenticated request.

---

## `dpc_login_history`

Append-only login attempts.

| Column       | Type                | Notes                              |
| ------------ | ------------------- | ---------------------------------- |
| `id`         | bigint unsigned, PK |                                    |
| `user_id`    | bigint unsigned NULL| Null when the username is unknown  |
| `username`   | varchar(100)        | Attempted username                 |
| `ip`         | varchar(45)         |                                    |
| `user_agent` | varchar(255)        |                                    |
| `result`     | varchar(20)         | `success` / `failure` / `lockout`  |
| `reason`     | varchar(150)        | e.g. `bad_password`                |
| `created_at` | datetime            | Indexed                            |

Indexes: `user_id`, `result`, `created_at`.

---

## `dpc_audit_logs`

Append-only compliance events with before/after values.

| Column       | Type                | Notes                                   |
| ------------ | ------------------- | --------------------------------------- |
| `id`         | bigint unsigned, PK |                                         |
| `user_id`    | bigint unsigned NULL| Actor                                   |
| `action`     | varchar(80)         | e.g. `user.updated`, `sso.handoff`      |
| `module`     | varchar(50)         | Indexed                                 |
| `resource`   | varchar(80)         | e.g. `user`                             |
| `record_id`  | varchar(64)         | Target id                               |
| `old_value`  | longtext            | JSON snapshot (nullable)                |
| `new_value`  | longtext            | JSON snapshot (nullable)                |
| `branch_id`  | bigint unsigned NULL|                                         |
| `ip`         | varchar(45)         |                                         |
| `user_agent` | varchar(255)        |                                         |
| `result`     | varchar(20)         | `success` / `failure`                   |
| `created_at` | datetime            | Indexed                                 |

Indexes: `user_id`, `action`, `module`, `created_at`.

---

## `dpc_activity_logs`

Operational timeline (lighter than audit logs).

| Column        | Type                | Notes                         |
| ------------- | ------------------- | ----------------------------- |
| `id`          | bigint unsigned, PK |                               |
| `user_id`     | bigint unsigned NULL|                               |
| `module`      | varchar(50)         | Indexed                       |
| `action`      | varchar(80)         |                               |
| `description` | varchar(255)        |                               |
| `record_id`   | varchar(64)         |                               |
| `branch_id`   | bigint unsigned NULL|                               |
| `created_at`  | datetime            | Indexed                       |

Indexes: `user_id`, `module`, `created_at`.

---

## `dpc_approval_workflows`

Approval rules (Phase 3 UI; schema present).

| Column              | Type                | Notes                          |
| ------------------- | ------------------- | ------------------------------ |
| `id`                | bigint unsigned, PK |                                |
| `document_type`     | varchar(50)         | Indexed                        |
| `name`              | varchar(150)        |                                |
| `min_amount`        | decimal(12,2)       |                                |
| `max_amount`        | decimal(12,2) NULL  |                                |
| `branch_id`         | bigint unsigned NULL| Indexed                        |
| `requester_role_id` | bigint unsigned NULL|                                |
| `approver_role_id`  | bigint unsigned     |                                |
| `level`             | int                 | Default 1                      |
| `is_active`         | tinyint(1)          | Default 1                      |
| `created_at`        | datetime            |                                |
| `updated_at`        | datetime            |                                |

---

## `dpc_approval_requests`

Approval requests (Phase 3 UI; schema present).

| Column         | Type                | Notes                                     |
| -------------- | ------------------- | ----------------------------------------- |
| `id`           | bigint unsigned, PK |                                           |
| `workflow_id`  | bigint unsigned NULL|                                           |
| `document_type`| varchar(50)         |                                           |
| `record_id`    | varchar(64)         |                                           |
| `amount`       | decimal(12,2)       |                                           |
| `status`       | varchar(20)         | `pending` (default)                       |
| `current_level`| int                 | Default 1                                 |
| `requested_by` | bigint unsigned     | Indexed                                   |
| `decided_by`   | bigint unsigned NULL|                                           |
| `decided_at`   | datetime NULL       |                                           |
| `notes`        | text                |                                           |
| `created_at`   | datetime            |                                           |
| `updated_at`   | datetime            |                                           |

Indexes: `(document_type, record_id)`, `status`, `requested_by`.

---

## `dpc_settings`

Key/value settings, including encrypted integration secrets.

| Column          | Type                | Notes                          |
| --------------- | ------------------- | ------------------------------ |
| `id`            | bigint unsigned, PK |                                |
| `setting_key`   | varchar(80), UNIQUE |                                |
| `setting_value` | longtext            | Serialized / encrypted value   |
| `updated_at`    | datetime            | Auto-updates                   |

Read/write with `DPC_POS_Security::get_setting()` /
`DPC_POS_Security::set_setting()` (passing `null` deletes the row).

Encrypted values are prefixed `sodium:` or `openssl:` and decrypted with a key
derived from `AUTH_KEY`, so they are not portable across sites.

---

## Seeding

`DPC_POS_Activator::install()` is idempotent and safe to re-run:

1. `create_tables()` — `dbDelta` creates/updates every table.
2. `seed_permissions()` — inserts missing registry entries.
3. `seed_roles()` — inserts missing roles + default grants.
4. `bootstrap_owner()` — if no Owner exists, links the first WordPress
   administrator as Owner (empty password).
5. Updates `dpc_pos_db_version`.

Bump `DPC_POS_Activator::DB_VERSION` when the schema changes to trigger the
upgrade on the next request.
