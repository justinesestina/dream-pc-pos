<?php
/**
 * Uninstall handler.
 *
 * Data is preserved by default. To remove every DPC POS table on uninstall,
 * set the WordPress option `dpc_pos_delete_data_on_uninstall` to true (or add
 * `define( 'DPC_POS_DELETE_DATA_ON_UNINSTALL', true );` to wp-config.php).
 *
 * @package DPC_POS_Connector
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;

$delete_data = (bool) get_option( 'dpc_pos_delete_data_on_uninstall', false );
if ( defined( 'DPC_POS_DELETE_DATA_ON_UNINSTALL' ) ) {
	$delete_data = (bool) DPC_POS_DELETE_DATA_ON_UNINSTALL;
}

if ( $delete_data ) {
	$suffixes = array(
		'users',
		'roles',
		'permissions',
		'role_permissions',
		'user_roles',
		'branches',
		'user_branches',
		'sessions',
		'login_history',
		'audit_logs',
		'activity_logs',
		'approval_workflows',
		'approval_requests',
		'settings',
	);
	foreach ( $suffixes as $suffix ) {
		$table = $wpdb->prefix . 'dpc_' . $suffix;
		$wpdb->query( "DROP TABLE IF EXISTS {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}
}

delete_option( 'dpc_pos_db_version' );
delete_option( 'dpc_pos_delete_data_on_uninstall' );

$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_dpc_pos_sso_%' OR option_name LIKE '_transient_timeout_dpc_pos_sso_%'" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
