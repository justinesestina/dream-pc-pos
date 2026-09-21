<?php
/**
 * Activation, schema creation and upgrades.
 *
 * All tables live in the existing WordPress database and use the real site
 * prefix via {@see wpdb::$prefix}, so custom prefixes are respected.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Creates/upgrades the wp_dpc_* schema and seeds defaults.
 */
class DPC_POS_Activator {

	/**
	 * Database schema version. Bump when the schema changes.
	 */
	const DB_VERSION = '0.3.1';

	/**
	 * Option holding the installed schema version.
	 */
	const DB_VERSION_OPTION = 'dpc_pos_db_version';

	/**
	 * Runs on plugin activation.
	 */
	public static function activate() {
		self::install();
		flush_rewrite_rules();
	}

	/**
	 * Runs on deactivation. Sessions are revoked; data is preserved.
	 */
	public static function deactivate() {
		global $wpdb;
		$sessions = DPC_POS_RBAC::table( 'sessions' );
		$wpdb->query( "UPDATE {$sessions} SET revoked_at = UTC_TIMESTAMP() WHERE revoked_at IS NULL" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		flush_rewrite_rules();
	}

	/**
	 * Applies schema/seed changes when the code version is newer.
	 */
	public static function maybe_upgrade() {
		if ( get_option( self::DB_VERSION_OPTION ) === self::DB_VERSION ) {
			return;
		}
		self::install();
	}

	/**
	 * Creates tables and seeds roles, permissions and the bootstrap Owner.
	 */
	public static function install() {
		self::create_tables();
		self::seed_permissions();
		self::seed_roles();
		self::bootstrap_owner();
		self::seed_projects();
		update_option( self::DB_VERSION_OPTION, self::DB_VERSION );
	}

	/**
	 * Creates/updates every DPC table with dbDelta.
	 */
	private static function create_tables() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$users           = DPC_POS_RBAC::table( 'users' );
		$roles           = DPC_POS_RBAC::table( 'roles' );
		$permissions     = DPC_POS_RBAC::table( 'permissions' );
		$role_perms      = DPC_POS_RBAC::table( 'role_permissions' );
		$user_roles      = DPC_POS_RBAC::table( 'user_roles' );
		$branches        = DPC_POS_RBAC::table( 'branches' );
		$user_branches   = DPC_POS_RBAC::table( 'user_branches' );
		$sessions        = DPC_POS_RBAC::table( 'sessions' );
		$login_history   = DPC_POS_RBAC::table( 'login_history' );
		$audit_logs      = DPC_POS_RBAC::table( 'audit_logs' );
		$activity_logs   = DPC_POS_RBAC::table( 'activity_logs' );
		$workflows       = DPC_POS_RBAC::table( 'approval_workflows' );
		$requests        = DPC_POS_RBAC::table( 'approval_requests' );
		$settings        = DPC_POS_RBAC::table( 'settings' );
		$projects        = DPC_POS_RBAC::table( 'projects' );
		$project_tasks   = DPC_POS_RBAC::table( 'project_tasks' );

		$queries = array();

		$queries[] = "CREATE TABLE {$users} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			wordpress_user_id bigint(20) unsigned DEFAULT NULL,
			username varchar(60) NOT NULL,
			email varchar(100) NOT NULL,
			display_name varchar(150) NOT NULL DEFAULT '',
			avatar_url varchar(255) NOT NULL DEFAULT '',
			phone varchar(20) NOT NULL DEFAULT '',
			password_hash varchar(255) NOT NULL DEFAULT '',
			status varchar(20) NOT NULL DEFAULT 'active',
			failed_attempts int(11) NOT NULL DEFAULT 0,
			locked_until datetime DEFAULT NULL,
			last_login_at datetime DEFAULT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY username (username),
			UNIQUE KEY email (email),
			KEY wordpress_user_id (wordpress_user_id),
			KEY status (status)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$roles} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			slug varchar(50) NOT NULL,
			name varchar(100) NOT NULL,
			description varchar(255) NOT NULL DEFAULT '',
			is_system tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$permissions} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			slug varchar(80) NOT NULL,
			module varchar(50) NOT NULL,
			action varchar(30) NOT NULL,
			description varchar(255) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug),
			KEY module (module)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$role_perms} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			role_id bigint(20) unsigned NOT NULL,
			permission_id bigint(20) unsigned NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY role_permission (role_id, permission_id),
			KEY permission_id (permission_id)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$user_roles} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			role_id bigint(20) unsigned NOT NULL,
			assigned_by bigint(20) unsigned DEFAULT NULL,
			assigned_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY user_role (user_id, role_id),
			KEY role_id (role_id)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$branches} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code varchar(50) NOT NULL,
			name varchar(150) NOT NULL,
			address varchar(255) NOT NULL DEFAULT '',
			status varchar(20) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY code (code),
			KEY status (status)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$user_branches} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			branch_id bigint(20) unsigned NOT NULL,
			is_primary tinyint(1) NOT NULL DEFAULT 0,
			assigned_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY user_branch (user_id, branch_id),
			KEY branch_id (branch_id)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$sessions} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			token_hash char(64) NOT NULL,
			csrf_token char(64) NOT NULL,
			ip varchar(45) NOT NULL DEFAULT '',
			user_agent varchar(255) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			last_seen_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			expires_at datetime NOT NULL,
			ttl_seconds int(11) NOT NULL DEFAULT 0,
			revoked_at datetime DEFAULT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY token_hash (token_hash),
			KEY user_id (user_id),
			KEY expires_at (expires_at)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$login_history} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned DEFAULT NULL,
			username varchar(100) NOT NULL DEFAULT '',
			ip varchar(45) NOT NULL DEFAULT '',
			user_agent varchar(255) NOT NULL DEFAULT '',
			result varchar(20) NOT NULL DEFAULT 'success',
			reason varchar(150) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY result (result),
			KEY created_at (created_at)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$audit_logs} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned DEFAULT NULL,
			action varchar(80) NOT NULL,
			module varchar(50) NOT NULL DEFAULT '',
			resource varchar(80) NOT NULL DEFAULT '',
			record_id varchar(64) NOT NULL DEFAULT '',
			old_value longtext,
			new_value longtext,
			branch_id bigint(20) unsigned DEFAULT NULL,
			ip varchar(45) NOT NULL DEFAULT '',
			user_agent varchar(255) NOT NULL DEFAULT '',
			result varchar(20) NOT NULL DEFAULT 'success',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY action (action),
			KEY module (module),
			KEY created_at (created_at)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$activity_logs} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned DEFAULT NULL,
			module varchar(50) NOT NULL,
			action varchar(80) NOT NULL,
			description varchar(255) NOT NULL DEFAULT '',
			record_id varchar(64) NOT NULL DEFAULT '',
			branch_id bigint(20) unsigned DEFAULT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY module (module),
			KEY created_at (created_at)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$workflows} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			document_type varchar(50) NOT NULL,
			name varchar(150) NOT NULL DEFAULT '',
			min_amount decimal(12,2) NOT NULL DEFAULT 0.00,
			max_amount decimal(12,2) DEFAULT NULL,
			branch_id bigint(20) unsigned DEFAULT NULL,
			requester_role_id bigint(20) unsigned DEFAULT NULL,
			approver_role_id bigint(20) unsigned NOT NULL,
			level int(11) NOT NULL DEFAULT 1,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY document_type (document_type),
			KEY branch_id (branch_id)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$requests} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			workflow_id bigint(20) unsigned DEFAULT NULL,
			document_type varchar(50) NOT NULL,
			record_id varchar(64) NOT NULL,
			amount decimal(12,2) NOT NULL DEFAULT 0.00,
			status varchar(20) NOT NULL DEFAULT 'pending',
			current_level int(11) NOT NULL DEFAULT 1,
			requested_by bigint(20) unsigned NOT NULL,
			decided_by bigint(20) unsigned DEFAULT NULL,
			decided_at datetime DEFAULT NULL,
			notes text,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY document (document_type, record_id),
			KEY status (status),
			KEY requested_by (requested_by)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$settings} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			setting_key varchar(80) NOT NULL,
			setting_value longtext,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY setting_key (setting_key)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$projects} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code varchar(20) NOT NULL,
			name varchar(150) NOT NULL,
			customer varchar(150) NOT NULL DEFAULT 'Internal',
			customer_type varchar(20) NOT NULL DEFAULT 'walk-in',
			status varchar(20) NOT NULL DEFAULT 'planning',
			start_date date DEFAULT NULL,
			due_date date DEFAULT NULL,
			owner bigint(20) unsigned DEFAULT NULL,
			description text,
			scope text,
			value decimal(12,2) NOT NULL DEFAULT 0.00,
			members text,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY code (code),
			KEY status (status),
			KEY owner (owner),
			KEY due_date (due_date)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$project_tasks} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			project_id bigint(20) unsigned NOT NULL,
			title varchar(200) NOT NULL,
			assignee bigint(20) unsigned DEFAULT NULL,
			status varchar(20) NOT NULL DEFAULT 'todo',
			due_date date DEFAULT NULL,
			duration varchar(60) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY project_id (project_id),
			KEY assignee (assignee),
			KEY status (status)
		) {$charset_collate};";

		foreach ( $queries as $query ) {
			dbDelta( $query );
		}
	}

	/**
	 * Inserts the permission registry (idempotent).
	 */
	private static function seed_permissions() {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'permissions' );
		foreach ( DPC_POS_RBAC::all_permissions() as $permission ) {
			$existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE slug = %s", $permission['slug'] ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			if ( $existing ) {
				continue;
			}
			$wpdb->insert(
				$table,
				array(
					'slug'        => $permission['slug'],
					'module'      => $permission['module'],
					'action'      => $permission['action'],
					'description' => $permission['description'],
				),
				array( '%s', '%s', '%s', '%s' )
			);
		}
	}

	/**
	 * Inserts default roles and their permission grants (idempotent).
	 */
	private static function seed_roles() {
		global $wpdb;
		$roles_table = DPC_POS_RBAC::table( 'roles' );
		$perms_table = DPC_POS_RBAC::table( 'permissions' );
		$rp_table    = DPC_POS_RBAC::table( 'role_permissions' );
		$registry    = DPC_POS_RBAC::all_permissions();
		$matrix      = DPC_POS_RBAC::default_role_matrix();

		foreach ( DPC_POS_RBAC::default_roles() as $role ) {
			$existing = DPC_POS_RBAC::get_role_by_slug( $role['slug'] );
			if ( $existing ) {
				$role_id = (int) $existing['id'];
			} else {
				$wpdb->insert(
					$roles_table,
					array(
						'slug'        => $role['slug'],
						'name'        => $role['name'],
						'description' => $role['description'],
						'is_system'   => (int) $role['is_system'],
					),
					array( '%s', '%s', '%s', '%d' )
				);
				$role_id = (int) $wpdb->insert_id;
			}

			$slugs = DPC_POS_RBAC::expand_rules( isset( $matrix[ $role['slug'] ] ) ? $matrix[ $role['slug'] ] : array(), $registry );
			foreach ( $slugs as $slug ) {
				$permission_id = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$perms_table} WHERE slug = %s", $slug ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				if ( ! $permission_id ) {
					continue;
				}
				$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$rp_table} WHERE role_id = %d AND permission_id = %d", $role_id, $permission_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				if ( ! $exists ) {
					$wpdb->insert(
						$rp_table,
						array(
							'role_id'       => $role_id,
							'permission_id' => $permission_id,
						),
						array( '%d', '%d' )
					);
				}
			}
		}
	}

	/**
	 * Ensures at least one Owner DPC account exists, linked to the first
	 * WordPress administrator. The owner sets a DPC password from wp-admin.
	 */
	private static function bootstrap_owner() {
		global $wpdb;
		$users_table = DPC_POS_RBAC::table( 'users' );

		$existing_owner = $wpdb->get_var(
			"SELECT u.id FROM {$users_table} u INNER JOIN " . DPC_POS_RBAC::table( 'user_roles' ) . " ur ON ur.user_id = u.id INNER JOIN " . DPC_POS_RBAC::table( 'roles' ) . " r ON r.id = ur.role_id WHERE r.slug = 'owner' LIMIT 1"
		); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $existing_owner ) {
			return;
		}

		$admins = get_users(
			array(
				'role'    => 'administrator',
				'number'  => 1,
				'orderby' => 'ID',
				'order'   => 'ASC',
				'fields'  => array( 'ID', 'user_login', 'user_email', 'display_name' ),
			)
		);
		if ( empty( $admins ) ) {
			return;
		}
		$admin   = $admins[0];
		$user_id = self::ensure_dpc_user( (int) $admin->ID, $admin->user_login, $admin->user_email, $admin->display_name );
		if ( $user_id ) {
			DPC_POS_RBAC::assign_role( $user_id, 'owner', null );
		}
	}

	/**
	 * Creates a DPC user for a WordPress user if one does not already exist.
	 *
	 * @param int    $wp_user_id    WordPress user id.
	 * @param string $username      Desired username.
	 * @param string $email         Desired email.
	 * @param string $display_name  Display name.
	 * @return int DPC user id (0 on failure).
	 */
	public static function ensure_dpc_user( $wp_user_id, $username, $email, $display_name ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'users' );

		$existing = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE wordpress_user_id = %d", $wp_user_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $existing ) {
			return $existing;
		}

		$username = self::unique_username( $username );
		$email    = self::unique_email( $email, $wp_user_id );

		$wpdb->insert(
			$table,
			array(
				'wordpress_user_id' => (int) $wp_user_id,
				'username'          => $username,
				'email'             => $email,
				'display_name'      => $display_name ? $display_name : $username,
				'password_hash'     => '',
				'status'            => 'active',
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s' )
		);
		return (int) $wpdb->insert_id;
	}

	/**
	 * Ensures a username is unique within DPC users.
	 *
	 * @param string $username Base username.
	 * @return string
	 */
	private static function unique_username( $username ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'users' );
		$base  = '' !== $username ? $username : 'dpc-user';
		$try   = $base;
		$i     = 1;
		while ( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE username = %s", $try ) ) ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$try = $base . '-' . $i;
			$i++;
		}
		return $try;
	}

	/**
	 * Ensures an email is unique within DPC users.
	 *
	 * @param string $email      Base email.
	 * @param int    $wp_user_id WordPress user id (for a deterministic fallback).
	 * @return string
	 */
	private static function unique_email( $email, $wp_user_id ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'users' );
		$base  = is_email( $email ) ? $email : 'wp-' . $wp_user_id . '@dpc.local';
		$try   = $base;
		$i     = 1;
		while ( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE email = %s", $try ) ) ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$parts = explode( '@', $base );
			$try   = $parts[0] . '+' . $i . '@' . ( isset( $parts[1] ) ? $parts[1] : 'dpc.local' );
			$i++;
		}
		return $try;
	}

	/**
	 * Seeds a few demo projects and tasks on first install (idempotent).
	 *
	 * Owners, members and assignees are the earliest active DPC accounts so the
	 * team views have real data on first load. Skips entirely once the projects
	 * table already contains rows.
	 */
	private static function seed_projects() {
		global $wpdb;
		$proj  = DPC_POS_RBAC::table( 'projects' );
		$tasks = DPC_POS_RBAC::table( 'project_tasks' );
		$users = DPC_POS_RBAC::table( 'users' );

		$has = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$proj}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $has > 0 ) {
			return;
		}

		$user_rows = $wpdb->get_results( "SELECT id FROM {$users} WHERE status = 'active' ORDER BY id ASC LIMIT 4", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( empty( $user_rows ) ) {
			return;
		}
		$uids = array_map( 'intval', array_column( $user_rows, 'id' ) );
		$first = $uids[0];
		$pick  = function ( $index ) use ( $uids ) {
			return $uids[ $index % count( $uids ) ];
		};
		$members = wp_json_encode( array_values( array_unique( array( $pick( 0 ), $pick( 1 ) ) ) ) );
		$members_solo = wp_json_encode( array( $first ) );

		$demo_projects = array(
			array(
				'code'  => 'PRJ-001',
				'name'  => 'Office PC Refresh',
				'customer' => 'Northstar Accounting',
				'customer_type' => 'business',
				'status' => 'active',
				'start_date' => '2026-09-10',
				'due_date' => '2026-09-28',
				'owner' => $first,
				'description' => 'Replace twelve workstations and migrate user profiles.',
				'scope' => 'Hardware replacement, profile migration, deployment and handover.',
				'value' => 450000,
				'members' => $members,
			),
			array(
				'code'  => 'PRJ-002',
				'name'  => 'Creator Workstation Build',
				'customer' => 'Mara Santos',
				'customer_type' => 'walk-in',
				'status' => 'planning',
				'start_date' => '2026-09-20',
				'due_date' => '2026-10-04',
				'owner' => $first,
				'description' => 'High-end editing workstation with calibrated display.',
				'scope' => 'Parts sourcing, assembly, burn-in testing and client orientation.',
				'value' => 185000,
				'members' => $members_solo,
			),
			array(
				'code'  => 'PRJ-003',
				'name'  => 'Branch Network Upgrade',
				'customer' => 'Dream PC Cebu',
				'customer_type' => 'business',
				'status' => 'on_hold',
				'start_date' => '2026-10-01',
				'due_date' => '2026-10-12',
				'owner' => $first,
				'description' => 'Switch, access point and structured cabling upgrade.',
				'scope' => 'Site survey, network design, installation and validation.',
				'value' => 210000,
				'members' => wp_json_encode( array_values( array_unique( array( $pick( 2 ), $pick( 3 ) ) ) ) ),
			),
		);

		$project_ids = array();
		foreach ( $demo_projects as $project ) {
			$wpdb->insert(
				$proj,
				array(
					'code'          => $project['code'],
					'name'          => $project['name'],
					'customer'      => $project['customer'],
					'customer_type' => $project['customer_type'],
					'status'        => $project['status'],
					'start_date'    => $project['start_date'],
					'due_date'      => $project['due_date'],
					'owner'         => $project['owner'],
					'description'   => $project['description'],
					'scope'         => $project['scope'],
					'value'         => $project['value'],
					'members'       => $project['members'],
				),
				array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%f', '%s' )
			);
			$project_ids[] = (int) $wpdb->insert_id;
		}

		if ( empty( $project_ids ) ) {
			return;
		}

		$demo_tasks = array(
			array( 0, 'Confirm component availability', 0, 'done', '2026-09-18', '30 mins' ),
			array( 0, 'Prepare migration checklist', 0, 'in_progress', '2026-09-20', '2 hours' ),
			array( 1, 'Send final quote for approval', 1, 'todo', '2026-09-22', '1 hour' ),
			array( 2, 'Confirm cabling schedule', 2, 'todo', '2026-09-24', 'Half-day' ),
			array( 0, 'Order replacement SSDs', 1, 'in_progress', '2026-09-19', '1 hour' ),
			array( 1, 'Benchmark test workstation', 0, 'todo', '2026-09-25', '4 hours' ),
		);
		foreach ( $demo_tasks as $task ) {
			$wpdb->insert(
				$tasks,
				array(
					'project_id' => $project_ids[ $task[0] ],
					'title'      => $task[1],
					'assignee'   => $pick( $task[2] ),
					'status'     => $task[3],
					'due_date'   => $task[4],
					'duration'   => $task[5],
				),
				array( '%d', '%s', '%d', '%s', '%s', '%s' )
			);
		}
	}
}
