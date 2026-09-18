<?php
/**
 * Audit and activity logging.
 *
 * Audit logs capture security/compliance events with before/after values.
 * Activity logs capture the operational timeline. They are deliberately
 * separate, append-only tables.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Append-only log writers and readers.
 */
class DPC_POS_Audit {

	/**
	 * Writes an audit record.
	 *
	 * @param array $args {
	 *     @type int|null    $user_id   Acting DPC user id.
	 *     @type string      $action    Event name, e.g. "user.suspended".
	 *     @type string      $module    Module slug.
	 *     @type string      $resource  Resource type.
	 *     @type string|int  $record_id Resource id.
	 *     @type mixed       $old_value Previous value (encoded as JSON).
	 *     @type mixed       $new_value New value (encoded as JSON).
	 *     @type int|null    $branch_id Branch id.
	 *     @type string      $result    success|failure.
	 * }
	 * @return void
	 */
	public static function record( array $args ) {
		global $wpdb;
		$table  = DPC_POS_RBAC::table( 'audit_logs' );
		$result = (string) ( $args['result'] ?? 'success' );
		if ( ! in_array( $result, array( 'success', 'failure' ), true ) ) {
			$result = 'success';
		}
		$wpdb->insert(
			$table,
			array(
				'user_id'    => isset( $args['user_id'] ) && $args['user_id'] ? (int) $args['user_id'] : null,
				'action'     => substr( (string) ( $args['action'] ?? '' ), 0, 80 ),
				'module'     => substr( (string) ( $args['module'] ?? '' ), 0, 50 ),
				'resource'   => substr( (string) ( $args['resource'] ?? '' ), 0, 80 ),
				'record_id'  => substr( (string) ( $args['record_id'] ?? '' ), 0, 64 ),
				'old_value'  => isset( $args['old_value'] ) ? wp_json_encode( $args['old_value'] ) : null,
				'new_value'  => isset( $args['new_value'] ) ? wp_json_encode( $args['new_value'] ) : null,
				'branch_id'  => isset( $args['branch_id'] ) && $args['branch_id'] ? (int) $args['branch_id'] : null,
				'ip'         => DPC_POS_Security::client_ip(),
				'user_agent' => DPC_POS_Security::user_agent(),
				'result'     => $result,
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s' )
		);
	}

	/**
	 * Writes an activity timeline record.
	 *
	 * @param array $args {
	 *     @type int|null   $user_id     Acting DPC user id.
	 *     @type string     $module      Module slug.
	 *     @type string     $action      Event name.
	 *     @type string     $description Short description.
	 *     @type string|int $record_id   Resource id.
	 *     @type int|null   $branch_id   Branch id.
	 * }
	 * @return void
	 */
	public static function activity( array $args ) {
		global $wpdb;
		$table = DPC_POS_RBAC::table( 'activity_logs' );
		$wpdb->insert(
			$table,
			array(
				'user_id'     => isset( $args['user_id'] ) && $args['user_id'] ? (int) $args['user_id'] : null,
				'module'      => substr( (string) ( $args['module'] ?? '' ), 0, 50 ),
				'action'      => substr( (string) ( $args['action'] ?? '' ), 0, 80 ),
				'description' => substr( (string) ( $args['description'] ?? '' ), 0, 255 ),
				'record_id'   => substr( (string) ( $args['record_id'] ?? '' ), 0, 64 ),
				'branch_id'   => isset( $args['branch_id'] ) && $args['branch_id'] ? (int) $args['branch_id'] : null,
			),
			array( '%d', '%s', '%s', '%s', '%s', '%d' )
		);
	}

	/**
	 * Paginates audit records, newest first.
	 *
	 * @param array $filters {module, action, user_id, page, per_page}.
	 * @return array{items:array,total:int}
	 */
	public static function list_audit( array $filters = array() ) {
		global $wpdb;
		$table    = DPC_POS_RBAC::table( 'audit_logs' );
		$where    = array( '1=1' );
		$params   = array();
		if ( ! empty( $filters['module'] ) ) {
			$where[]  = 'module = %s';
			$params[] = $filters['module'];
		}
		if ( ! empty( $filters['action'] ) ) {
			$where[]  = 'action = %s';
			$params[] = $filters['action'];
		}
		if ( ! empty( $filters['user_id'] ) ) {
			$where[]  = 'user_id = %d';
			$params[] = (int) $filters['user_id'];
		}
		$per_page = min( 200, max( 1, (int) ( $filters['per_page'] ?? 50 ) ) );
		$page     = max( 1, (int) ( $filters['page'] ?? 1 ) );
		$offset   = ( $page - 1 ) * $per_page;
		$where_sql = implode( ' AND ', $where );

		$count_sql = "SELECT COUNT(*) FROM {$table} WHERE {$where_sql}";
		$total     = (int) ( $params ? $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) : $wpdb->get_var( $count_sql ) ); // phpcs:ignore WordPress.DB.PreparedSQL

		$list_sql = "SELECT * FROM {$table} WHERE {$where_sql} ORDER BY id DESC LIMIT %d OFFSET %d";
		$args     = array_merge( $params, array( $per_page, $offset ) );
		$items    = $wpdb->get_results( $wpdb->prepare( $list_sql, $args ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL

		return array(
			'items' => array_map( array( __CLASS__, 'decode_row' ), (array) $items ),
			'total' => $total,
		);
	}

	/**
	 * Paginates activity records, newest first.
	 *
	 * @param array $filters {module, user_id, page, per_page}.
	 * @return array{items:array,total:int}
	 */
	public static function list_activity( array $filters = array() ) {
		global $wpdb;
		$table  = DPC_POS_RBAC::table( 'activity_logs' );
		$where  = array( '1=1' );
		$params = array();
		if ( ! empty( $filters['module'] ) ) {
			$where[]  = 'module = %s';
			$params[] = $filters['module'];
		}
		if ( ! empty( $filters['action'] ) ) {
			$where[]  = 'action = %s';
			$params[] = $filters['action'];
		}
		if ( ! empty( $filters['user_id'] ) ) {
			$where[]  = 'user_id = %d';
			$params[] = (int) $filters['user_id'];
		}
		if ( ! empty( $filters['search'] ) ) {
			$where[]  = '(description LIKE %s OR action LIKE %s)';
			$params[] = '%' . $wpdb->esc_like( $filters['search'] ) . '%';
			$params[] = '%' . $wpdb->esc_like( $filters['search'] ) . '%';
		}
		if ( ! empty( $filters['from'] ) && strtotime( (string) $filters['from'] ) ) {
			$where[]  = 'created_at >= %s';
			$params[] = gmdate( 'Y-m-d H:i:s', strtotime( (string) $filters['from'] ) );
		}
		if ( ! empty( $filters['to'] ) && strtotime( (string) $filters['to'] ) ) {
			$where[]  = 'created_at <= %s';
			$params[] = gmdate( 'Y-m-d H:i:s', strtotime( (string) $filters['to'] ) + 86399 );
		}
		$per_page = min( 200, max( 1, (int) ( $filters['per_page'] ?? 50 ) ) );
		$page     = max( 1, (int) ( $filters['page'] ?? 1 ) );
		$offset   = ( $page - 1 ) * $per_page;
		$where_sql = implode( ' AND ', $where );

		$count_sql = "SELECT COUNT(*) FROM {$table} WHERE {$where_sql}";
		$total     = (int) ( $params ? $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) : $wpdb->get_var( $count_sql ) ); // phpcs:ignore WordPress.DB.PreparedSQL

		$list_sql = "SELECT * FROM {$table} WHERE {$where_sql} ORDER BY id DESC LIMIT %d OFFSET %d";
		$args     = array_merge( $params, array( $per_page, $offset ) );
		$items    = $wpdb->get_results( $wpdb->prepare( $list_sql, $args ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL

		return array(
			'items' => (array) $items,
			'total' => $total,
		);
	}

	/**
	 * JSON-decodes the before/after columns of an audit row.
	 *
	 * @param array $row Raw row.
	 * @return array
	 */
	private static function decode_row( array $row ) {
		foreach ( array( 'old_value', 'new_value' ) as $key ) {
			if ( isset( $row[ $key ] ) && is_string( $row[ $key ] ) ) {
				$row[ $key ] = json_decode( $row[ $key ], true );
			}
		}
		return $row;
	}
}
