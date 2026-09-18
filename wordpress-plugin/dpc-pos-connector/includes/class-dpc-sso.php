<?php
/**
 * WordPress Admin single sign-on.
 *
 * A DPC POS user with the `users.manage` permission (or Owner) can request a
 * one-time, 60-second handoff token. Presenting it at the handoff URL consumes
 * it and establishes a normal WordPress auth cookie for the linked WP account,
 * then redirects to wp-admin. The token is single-use and never reusable.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * SSO token issuing and handoff.
 */
class DPC_POS_SSO {

	/**
	 * Transient prefix for pending handoff tokens.
	 */
	const TRANSIENT_PREFIX = 'dpc_pos_sso_';

	/**
	 * Handoff token lifetime in seconds.
	 *
	 * @return int
	 */
	public static function ttl() {
		return (int) apply_filters( 'dpc_pos_sso_ttl', 60 );
	}

	/**
	 * Whether a DPC user may sign in to wp-admin via SSO.
	 *
	 * @param int $user_id DPC user id.
	 * @return bool
	 */
	public static function user_may_sso( $user_id ) {
		return DPC_POS_RBAC::is_owner( $user_id ) || DPC_POS_RBAC::user_can( $user_id, 'users.manage' );
	}

	/**
	 * POST /auth/sso-token — issues a one-time handoff URL.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function issue_token( $request, $auth ) {
		global $wpdb;
		$user_id = (int) $auth['user']['id'];

		if ( ! self::user_may_sso( $user_id ) ) {
			return DPC_POS_Auth::error( 'dpc_forbidden', 'Your role cannot open WordPress Admin.', 403 );
		}

		$table       = DPC_POS_RBAC::table( 'users' );
		$wp_user_id  = (int) $wpdb->get_var( $wpdb->prepare( "SELECT wordpress_user_id FROM {$table} WHERE id = %d", $user_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $wp_user_id || ! get_userdata( $wp_user_id ) ) {
			return DPC_POS_Auth::error(
				'dpc_wp_not_linked',
				'This account is not linked to a WordPress user. Link one before using SSO.',
				409
			);
		}

		$token = bin2hex( random_bytes( 32 ) );
		set_transient(
			self::TRANSIENT_PREFIX . hash( 'sha256', $token ),
			array(
				'user_id'    => $user_id,
				'wp_user_id' => $wp_user_id,
			),
			self::ttl()
		);

		$url = add_query_arg(
			array(
				'dpc_sso' => 1,
				'token'   => $token,
			),
			home_url( '/' )
		);

		DPC_POS_Audit::record(
			array(
				'user_id'   => $user_id,
				'action'    => 'sso.token_issued',
				'module'    => 'users',
				'resource'  => 'wordpress_user',
				'record_id' => $wp_user_id,
			)
		);

		return rest_ensure_response(
			array(
				'url'        => $url,
				'expires_in' => self::ttl(),
			)
		);
	}

	/**
	 * Handles the handoff URL, signs the linked WP user in and redirects.
	 *
	 * Runs on `template_redirect`.
	 *
	 * @return void
	 */
	public function maybe_handle_handoff() {
		if ( ! get_query_var( 'dpc_sso' ) && ! isset( $_GET['dpc_sso'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}

		$raw = isset( $_GET['token'] ) ? sanitize_text_field( wp_unslash( $_GET['token'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$key = self::TRANSIENT_PREFIX . hash( 'sha256', $raw );

		// One-time use: read then delete before doing anything else.
		$payload = get_transient( $key );
		delete_transient( $key );

		if ( ! is_array( $payload ) || empty( $payload['wp_user_id'] ) || empty( $payload['user_id'] ) ) {
			wp_die( esc_html( 'This DPC POS sign-in link is invalid or has expired. Please request a new one.' ), '', array( 'response' => 403 ) );
		}

		$dp_user = DPC_POS_Auth::user_payload( (int) $payload['user_id'] );
		if ( ! $dp_user || 'active' !== $dp_user['status'] || ! self::user_may_sso( (int) $payload['user_id'] ) ) {
			wp_die( esc_html( 'This DPC POS account is not allowed to open WordPress Admin.' ), '', array( 'response' => 403 ) );
		}

		$wp_user_id = (int) $payload['wp_user_id'];
		$wp_user    = get_userdata( $wp_user_id );
		if ( ! $wp_user ) {
			wp_die( esc_html( 'The linked WordPress user no longer exists.' ), '', array( 'response' => 403 ) );
		}

		wp_clear_auth_cookie();
		wp_set_current_user( $wp_user_id );
		wp_set_auth_cookie( $wp_user_id, true, is_ssl() );
		do_action( 'wp_login', $wp_user->user_login, $wp_user );

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $payload['user_id'],
				'action'    => 'sso.handoff',
				'module'    => 'users',
				'resource'  => 'wordpress_user',
				'record_id' => $wp_user_id,
			)
		);

		$redirect = apply_filters( 'dpc_pos_sso_redirect', admin_url() );
		wp_safe_redirect( $redirect );
		exit;
	}
}
