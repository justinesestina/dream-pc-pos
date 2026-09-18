<?php
/**
 * Role and permission writes backed by the DPC role tables.
 *
 * Complements the read-only `list_roles` / `list_permissions` endpoints with
 * create, update, delete and permission-assignment handlers. System roles can
 * be renamed and their grants edited, but their slug is immutable and they can
 * never be deleted. The `administrator` grants are enforced; the `owner` role
 * still resolves to full access regardless of its stored grants.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Role CRUD + permission management.
 */
class DPC_POS_Roles {

	/**
	 * Slugs that are protected system roles and cannot be deleted or renamed.
	 *
	 * @return string[]
	 */
	private static function immutable_slugs() {
		return array( 'owner', 'administrator' );
	}

	/**
	 * Role payload matching the shape returned by GET /roles.
	 *
	 * @param int $role_id Role id.
	 * @return array<string,mixed>|null
	 */
	private static function item( $role_id ) {
		global $wpdb;
		$roles_table = DPC_POS_RBAC::table( 'roles' );
		$row         = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$roles_table} WHERE id = %d", $role_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $row ) {
			return null;
		}
		return self::render( $row );
	}

	/**
	 * Renders one roles row into the API payload.
	 *
	 * Grants are always read from the role_permissions table so the matrix
	 * reflects what is stored, including for system roles.
	 *
	 * @param array $row Raw role row.
	 * @return array<string,mixed>
	 */
	private static function render( array $row ) {
		global $wpdb;
		$rp_table = DPC_POS_RBAC::table( 'role_permissions' );
		$p_table  = DPC_POS_RBAC::table( 'permissions' );
		$permissions = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT p.slug FROM {$rp_table} rp INNER JOIN {$p_table} p ON p.id = rp.permission_id WHERE rp.role_id = %d ORDER BY p.module ASC, p.action ASC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				(int) $row['id']
			)
		);
		return array(
			'id'          => (int) $row['id'],
			'slug'        => $slug,
			'name'        => $row['name'],
			'description' => $row['description'],
			'is_system'   => (bool) $row['is_system'],
			'user_count'  => (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . DPC_POS_RBAC::table( 'user_roles' ) . ' WHERE role_id = %d', (int) $row['id'] ) ), // phpcs:ignore WordPress.DB.PreparedSQL
			'permissions' => array_map( 'strval', (array) $permissions ),
		);
	}

	/**
	 * POST /roles
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_role( $request, $auth ) {
		global $wpdb;
		$table       = DPC_POS_RBAC::table( 'roles' );
		$name        = sanitize_text_field( (string) $request->get_param( 'name' ) );
		$slug        = sanitize_key( (string) $request->get_param( 'slug' ) );
		$description = sanitize_text_field( (string) $request->get_param( 'description' ) );

		if ( '' === $name ) {
			return DPC_POS_Auth::error( 'dpc_invalid_role_name', 'A role name is required.', 400 );
		}
		if ( '' === $slug ) {
			$slug = sanitize_key( sanitize_title_with_dashes( $name ) );
		}
		if ( '' === $slug ) {
			return DPC_POS_Auth::error( 'dpc_invalid_role_slug', 'A valid role slug is required.', 400 );
		}
		if ( in_array( $slug, self::immutable_slugs(), true ) ) {
			return DPC_POS_Auth::error( 'dpc_protected_role_slug', 'That slug is reserved for a system role.', 400 );
		}
		if ( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE slug = %s", $slug ) ) ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			return DPC_POS_Auth::error( 'dpc_role_slug_taken', 'That role slug is already in use.', 409 );
		}

		$wpdb->insert(
			$table,
			array(
				'slug'        => $slug,
				'name'        => $name,
				'description' => $description,
				'is_system'   => 0,
			),
			array( '%s', '%s', '%s', '%d' )
		);
		$role_id = (int) $wpdb->insert_id;
		if ( ! $role_id ) {
			return DPC_POS_Auth::error( 'dpc_role_create_failed', 'Could not create the role.', 500 );
		}

		$set = self::replace_permissions( $role_id, (array) $request->get_param( 'permissions' ) );
		if ( is_wp_error( $set ) ) {
			return $set;
		}

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'role.created',
				'module'    => 'roles',
				'resource'  => 'role',
				'record_id' => $role_id,
				'new_value' => array(
					'slug'        => $slug,
					'name'        => $name,
					'permissions' => $set['slugs'],
				),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'roles',
				'action'      => 'role.created',
				'description' => sprintf( 'Role "%s" created', $name ),
				'record_id'   => $role_id,
			)
		);

		return rest_ensure_response( self::item( $role_id ) );
	}

	/**
	 * PUT /roles/{id}
	 *
	 * Slug is immutable. System roles can change their display name,
	 * description and grants; `administrator` always keeps account-management
	 * permissions so the role stays recoverable.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_role( $request, $auth ) {
		global $wpdb;
		$table   = DPC_POS_RBAC::table( 'roles' );
		$role_id = (int) $request->get_param( 'id' );
		$row     = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $role_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_role_not_found', 'Role not found.', 404 );
		}

		$data    = array();
		$formats = array();
		$slug    = $row['slug'];
		$name    = $row['name'];

		if ( null !== $request->get_param( 'name' ) ) {
			$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
			if ( '' === $name ) {
				return DPC_POS_Auth::error( 'dpc_invalid_role_name', 'A role name is required.', 400 );
			}
			$data['name'] = $name;
			$formats[]    = '%s';
		}
		if ( null !== $request->get_param( 'description' ) ) {
			$data['description'] = sanitize_text_field( (string) $request->get_param( 'description' ) );
			$formats[]           = '%s';
		}

		if ( $data ) {
			$done = $wpdb->update( $table, $data, array( 'id' => $role_id ), $formats, array( '%d' ) );
			if ( false === $done ) {
				return DPC_POS_Auth::error( 'dpc_role_update_failed', 'Could not update the role.', 500 );
			}
		}

		$permissions = array();
		if ( null !== $request->get_param( 'permissions' ) ) {
			$set = self::replace_permissions( $role_id, (array) $request->get_param( 'permissions' ), $slug );
			if ( is_wp_error( $set ) ) {
				return $set;
			}
			$permissions = $set['slugs'];
		}

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'role.updated',
				'module'    => 'roles',
				'resource'  => 'role',
				'record_id' => $role_id,
				'old_value' => array(
					'name' => $row['name'],
				),
				'new_value' => array(
					'slug'        => $slug,
					'name'        => $name,
					'permissions' => $permissions ? $permissions : null,
				),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'roles',
				'action'      => 'role.updated',
				'description' => sprintf( 'Role "%s" updated', $name ),
				'record_id'   => $role_id,
			)
		);

		return rest_ensure_response( self::item( $role_id ) );
	}

	/**
	 * DELETE /roles/{id}
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_role( $request, $auth ) {
		global $wpdb;
		$table   = DPC_POS_RBAC::table( 'roles' );
		$role_id = (int) $request->get_param( 'id' );
		$row     = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $role_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_role_not_found', 'Role not found.', 404 );
		}
		if ( (bool) $row['is_system'] ) {
			return DPC_POS_Auth::error( 'dpc_protected_role', 'System roles cannot be deleted.', 400 );
		}
		$assigned = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . DPC_POS_RBAC::table( 'user_roles' ) . ' WHERE role_id = %d', $role_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL
		if ( $assigned > 0 ) {
			return DPC_POS_Auth::error( 'dpc_role_in_use', 'This role is assigned to users and cannot be deleted.', 409 );
		}

		$wpdb->delete( DPC_POS_RBAC::table( 'role_permissions' ), array( 'role_id' => $role_id ), array( '%d' ) );
		$wpdb->delete( $table, array( 'id' => $role_id ), array( '%d' ) );

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'role.deleted',
				'module'    => 'roles',
				'resource'  => 'role',
				'record_id' => $role_id,
				'new_value' => array(
					'slug' => $row['slug'],
					'name' => $row['name'],
				),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'roles',
				'action'      => 'role.deleted',
				'description' => sprintf( 'Role "%s" deleted', $row['name'] ),
				'record_id'   => $role_id,
			)
		);

		return rest_ensure_response(
			array(
				'ok'   => true,
				'id'   => $role_id,
				'slug' => $row['slug'],
			)
		);
	}

	/**
	 * POST /roles/{id}/permissions
	 *
	 * Replaces the grants of a role with the submitted rules. The
	 * `administrator` role always keeps account-management permissions.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function set_role_permissions( $request, $auth ) {
		global $wpdb;
		$table   = DPC_POS_RBAC::table( 'roles' );
		$role_id = (int) $request->get_param( 'id' );
		$row     = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $role_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_role_not_found', 'Role not found.', 404 );
		}

		$set = self::replace_permissions( $role_id, (array) $request->get_param( 'permissions' ), $row['slug'] );
		if ( is_wp_error( $set ) ) {
			return $set;
		}

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'role.permissions_updated',
				'module'    => 'roles',
				'resource'  => 'role',
				'record_id' => $role_id,
				'new_value' => array(
					'slug'        => $row['slug'],
					'permissions' => $set['slugs'],
				),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'roles',
				'action'      => 'role.permissions_updated',
				'description' => sprintf( 'Permissions updated for role "%s"', $row['name'] ),
				'record_id'   => $role_id,
			)
		);

		return rest_ensure_response( self::item( $role_id ) );
	}

	/**
	 * Replaces the permission grants of a role with the expanded set of the
	 * submitted rules (`module.action` slug, `module.*` or `*`).
	 *
	 * The `administrator` role always keeps `users.manage` and `roles.manage`
	 * so the account and role administration can never be locked out.
	 *
	 * @param int    $role_id Role id.
	 * @param array  $rules   Permission rules.
	 * @param string $slug    Role slug (defaults to "").
	 * @return array{slugs:string[]}|WP_Error
	 */
	private static function replace_permissions( $role_id, array $rules, $slug = '' ) {
		global $wpdb;
		$registry  = DPC_POS_RBAC::all_permissions();
		$registry_slugs = array_column( $registry, 'slug' );
		$rules     = array_values( array_unique( array_filter( array_map( 'sanitize_key', $rules ) ) ) );
		if ( 'administrator' === $slug ) {
			$rules = array_values( array_unique( array_merge( $rules, array( 'users.manage', 'roles.manage' ) ) ) );
		}
		$expanded  = DPC_POS_RBAC::expand_rules( $rules, $registry );
		$unknown   = array_diff( $expanded, $registry_slugs );
		if ( $unknown ) {
			return DPC_POS_Auth::error( 'dpc_unknown_permission', 'Unknown permission slug: ' . implode( ', ', $unknown ), 400 );
		}

		$p_table = DPC_POS_RBAC::table( 'permissions' );
		$rp_table = DPC_POS_RBAC::table( 'role_permissions' );
		$ids     = $wpdb->get_col( $wpdb->prepare( "SELECT id FROM {$p_table} WHERE slug IN ( " . implode( ',', array_fill( 0, count( $expanded ), '%s' ) ) . ' )', $expanded ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		sort( $ids, SORT_NUMERIC );

		$wpdb->query( $wpdb->prepare( "DELETE FROM {$rp_table} WHERE role_id = %d", $role_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		foreach ( (array) $ids as $permission_id ) {
			$wpdb->insert(
				$rp_table,
				array(
					'role_id'       => $role_id,
					'permission_id' => (int) $permission_id,
				),
				array( '%d', '%d' )
			);
		}
		return array( 'slugs' => array_values( $expanded ) );
	}
}