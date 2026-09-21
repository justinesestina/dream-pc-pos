<?php
/**
 * Projects, project tasks and the project team roster.
 *
 * Projects are stored in dedicated `wp_dpc_projects` / `wp_dpc_project_tasks`
 * tables. Owners and members are real DPC users (the `wp_dpc_users` table), so
 * team work and assignments stay linked to the role system. Every mutation is
 * guarded by `projects.*` permissions and written to the audit trail.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Projects CRUD backed by dedicated DPC tables.
 */
class DPC_POS_Projects {

	/**
	 * Logical table names used via {@see DPC_POS_RBAC::table}.
	 *
	 * @return string[]
	 */
	private static function table_names() {
		return array( 'projects', 'project_tasks' );
	}

	/**
	 * Real (prefixed) table name.
	 *
	 * @param string $name Table suffix.
	 * @return string
	 */
	private static function table( $name ) {
		return DPC_POS_RBAC::table( $name );
	}

	/**
	 * Valid project statuses.
	 *
	 * @return string[]
	 */
	public static function statuses() {
		return array( 'planning', 'active', 'on_hold', 'completed' );
	}

	/**
	 * Valid task statuses.
	 *
	 * @return string[]
	 */
	public static function task_statuses() {
		return array( 'todo', 'in_progress', 'done' );
	}

	/**
	 * Valid customer categories for a project.
	 *
	 * @return string[]
	 */
	private static function customer_types() {
		return array( 'walk-in', 'business', 'household' );
	}

	/**
	 * Normalizes a member id list into integers, dropping anything invalid.
	 *
	 * @param mixed $members Raw members payload.
	 * @return int[]
	 */
	private static function clean_members( $members ) {
		if ( is_string( $members ) && '' !== $members ) {
			$decoded = json_decode( $members, true );
			$members = is_array( $decoded ) ? $decoded : array();
		}
		$ids = array();
		foreach ( (array) $members as $id ) {
			if ( is_numeric( $id ) && (int) $id > 0 ) {
				$ids[] = (int) $id;
			}
		}
		$ids = array_values( array_unique( $ids ) );
		if ( count( $ids ) > 50 ) {
			$ids = array_slice( $ids, 0, 50 );
		}
		return $ids;
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
	 * Loads lightweight display info for DPC user ids.
	 *
	 * @param int[] $user_ids User ids.
	 * @return array<int,array{id:int,name:string,initials:string,role:string}>
	 */
	private static function users_map( array $user_ids ) {
		if ( empty( $user_ids ) ) {
			return array();
		}
		global $wpdb;
		$table = self::table( 'users' );
		$ids   = array_map( 'absint', array_unique( $user_ids ) );
		$ph    = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT id, display_name, avatar_url, status FROM {$table} WHERE id IN ({$ph})", $ids ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		$map = array();
		foreach ( (array) $rows as $row ) {
			$uid    = (int) $row['id'];
			$name   = sanitize_text_field( (string) $row['display_name'] );
			$init   = self::initials( $name );
			$roles  = DPC_POS_RBAC::get_user_roles( $uid );
			$role   = $roles ? $roles[0] : '';
			$role_name = $role;
			$rrow   = $role ? DPC_POS_RBAC::get_role_by_slug( $role ) : null;
			if ( $rrow ) {
				$role_name = (string) $rrow['name'];
			}
			$map[ $uid ] = array(
				'id'         => $uid,
				'name'       => $name,
				'initials'   => $init,
				'role'       => $role_name,
				'avatar_url' => isset( $row['avatar_url'] ) ? (string) $row['avatar_url'] : '',
			);
		}
		return $map;
	}

	/**
	 * Project row => API payload with member/owner enrichment and task counts.
	 *
	 * @param array               $rows        Project rows.
	 * @param array<int,array>     $users       User display map.
	 * @param array<int,array{total:int,done:int}> $counts Task counts keyed by project id.
	 * @return array[]
	 */
	private static function payload( array $rows, array $users, array $counts ) {
		$items = array();
		foreach ( $rows as $row ) {
			$member_ids = self::clean_members( isset( $row['members'] ) ? $row['members'] : array() );
			$cnt        = isset( $counts[ (int) $row['id'] ] ) ? $counts[ (int) $row['id'] ] : array( 'total' => 0, 'done' => 0 );

			$member_details = array();
			$member_names   = array();
			foreach ( $member_ids as $mid ) {
				if ( isset( $users[ $mid ] ) ) {
					$member_details[] = $users[ $mid ];
					$member_names[]   = $users[ $mid ]['name'];
				}
			}

			$owner_id = ! empty( $row['owner'] ) ? (int) $row['owner'] : 0;
			$items[]  = array(
				'id'            => (int) $row['id'],
				'code'          => (string) $row['code'],
				'name'          => (string) $row['name'],
				'customer'      => (string) $row['customer'],
				'customer_type' => (string) $row['customer_type'],
				'status'        => (string) $row['status'],
				'start_date'    => $row['start_date'] ? (string) $row['start_date'] : null,
				'due_date'      => $row['due_date'] ? (string) $row['due_date'] : null,
				'owner'         => $owner_id,
				'owner_name'    => isset( $users[ $owner_id ] ) ? $users[ $owner_id ]['name'] : '',
				'description'   => (string) $row['description'],
				'scope'         => (string) $row['scope'],
				'value'         => (float) $row['value'],
				'members'       => $member_ids,
				'member_names'  => $member_names,
				'member_details'=> $member_details,
				'tasks'         => (int) $cnt['total'],
				'done'          => (int) $cnt['done'],
				'created_at'    => (string) $row['created_at'],
			);
		}
		return $items;
	}

	/**
	 * Fetches projects with optional filters and returns API payload plus counts.
	 *
	 * @param string $status Optional status filter.
	 * @param string $search Optional free-text search.
	 * @return array{items:array[]}
	 */
	private static function projects( $status = '', $search = '' ) {
		global $wpdb;
		$table = self::table( 'projects' );

		$where  = array( '1=1' );
		$params = array();
		if ( $status && in_array( $status, self::statuses(), true ) ) {
			$where[]  = 'p.status = %s';
			$params[] = $status;
		}
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '(p.name LIKE %s OR p.customer LIKE %s OR p.code LIKE %s)';
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
		}
		$where_sql = implode( ' AND ', $where );
		$sql       = "SELECT p.* FROM {$table} p WHERE {$where_sql} ORDER BY p.id ASC";
		$rows      = $params ? $wpdb->get_results( $wpdb->prepare( $sql, $params ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL

		if ( empty( $rows ) ) {
			return array( 'items' => array() );
		}

		$ids        = array_map( 'intval', array_column( $rows, 'id' ) );
		$user_ids   = array();
		foreach ( $rows as $row ) {
			if ( ! empty( $row['owner'] ) ) {
				$user_ids[] = (int) $row['owner'];
			}
			$user_ids = array_merge( $user_ids, self::clean_members( $row['members'] ) );
		}
		$users  = self::users_map( array_values( array_unique( $user_ids ) ) );

		$tasks_table = self::table( 'project_tasks' );
		$ph          = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
		$count_rows  = $wpdb->get_results( $wpdb->prepare( "SELECT project_id, COUNT(*) AS total, SUM(status = 'done') AS done FROM {$tasks_table} WHERE project_id IN ({$ph}) GROUP BY project_id", $ids ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$counts      = array();
		foreach ( (array) $count_rows as $c ) {
			$counts[ (int) $c['project_id'] ] = array(
				'total' => (int) $c['total'],
				'done'  => (int) $c['done'],
			);
		}

		return array( 'items' => self::payload( $rows, $users, $counts ) );
	}

	/**
	 * Task row => API payload.
	 *
	 * @param array $row Task row.
	 * @param array $users User display map.
	 * @return array
	 */
	private static function task_payload( array $row, array $users ) {
		$assignee = ! empty( $row['assignee'] ) ? (int) $row['assignee'] : 0;
		return array(
			'id'            => (int) $row['id'],
			'project_id'    => (int) $row['project_id'],
			'project'       => (string) $row['project_name'],
			'title'         => (string) $row['title'],
			'assignee'      => $assignee,
			'assignee_name' => isset( $users[ $assignee ] ) ? $users[ $assignee ]['name'] : '',
			'status'        => (string) $row['status'],
			'due_date'      => $row['due_date'] ? (string) $row['due_date'] : null,
			'duration'      => (string) $row['duration'],
			'created_at'    => (string) $row['created_at'],
		);
	}

	/**
	 * Fetches tasks, optionally scoped to a project.
	 *
	 * @param int $project_id Optional project id filter.
	 * @return array[]
	 */
	private static function tasks( $project_id = 0 ) {
		global $wpdb;
		$tasks_table = self::table( 'project_tasks' );
		$proj_table  = self::table( 'projects' );
		$sql         = "SELECT t.*, p.name AS project_name FROM {$tasks_table} t INNER JOIN {$proj_table} p ON p.id = t.project_id";
		$params      = array();
		if ( $project_id > 0 ) {
			$sql    .= ' WHERE t.project_id = %d';
			$params[] = $project_id;
		}
		$sql .= ' ORDER BY t.id ASC';

		$rows = $params ? $wpdb->get_results( $wpdb->prepare( $sql, $params ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL

		$user_ids = array();
		foreach ( (array) $rows as $row ) {
			if ( ! empty( $row['assignee'] ) ) {
				$user_ids[] = (int) $row['assignee'];
			}
		}
		$users = self::users_map( array_values( array_unique( $user_ids ) ) );

		$items = array();
		foreach ( (array) $rows as $row ) {
			$items[] = self::task_payload( $row, $users );
		}
		return $items;
	}

	/**
	 * GET /projects — list projects.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function list_projects( $request, $auth ) {
		$result = self::projects(
			(string) $request->get_param( 'status' ),
			(string) $request->get_param( 'search' )
		);
		return rest_ensure_response(
			array(
				'items' => $result['items'],
			)
		);
	}

	/**
	 * GET /projects/{id} — single project.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_project( $request, $auth ) {
		$project = self::get_project_row( (int) $request->get_param( 'id' ) );
		if ( ! $project ) {
			return DPC_POS_Auth::error( 'dpc_project_not_found', 'Project not found.', 404 );
		}
		$result = self::projects( '', '' );
		foreach ( $result['items'] as $item ) {
			if ( (int) $item['id'] === (int) $project['id'] ) {
				return rest_ensure_response( $item );
			}
		}
		return DPC_POS_Auth::error( 'dpc_project_not_found', 'Project not found.', 404 );
	}

	/**
	 * Finds a project row by id.
	 *
	 * @param int $id Project id.
	 * @return array<string,mixed>|null
	 */
	private static function get_project_row( $id ) {
		global $wpdb;
		$table = self::table( 'projects' );
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $row ? $row : null;
	}

	/**
	 * Next sequential project code (PRJ-001, PRJ-002…).
	 *
	 * @return string
	 */
	private static function next_code() {
		global $wpdb;
		$table = self::table( 'projects' );
		$max   = (int) $wpdb->get_var( "SELECT MAX(CAST(SUBSTRING(code, 5) AS UNSIGNED)) FROM {$table} WHERE code LIKE 'PRJ-%'" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return 'PRJ-' . str_pad( (string) ( $max + 1 ), 3, '0', STR_PAD_LEFT );
	}

	/**
	 * POST /projects — create a project.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_project( $request, $auth ) {
		global $wpdb;
		$table  = self::table( 'projects' );
		$actor  = isset( $auth['user']['id'] ) ? (int) $auth['user']['id'] : 0;
		$data   = self::sanitize_project( $request, false );
		$errors = self::validate_project( $data );
		if ( $errors ) {
			return DPC_POS_Auth::error( 'dpc_project_invalid', $errors, 400 );
		}

		$members = self::clean_members( $request->get_param( 'members' ) );
		if ( empty( $members ) && $actor > 0 ) {
			$members = array( $actor );
		}
		$owner = isset( $data['owner'] ) && $data['owner'] > 0 ? (int) $data['owner'] : $actor;
		$code  = self::next_code();

		$wpdb->insert(
			$table,
			array(
				'code'          => $code,
				'name'          => $data['name'],
				'customer'      => $data['customer'],
				'customer_type' => $data['customer_type'],
				'status'        => $data['status'],
				'start_date'    => $data['start_date'],
				'due_date'      => $data['due_date'],
				'owner'         => $owner,
				'description'   => $data['description'],
				'scope'         => $data['scope'],
				'value'         => $data['value'],
				'members'       => wp_json_encode( $members ),
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%f', '%s' )
		);
		$id = (int) $wpdb->insert_id;
		if ( ! $id ) {
			return DPC_POS_Auth::error( 'dpc_project_create_failed', 'Could not create the project.', 500 );
		}

		DPC_POS_Audit::record(
			array(
				'user_id'   => $actor,
				'action'    => 'create_project',
				'module'    => 'projects',
				'resource'  => 'project',
				'record_id' => $id,
				'new_value' => array( 'name' => $data['name'], 'code' => $code ),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => $actor,
				'module'      => 'projects',
				'action'      => 'project.created',
				'description' => sprintf(
					'Created project %s (%s) for %s with value ₱%s',
					$data['name'],
					$code,
					$data['customer'],
					number_format( $data['value'], 2 )
				),
				'record_id'   => $id,
			)
		);

		return self::get_project_response( $id );
	}

	/**
	 * PUT/PATCH /projects/{id} — update a project.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_project( $request, $auth ) {
		global $wpdb;
		$table  = self::table( 'projects' );
		$id     = (int) $request->get_param( 'id' );
		$actor  = isset( $auth['user']['id'] ) ? (int) $auth['user']['id'] : 0;
		$old    = self::get_project_row( $id );
		if ( ! $old ) {
			return DPC_POS_Auth::error( 'dpc_project_not_found', 'Project not found.', 404 );
		}

		$data   = self::sanitize_project( $request, true );
		// Partial PATCH semantics: absent fields keep their stored value so a
		// members/status-only update never wipes the rest of the record.
		if ( '' === $data['name'] ) {
			$data['name'] = (string) $old['name'];
		}
		if ( '' === $data['customer'] ) {
			$data['customer'] = (string) $old['customer'];
		}
		if ( '' === $data['customer_type'] ) {
			$data['customer_type'] = (string) $old['customer_type'];
		}
		if ( '' === $data['status'] ) {
			$data['status'] = (string) $old['status'];
		}
		if ( '' === $data['start_date'] ) {
			$data['start_date'] = (string) $old['start_date'];
		}
		if ( '' === $data['due_date'] ) {
			$data['due_date'] = (string) $old['due_date'];
		}
		if ( ! $data['owner'] ) {
			$data['owner'] = (int) $old['owner'];
		}
		if ( '' === $data['description'] ) {
			$data['description'] = (string) $old['description'];
		}
		if ( '' === $data['scope'] ) {
			$data['scope'] = (string) $old['scope'];
		}
		if ( ! $data['value'] ) {
			$data['value'] = (float) $old['value'];
		}
		$errors = self::validate_project( $data );
		if ( $errors ) {
			return DPC_POS_Auth::error( 'dpc_project_invalid', $errors, 400 );
		}

		$update = array(
			'name'          => $data['name'],
			'customer'      => $data['customer'],
			'customer_type' => $data['customer_type'],
			'status'        => $data['status'],
			'start_date'    => $data['start_date'],
			'due_date'      => $data['due_date'],
			'owner'         => $data['owner'],
			'description'   => $data['description'],
			'scope'         => $data['scope'],
			'value'         => $data['value'],
		);
		$format = array( '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%f' );
		if ( $request->get_param( 'members' ) !== null ) {
			$update['members'] = wp_json_encode( self::clean_members( $request->get_param( 'members' ) ) );
			$format[]          = '%s';
		}

		$wpdb->update( $table, $update, array( 'id' => $id ), $format, array( '%d' ) );

		DPC_POS_Audit::record(
			array(
				'user_id'   => $actor,
				'action'    => 'update_project',
				'module'    => 'projects',
				'resource'  => 'project',
				'record_id' => $id,
				'old_value' => array( 'name' => $old['name'], 'status' => $old['status'] ),
				'new_value' => array( 'name' => $data['name'], 'status' => $data['status'] ),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => $actor,
				'module'      => 'projects',
				'action'      => 'project.updated',
				'description' => sprintf(
					'Updated project %s - status changed from %s to %s',
					$data['name'],
					$old['status'],
					$data['status']
				),
				'record_id'   => $id,
			)
		);

		return self::get_project_response( $id );
	}

	/**
	 * DELETE /projects/{id} — delete a project and its tasks.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_project( $request, $auth ) {
		global $wpdb;
		$id    = (int) $request->get_param( 'id' );
		$actor = isset( $auth['user']['id'] ) ? (int) $auth['user']['id'] : 0;
		$old   = self::get_project_row( $id );
		if ( ! $old ) {
			return DPC_POS_Auth::error( 'dpc_project_not_found', 'Project not found.', 404 );
		}
		
		// Get task count before deletion
		$task_count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM " . self::table( 'project_tasks' ) . " WHERE project_id = %d", $id ) ); // phpcs:ignore WordPress.DB.PreparedSQL
		
		$wpdb->delete( self::table( 'project_tasks' ), array( 'project_id' => $id ), array( '%d' ) );
		$wpdb->delete( self::table( 'projects' ), array( 'id' => $id ), array( '%d' ) );

		DPC_POS_Audit::record(
			array(
				'user_id'   => $actor,
				'action'    => 'delete_project',
				'module'    => 'projects',
				'resource'  => 'project',
				'record_id' => $id,
				'old_value' => array( 'name' => $old['name'] ),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => $actor,
				'module'      => 'projects',
				'action'      => 'project.deleted',
				'description' => sprintf(
					'Deleted project %s (%s) with %d tasks',
					sanitize_text_field( (string) $old['name'] ),
					$old['code'],
					(int) $task_count
				),
				'record_id'   => $id,
			)
		);

		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * GET /projects/{id}/tasks — list tasks for a project.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_tasks( $request, $auth ) {
		$id = (int) $request->get_param( 'id' );
		if ( ! self::get_project_row( $id ) ) {
			return DPC_POS_Auth::error( 'dpc_project_not_found', 'Project not found.', 404 );
		}
		return rest_ensure_response( array( 'items' => self::tasks( $id ) ) );
	}

	/**
	 * GET /tasks — all tasks (optionally filtered by project_id query param).
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function all_tasks( $request, $auth ) {
		$project_id = (int) $request->get_param( 'project_id' );
		return rest_ensure_response( array( 'items' => self::tasks( $project_id ) ) );
	}

	/**
	 * POST /projects/{id}/tasks — create a task.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_task( $request, $auth ) {
		global $wpdb;
		$project_id = (int) $request->get_param( 'id' );
		$actor      = isset( $auth['user']['id'] ) ? (int) $auth['user']['id'] : 0;
		if ( ! self::get_project_row( $project_id ) ) {
			return DPC_POS_Auth::error( 'dpc_project_not_found', 'Project not found.', 404 );
		}
		$data = self::sanitize_task( $request, false );
		if ( '' === $data['title'] ) {
			return DPC_POS_Auth::error( 'dpc_task_invalid', 'Task title is required.', 400 );
		}
		if ( '' === $data['due_date'] ) {
			return DPC_POS_Auth::error( 'dpc_task_invalid', 'Task due date is required.', 400 );
		}
		if ( ! in_array( $data['status'], self::task_statuses(), true ) ) {
			return DPC_POS_Auth::error( 'dpc_task_invalid', 'Invalid task status.', 400 );
		}

		$wpdb->insert(
			self::table( 'project_tasks' ),
			array(
				'project_id' => $project_id,
				'title'      => $data['title'],
				'assignee'   => $data['assignee'],
				'status'     => $data['status'],
				'due_date'   => $data['due_date'],
				'duration'   => $data['duration'],
			),
			array( '%d', '%s', '%d', '%s', '%s', '%s' )
		);
		$id       = (int) $wpdb->insert_id;
		$row      = $wpdb->get_row( $wpdb->prepare( 'SELECT t.*, p.name AS project_name FROM ' . self::table( 'project_tasks' ) . ' t INNER JOIN ' . self::table( 'projects' ) . ' p ON p.id = t.project_id WHERE t.id = %d', $id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL
		$user_ids = $row['assignee'] ? array( (int) $row['assignee'] ) : array();
		$users    = self::users_map( $user_ids );

		DPC_POS_Audit::record(
			array(
				'user_id'   => $actor,
				'action'    => 'create_task',
				'module'    => 'projects',
				'resource'  => 'task',
				'record_id' => $id,
				'new_value' => array( 'title' => $data['title'], 'project_id' => $project_id ),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => $actor,
				'module'      => 'projects',
				'action'      => 'task.created',
				'description' => sprintf(
					'Created task "%s" in project %s (%s)',
					$data['title'],
					$row['project_name'],
					$project_id
				),
				'record_id'   => $id,
			)
		);

		return rest_ensure_response( self::task_payload( $row, $users ) );
	}

	/**
	 * PUT/PATCH /tasks/{id} — update a task (title, assignee, status, dates).
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_task( $request, $auth ) {
		global $wpdb;
		$table = self::table( 'project_tasks' );
		$id    = (int) $request->get_param( 'id' );
		$actor = isset( $auth['user']['id'] ) ? (int) $auth['user']['id'] : 0;
		$old   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $old ) {
			return DPC_POS_Auth::error( 'dpc_task_not_found', 'Task not found.', 404 );
		}

		$data  = self::sanitize_task( $request, true );
		$update = array();
		$format = array();

		if ( '' !== $data['title'] ) {
			$update['title'] = $data['title'];
			$format[]        = '%s';
		}
		$assignee = (int) $request->get_param( 'assignee' );
		if ( $request->get_param( 'assignee' ) !== null && $assignee >= 0 ) {
			$update['assignee'] = $assignee;
			$format[]           = '%d';
		}
		if ( $request->get_param( 'status' ) !== null && in_array( $data['status'], self::task_statuses(), true ) ) {
			$update['status'] = $data['status'];
			$format[]         = '%s';
		}
		if ( $request->get_param( 'due_date' ) !== null && '' !== $data['due_date'] ) {
			$update['due_date'] = $data['due_date'];
			$format[]           = '%s';
		}
		if ( $request->get_param( 'duration' ) !== null ) {
			$update['duration'] = $data['duration'];
			$format[]           = '%s';
		}

		if ( $update ) {
			$wpdb->update( $table, $update, array( 'id' => $id ), $format, array( '%d' ) );
		}

		$row      = $wpdb->get_row( $wpdb->prepare( 'SELECT t.*, p.name AS project_name FROM ' . self::table( 'project_tasks' ) . ' t INNER JOIN ' . self::table( 'projects' ) . ' p ON p.id = t.project_id WHERE t.id = %d', $id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL
		$user_ids = $row['assignee'] ? array( (int) $row['assignee'] ) : array();
		$users    = self::users_map( $user_ids );

		DPC_POS_Audit::record(
			array(
				'user_id'   => $actor,
				'action'    => 'update_task',
				'module'    => 'projects',
				'resource'  => 'task',
				'record_id' => $id,
				'old_value' => array( 'status' => $old['status'], 'assignee' => $old['assignee'] ),
				'new_value' => array(
					'status'   => isset( $update['status'] ) ? $update['status'] : $old['status'],
					'assignee' => isset( $update['assignee'] ) ? $update['assignee'] : (int) $old['assignee'],
				),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => $actor,
				'module'      => 'projects',
				'action'      => 'task.updated',
				'description' => sprintf(
					'Updated task "%s" in project %s - status: %s',
					$old['title'],
					$row['project_name'],
					isset( $update['status'] ) ? $update['status'] : $old['status']
				),
				'record_id'   => $id,
			)
		);

		return rest_ensure_response( self::task_payload( $row, $users ) );
	}

	/**
	 * DELETE /tasks/{id} — delete a task.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_task( $request, $auth ) {
		global $wpdb;
		$table = self::table( 'project_tasks' );
		$id    = (int) $request->get_param( 'id' );
		$actor = isset( $auth['user']['id'] ) ? (int) $auth['user']['id'] : 0;
		$old   = $wpdb->get_row( $wpdb->prepare( "SELECT t.*, p.name AS project_name FROM {$table} t INNER JOIN " . self::table( 'projects' ) . " p ON p.id = t.project_id WHERE t.id = %d", $id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $old ) {
			return DPC_POS_Auth::error( 'dpc_task_not_found', 'Task not found.', 404 );
		}
		$wpdb->delete( $table, array( 'id' => $id ), array( '%d' ) );

		DPC_POS_Audit::record(
			array(
				'user_id'   => $actor,
				'action'    => 'delete_task',
				'module'    => 'projects',
				'resource'  => 'task',
				'record_id' => $id,
				'old_value' => array( 'title' => $old['title'] ),
			)
		);
		DPC_POS_Audit::activity(
			array(
				'user_id'     => $actor,
				'module'      => 'projects',
				'action'      => 'task.deleted',
				'description' => sprintf(
					'Deleted task "%s" from project %s',
					$old['title'],
					$old['project_name']
				),
				'record_id'   => $id,
			)
		);

		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * GET /projects/team — DPC users available as project members.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function team_members( $request, $auth ) {
		global $wpdb;
		$table = self::table( 'users' );
		$rows  = $wpdb->get_results( "SELECT id, display_name, email, avatar_url, status FROM {$table} ORDER BY id ASC", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		$items = array();
		foreach ( (array) $rows as $row ) {
			$uid   = (int) $row['id'];
			$name  = sanitize_text_field( (string) $row['display_name'] );
			$roles = DPC_POS_RBAC::get_user_roles( $uid );
			$slug  = $roles ? $roles[0] : '';
			$role  = $slug;
			$rrow  = $slug ? DPC_POS_RBAC::get_role_by_slug( $slug ) : null;
			if ( $rrow ) {
				$role = (string) $rrow['name'];
			}
			$items[] = array(
				'id'         => $uid,
				'name'       => $name,
				'email'      => (string) $row['email'],
				'role'       => $role,
				'role_slug'  => $slug,
				'status'     => (string) $row['status'],
				'initials'   => self::initials( $name ),
				'avatar_url' => isset( $row['avatar_url'] ) ? (string) $row['avatar_url'] : '',
			);
		}
		return rest_ensure_response( array( 'items' => $items ) );
	}

	/**
	 * Reads and normalizes project fields from the request.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param bool            $partial True for updates (keeps existing values).
	 * @return array
	 */
	private static function sanitize_project( $request, $partial ) {
		return array(
			'name'          => sanitize_text_field( (string) $request->get_param( 'name' ) ),
			'customer'      => sanitize_text_field( (string) $request->get_param( 'customer' ) ),
			'customer_type' => sanitize_key( (string) $request->get_param( 'customer_type' ) ),
			'status'        => sanitize_key( (string) $request->get_param( 'status' ) ),
			'start_date'    => sanitize_text_field( (string) $request->get_param( 'start_date' ) ),
			'due_date'      => sanitize_text_field( (string) $request->get_param( 'due_date' ) ),
			'owner'         => (int) $request->get_param( 'owner' ),
			'description'   => sanitize_textarea_field( (string) $request->get_param( 'description' ) ),
			'scope'         => sanitize_textarea_field( (string) $request->get_param( 'scope' ) ),
			'value'         => (float) $request->get_param( 'value' ),
		);
	}

	/**
	 * Validates normalized project data; returns a message or empty string.
	 *
	 * @param array $data Normalized project data.
	 * @return string
	 */
	private static function validate_project( array $data ) {
		if ( '' === $data['name'] ) {
			return 'Project name is required.';
		}
		if ( '' === $data['start_date'] ) {
			return 'Start date is required.';
		}
		if ( '' === $data['due_date'] ) {
			return 'Due date is required.';
		}
		if ( ! in_array( $data['status'], self::statuses(), true ) ) {
			return 'Invalid project status.';
		}
		if ( $data['customer_type'] && ! in_array( $data['customer_type'], self::customer_types(), true ) ) {
			return 'Invalid customer category.';
		}
		return '';
	}

	/**
	 * Reads and normalizes task fields from the request.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param bool            $partial True for updates.
	 * @return array
	 */
	private static function sanitize_task( $request, $partial ) {
		return array(
			'title'    => sanitize_text_field( (string) $request->get_param( 'title' ) ),
			'assignee' => (int) $request->get_param( 'assignee' ),
			'status'   => sanitize_key( (string) $request->get_param( 'status' ) ),
			'due_date' => sanitize_text_field( (string) $request->get_param( 'due_date' ) ),
			'duration' => sanitize_text_field( (string) $request->get_param( 'duration' ) ),
		);
	}

	/**
	 * Re-reads a single project and returns its API payload.
	 *
	 * @param int $id Project id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function get_project_response( $id ) {
		$result = self::projects( '', '' );
		foreach ( $result['items'] as $item ) {
			if ( (int) $item['id'] === (int) $id ) {
				return rest_ensure_response( $item );
			}
		}
		return DPC_POS_Auth::error( 'dpc_project_not_found', 'Project not found.', 404 );
	}
}