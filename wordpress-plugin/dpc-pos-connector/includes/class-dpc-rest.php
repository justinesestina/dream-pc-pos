<?php
/**
 * REST API bootstrap: route registration, authentication/permission middleware
 * and credentialed CORS for the DPC POS frontend.
 *
 * All endpoints live under the `dpc/v1` namespace. Authenticated routes receive
 * an auth context resolved by the permission callback and stashed on the class
 * for the duration of the request (WordPress has no request-attribute store).
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers every connector route.
 */
class DPC_POS_REST {

	/**
	 * Auth context for the in-flight request, set by the permission callback.
	 *
	 * @var array
	 */
	private static $current_auth = array();

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
		register_rest_route(
			$ns,
			'/users/(?P<id>\d+)/branches',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'set_branches' ) ),
				'permission_callback' => $this->require_permission( 'users.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/users/(?P<id>\d+)/sessions/revoke',
			array(
				'methods'             => 'POST',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'revoke_sessions' ) ),
				'permission_callback' => $this->require_permission( 'users.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/branches',
			array(
				'methods'             => 'GET',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'list_branches' ) ),
				'permission_callback' => $this->require_permission( 'users.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/login-history',
			array(
				'methods'             => 'GET',
				'callback' => $this->with_auth( array( 'DPC_POS_Users', 'list_login_history' ) ),
				'permission_callback' => $this->require_permission( 'audit.read' ),
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
			'/roles',
			array(
				'methods'             => 'POST',
				'callback'            => $this->with_auth( array( 'DPC_POS_Roles', 'create_role' ) ),
				'permission_callback' => $this->require_permission( 'roles.create' ),
			)
		);
		register_rest_route(
			$ns,
			'/roles/(?P<id>\d+)',
			array(
				'methods'             => 'PUT',
				'callback'            => $this->with_auth( array( 'DPC_POS_Roles', 'update_role' ) ),
				'permission_callback' => $this->require_permission( 'roles.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/roles/(?P<id>\d+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => $this->with_auth( array( 'DPC_POS_Roles', 'delete_role' ) ),
				'permission_callback' => $this->require_permission( 'roles.delete' ),
			)
		);
		register_rest_route(
			$ns,
			'/roles/(?P<id>\d+)/permissions',
			array(
				'methods'             => 'POST',
				'callback'            => $this->with_auth( array( 'DPC_POS_Roles', 'set_role_permissions' ) ),
				'permission_callback' => $this->require_permission( 'roles.update' ),
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
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'list_products' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'create_product' ) ),
					'permission_callback' => $this->require_permission( 'products.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/products/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'get_product' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'update_product' ) ),
					'permission_callback' => $this->require_permission( 'products.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'delete_product' ) ),
					'permission_callback' => $this->require_permission( 'products.delete' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/products/(?P<id>\d+)/stock',
			array(
				'methods'             => array( 'PUT', 'PATCH' ),
				'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'update_product_stock' ) ),
				'permission_callback' => $this->require_permission( 'products.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/categories',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'list_categories' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'create_category' ) ),
					'permission_callback' => $this->require_permission( 'products.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/categories/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'get_category' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'update_category' ) ),
					'permission_callback' => $this->require_permission( 'products.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Catalog', 'delete_category' ) ),
					'permission_callback' => $this->require_permission( 'products.delete' ),
				),
			)
		);

		// ---- Brands / tags / attributes (WooCommerce taxonomy) ------------
		register_rest_route(
			$ns,
			'/brands',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'list_brands' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'create_brand' ) ),
					'permission_callback' => $this->require_permission( 'products.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/brands/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'get_brand' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'update_brand' ) ),
					'permission_callback' => $this->require_permission( 'products.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'delete_brand' ) ),
					'permission_callback' => $this->require_permission( 'products.delete' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/tags',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'list_tags' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'create_tag' ) ),
					'permission_callback' => $this->require_permission( 'products.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/tags/(?P<id>\d+)',
			array(
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'update_tag' ) ),
					'permission_callback' => $this->require_permission( 'products.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'delete_tag' ) ),
					'permission_callback' => $this->require_permission( 'products.delete' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/attributes',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'list_attributes' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'create_attribute' ) ),
					'permission_callback' => $this->require_permission( 'products.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/attributes/(?P<id>\d+)',
			array(
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'update_attribute' ) ),
					'permission_callback' => $this->require_permission( 'products.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'delete_attribute' ) ),
					'permission_callback' => $this->require_permission( 'products.delete' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/attributes/(?P<id>\d+)/terms',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'list_attribute_terms' ) ),
					'permission_callback' => $this->require_permission( 'products.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'create_attribute_term' ) ),
					'permission_callback' => $this->require_permission( 'products.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/attributes/(?P<id>\d+)/terms/(?P<termId>\d+)',
			array(
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'update_attribute_term' ) ),
					'permission_callback' => $this->require_permission( 'products.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Taxonomy', 'delete_attribute_term' ) ),
					'permission_callback' => $this->require_permission( 'products.delete' ),
				),
			)
		);

		// ---- Sales (WooCommerce) -----------------------------------------
		register_rest_route(
			$ns,
			'/customers',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'list_customers' ) ),
					'permission_callback' => $this->require_permission( 'customers.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'create_customer' ) ),
					'permission_callback' => $this->require_permission( 'customers.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/orders',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'list_orders' ) ),
					'permission_callback' => $this->require_permission( 'sales.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'create_order' ) ),
					'permission_callback' => $this->require_permission( 'sales.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/orders/(?P<id>\d+)',
			array(
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'update_order' ) ),
					'permission_callback' => $this->require_permission( 'sales.update' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/quotes',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'list_quotes' ) ),
					'permission_callback' => $this->require_permission( 'sales.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'create_quote' ) ),
					'permission_callback' => $this->require_permission( 'sales.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/quotes/(?P<id>[A-Za-z0-9-]+)',
			array(
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'update_quote' ) ),
					'permission_callback' => $this->require_permission( 'sales.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'delete_quote' ) ),
					'permission_callback' => $this->require_permission( 'sales.delete' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/suppliers',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'list_suppliers' ) ),
					'permission_callback' => $this->require_permission( 'purchase_orders.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'create_supplier' ) ),
					'permission_callback' => $this->require_permission( 'purchase_orders.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/suppliers/(?P<id>[A-Za-z0-9-]+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'get_supplier' ) ),
					'permission_callback' => $this->require_permission( 'purchase_orders.read' ),
				),
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'update_supplier' ) ),
					'permission_callback' => $this->require_permission( 'purchase_orders.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Sales', 'delete_supplier' ) ),
					'permission_callback' => $this->require_permission( 'purchase_orders.delete' ),
				),
			)
		);

		// ---- Warehouses / inventory / transfers ---------------------------
		register_rest_route(
			$ns,
			'/warehouses',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'list_warehouses_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'create_warehouse_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/warehouses/(?P<id>[A-Za-z0-9-]+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'get_warehouse_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.read' ),
				),
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'update_warehouse_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'delete_warehouse_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.delete' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/warehouses/(?P<id>[A-Za-z0-9-]+)/stock',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'warehouse_stock_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.read' ),
				),
				array(
					'methods'             => array( 'POST', 'PUT' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'add_stock_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.update' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/warehouses/(?P<id>[A-Za-z0-9-]+)/stock/(?P<productId>\d+)',
			array(
				'methods'             => array( 'PUT', 'PATCH' ),
				'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'set_stock_route' ) ),
				'permission_callback' => $this->require_permission( 'inventory.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/warehouses/(?P<id>[A-Za-z0-9-]+)/movements',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'warehouse_movements_route' ) ),
				'permission_callback' => $this->require_permission( 'inventory.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/warehouses/(?P<id>[A-Za-z0-9-]+)/transfers',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'warehouse_transfers_route' ) ),
				'permission_callback' => $this->require_permission( 'inventory.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/inventory/stock',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'inventory_stock_route' ) ),
				'permission_callback' => $this->require_permission( 'inventory.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/inventory/stock/(?P<productId>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'inventory_product_stock_route' ) ),
				'permission_callback' => $this->require_permission( 'inventory.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/inventory/stock/(?P<productId>\d+)/adjust',
			array(
				'methods'             => 'POST',
				'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'inventory_adjust_route' ) ),
				'permission_callback' => $this->require_permission( 'inventory.update' ),
			)
		);
		register_rest_route(
			$ns,
			'/inventory/movements',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'inventory_movements_route' ) ),
				'permission_callback' => $this->require_permission( 'inventory.read' ),
			)
		);
		register_rest_route(
			$ns,
			'/transfers',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'list_transfers_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'create_transfer_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.create' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/transfers/(?P<id>[A-Za-z0-9-]+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'get_transfer_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.read' ),
				),
				array(
					'methods'             => array( 'PUT', 'PATCH' ),
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'update_transfer_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.update' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => $this->with_auth( array( 'DPC_POS_Inventory', 'delete_transfer_route' ) ),
					'permission_callback' => $this->require_permission( 'inventory.delete' ),
				),
			)
		);

		// ---- Global search ------------------------------------------------
		register_rest_route(
			$ns,
			'/search',
			array(
				'methods'             => 'GET',
				'callback'            => $this->with_auth( array( 'DPC_POS_Search', 'search' ) ),
				'permission_callback' => $this->require_permission( 'products.read' ),
			)
		);

		// ---- Media --------------------------------------------------------
		register_rest_route(
			$ns,
			'/media',
			array(
				'methods'             => 'POST',
				'callback'            => $this->with_auth( array( 'DPC_POS_Media', 'upload' ) ),
				'permission_callback' => $this->require_auth(),
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
		// Send headers before dispatch so even a fatal error carries CORS and the
		// browser surfaces the real message instead of an opaque CORS failure.
		add_action( 'rest_api_init', array( $this, 'maybe_send_early_cors' ), 1 );
	}

	/**
	 * Sends CORS headers up-front for connector routes.
	 *
	 * @return void
	 */
	public function maybe_send_early_cors() {
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '';
		if ( false === strpos( $uri, '/dpc/v1/' ) ) {
			return;
		}
		$this->send_cors_headers( false );
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
			self::$current_auth = $auth;
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
			self::$current_auth = $auth;
			return true;
		};
	}

	/**
	 * Wraps a class-method callback so it also receives the auth context.
	 *
	 * WordPress invokes REST callbacks with only the request; the permission
	 * callback stashes the auth context on this class. This adapter forwards it
	 * as the callback's second argument.
	 *
	 * @param callable $callable Target callback that accepts `( $request, $auth )`.
	 * @return callable
	 */
	private function with_auth( $callable ) {
		return function ( $request ) use ( $callable ) {
			return call_user_func( $callable, $request, self::auth() );
		};
	}

	/**
	 * Returns the auth context stashed by the permission callback.
	 *
	 * @return array
	 */
	private static function auth() {
		return is_array( self::$current_auth ) ? self::$current_auth : array();
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
		return DPC_POS_Auth::logout( $request, self::auth() );
	}

	/**
	 * GET /auth/me
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function me( WP_REST_Request $request ) {
		return DPC_POS_Auth::me( $request, self::auth() );
	}

	/**
	 * POST /auth/password
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function change_password( WP_REST_Request $request ) {
		return DPC_POS_Auth::change_password( $request, self::auth() );
	}

	/**
	 * GET /auth/sessions
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function list_sessions( WP_REST_Request $request ) {
		return DPC_POS_Auth::list_sessions( $request, self::auth() );
	}

	/**
	 * DELETE /auth/sessions/{id}
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function revoke_session( WP_REST_Request $request ) {
		return DPC_POS_Auth::revoke_session( $request, self::auth() );
	}

	/**
	 * POST /auth/sso-token
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function sso_token( WP_REST_Request $request ) {
		return DPC_POS_SSO::issue_token( $request, self::auth() );
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
				'action'   => (string) $request->get_param( 'action' ),
				'user_id'  => (int) $request->get_param( 'user_id' ),
				'search'   => (string) $request->get_param( 'search' ),
				'from'     => (string) $request->get_param( 'from' ),
				'to'       => (string) $request->get_param( 'to' ),
				'page'     => (int) $request->get_param( 'page' ),
				'per_page' => (int) $request->get_param( 'per_page' ),
			)
		);
		return rest_ensure_response( $result );
	}
}
