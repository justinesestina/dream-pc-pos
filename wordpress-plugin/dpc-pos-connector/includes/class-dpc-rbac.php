<?php
/**
 * Role-based access control: permission registry, role seeding and checks.
 *
 * Every authorization decision in the connector flows through
 * {@see DPC_POS_RBAC::user_can()}. Roles are fully database-driven so custom
 * roles can be created without touching code.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Static RBAC helpers.
 */
class DPC_POS_RBAC {

	/**
	 * Resolves a logical table name to its real (prefixed) name.
	 *
	 * @param string $name Table suffix, e.g. "users".
	 * @return string
	 */
	public static function table( $name ) {
		global $wpdb;
		return $wpdb->prefix . 'dpc_' . $name;
	}

	/**
	 * The CRUD/action verbs every module can expose.
	 *
	 * @return string[]
	 */
	public static function actions() {
		return array( 'create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'print', 'manage' );
	}

	/**
	 * Module slug => human label. Both the Administration module and the rest of
	 * the business areas are permission-controlled, not just admin screens.
	 *
	 * @return array<string,string>
	 */
	public static function modules() {
		return array(
			'users'           => 'Users',
			'roles'           => 'Roles & Permissions',
			'branches'        => 'Branches',
			'approvals'       => 'Approval Workflows',
			'audit'           => 'Audit Logs',
			'activity'        => 'Activity Logs',
			'settings'        => 'System Settings',
			'integrations'    => 'Integrations',
			'products'        => 'Products',
			'inventory'       => 'Inventory',
			'purchase_orders' => 'Purchase Orders',
			'sales'           => 'Sales',
			'customers'       => 'Customers',
			'projects'        => 'Projects',
			'promo_codes'     => 'Promo Codes',
			'accounts'        => 'Accounts',
			'reports'         => 'Reports',
		);
	}

	/**
	 * Full permission registry in canonical `module.action` form.
	 *
	 * @return array<int,array{slug:string,module:string,action:string,description:string}>
	 */
	public static function all_permissions() {
		$permissions = array();
		foreach ( self::modules() as $module => $label ) {
			foreach ( self::actions() as $action ) {
				$permissions[] = array(
					'slug'        => $module . '.' . $action,
					'module'      => $module,
					'action'      => $action,
					'description' => sprintf( '%s: %s', $label, $action ),
				);
			}
		}
		return $permissions;
	}

	/**
	 * Default system roles.
	 *
	 * @return array<int,array{slug:string,name:string,description:string,is_system:int}>
	 */
	public static function default_roles() {
		return array(
			array(
				'slug'        => 'owner',
				'name'        => 'Owner',
				'description' => 'Protected system role. Full control, including role management and integrations.',
				'is_system'   => 1,
			),
			array(
				'slug'        => 'administrator',
				'name'        => 'Administrator',
				'description' => 'Day-to-day administration. Cannot manage the Owner role or grant Owner.',
				'is_system'   => 1,
			),
			array(
				'slug'        => 'manager',
				'name'        => 'Manager',
				'description' => 'Operational manager with approval authority.',
				'is_system'   => 1,
			),
			array(
				'slug'        => 'sales',
				'name'        => 'Sales',
				'description' => 'POS and sales staff.',
				'is_system'   => 1,
			),
			array(
				'slug'        => 'inventory_staff',
				'name'        => 'Inventory Staff',
				'description' => 'Warehouse and stock staff.',
				'is_system'   => 1,
			),
			array(
				'slug'        => 'accountant',
				'name'        => 'Accountant',
				'description' => 'Finance and reporting.',
				'is_system'   => 1,
			),
		);
	}

	/**
	 * Permission grants per default role. `*` means every permission; a
	 * `<module>.*` entry means every action in that module.
	 *
	 * @return array<string,string[]>
	 */
	public static function default_role_matrix() {
		return array(
			'owner'           => array( '*' ),
			'administrator'   => array( '*' ),
			'manager'         => array(
				'users.read',
				'users.update',
				'roles.read',
				'branches.*',
				'approvals.*',
				'audit.read',
				'activity.read',
				'products.*',
				'inventory.*',
				'purchase_orders.*',
				'sales.*',
				'customers.*',
				'projects.*',
				'promo_codes.*',
				'accounts.read',
				'accounts.export',
				'reports.*',
				'settings.read',
			),
			'sales'           => array(
				'products.read',
				'sales.*',
				'customers.*',
				'promo_codes.read',
				'projects.read',
				'reports.read',
			),
			'inventory_staff' => array(
				'products.*',
				'inventory.*',
				'purchase_orders.create',
				'purchase_orders.read',
				'purchase_orders.update',
				'reports.read',
			),
			'accountant'      => array(
				'accounts.*',
				'reports.*',
				'sales.read',
				'purchase_orders.read',
				'inventory.read',
			),
		);
	}

	/**
	 * Expands a matrix rule into concrete permission slugs.
	 *
	 * @param string[]                                             $rules Matrix entries.
	 * @param array<int,array{slug:string,module:string}>          $registry Permission registry.
	 * @return string[]
	 */
	public static function expand_rules( array $rules, array $registry ) {
		if ( in_array( '*', $rules, true ) ) {
			return array_column( $registry, 'slug' );
		}
		$slugs = array();
		foreach ( $rules as $rule ) {
			if ( substr( $rule, -2 ) === '.*' ) {
				$module = substr( $rule, 0, -2 );
				foreach ( $registry as $permission ) {
					if ( $permission['module'] === $module ) {
						$slugs[] = $permission['slug'];
					}
				}
			} elseif ( '' === $rule ) {
				continue;
			} else {
				$slugs[] = $rule;
			}
		}
		return array_values( array_unique( $slugs ) );
	}

	/**
	 * Finds a role row by slug.
	 *
	 * @param string $slug Role slug.
	 * @return array<string,mixed>|null
	 */
	public static function get_role_by_slug( $slug ) {
		global $wpdb;
		$table = self::table( 'roles' );
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE slug = %s", $slug ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $row ? $row : null;
	}

	/**
	 * Role slugs assigned to a DPC user (primary role first).
	 *
	 * @param int $user_id DPC user id.
	 * @return string[]
	 */
	public static function get_user_roles( $user_id ) {
		global $wpdb;
		$user_roles = self::table( 'user_roles' );
		$roles      = self::table( 'roles' );
		$sql        = "SELECT r.slug FROM {$user_roles} ur INNER JOIN {$roles} r ON r.id = ur.role_id WHERE ur.user_id = %d ORDER BY r.slug = 'owner' DESC, r.is_system DESC, r.id ASC";
		$slugs      = $wpdb->get_col( $wpdb->prepare( $sql, $user_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return array_map( 'strval', (array) $slugs );
	}

	/**
	 * Primary role slug for a user, or empty string.
	 *
	 * @param int $user_id DPC user id.
	 * @return string
	 */
	public static function primary_role( $user_id ) {
		$roles = self::get_user_roles( $user_id );
		return $roles ? $roles[0] : '';
	}

	/**
	 * True when the user holds the protected Owner role.
	 *
	 * @param int $user_id DPC user id.
	 * @return bool
	 */
	public static function is_owner( $user_id ) {
		return in_array( 'owner', self::get_user_roles( $user_id ), true );
	}

	/**
	 * Counts active owners. Used to protect the final Owner account.
	 *
	 * @return int
	 */
	public static function active_owner_count() {
		global $wpdb;
		$users      = self::table( 'users' );
		$user_roles = self::table( 'user_roles' );
		$roles      = self::table( 'roles' );
		$sql        = "SELECT COUNT(DISTINCT u.id) FROM {$users} u INNER JOIN {$user_roles} ur ON ur.user_id = u.id INNER JOIN {$roles} r ON r.id = ur.role_id WHERE r.slug = 'owner' AND u.status = 'active'";
		return (int) $wpdb->get_var( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}

	/**
	 * The complete permission set for a user (`*` for Owner).
	 *
	 * @param int $user_id DPC user id.
	 * @return string[]
	 */
	public static function permission_set( $user_id ) {
		if ( self::is_owner( $user_id ) ) {
			return array( '*' );
		}
		global $wpdb;
		$user_roles        = self::table( 'user_roles' );
		$role_permissions  = self::table( 'role_permissions' );
		$permissions       = self::table( 'permissions' );
		$sql               = "SELECT DISTINCT p.slug FROM {$user_roles} ur INNER JOIN {$role_permissions} rp ON rp.role_id = ur.role_id INNER JOIN {$permissions} p ON p.id = rp.permission_id WHERE ur.user_id = %d";
		$slugs             = $wpdb->get_col( $wpdb->prepare( $sql, $user_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return array_map( 'strval', (array) $slugs );
	}

	/**
	 * Authorizes a user for a `module.action` permission. `module.manage`
	 * implies every other action in that module.
	 *
	 * @param int    $user_id    DPC user id.
	 * @param string $permission Permission slug.
	 * @return bool
	 */
	public static function user_can( $user_id, $permission ) {
		$set = self::permission_set( $user_id );
		if ( in_array( '*', $set, true ) ) {
			return true;
		}
		if ( in_array( $permission, $set, true ) ) {
			return true;
		}
		$module = explode( '.', $permission )[0] ?? '';
		return '' !== $module && in_array( $module . '.manage', $set, true );
	}

	/**
	 * Assigns a role to a user (idempotent).
	 *
	 * @param int      $user_id   DPC user id.
	 * @param string   $role_slug Role slug.
	 * @param int|null $assigned_by Acting DPC user id.
	 * @return bool
	 */
	public static function assign_role( $user_id, $role_slug, $assigned_by = null ) {
		$role = self::get_role_by_slug( $role_slug );
		if ( ! $role ) {
			return false;
		}
		global $wpdb;
		$table    = self::table( 'user_roles' );
		$existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE user_id = %d AND role_id = %d", $user_id, (int) $role['id'] ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $existing ) {
			return true;
		}
		$wpdb->insert(
			$table,
			array(
				'user_id'     => (int) $user_id,
				'role_id'     => (int) $role['id'],
				'assigned_by' => $assigned_by ? (int) $assigned_by : null,
			),
			array( '%d', '%d', '%d' )
		);
		return true;
	}

	/**
	 * Removes a role from a user.
	 *
	 * @param int    $user_id   DPC user id.
	 * @param string $role_slug Role slug.
	 * @return bool
	 */
	public static function remove_role( $user_id, $role_slug ) {
		$role = self::get_role_by_slug( $role_slug );
		if ( ! $role ) {
			return false;
		}
		global $wpdb;
		$table = self::table( 'user_roles' );
		$wpdb->delete( $table, array( 'user_id' => (int) $user_id, 'role_id' => (int) $role['id'] ), array( '%d', '%d' ) );
		return true;
	}
}
