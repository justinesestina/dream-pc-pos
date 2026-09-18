<?php
/**
 * REST API bootstrap: route registration, authentication/permission middleware
 * and credentialed CORS for the DPC POS frontend.
 *
 * All endpoints live under the `dpc/v1` namespace. Authenticated routes receive
 * an auth context via a request attribute set by the permission callback.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers every connector route.
 */
class DPC_POS_REST {

	/**
	 * Namespace shared by all routes.
	 *
	 * @return string
	 */
	public static function rest_namespace() {
		return DPC_POS_Plugin::REST_NAMESPACE;
	}

	/**
	 * Wires CORS early, then registers routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		$this->register_cors();
		$ns = self::rest_namespace();

		// ---- Health -------------------------------------------------------
		register_rest_route(
			$ns,
			'/health',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'health' ),
				'permission_callback' => '__return_true',
			)
		);

		// ---- Auth ---------------------------------------------------------
		register_rest_route(
			$ns,
			'/auth/login',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Auth', 'login' ) ),
				'permission_callback' => '__return_true',
			)
		);
		register_rest_route(
			$ns,
			'/auth/password/forgot',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Auth', 'forgot_password' ) ),
				'permission_callback' => '__return_true',
			)
		);
		register_rest_route(
			$ns,
			'/auth/password/reset',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Auth', 'reset_password' ) ),
				'permission_callback' => '__return_true',
			)
		);
		register_rest_route(
			$ns,
			'/auth/logout',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'logout' ),
				'permission_callback' => $this->require_auth(),
			)
		);
		register_rest_route(
			$ns,
			'/auth/me',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'me' ),
				'permission_callback' => $this->require_auth(),
			)
		);
		register_rest_route(
			$ns,
			'/auth/password',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'change_password' ),
				'permission_callback' => $this->require_auth(),
			)
		);
		register_rest_route(
			$ns,
			'/auth/sessions',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'list_sessions' ),
				'permission_callback' => $this->require_auth(),
			)
		);
		register_rest_route(
			$ns,
			'/auth/sessions/(?P<id>\d+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( $this, 'revoke_session' ),
				'permission_callback' => $this->require_auth(),
			)
		);
		register_rest_route(
			$ns,
			'/auth/sso-token',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'sso_token' ),
				'permission_callback' => $this->require_auth(),
			)
		);

		// ---- Users --------------------------------------------------------
		register_rest_route(
			$ns,
			'/users',
			array(
				array(
					'methods'             => 'GET',
					'callback' => $this->with_auth( array( 'DPC_POS_Users', 'list_users' ) ),
					'permission_callback' => $this->require_permission( 'users.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback' => $this->with_auth( array( 'DPC_POS_Users', 'create_user' ) ),
					'permission_callback' => $this->require_permission( 'users.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/users/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback' => $this->with_auth( array( 'DPC_POS_Users', 'get_user' ) ),
					'permission_callback' => $this->require_permission( 'users.read' ),
				),
				array(
					'methods'             => array( 'PATCH', 'PUT' ),
					'callback' => $this->with_auth( array( 'DPC_POS_Users', 'update_user' ) ),
					'permission_callback' => $this->require_permission( 'users.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback' => $this->with_auth( array( 'DPC_POS_Users', 'delete_user' ) ),
					'permission_callback' => $this->require_permission( 'users.delete' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/users/(?P<id>\d+)/status',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'set_status' ) ),
				'permission_callback' => $this->require_permission( 'users.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/users/(?P<id>\d+)/password',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'set_password' ) ),
				'permission_callback' => $this->require_permission( 'users.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/users/(?P<id>\d+)/roles',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'set_roles' ) ),
				'permission_callback' => $this->require_permission( 'users.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/users/(?P<id>\d+)/sessions',
			array(
				'methods'             => 'GET',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'sessions' ) ),
				'permission_callback' => $this->require_permission( 'users.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/users/(?P<id>\d+)/login-history',
			array(
				'methods'             => 'GET',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'login_history' ) ),
				'permission_callback' => $this->require_permission( 'users.read' ),
			)
		);

		// ---- Roles & permissions -----------------------------------------
		register_rest_route(
			$ns,
			'/roles',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'list_roles' ),
				'permission_callback' => $this->require_permission( 'roles.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/permissions',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'list_permissions' ),
				'permission_callback' => $this->require_permission( 'roles.read' ),
			)
		);

		// ---- Audit / activity --------------------------------------------
		register_rest_route(
			$ns,
			'/audit-logs',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'list_audit' ),
				'permission_callback' => $this->require_permission( 'audit.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/activity-logs',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'list_activity' ),
				'permission_callback' => $this->require_permission( 'activity.read' ),
			)
		);

		// ---- Integrations -------------------------------------------------
		register_rest_route(
			$ns,
			'/integrations',
			array(
				'methods'             => 'GET',
				'callback' => $this->with_auth( array( 'DPC_POS_Integrations', 'status' ) ),
				'permission_callback' => $this->require_permission( 'integrations.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/integrations/(?P<type>[a-z_]+)',
			array(
				'methods'             => array( 'POST', 'PUT', 'PATCH' ),
				'callback' => $this->with_auth( array( 'DPC_POS_Integrations', 'save' ) ),
				'permission_callback' => $this->require_permission( 'integrations.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/integrations/(?P<type>[a-z_]+)/test',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Integrations', 'test' ) ),
				'permission_callback' => $this->require_permission( 'integrations.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/integrations/(?P<type>[a-z_]+)/revoke',
			array(
				'methods'             => 'POST',
				'callback'            => $this->with_auth( array( 'DPC_POS_Integrations', 'revoke' ) ),
				'permission_callback' => $this->require_permission( 'integrations.update' ),
			)
		);

		// ---- Catalog (WooCommerce) ---------------------------------------
		register_rest_route(
			$ns,
			'/products',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'list_products' ) ),
				'permission_callback' => $this->require_permission( 'products.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/products/(?P<id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'get_product' ) ),
				'permission_callback' => $this->require_permission( 'products.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/categories',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'list_categories' ) ),
				'permission_callback' => $this->require_permission( 'products.read' ),
			)
		);
	}

	/**
	 * Adds credentialed CORS headers for allowed app origins.
	 *
	 * WordPress reflects the request origin by default; we replace that with an
	 * explicit allow-list so cookies are only accepted from known frontends.
	 *
	 * @return void
	 */
	private function register_cors() {
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter( 'rest_pre_serve_request', array( $this, 'send_cors_headers' ), 15, 1 );
	}

	/**
	 * Emits CORS headers when the request origin is allowed.
	 *
	 * @param bool $served Whether the request has been served.
	 * @return bool
	 */
	public function send_cors_headers( $served ) {
		$origin = get_http_origin();
		if ( ! $origin ) {
			return $served;
		}
		$origin  = untrailingslashit( $origin );
		$allowed = DPC_POS_Integrations::allowed_origins();
		$site    = untrailingslashit( home_url() );

		if ( ! in_array( $origin, $allowed, true ) && $origin !== $site ) {
			return $served;
		}
		if ( headers_sent() ) {
			return $served;
		}

		header( 'Access-Control-Allow-Origin: ' . $origin );
		header( 'Access-Control-Allow-Credentials: true' );
		header( 'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS', false );
		header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-DPC-CSRF, X-WP-Nonce', false );
		header( 'Access-Control-Max-Age: 600', false );
		header( 'Vary: Origin', false );
		return $served;
	}

	/**
	 * Permission callback factory: requires a valid session and permission.
	 *
	 * @param string $permission Required `module.action` permission.
	 * @return callable
	 */
	private function require_permission( $permission ) {
		return function ( WP_REST_Request $request ) use ( $permission ) {
			$auth = DPC_POS_Security::authenticate( $request, true );
			if ( ! $auth ) {
				return new WP_Error( 'dpc_unauthorized', 'Authentication required.', array( 'status' => 401 ) );
			}
			if ( ! DPC_POS_RBAC::user_can( (int) $auth['user']['id'], $permission ) ) {
				return new WP_Error( 'dpc_forbidden', 'You do not have permission to do that.', array( 'status' => 403 ) );
			}
			$request->set_attribute( 'dpc_auth', $auth );
			return true;
		};
	}

	/**
	 * Permission callback requiring only a valid session.
	 *
	 * @return callable
	 */
	private function require_auth() {
		return function ( WP_REST_Request $request ) {
			$auth = DPC_POS_Security::authenticate( $request, true );
			if ( ! $auth ) {
				return new WP_Error( 'dpc_unauthorized', 'Authentication required.', array( 'status' => 401 ) );
			}
			$request->set_attribute( 'dpc_auth', $auth );
			return true;
		};
	}

	/**
	 * Wraps a class-method callback so it also receives the auth context.
	 *
	 * WordPress invokes REST callbacks with only the request; the auth context
	 * is attached to the request as the `dpc_auth` attribute by the permission
	 * callback. This adapter forwards it as the callback's second argument.
	 *
	 * @param callable $callable Target callback that accepts `( $request, $auth )`.
	 * @return callable
	 */
	private function with_auth( $callable ) {
		return function ( $request ) use ( $callable ) {
			return call_user_func( $callable, $request, self::auth( $request ) );
		};
	}

	/**
	 * Returns the auth context attached by the permission callback.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return array
	 */
	private static function auth( WP_REST_Request $request ) {
		$auth = $request->get_attribute( 'dpc_auth' );
		return is_array( $auth ) ? $auth : array();
	}

	/**
	 * GET /health
	 *
	 * @return WP_REST_Response
	 */
	public function health() {
		return rest_ensure_response(
			array(
				'ok'      => true,
				'plugin'  => 'dpc-pos-connector',
				'version' => DPC_POS_VERSION,
				'db'      => get_option( DPC_POS_Activator::DB_VERSION_OPTION ),
			)
		);
	}

	/**
	 * POST /auth/logout
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function logout( WP_REST_Request $request ) {
		return DPC_POS_Auth::logout( $request, self::auth( $request ) );
	}

	/**
	 * GET /auth/me
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function me( WP_REST_Request $request ) {
		return DPC_POS_Auth::me( $request, self::auth( $request ) );
	}

	/**
	 * POST /auth/password
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function change_password( WP_REST_Request $request ) {
		return DPC_POS_Auth::change_password( $request, self::auth( $request ) );
	}

	/**
	 * GET /auth/sessions
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function list_sessions( WP_REST_Request $request ) {
		return DPC_POS_Auth::list_sessions( $request, self::auth( $request ) );
	}

	/**
	 * DELETE /auth/sessions/{id}
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function revoke_session( WP_REST_Request $request ) {
		return DPC_POS_Auth::revoke_session( $request, self::auth( $request ) );
	}

	/**
	 * POST /auth/sso-token
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function sso_token( WP_REST_Request $request ) {
		return DPC_POS_SSO::issue_token( $request, self::auth( $request ) );
	}

	/**
	 * GET /roles
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function list_roles( WP_REST_Request $request ) {
		global $wpdb;
		$roles_table = DPC_POS_RBAC::table( 'roles' );
		$rp_table    = DPC_POS_RBAC::table( 'role_permissions' );
		$perm_table  = DPC_POS_RBAC::table( 'permissions' );
		$rows        = $wpdb->get_results( "SELECT * FROM {$roles_table} ORDER BY is_system DESC, id ASC", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		$items = array();
		foreach ( (array) $rows as $row ) {
			$slug = $row['slug'];
			if ( 'owner' === $slug || 'administrator' === $slug ) {
				$permissions = array( '*' );
			} else {
				$permissions = $wpdb->get_col(
					$wpdb->prepare(
						"SELECT p.slug FROM {$rp_table} rp INNER JOIN {$perm_table} p ON p.id = rp.permission_id WHERE rp.role_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
						(int) $row['id']
					)
				);
			}
			$items[] = array(
				'id'          => (int) $row['id'],
				'slug'        => $slug,
				'name'        => $row['name'],
				'description' => $row['description'],
				'is_system'   => (bool) $row['is_system'],
				'user_count'  => (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . DPC_POS_RBAC::table( 'user_roles' ) . ' WHERE role_id = %d', (int) $row['id'] ) ), // phpcs:ignore WordPress.DB.PreparedSQL
				'permissions' => array_map( 'strval', (array) $permissions ),
			);
		}
		return rest_ensure_response(
			array(
				'items'   => $items,
				'modules' => DPC_POS_RBAC::modules(),
				'actions' => DPC_POS_RBAC::actions(),
			)
		);
	}

	/**
	 * GET /permissions
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function list_permissions( WP_REST_Request $request ) {
		return rest_ensure_response(
			array(
				'items'   => DPC_POS_RBAC::all_permissions(),
				'modules' => DPC_POS_RBAC::modules(),
				'actions' => DPC_POS_RBAC::actions(),
			)
		);
	}

	/**
	 * GET /audit-logs
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function list_audit( WP_REST_Request $request ) {
		$result = DPC_POS_Audit::list_audit(
			array(
				'module'   => (string) $request->get_param( 'module' ),
				'action'   => (string) $request->get_param( 'action' ),
				'user_id'  => (int) $request->get_param( 'user_id' ),
				'page'     => (int) $request->get_param( 'page' ),
				'per_page' => (int) $request->get_param( 'per_page' ),
			)
		);
		return rest_ensure_response( $result );
	}

	/**
	 * GET /activity-logs
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function list_activity( WP_REST_Request $request ) {
		$result = DPC_POS_Audit::list_activity(
			array(
				'module'   => (string) $request->get_param( 'module' ),
				'user_id'  => (int) $request->get_param( 'user_id' ),
				'page'     => (int) $request->get_param( 'page' ),
				'per_page' => (int) $request->get_param( 'per_page' ),
			)
		);
		return rest_ensure_response( $result );
	}
}
