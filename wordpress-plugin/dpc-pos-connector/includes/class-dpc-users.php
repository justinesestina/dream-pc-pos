<?php
/**
 * DPC POS user management REST handlers.
 *
 * Enforces the Owner-protection rules from the brief: the last active Owner can
 * never be deleted, suspended or stripped of the Owner role, and only an Owner
 * can grant or revoke the Owner role.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * User CRUD, roles and status handlers.
 */
class DPC_POS_Users {

	/**
	 * Valid account statuses.
	 *
	 * @return string[]
	 */
	public static function statuses() {
		return array( 'active', 'inactive', 'suspended', 'locked' );
	}

	/**
	 * Loads a raw DPC user row.
	 *
	 * @param int $user_id DPC user id.
	 * @return array<string,mixed>|null
	 */
	private static function row( $user_id ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'users' );
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $user_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $row ? $row : null;
	}

	/**
	 * True when this is the final active Owner.
	 *
	 * @param int $user_id DPC user id.
	 * @return bool
	 */
	private static function is_last_owner( $user_id ) {
		return DPC_POS_RBAC::is_owner( $user_id ) && DPC_POS_RBAC::active_owner_count() <= 1;
	}

	/**
	 * GET /users
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function list_users( $request, $auth ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'users' );

		$where  = array( '1=1' );
		$params = array();

		$search = (string) $request->get_param( 'search' );
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '(u.username LIKE %s OR u.email LIKE %s OR u.display_name LIKE %s)';
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
		}
		$status = (string) $request->get_param( 'status' );
		if ( $status && in_array( $status, self::statuses(), true ) ) {
			$where[]  = 'u.status = %s';
			$params[] = $status;
		}
		$role = (string) $request->get_param( 'role' );
		if ( '' !== $role ) {
			$where[]  = 'EXISTS (SELECT 1 FROM ' . DPC_POS_RBAC::table( 'user_roles' ) . ' ur INNER JOIN ' . DPC_POS_RBAC::table( 'roles' ) . ' r ON r.id = ur.role_id WHERE ur.user_id = u.id AND r.slug = %s)';
			$params[] = $role;
		}

		$per_page = min( 200, max( 1, (int) ( $request->get_param( 'per_page' ) ? $request->get_param( 'per_page' ) : 50 ) ) );
		$page     = max( 1, (int) ( $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1 ) );
		$offset   = ( $page - 1 ) * $per_page;
		$where_sql = implode( ' AND ', $where );

		$count_sql = "SELECT COUNT(*) FROM {$table} u WHERE {$where_sql}";
		$total     = (int) ( $params ? $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) : $wpdb->get_var( $count_sql ) ); // phpcs:ignore WordPress.DB.PreparedSQL

		$list_sql = "SELECT u.id FROM {$table} u WHERE {$where_sql} ORDER BY u.id ASC LIMIT %d OFFSET %d";
		$ids      = $wpdb->get_col( $wpdb->prepare( $list_sql, array_merge( $params, array( $per_page, $offset ) ) ) ); // phpcs:ignore WordPress.DB.PreparedSQL

		$items = array();
		foreach ( (array) $ids as $id ) {
			$payload = DPC_POS_Auth::user_payload( (int) $id );
			if ( $payload ) {
				$items[] = $payload;
			}
		}

		return rest_ensure_response(
			array(
				'items'    => $items,
				'total'    => $total,
				'page'     => $page,
				'per_page' => $per_page,
			)
		);
	}

	/**
	 * POST /users
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_user( $request, $auth ) {
		global $wpdb;
		$table    = DPC_POS_RBAC::table( 'users' );
		$username = sanitize_user( (string) $request->get_param( 'username' ), true );
		$email    = sanitize_email( (string) $request->get_param( 'email' ) );
		$display  = sanitize_text_field( (string) $request->get_param( 'display_name' ) );
		$password = (string) $request->get_param( 'password' );
		$roles    = (array) $request->get_param( 'roles' );

		if ( '' === $username ) {
			return DPC_POS_Auth::error( 'dpc_invalid_username', 'A username is required.', 400 );
		}
		if ( ! is_email( $email ) ) {
			return DPC_POS_Auth::error( 'dpc_invalid_email', 'A valid email is required.', 400 );
		}
		if ( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE username = %s", $username ) ) ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			return DPC_POS_Auth::error( 'dpc_username_taken', 'That username is already in use.', 409 );
		}
		if ( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE email = %s", $email ) ) ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			return DPC_POS_Auth::error( 'dpc_email_taken', 'That email is already in use.', 409 );
		}

		$roles = self::sanitize_roles( $roles, $auth );
		if ( is_wp_error( $roles ) ) {
			return $roles;
		}
		if ( '' !== $password ) {
			$policy = DPC_POS_Auth::validate_password( $password );
			if ( is_wp_error( $policy ) ) {
				return $policy;
			}
		}

		$wp_user_id = '';
		$linked     = $request->get_param( 'wordpress_user_id' );
		if ( $linked ) {
			$wp_user_id = (int) $linked;
			if ( ! get_userdata( $wp_user_id ) ) {
				return DPC_POS_Auth::error( 'dpc_invalid_wp_user', 'That WordPress user does not exist.', 400 );
			}
		}

		$wpdb->insert(
			$table,
			array(
				'wordpress_user_id' => '' !== $wp_user_id ? $wp_user_id : null,
				'username'          => $username,
				'email'             => $email,
				'display_name'      => $display ? $display : $username,
				'password_hash'     => '' !== $password ? DPC_POS_Security::hash_password( $password ) : '',
				'status'            => in_array( (string) $request->get_param( 'status' ), self::statuses(), true ) ? (string) $request->get_param( 'status' ) : 'active',
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s' )
		);
		$user_id = (int) $wpdb->insert_id;
		if ( ! $user_id ) {
			return DPC_POS_Auth::error( 'dpc_create_failed', 'Could not create the user.', 500 );
		}

		foreach ( $roles as $slug ) {
			DPC_POS_RBAC::assign_role( $user_id, $slug, (int) $auth['user']['id'] );
		}
		self::sync_branches( $user_id, (array) $request->get_param( 'branch_ids' ), $request->get_param( 'primary_branch_id' ) ? (int) $request->get_param( 'primary_branch_id' ) : null );

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'user.created',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
				'new_value' => array(
					'username' => $username,
					'email'    => $email,
					'roles'    => $roles,
				),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'user.created',
				'description' => sprintf( 'User "%s" created (%s)', $display ? $display : $username, $email ),
				'record_id'   => $user_id,
			)
		);

		return rest_ensure_response( DPC_POS_Auth::user_payload( $user_id ) );
	}

	/**
	 * GET /users/{id}
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_user( $request, $auth ) {
		$payload = DPC_POS_Auth::user_payload( (int) $request->get_param( 'id' ) );
		if ( ! $payload ) {
			return DPC_POS_Auth::error( 'dpc_not_found', 'User not found.', 404 );
		}
		return rest_ensure_response( $payload );
	}

	/**
	 * PATCH /users/{id}
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_user( $request, $auth ) {
		global $wpdb;
		$user_id = (int) $request->get_param( 'id' );
		$before  = self::row( $user_id );
		if ( ! $before ) {
			return DPC_POS_Auth::error( 'dpc_not_found', 'User not found.', 404 );
		}

		$table = DPC_POS_RBAC::table( 'users' );
		$data  = array();

		$email = $request->get_param( 'email' );
		if ( null !== $email ) {
			$email = sanitize_email( (string) $email );
			if ( ! is_email( $email ) ) {
				return DPC_POS_Auth::error( 'dpc_invalid_email', 'A valid email is required.', 400 );
			}
			$taken = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE email = %s AND id <> %d", $email, $user_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			if ( $taken ) {
				return DPC_POS_Auth::error( 'dpc_email_taken', 'That email is already in use.', 409 );
			}
			$data['email'] = $email;
		}

		$display = $request->get_param( 'display_name' );
		if ( null !== $display ) {
			$data['display_name'] = sanitize_text_field( (string) $display );
		}

		$linked = $request->get_param( 'wordpress_user_id' );
		if ( null !== $linked ) {
			$wp_user_id = $linked ? (int) $linked : null;
			if ( $wp_user_id && ! get_userdata( $wp_user_id ) ) {
				return DPC_POS_Auth::error( 'dpc_invalid_wp_user', 'That WordPress user does not exist.', 400 );
			}
			$data['wordpress_user_id'] = $wp_user_id;
		}

		if ( $data ) {
			$wpdb->update( $table, $data, array( 'id' => $user_id ) );
		}

		$roles = $request->get_param( 'roles' );
		if ( is_array( $roles ) ) {
			$clean = self::sanitize_roles( $roles, $auth, $user_id );
			if ( is_wp_error( $clean ) ) {
				return $clean;
			}
			self::apply_roles( $user_id, $clean, (int) $auth['user']['id'] );
		}

		if ( null !== $request->get_param( 'branch_ids' ) ) {
			self::sync_branches( $user_id, (array) $request->get_param( 'branch_ids' ), $request->get_param( 'primary_branch_id' ) ? (int) $request->get_param( 'primary_branch_id' ) : null );
		}

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'user.updated',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
				'old_value' => array(
					'email'        => $before['email'],
					'display_name' => $before['display_name'],
				),
				'new_value' => $data,
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'user.updated',
				'description' => sprintf( 'Profile updated for %s (id %d)', $before['display_name'], $user_id ),
				'record_id'   => $user_id,
			)
		);

		return rest_ensure_response( DPC_POS_Auth::user_payload( $user_id ) );
	}

	/**
	 * POST /users/{id}/status
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function set_status( $request, $auth ) {
		$user_id = (int) $request->get_param( 'id' );
		$status  = (string) $request->get_param( 'status' );
		$row     = self::row( $user_id );

		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_not_found', 'User not found.', 404 );
		}
		if ( ! in_array( $status, self::statuses(), true ) ) {
			return DPC_POS_Auth::error( 'dpc_invalid_status', 'Unknown account status.', 400 );
		}
		if ( $user_id === (int) $auth['user']['id'] && in_array( $status, array( 'suspended', 'inactive' ), true ) ) {
			return DPC_POS_Auth::error( 'dpc_self_lockout', 'You cannot suspend or deactivate your own account.', 409 );
		}
		if ( 'active' !== $status && self::is_last_owner( $user_id ) ) {
			return DPC_POS_Auth::error( 'dpc_last_owner', 'The last active Owner cannot be suspended or deactivated.', 409 );
		}

		global $wpdb;
		$table = DPC_POS_RBAC::table( 'users' );
		$data  = array( 'status' => $status );
		if ( 'active' === $status ) {
			$data['failed_attempts'] = 0;
			$data['locked_until']    = null;
		}
		$wpdb->update( $table, $data, array( 'id' => $user_id ) );

		if ( 'active' !== $status ) {
			DPC_POS_Security::revoke_all_sessions( $user_id );
		}

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'user.status_changed',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
				'old_value' => array( 'status' => $row['status'] ),
				'new_value' => array( 'status' => $status ),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'user.status_changed',
				'description' => sprintf( 'Account %s %s (id %d)', $row['username'], $status, $user_id ),
				'record_id'   => $user_id,
			)
		);

		return rest_ensure_response( DPC_POS_Auth::user_payload( $user_id ) );
	}

	/**
	 * POST /users/{id}/password — administrator sets a password.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function set_password( $request, $auth ) {
		global $wpdb;
		$user_id = (int) $request->get_param( 'id' );
		$row     = self::row( $user_id );
		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_not_found', 'User not found.', 404 );
		}

		$password = (string) $request->get_param( 'password' );
		$generate = (bool) $request->get_param( 'generate' );
		if ( $generate || '' === $password ) {
			$password = wp_generate_password( 16, true, true );
		} else {
			$policy = DPC_POS_Auth::validate_password( $password );
			if ( is_wp_error( $policy ) ) {
				return $policy;
			}
		}

		$table = DPC_POS_RBAC::table( 'users' );
		$wpdb->update(
			$table,
			array(
				'password_hash'   => DPC_POS_Security::hash_password( $password ),
				'failed_attempts' => 0,
				'locked_until'    => null,
			),
			array( 'id' => $user_id ),
			array( '%s', '%d', '%s' ),
			array( '%d' )
		);
		DPC_POS_Security::revoke_all_sessions( $user_id );

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'user.password_set',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'user.password_set',
				'description' => sprintf( 'Password reset for %s (id %d)', $row['username'], $user_id ),
				'record_id'   => $user_id,
			)
		);

		return rest_ensure_response(
			array(
				'ok'       => true,
				'password' => ( $generate || '' === (string) $request->get_param( 'password' ) ) ? $password : null,
			)
		);
	}

	/**
	 * POST /users/{id}/roles
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function set_roles( $request, $auth ) {
		$user_id = (int) $request->get_param( 'id' );
		$row     = self::row( $user_id );
		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_not_found', 'User not found.', 404 );
		}
		$before = DPC_POS_RBAC::get_user_roles( $user_id );
		$roles  = self::sanitize_roles( (array) $request->get_param( 'roles' ), $auth, $user_id );
		if ( is_wp_error( $roles ) ) {
			return $roles;
		}
		self::apply_roles( $user_id, $roles, (int) $auth['user']['id'] );
		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'user.roles_updated',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
				'old_value' => array( 'roles' => $before ),
				'new_value' => array( 'roles' => $roles ),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'user.roles_updated',
				'description' => sprintf( 'Roles for user id %d set to: %s', $user_id, implode( ', ', $roles ) ),
				'record_id'   => $user_id,
			)
		);
		return rest_ensure_response( DPC_POS_Auth::user_payload( $user_id ) );
	}

	/**
	 * DELETE /users/{id}
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_user( $request, $auth ) {
		global $wpdb;
		$user_id = (int) $request->get_param( 'id' );
		$row     = self::row( $user_id );
		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_not_found', 'User not found.', 404 );
		}
		if ( $user_id === (int) $auth['user']['id'] ) {
			return DPC_POS_Auth::error( 'dpc_self_delete', 'You cannot delete your own account.', 409 );
		}
		if ( self::is_last_owner( $user_id ) ) {
			return DPC_POS_Auth::error( 'dpc_last_owner', 'The last active Owner cannot be deleted.', 409 );
		}

		$sessions = DPC_POS_RBAC::table( 'sessions' );
		$wpdb->delete( $sessions, array( 'user_id' => $user_id ), array( '%d' ) );
		$wpdb->delete( DPC_POS_RBAC::table( 'user_roles' ), array( 'user_id' => $user_id ), array( '%d' ) );
		$wpdb->delete( DPC_POS_RBAC::table( 'user_branches' ), array( 'user_id' => $user_id ), array( '%d' ) );
		$wpdb->delete( DPC_POS_RBAC::table( 'users' ), array( 'id' => $user_id ), array( '%d' ) );

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'user.deleted',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
				'old_value' => array(
					'username' => $row['username'],
					'email'    => $row['email'],
				),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'user.deleted',
				'description' => sprintf( 'User "%s" (id %d) deleted', $row['username'], $user_id ),
				'record_id'   => $user_id,
			)
		);

		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * GET /users/{id}/login-history
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function login_history( $request, $auth ) {
		global $wpdb;
		$user_id = (int) $request->get_param( 'id' );
		$table   = DPC_POS_RBAC::table( 'login_history' );
		$rows    = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, username, ip, user_agent, result, reason, created_at FROM {$table} WHERE user_id = %d ORDER BY id DESC LIMIT 100", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$user_id
			),
			ARRAY_A
		);
		return rest_ensure_response( array( 'items' => (array) $rows ) );
	}

	/**
	 * GET /users/{id}/sessions — active sessions (administrator view).
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function sessions( $request, $auth ) {
		global $wpdb;
		$user_id = (int) $request->get_param( 'id' );
		$table   = DPC_POS_RBAC::table( 'sessions' );
		$rows    = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, ip, user_agent, created_at, last_seen_at, expires_at FROM {$table} WHERE user_id = %d AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP() ORDER BY id DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$user_id
			),
			ARRAY_A
		);
		return rest_ensure_response( array( 'items' => (array) $rows ) );
	}

	/**
	 * Validates and normalizes a requested role set, enforcing Owner rules.
	 *
	 * @param array    $roles    Requested slugs.
	 * @param array    $auth     Auth context.
	 * @param int|null $target_id Existing target user id (for updates).
	 * @return string[]|WP_Error
	 */
	private static function sanitize_roles( array $roles, $auth, $target_id = null ) {
		$roles    = array_values( array_unique( array_filter( array_map( 'sanitize_key', $roles ) ) ) );
		$actor    = (int) $auth['user']['id'];
		$is_owner = DPC_POS_RBAC::is_owner( $actor );

		global $wpdb;
		$roles_table = DPC_POS_RBAC::table( 'roles' );
		$known       = array_map( 'strval', (array) $wpdb->get_col( "SELECT slug FROM {$roles_table}" ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		foreach ( $roles as $slug ) {
			if ( ! in_array( $slug, $known, true ) ) {
				return DPC_POS_Auth::error( 'dpc_invalid_role', sprintf( 'Unknown role: %s', $slug ), 400 );
			}
		}

		if ( in_array( 'owner', $roles, true ) && ! $is_owner ) {
			return DPC_POS_Auth::error( 'dpc_owner_restricted', 'Only an Owner can grant the Owner role.', 403 );
		}

		if ( $target_id && DPC_POS_RBAC::is_owner( $target_id ) && ! in_array( 'owner', $roles, true ) && self::is_last_owner( $target_id ) ) {
			return DPC_POS_Auth::error( 'dpc_last_owner', 'The last active Owner must keep the Owner role.', 409 );
		}

		if ( empty( $roles ) ) {
			$roles = array( 'sales' );
		}
		return $roles;
	}

	/**
	 * Replaces a user's role set.
	 *
	 * @param int    $user_id     DPC user id.
	 * @param string[] $roles     Desired role slugs.
	 * @param int    $assigned_by Acting DPC user id.
	 * @return void
	 */
	private static function apply_roles( $user_id, array $roles, $assigned_by ) {
		$current = DPC_POS_RBAC::get_user_roles( $user_id );
		foreach ( $current as $slug ) {
			if ( ! in_array( $slug, $roles, true ) ) {
				DPC_POS_RBAC::remove_role( $user_id, $slug );
			}
		}
		foreach ( $roles as $slug ) {
			if ( ! in_array( $slug, $current, true ) ) {
				DPC_POS_RBAC::assign_role( $user_id, $slug, $assigned_by );
			}
		}
	}

	/**
	 * Replaces the branch assignment for a user.
	 *
	 * @param int         $user_id          DPC user id.
	 * @param array       $branch_ids       Branch ids.
	 * @param int|null    $primary_branch_id Branch id flagged as the primary.
	 * @return void
	 */
	private static function sync_branches( $user_id, array $branch_ids, $primary_branch_id = null ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'user_branches' );
		$wpdb->delete( $table, array( 'user_id' => $user_id ), array( '%d' ) );
		$seen    = array();
		$primary = $primary_branch_id ? (int) $primary_branch_id : null;
		foreach ( $branch_ids as $index => $branch_id ) {
			$branch_id = (int) $branch_id;
			if ( ! $branch_id || isset( $seen[ $branch_id ] ) ) {
				continue;
			}
			$seen[ $branch_id ] = true;
			if ( null === $primary ) {
				$primary = $branch_id;
			}
			$wpdb->insert(
				$table,
				array(
					'user_id'    => $user_id,
					'branch_id'  => $branch_id,
					'is_primary' => $branch_id === $primary ? 1 : 0,
				),
				array( '%d', '%d', '%d' )
			);
		}
	}

	/**
	 * GET /branches — list every branch.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function list_branches( $request, $auth ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'branches' );
		$rows  = $wpdb->get_results( "SELECT id, code, name, address, status FROM {$table} ORDER BY name ASC", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$items = array();
		foreach ( (array) $rows as $row ) {
			$items[] = array(
				'id'      => (int) $row['id'],
				'code'    => (string) $row['code'],
				'name'    => (string) $row['name'],
				'address' => (string) $row['address'],
				'status'  => (string) $row['status'],
			);
		}
		return rest_ensure_response( array( 'items' => $items ) );
	}

	/**
	 * POST /branches — create a branch.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_branch( $request, $auth ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'branches' );

		$name    = sanitize_text_field( (string) $request->get_param( 'name' ) );
		$code    = sanitize_text_field( (string) $request->get_param( 'code' ) );
		$address = sanitize_text_field( (string) $request->get_param( 'address' ) );
		$status  = (string) $request->get_param( 'status' );
		if ( ! in_array( $status, array( 'active', 'inactive' ), true ) ) {
			$status = 'active';
		}

		if ( '' === $name ) {
			return DPC_POS_Auth::error( 'dpc_invalid_branch', 'A branch name is required.', 400 );
		}
		if ( '' === $code ) {
			$code = self::next_branch_code();
		}
		if ( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE code = %s", $code ) ) ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			return DPC_POS_Auth::error( 'dpc_branch_code_taken', 'A branch with that code already exists.', 409 );
		}

		$wpdb->insert(
			$table,
			array(
				'code'    => substr( $code, 0, 50 ),
				'name'    => substr( $name, 0, 150 ),
				'address' => substr( $address, 0, 255 ),
				'status'  => $status,
			),
			array( '%s', '%s', '%s', '%s' )
		);
		$branch_id = (int) $wpdb->insert_id;
		if ( ! $branch_id ) {
			return DPC_POS_Auth::error( 'dpc_create_failed', 'Could not create the branch.', 500 );
		}

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'branch.created',
				'module'    => 'users',
				'resource'  => 'branch',
				'record_id' => $branch_id,
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'branch.created',
				'description' => 'Created branch "' . $name . '"',
				'record_id'   => $branch_id,
			)
		);

		return rest_ensure_response(
			array(
				'id'      => $branch_id,
				'code'    => $code,
				'name'    => $name,
				'address' => $address,
				'status'  => $status,
			)
		);
	}

	/**
	 * Next short code for a branch, e.g. BR-002.
	 *
	 * @return string
	 */
	private static function next_branch_code() {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'branches' );
		$max   = (int) $wpdb->get_var( "SELECT COALESCE(MAX(id), 0) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return 'BR-' . str_pad( (string) $max, 3, '0', STR_PAD_LEFT );
	}

	/**
	 * POST /users/{id}/branches — replace a user's branch assignments.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function set_branches( $request, $auth ) {
		global $wpdb;
		$user_id = (int) $request->get_param( 'id' );
		$row     = self::row( $user_id );
		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_not_found', 'User not found.', 404 );
		}

		$branch_ids = array_values( array_unique( array_filter( array_map( 'intval', (array) $request->get_param( 'branch_ids' ) ) ) ) );
		if ( empty( $branch_ids ) ) {
			$branch_ids = array();
		}
		$primary = $request->get_param( 'primary_branch_id' );
		$primary = $primary ? (int) $primary : null;

		$table = DPC_POS_RBAC::table( 'branches' );
		$known = array_map( 'intval', (array) $wpdb->get_col( "SELECT id FROM {$table}" ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		foreach ( $branch_ids as $branch_id ) {
			if ( ! in_array( $branch_id, $known, true ) ) {
				return DPC_POS_Auth::error( 'dpc_invalid_branch', sprintf( 'Unknown branch: %d', $branch_id ), 400 );
			}
		}
		if ( $primary && ! in_array( $primary, $branch_ids, true ) ) {
			$primary = $branch_ids[0] ?? null;
		}

		self::sync_branches( $user_id, $branch_ids, $primary );

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'user.branches_updated',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
				'new_value' => array(
					'branch_ids'         => $branch_ids,
					'primary_branch_id'  => $primary,
				),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'user.branches_updated',
				'description' => sprintf( 'Branches for user id %d set to: %s', $user_id, $branch_ids ? implode( ', ', $branch_ids ) : '(none)' ),
				'record_id'   => $user_id,
			)
		);

		return rest_ensure_response( DPC_POS_Auth::user_payload( $user_id ) );
	}

	/**
	 * POST /users/{id}/sessions/revoke — revoke every active session.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function revoke_sessions( $request, $auth ) {
		$user_id = (int) $request->get_param( 'id' );
		$row     = self::row( $user_id );
		if ( ! $row ) {
			return DPC_POS_Auth::error( 'dpc_not_found', 'User not found.', 404 );
		}
		DPC_POS_Security::revoke_all_sessions( $user_id );
		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'user.sessions_revoked',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => (int) $auth['user']['id'],
				'module'      => 'users',
				'action'      => 'user.sessions_revoked',
				'description' => sprintf( 'All sessions revoked for %s (id %d)', $row['username'], $user_id ),
				'record_id'   => $user_id,
			)
		);
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * GET /login-history — global login event log across every user.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function list_login_history( $request, $auth ) {
		global $wpdb;
		$table    = DPC_POS_RBAC::table( 'login_history' );
		$users    = DPC_POS_RBAC::table( 'users' );
		$where    = array( '1=1' );
		$params   = array();

		$search = (string) $request->get_param( 'search' );
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '(lh.username LIKE %s OR u.username LIKE %s OR u.display_name LIKE %s)';
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
		}
		$result = (string) $request->get_param( 'result' );
		if ( in_array( $result, array( 'success', 'failed' ), true ) ) {
			$where[]  = 'lh.result = %s';
			$params[] = $result;
		}
		$user_id = (int) $request->get_param( 'user_id' );
		if ( $user_id ) {
			$where[]  = 'lh.user_id = %d';
			$params[] = $user_id;
		}
		$from = (string) $request->get_param( 'from' );
		if ( '' !== $from && strtotime( $from ) ) {
			$where[]  = 'lh.created_at >= %s';
			$params[] = gmdate( 'Y-m-d H:i:s', strtotime( $from ) );
		}
		$to = (string) $request->get_param( 'to' );
		if ( '' !== $to && strtotime( $to ) ) {
			$where[]  = 'lh.created_at <= %s';
			$params[] = gmdate( 'Y-m-d H:i:s', strtotime( $to ) + 86399 );
		}

		$per_page = min( 200, max( 1, (int) ( $request->get_param( 'per_page' ) ? $request->get_param( 'per_page' ) : 50 ) ) );
		$page     = max( 1, (int) ( $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1 ) );
		$offset   = ( $page - 1 ) * $per_page;
		$where_sql = implode( ' AND ', $where );

		$count_sql = "SELECT COUNT(*) FROM {$table} lh LEFT JOIN {$users} u ON u.id = lh.user_id WHERE {$where_sql}";
		$total     = (int) ( $params ? $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) : $wpdb->get_var( $count_sql ) ); // phpcs:ignore WordPress.DB.PreparedSQL

		$list_sql = "SELECT lh.id, lh.user_id, lh.username AS logged_username, COALESCE(u.username, lh.username) AS username, u.display_name, lh.ip, lh.user_agent, lh.result, lh.reason, lh.created_at FROM {$table} lh LEFT JOIN {$users} u ON u.id = lh.user_id WHERE {$where_sql} ORDER BY lh.id DESC LIMIT %d OFFSET %d";
		$args     = array_merge( $params, array( $per_page, $offset ) );
		$items    = $wpdb->get_results( $wpdb->prepare( $list_sql, $args ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL

		return rest_ensure_response(
			array(
				'items'    => (array) $items,
				'total'    => $total,
				'page'     => $page,
				'per_page' => $per_page,
			)
		);
	}
}
