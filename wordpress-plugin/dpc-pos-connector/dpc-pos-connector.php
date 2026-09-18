<?php
/**
 * Plugin Name:       DPC POS Connector
 * Plugin URI:        https://dreampcbuild.com
 * Description:       Secure backend/API connector between the DPC POS interface and WordPress + WooCommerce. Owns DPC POS users, roles, permissions, branches, sessions, audit/activity logs, approval workflows and WordPress Admin SSO. Stores its data in wp_dpc_* tables inside the existing WordPress database.
 * Version:           0.2.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Dream PC Build & IT Solutions
 * License:           Proprietary
 * Text Domain:       dpc-pos-connector
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

define( 'DPC_POS_VERSION', '0.2.0' );
define( 'DPC_POS_FILE', __FILE__ );
define( 'DPC_POS_DIR', plugin_dir_path( __FILE__ ) );
define( 'DPC_POS_URL', plugin_dir_url( __FILE__ ) );

require_once DPC_POS_DIR . 'includes/class-dpc-activator.php';
require_once DPC_POS_DIR . 'includes/class-dpc-crypto.php';
require_once DPC_POS_DIR . 'includes/class-dpc-security.php';
require_once DPC_POS_DIR . 'includes/class-dpc-rbac.php';
require_once DPC_POS_DIR . 'includes/class-dpc-audit.php';
require_once DPC_POS_DIR . 'includes/class-dpc-auth.php';
require_once DPC_POS_DIR . 'includes/class-dpc-sso.php';
require_once DPC_POS_DIR . 'includes/class-dpc-users.php';
require_once DPC_POS_DIR . 'includes/class-dpc-integrations.php';
require_once DPC_POS_DIR . 'includes/class-dpc-rest.php';

register_activation_hook( DPC_POS_FILE, array( 'DPC_POS_Activator', 'activate' ) );
register_deactivation_hook( DPC_POS_FILE, array( 'DPC_POS_Activator', 'deactivate' ) );

/**
 * Boots the connector once WordPress is ready.
 */
final class DPC_POS_Plugin {

	/**
	 * Singleton instance.
	 *
	 * @var DPC_POS_Plugin|null
	 */
	private static $instance = null;

	/**
	 * REST namespace shared by every endpoint.
	 */
	const REST_NAMESPACE = 'dpc/v1';

	/**
	 * Returns the shared plugin instance.
	 *
	 * @return DPC_POS_Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Wires hooks.
	 */
	private function __construct() {
		add_action( 'plugins_loaded', array( $this, 'maybe_upgrade' ) );
		add_action( 'rest_api_init', array( new DPC_POS_REST(), 'register_routes' ) );
		add_action( 'init', array( $this, 'register_sso_rewrite' ) );
		add_action( 'template_redirect', array( new DPC_POS_SSO(), 'maybe_handle_handoff' ) );
		add_action( 'admin_menu', array( new DPC_POS_Integrations(), 'register_menu' ) );
		add_action( 'admin_init', array( new DPC_POS_Integrations(), 'handle_admin_actions' ) );
	}

	/**
	 * Runs schema upgrades when the stored version is behind the code.
	 */
	public function maybe_upgrade() {
		DPC_POS_Activator::maybe_upgrade();
	}

	/**
	 * Registers the clean SSO handoff endpoint.
	 */
	public function register_sso_rewrite() {
		add_rewrite_rule( '^dpc-sso/?$', 'index.php?dpc_sso=1', 'top' );
		add_rewrite_tag( '%dpc_sso%', '1' );
	}
}

DPC_POS_Plugin::instance();
