<?php
/**
 * Security primitives: password hashing, sessions, cookies, CSRF and lockout.
 *
 * Passwords are hashed with Argon2id when the PHP build supports it and fall
 * back to bcrypt. Nothing reversible is ever stored. Sessions are opaque random
 * tokens; only their SHA-256 hash is persisted, and the raw token lives solely
 * in an HttpOnly cookie.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Session and credential helpers.
 */
class DPC_POS_Security {

	/**
	 * Session cookie name.
	 *
	 * @return string
	 */
	public static function cookie_name() {
		return apply_filters( 'dpc_pos_session_cookie_name', 'dpc_session' );
	}

	/**
	 * Hashes a plaintext password.
	 *
	 * @param string $plain Plaintext password.
	 * @return string
	 */
	public static function hash_password( $plain ) {
		if ( defined( 'PASSWORD_ARGON2ID' ) && function_exists( 'password_algos' ) && in_array( 'argon2id', password_algos(), true ) ) {
			$hash = password_hash( $plain, PASSWORD_ARGON2ID );
			if ( is_string( $hash ) ) {
				return $hash;
			}
		}
		return (string) password_hash( $plain, PASSWORD_BCRYPT );
	}

	/**
	 * Verifies a password against a stored hash.
	 *
	 * @param string $plain Plaintext password.
	 * @param string $hash  Stored hash.
	 * @return bool
	 */
	public static function verify_password( $plain, $hash ) {
		if ( '' === $hash || '' === $plain ) {
			return false;
		}
		return (bool) password_verify( $plain, $hash );
	}

	/**
	 * Reads a DPC setting with a default.
	 *
	 * @param string $key     Setting key.
	 * @param mixed  $default Default value.
	 * @return mixed
	 */
	public static function get_setting( $key, $default = null ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'settings' );
		$value = $wpdb->get_var( $wpdb->prepare( "SELECT setting_value FROM {$table} WHERE setting_key = %s", $key ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( null === $value ) {
			return $default;
		}
		$decoded = maybe_unserialize( $value );
		return $decoded;
	}

	/**
	 * Writes a DPC setting.
	 *
	 * @param string $key   Setting key.
	 * @param mixed  $value Value.
	 * @return void
	 */
	public static function set_setting( $key, $value ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'settings' );
		if ( null === $value ) {
			$wpdb->delete( $table, array( 'setting_key' => $key ), array( '%s' ) );
			return;
		}
		$data   = maybe_serialize( $value );
		$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE setting_key = %s", $key ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $exists ) {
			$wpdb->update( $table, array( 'setting_value' => $data ), array( 'setting_key' => $key ), array( '%s' ), array( '%s' ) );
		} else {
			$wpdb->insert( $table, array( 'setting_key' => $key, 'setting_value' => $data ), array( '%s', '%s' ) );
		}
	}

	/**
	 * Session lifetime in seconds (idle timeout).
	 *
	 * @return int
	 */
	public static function session_ttl() {
		$minutes = (int) self::get_setting( 'session_timeout_minutes', 480 );
		if ( $minutes < 5 ) {
			$minutes = 5;
		}
		return $minutes * 60;
	}

	/**
	 * Session lifetime when "remember me" is selected (30 days).
	 *
	 * @return int
	 */
	public static function remember_session_ttl() {
		$days = (int) self::get_setting( 'remember_session_days', 30 );
		if ( $days < 1 ) {
			$days = 1;
		}
		return $days * 86400;
	}

	/**
	 * Maximum consecutive failed attempts before lockout.
	 *
	 * @return int
	 */
	public static function max_login_attempts() {
		$max = (int) self::get_setting( 'login_attempt_limit', 5 );
		return $max > 0 ? $max : 5;
	}

	/**
	 * Lockout duration in seconds.
	 *
	 * @return int
	 */
	public static function lockout_seconds() {
		$minutes = (int) self::get_setting( 'lockout_minutes', 15 );
		return ( $minutes > 0 ? $minutes : 15 ) * 60;
	}

	/**
	 * Client IP address, best effort behind proxies.
	 *
	 * @return string
	 */
	public static function client_ip() {
		$candidates = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR' );
		foreach ( $candidates as $key ) {
			if ( ! empty( $_SERVER[ $key ] ) ) {
				$value = sanitize_text_field( wp_unslash( $_SERVER[ $key ] ) );
				$parts = explode( ',', $value );
				$ip    = trim( $parts[0] );
				if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
					return $ip;
				}
			}
		}
		return '';
	}

	/**
	 * Current user agent, truncated for storage.
	 *
	 * @return string
	 */
	public static function user_agent() {
		$agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
		return substr( $agent, 0, 255 );
	}

	/**
	 * Sets the session cookie.
	 *
	 * @param string $token   Raw session token.
	 * @param int    $expires Unix expiry timestamp.
	 * @return void
	 */
	public static function set_session_cookie( $token, $expires ) {
		self::write_cookie( self::cookie_name(), $token, $expires );
	}

	/**
	 * Clears the session cookie.
	 *
	 * @return void
	 */
	public static function clear_session_cookie() {
		self::write_cookie( self::cookie_name(), '', time() - 3600 );
	}

	/**
	 * Low-level cookie writer with hardened defaults.
	 *
	 * @param string $name    Cookie name.
	 * @param string $value   Cookie value.
	 * @param int    $expires Unix expiry.
	 * @return void
	 */
	private static function write_cookie( $name, $value, $expires ) {
		$secure = apply_filters( 'dpc_pos_cookie_secure', is_ssl() || 'production' === wp_get_environment_type() );

		$configured = self::get_setting( 'cookie_samesite', '' );
		if ( ! is_string( $configured ) || '' === $configured ) {
			// When the frontend app is on a different host, the cookie must be
			// SameSite=None; Secure or the browser will not send it cross-site.
			$configured = self::is_cross_site() ? 'None' : 'Lax';
		}
		$samesite = apply_filters( 'dpc_pos_cookie_samesite', $configured );
		if ( ! in_array( $samesite, array( 'Lax', 'Strict', 'None' ), true ) ) {
			$samesite = 'Lax';
		}
		if ( 'None' === $samesite ) {
			$secure = true;
		}
		setcookie(
			$name,
			$value,
			array(
				'expires'  => $expires,
				'path'     => '/',
				'domain'   => apply_filters( 'dpc_pos_cookie_domain', '' ),
				'secure'   => (bool) $secure,
				'httponly' => true,
				'samesite' => $samesite,
			)
		);
	}

	/**
	 * True when the configured app origin is on a different host than WordPress.
	 *
	 * @return bool
	 */
	private static function is_cross_site() {
		$site_host = wp_parse_url( home_url(), PHP_URL_HOST );

		// The actual request origin wins (covers local dev servers that are not
		// the configured App URL yet).
		$origin       = get_http_origin();
		$request_host = $origin ? wp_parse_url( $origin, PHP_URL_HOST ) : '';
		if ( $request_host && $site_host && $request_host !== $site_host ) {
			return true;
		}

		$app_host = wp_parse_url( (string) DPC_POS_Integrations::app_url(), PHP_URL_HOST );
		return $app_host && $site_host && $app_host !== $site_host;
	}

	/**
	 * Creates a session and returns its raw token + CSRF token.
	 *
	 * @param int  $user_id  DPC user id.
	 * @param bool $remember Persist the session for the "remember me" lifetime.
	 * @return array{token:string,csrf:string,expires_at:int}|null
	 */
	public static function create_session( $user_id, $remember = false ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'sessions' );

		$token      = bin2hex( random_bytes( 32 ) );
		$csrf       = bin2hex( random_bytes( 32 ) );
		$ttl        = $remember ? self::remember_session_ttl() : self::session_ttl();
		$expires_ts = time() + $ttl;
		$expires    = gmdate( 'Y-m-d H:i:s', $expires_ts );

		$inserted = $wpdb->insert(
			$table,
			array(
				'user_id'     => (int) $user_id,
				'token_hash'  => hash( 'sha256', $token ),
				'csrf_token'  => hash( 'sha256', $csrf ),
				'ip'          => self::client_ip(),
				'user_agent'  => self::user_agent(),
				'expires_at'  => $expires,
				'ttl_seconds' => $ttl,
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s', '%d' )
		);
		if ( ! $inserted ) {
			return null;
		}
		return array(
			'token'      => $token,
			'csrf'       => $csrf,
			'expires_at' => $expires_ts,
		);
	}

	/**
	 * Resolves the raw session token from the request (cookie preferred).
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return string
	 */
	private static function raw_token_from_request( $request ) {
		$cookie = self::cookie_value_from_request( $request );
		if ( '' !== $cookie ) {
			return $cookie;
		}
		$auth = (string) $request->get_header( 'authorization' );
		if ( '' === $auth && ! empty( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
			$auth = sanitize_text_field( wp_unslash( $_SERVER['HTTP_AUTHORIZATION'] ) );
		}
		if ( 0 === stripos( $auth, 'bearer ' ) ) {
			return trim( substr( $auth, 7 ) );
		}
		return '';
	}

	/**
	 * Reads the session cookie value from $_COOKIE or the raw Cookie header.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return string
	 */
	private static function cookie_value_from_request( $request ) {
		$name = self::cookie_name();
		if ( isset( $_COOKIE[ $name ] ) && '' !== $_COOKIE[ $name ] ) {
			return (string) wp_unslash( $_COOKIE[ $name ] );
		}
		$cookie = (string) $request->get_header( 'cookie' );
		if ( '' === $cookie ) {
			return '';
		}
		foreach ( explode( ';', $cookie ) as $pair ) {
			$parts = explode( '=', trim( $pair ), 2 );
			if ( 2 === count( $parts ) && $name === $parts[0] && '' !== $parts[1] ) {
				return urldecode( $parts[1] );
			}
		}
		return '';
	}

	/**
	 * Looks up a valid session for the request, sliding its idle expiry.
	 *
	 * @param WP_REST_Request $request     REST request.
	 * @param bool            $enforce_csrf Verify the CSRF header on writes.
	 * @return array{user:array,session:array,via:string}|null
	 */
	public static function authenticate( $request, $enforce_csrf = true ) {
		global $wpdb;
		$raw = self::raw_token_from_request( $request );
		if ( '' === $raw ) {
			return null;
		}
		$hash = hash( 'sha256', $raw );

		$sessions = DPC_POS_RBAC::table( 'sessions' );
		$user_tbl = DPC_POS_RBAC::table( 'users' );
		$sql      = "SELECT s.*, u.id AS uid, u.username, u.email, u.display_name, u.status, u.wordpress_user_id, u.last_login_at FROM {$sessions} s INNER JOIN {$user_tbl} u ON u.id = s.user_id WHERE s.token_hash = %s LIMIT 1";
		$session  = $wpdb->get_row( $wpdb->prepare( $sql, $hash ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		if ( ! $session ) {
			return null;
		}
		if ( ! empty( $session['revoked_at'] ) ) {
			return null;
		}
		if ( strtotime( $session['expires_at'] . ' UTC' ) < time() ) {
			return null;
		}
		if ( 'active' !== $session['status'] ) {
			return null;
		}

		$via = self::request_used_cookie( $request ) ? 'cookie' : 'bearer';

		if ( 'cookie' === $via && $enforce_csrf && in_array( $request->get_method(), array( 'POST', 'PUT', 'PATCH', 'DELETE' ), true ) ) {
			$header = (string) $request->get_header( 'x-dpc-csrf' );
			if ( '' === $header || ! hash_equals( $session['csrf_token'], hash( 'sha256', $header ) ) ) {
				return null;
			}
		}

		$now      = gmdate( 'Y-m-d H:i:s' );
		$ttl      = (int) $session['ttl_seconds'];
		if ( $ttl <= 0 ) {
			$ttl = self::session_ttl();
		}
		$new_exp = gmdate( 'Y-m-d H:i:s', time() + $ttl );
		$wpdb->update(
			$sessions,
			array(
				'last_seen_at' => $now,
				'expires_at'   => $new_exp,
			),
			array( 'id' => (int) $session['id'] ),
			array( '%s', '%s' ),
			array( '%d' )
		);

		return array(
			'user'    => array(
				'id'                => (int) $session['uid'],
				'username'          => $session['username'],
				'email'             => $session['email'],
				'display_name'      => $session['display_name'],
				'status'            => $session['status'],
				'wordpress_user_id' => $session['wordpress_user_id'] ? (int) $session['wordpress_user_id'] : null,
				'last_login_at'     => $session['last_login_at'],
			),
			'session' => $session,
			'via'     => $via,
		);
	}

	/**
	 * True when the request presented the session cookie rather than a bearer.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return bool
	 */
	private static function request_used_cookie( $request ) {
		return '' !== self::cookie_value_from_request( $request );
	}

	/**
	 * Revokes a single session by id.
	 *
	 * @param int $session_id Session id.
	 * @return void
	 */
	public static function revoke_session( $session_id ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'sessions' );
		$wpdb->update( $table, array( 'revoked_at' => gmdate( 'Y-m-d H:i:s' ) ), array( 'id' => (int) $session_id ), array( '%s' ), array( '%d' ) );
	}

	/**
	 * Revokes all sessions for a user (optionally keeping the current one).
	 *
	 * @param int      $user_id    DPC user id.
	 * @param int|null $except_id Session id to keep.
	 * @return void
	 */
	public static function revoke_all_sessions( $user_id, $except_id = null ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'sessions' );
		if ( $except_id ) {
			$wpdb->query( $wpdb->prepare( "UPDATE {$table} SET revoked_at = UTC_TIMESTAMP() WHERE user_id = %d AND revoked_at IS NULL AND id <> %d", $user_id, $except_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		} else {
			$wpdb->query( $wpdb->prepare( "UPDATE {$table} SET revoked_at = UTC_TIMESTAMP() WHERE user_id = %d AND revoked_at IS NULL", $user_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}
	}

	/**
	 * Records a login attempt.
	 *
	 * @param int|null $user_id  DPC user id or null when unknown.
	 * @param string   $username Attempted username.
	 * @param string   $result   success|failure|lockout.
	 * @param string   $reason   Human-readable reason.
	 * @return void
	 */
	public static function log_login_attempt( $user_id, $username, $result, $reason = '' ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'login_history' );
		$wpdb->insert(
			$table,
			array(
				'user_id'    => $user_id ? (int) $user_id : null,
				'username'   => substr( (string) $username, 0, 100 ),
				'ip'         => self::client_ip(),
				'user_agent' => self::user_agent(),
				'result'     => $result,
				'reason'     => substr( (string) $reason, 0, 150 ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s' )
		);

		// Mirror failed/lockout attempts into the audit trail so auth security
		// events are visible alongside login_history (success is logged by DPC_POS_Auth).
		if ( 'lockout' === $result ) {
			DPC_POS_Audit::record(
				array(
					'user_id'   => $user_id ? (int) $user_id : null,
					'action'    => 'auth.account_locked',
					'module'    => 'users',
					'resource'  => 'user',
					'record_id' => $user_id,
					'result'    => 'failure',
				)
			);
		} elseif ( 'failure' === $result ) {
			DPC_POS_Audit::record(
				array(
					'user_id'   => $user_id ? (int) $user_id : null,
					'action'    => 'auth.login_failed',
					'module'    => 'users',
					'resource'  => 'user',
					'record_id' => $user_id,
					'result'    => 'failure',
				)
			);
		}

		do_action( 'dpc_pos_login_attempt', $user_id, $username, $result, $reason );
	}
}
