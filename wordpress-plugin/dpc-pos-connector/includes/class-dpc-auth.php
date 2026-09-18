<?php
/**
 * DPC POS authentication: login, logout, session, password change/reset.
 *
 * DPC POS credentials are completely separate from WordPress credentials. The
 * login endpoint never receives or stores a WordPress password, and the
 * response never contains a password hash.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Auth REST handlers (invoked by {@see DPC_POS_REST}).
 */
class DPC_POS_Auth {

	/**
	 * Minimum password length.
	 *
	 * @return int
	 */
	public static function min_password_length() {
		$min = (int) DPC_POS_Security::get_setting( 'password_min_length', 10 );
		return $min >= 8 ? $min : 8;
	}

	/**
	 * Builds a WP_Error with an HTTP status.
	 *
	 * @param string $code    Error code.
	 * @param string $message Message.
	 * @param int    $status  HTTP status.
	 * @return WP_Error
	 */
	public static function error( $code, $message, $status = 400 ) {
		return new WP_Error( $code, $message, array( 'status' => $status ) );
	}

	/**
	 * Finds a DPC user by username or email.
	 *
	 * @param string $login Username or email.
	 * @return array<string,mixed>|null
	 */
	public static function find_user_by_login( $login ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'users' );
		$row   = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE username = %s OR email = %s LIMIT 1", $login, $login ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			ARRAY_A
		);
		return $row ? $row : null;
	}

	/**
	 * Full public payload for a DPC user. Never includes secret material.
	 *
	 * @param int $user_id DPC user id.
	 * @return array<string,mixed>|null
	 */
	public static function user_payload( $user_id ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'users' );
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $user_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $row ) {
			return null;
		}

		$wp_user = null;
		if ( ! empty( $row['wordpress_user_id'] ) ) {
			$wp_user = get_userdata( (int) $row['wordpress_user_id'] );
		}

		$roles       = DPC_POS_RBAC::get_user_roles( $user_id );
		$role_names  = array();
		foreach ( $roles as $slug ) {
			$role = DPC_POS_RBAC::get_role_by_slug( $slug );
			$role_names[] = array(
				'slug' => $slug,
				'name' => $role ? $role['name'] : $slug,
			);
		}

		return array(
			'id'                  => (int) $row['id'],
			'username'            => (string) $row['username'],
			'email'               => (string) $row['email'],
			'display_name'        => (string) $row['display_name'],
			'status'              => (string) $row['status'],
			'wordpress_user_id'   => $row['wordpress_user_id'] ? (int) $row['wordpress_user_id'] : null,
			'wordpress_connected' => (bool) $wp_user,
			'wordpress_username'  => $wp_user ? $wp_user->user_login : null,
			'role'                => $roles ? $roles[0] : '',
			'roles'               => $role_names,
			'permissions'         => DPC_POS_RBAC::permission_set( $user_id ),
			'last_login_at'       => $row['last_login_at'],
			'created_at'          => $row['created_at'],
			'initials'            => self::initials( (string) $row['display_name'] ),
		);
	}

	/**
	 * Two-letter initials for avatars.
	 *
	 * @param string $name Display name.
	 * @return string
	 */
	private static function initials( $name ) {
		$parts    = preg_split( '/\s+/', trim( $name ) );
		$initials = '';
		foreach ( (array) $parts as $part ) {
			if ( '' !== $part ) {
				$initials .= strtoupper( substr( $part, 0, 1 ) );
			}
			if ( strlen( $initials ) >= 2 ) {
				break;
			}
		}
		return '' !== $initials ? $initials : '?';
	}

	/**
	 * POST /auth/login
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function login( $request ) {
		global $wpdb;
		$login    = sanitize_text_field( (string) $request->get_param( 'username' ) );
		$password = (string) $request->get_param( 'password' );

		if ( '' === $login || '' === $password ) {
			return self::error( 'dpc_invalid_request', 'username and password are required', 400 );
		}

		$user = self::find_user_by_login( $login );
		if ( ! $user ) {
			DPC_POS_Security::log_login_attempt( null, $login, 'failure', 'unknown_user' );
			return self::error( 'dpc_invalid_credentials', 'Invalid credentials.', 401 );
		}

		$user_id = (int) $user['id'];

		if ( 'active' !== $user['status'] ) {
			DPC_POS_Security::log_login_attempt( $user_id, $login, 'failure', 'status_' . $user['status'] );
			return self::error( 'dpc_account_inactive', 'This account is not active.', 403 );
		}

		if ( ! empty( $user['locked_until'] ) && strtotime( $user['locked_until'] . ' UTC' ) > time() ) {
			DPC_POS_Security::log_login_attempt( $user_id, $login, 'lockout', 'locked' );
			return self::error( 'dpc_account_locked', 'Account temporarily locked after too many failed attempts.', 423 );
		}

		if ( '' === $user['password_hash'] ) {
			DPC_POS_Security::log_login_attempt( $user_id, $login, 'failure', 'no_password_set' );
			return self::error( 'dpc_password_not_set', 'No DPC POS password is set. Ask an administrator to set one.', 403 );
		}

		if ( ! DPC_POS_Security::verify_password( $password, $user['password_hash'] ) ) {
			$attempts = (int) $user['failed_attempts'] + 1;
			$data     = array( 'failed_attempts' => $attempts );
			if ( $attempts >= DPC_POS_Security::max_login_attempts() ) {
				$data['locked_until'] = gmdate( 'Y-m-d H:i:s', time() + DPC_POS_Security::lockout_seconds() );
				DPC_POS_Security::log_login_attempt( $user_id, $login, 'lockout', 'max_attempts' );
				DPC_POS_Audit::record(
					array(
						'user_id'   => $user_id,
						'action'    => 'auth.account_locked',
						'module'    => 'users',
						'resource'  => 'user',
						'record_id' => $user_id,
						'result'    => 'failure',
					)
				);
			} else {
				DPC_POS_Security::log_login_attempt( $user_id, $login, 'failure', 'bad_password' );
			}
			$wpdb->update( DPC_POS_RBAC::table( 'users' ), $data, array( 'id' => $user_id ) );
			return self::error( 'dpc_invalid_credentials', 'Invalid credentials.', 401 );
		}

		// Success: clear counters, stamp last login, open a session.
		$wpdb->update(
			DPC_POS_RBAC::table( 'users' ),
			array(
				'failed_attempts' => 0,
				'locked_until'    => null,
				'last_login_at'   => gmdate( 'Y-m-d H:i:s' ),
			),
			array( 'id' => $user_id )
		);

		$session = DPC_POS_Security::create_session( $user_id );
		if ( ! $session ) {
			return self::error( 'dpc_session_failed', 'Could not create a session.', 500 );
		}
		DPC_POS_Security::set_session_cookie( $session['token'], $session['expires_at'] );
		DPC_POS_Security::log_login_attempt( $user_id, $login, 'success', '' );

		DPC_POS_Audit::record(
			array(
				'user_id'   => $user_id,
				'action'    => 'auth.login',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => $user_id,
				'module'      => 'users',
				'action'      => 'auth.login',
				'description' => $user['display_name'] . ' signed in',
				'record_id'   => $user_id,
			)
		);

		return rest_ensure_response(
			array(
				'user'       => self::user_payload( $user_id ),
				'csrf_token' => $session['csrf'],
				'expires_at' => $session['expires_at'],
			)
		);
	}

	/**
	 * POST /auth/logout
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context from {@see DPC_POS_REST}.
	 * @return WP_REST_Response
	 */
	public static function logout( $request, $auth ) {
		if ( ! empty( $auth['session']['id'] ) ) {
			DPC_POS_Security::revoke_session( (int) $auth['session']['id'] );
		}
		DPC_POS_Security::clear_session_cookie();
		DPC_POS_Audit::record(
			array(
				'user_id'   => $auth['user']['id'],
				'action'    => 'auth.logout',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $auth['user']['id'],
			)
		);
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * GET /auth/me
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function me( $request, $auth ) {
		$payload = self::user_payload( (int) $auth['user']['id'] );
		if ( ! $payload ) {
			return self::error( 'dpc_not_found', 'User not found.', 404 );
		}
		return rest_ensure_response( $payload );
	}

	/**
	 * POST /auth/password — change own password.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function change_password( $request, $auth ) {
		global $wpdb;
		$user_id     = (int) $auth['user']['id'];
		$current     = (string) $request->get_param( 'current_password' );
		$new         = (string) $request->get_param( 'new_password' );
		$table       = DPC_POS_RBAC::table( 'users' );
		$stored_hash = (string) $wpdb->get_var( $wpdb->prepare( "SELECT password_hash FROM {$table} WHERE id = %d", $user_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		if ( ! DPC_POS_Security::verify_password( $current, $stored_hash ) ) {
			return self::error( 'dpc_invalid_password', 'Current password is incorrect.', 400 );
		}
		$policy = self::validate_password( $new );
		if ( is_wp_error( $policy ) ) {
			return $policy;
		}

		$wpdb->update( $table, array( 'password_hash' => DPC_POS_Security::hash_password( $new ) ), array( 'id' => $user_id ), array( '%s' ), array( '%d' ) );
		DPC_POS_Audit::record(
			array(
				'user_id'   => $user_id,
				'action'    => 'auth.password_changed',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
			)
		);
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * POST /auth/password/forgot
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public static function forgot_password( $request ) {
		$login = sanitize_text_field( (string) $request->get_param( 'username' ) );
		$user  = self::find_user_by_login( $login );
		// Always succeed to avoid account enumeration.
		if ( $user && 'active' === $user['status'] && is_email( $user['email'] ) ) {
			$token = bin2hex( random_bytes( 24 ) );
			DPC_POS_Security::set_setting(
				'pwd_reset_' . (int) $user['id'],
				array(
					'hash' => hash( 'sha256', $token ),
					'exp'  => time() + 3600,
				)
			);
			$base = apply_filters( 'dpc_pos_app_url', home_url( '/' ) );
			$link = add_query_arg(
				array(
					'dpc_reset' => 1,
					'uid'       => (int) $user['id'],
					'token'     => $token,
				),
				$base
			);
			wp_mail(
				$user['email'],
				'DPC POS password reset',
				"Use this link within one hour to reset your DPC POS password:\n\n{$link}\n"
			);
		}
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * POST /auth/password/reset
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reset_password( $request ) {
		global $wpdb;
		$uid   = (int) $request->get_param( 'user_id' );
		$token = (string) $request->get_param( 'token' );
		$new   = (string) $request->get_param( 'new_password' );

		$record = DPC_POS_Security::get_setting( 'pwd_reset_' . $uid );
		if ( ! is_array( $record ) || empty( $record['hash'] ) || empty( $record['exp'] ) ) {
			return self::error( 'dpc_invalid_token', 'This reset link is invalid or has expired.', 400 );
		}
		if ( (int) $record['exp'] < time() ) {
			DPC_POS_Security::set_setting( 'pwd_reset_' . $uid, null );
			return self::error( 'dpc_invalid_token', 'This reset link is invalid or has expired.', 400 );
		}
		if ( ! hash_equals( (string) $record['hash'], hash( 'sha256', $token ) ) ) {
			return self::error( 'dpc_invalid_token', 'This reset link is invalid or has expired.', 400 );
		}
		$policy = self::validate_password( $new );
		if ( is_wp_error( $policy ) ) {
			return $policy;
		}

		$table = DPC_POS_RBAC::table( 'users' );
		$wpdb->update(
			$table,
			array(
				'password_hash'   => DPC_POS_Security::hash_password( $new ),
				'failed_attempts' => 0,
				'locked_until'    => null,
			),
			array( 'id' => $uid ),
			array( '%s', '%d', '%s' ),
			array( '%d' )
		);
		DPC_POS_Security::set_setting( 'pwd_reset_' . $uid, null );
		DPC_POS_Security::revoke_all_sessions( $uid );
		DPC_POS_Audit::record(
			array(
				'user_id'   => $uid,
				'action'    => 'auth.password_reset',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $uid,
			)
		);
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * GET /auth/sessions — active sessions for the current user.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function list_sessions( $request, $auth ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'sessions' );
		$rows  = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, ip, user_agent, created_at, last_seen_at, expires_at FROM {$table} WHERE user_id = %d AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP() ORDER BY id DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				(int) $auth['user']['id']
			),
			ARRAY_A
		);
		$current = (int) $auth['session']['id'];
		$items   = array();
		foreach ( (array) $rows as $row ) {
			$row['id']      = (int) $row['id'];
			$row['current'] = ( $row['id'] === $current );
			$items[]        = $row;
		}
		return rest_ensure_response( array( 'items' => $items ) );
	}

	/**
	 * DELETE /auth/sessions/{id} — revoke one of the current user's sessions.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function revoke_session( $request, $auth ) {
		global $wpdb;
		$id    = (int) $request->get_param( 'id' );
		$table = DPC_POS_RBAC::table( 'sessions' );
		$owner = (int) $wpdb->get_var( $wpdb->prepare( "SELECT user_id FROM {$table} WHERE id = %d", $id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $owner !== (int) $auth['user']['id'] && ! DPC_POS_RBAC::user_can( (int) $auth['user']['id'], 'users.manage' ) ) {
			return self::error( 'dpc_forbidden', 'You cannot revoke this session.', 403 );
		}
		DPC_POS_Security::revoke_session( $id );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * Validates a new password against the policy.
	 *
	 * @param string $password Candidate password.
	 * @return true|WP_Error
	 */
	public static function validate_password( $password ) {
		if ( strlen( (string) $password ) < self::min_password_length() ) {
			return self::error(
				'dpc_weak_password',
				sprintf( 'Password must be at least %d characters.', self::min_password_length() ),
				400
			);
		}
		return true;
	}
}
