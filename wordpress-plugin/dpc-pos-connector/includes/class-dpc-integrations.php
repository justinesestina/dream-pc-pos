<?php
/**
 * Integrations management (WooCommerce, WordPress media, Supabase) plus the
 * wp-admin bootstrap screen for the first Owner account.
 *
 * Secrets are encrypted at rest with {@see DPC_POS_Crypto} and are only ever
 * returned masked. Every change is audited.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Integration settings, connection tests and the admin screen.
 */
class DPC_POS_Integrations {

	/**
	 * Integration definitions: type => [label, fields, secret fields].
	 *
	 * @return array<string,array{label:string,fields:array<string,string>,secrets:string[]}>
	 */
	public static function definitions() {
		return array(
			'wordpress'   => array(
				'label'   => 'WordPress Media',
				'fields'  => array( 'username' => 'Application username' ),
				'secrets' => array( 'password' => 'Application password' ),
			),
			'woocommerce' => array(
				'label'   => 'WooCommerce',
				'fields'  => array( 'url' => 'Store URL' ),
				'secrets' => array(
					'key'    => 'Consumer key',
					'secret' => 'Consumer secret',
				),
			),
			'supabase'    => array(
				'label'   => 'Supabase (optional)',
				'fields'  => array( 'url' => 'Project URL' ),
				'secrets' => array( 'service_key' => 'Service role key' ),
			),
		);
	}

	/**
	 * Setting key for an integration field.
	 *
	 * @param string $type  Integration type.
	 * @param string $field Field name.
	 * @return string
	 */
	private static function setting_key( $type, $field ) {
		return 'integration_' . $type . '_' . $field;
	}

	/**
	 * Reads a plain integration field.
	 *
	 * @param string $type    Integration type.
	 * @param string $field   Field name.
	 * @param string $default Default.
	 * @return string
	 */
	public static function get_field( $type, $field, $default = '' ) {
		$value = DPC_POS_Security::get_setting( self::setting_key( $type, $field ), $default );
		return is_string( $value ) ? $value : $default;
	}

	/**
	 * Reads and decrypts an integration secret.
	 *
	 * @param string $type  Integration type.
	 * @param string $field Field name.
	 * @return string
	 */
	public static function get_secret( $type, $field ) {
		$stored = DPC_POS_Security::get_setting( self::setting_key( $type, $field ), '' );
		return is_string( $stored ) && '' !== $stored ? DPC_POS_Crypto::decrypt( $stored ) : '';
	}

	/**
	 * True when every required field/secret for a type is present.
	 *
	 * @param string $type Integration type.
	 * @return bool
	 */
	public static function is_configured( $type ) {
		$def = self::definitions()[ $type ] ?? null;
		if ( ! $def ) {
			return false;
		}
		foreach ( array_keys( $def['fields'] ) as $field ) {
			if ( '' === trim( (string) self::get_field( $type, $field ) ) ) {
				return false;
			}
		}
		foreach ( array_keys( $def['secrets'] ) as $field ) {
			if ( '' === self::get_secret( $type, $field ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * The frontend/app origin used for reset links and CORS.
	 *
	 * @return string
	 */
	public static function app_url() {
		return (string) self::get_field( 'app', 'url', home_url() );
	}

	/**
	 * Origins allowed to call the API with credentials.
	 *
	 * @return string[]
	 */
	public static function allowed_origins() {
		$origins = array( self::app_url() );
		$stored  = DPC_POS_Security::get_setting( 'integration_app_origins', array() );
		if ( is_array( $stored ) ) {
			$origins = array_merge( $origins, $stored );
		}
		$origins = array_merge( $origins, (array) apply_filters( 'dpc_pos_allowed_origins', array() ) );

		$clean = array();
		foreach ( $origins as $origin ) {
			$origin = untrailingslashit( trim( (string) $origin ) );
			if ( '' !== $origin && ! in_array( $origin, $clean, true ) ) {
				$clean[] = $origin;
			}
		}
		return $clean;
	}

	/**
	 * GET /integrations — masked status for every integration.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function status( $request, $auth ) {
		$types    = self::definitions();
		$types['app'] = array(
			'label'   => 'Application',
			'fields'  => array( 'url' => 'App URL' ),
			'secrets' => array(),
		);
		$response = array();
		foreach ( $types as $type => $def ) {
			$fields = array();
			foreach ( array_keys( $def['fields'] ) as $field ) {
				$fields[ $field ] = self::get_field( $type, $field );
			}
			$secrets = array();
			foreach ( array_keys( $def['secrets'] ) as $field ) {
				$secrets[ $field ] = DPC_POS_Crypto::mask( self::get_secret( $type, $field ) );
			}
			$response[ $type ] = array(
				'label'       => $def['label'],
				'configured'  => isset( self::definitions()[ $type ] ) ? self::is_configured( $type ) : ( '' !== self::app_url() ),
				'fields'      => $fields,
				'secrets'     => $secrets,
				'last_test'   => DPC_POS_Security::get_setting( 'integration_last_test_' . $type, null ),
				'last_tested' => DPC_POS_Security::get_setting( 'integration_last_tested_at', null ),
			);
		}
		return rest_ensure_response( array( 'items' => $response ) );
	}

	/**
	 * POST /integrations/{type} — save/replace credentials.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function save( $request, $auth ) {
		$type = sanitize_key( (string) $request->get_param( 'type' ) );
		if ( 'app' === $type ) {
			$url = esc_url_raw( (string) $request->get_param( 'url' ) );
			if ( '' === $url ) {
				return DPC_POS_Auth::error( 'dpc_invalid_url', 'A valid app URL is required.', 400 );
			}
			DPC_POS_Security::set_setting( self::setting_key( 'app', 'url' ), $url );
			$origins = (array) $request->get_param( 'allowed_origins' );
			if ( $origins ) {
				DPC_POS_Security::set_setting( 'integration_app_origins', array_map( 'esc_url_raw', $origins ) );
			}
			DPC_POS_Audit::record(
				array(
					'user_id'   => (int) $auth['user']['id'],
					'action'    => 'integration.updated',
					'module'    => 'integrations',
					'resource'  => 'integration',
					'record_id' => 'app',
				)
			);
			return rest_ensure_response( array( 'ok' => true ) );
		}

		$def = self::definitions()[ $type ] ?? null;
		if ( ! $def ) {
			return DPC_POS_Auth::error( 'dpc_invalid_integration', 'Unknown integration type.', 400 );
		}

		$old = array();
		foreach ( array_keys( $def['fields'] ) as $field ) {
			$value = $request->get_param( $field );
			if ( null === $value ) {
				continue;
			}
			$value = ( 'url' === $field ) ? esc_url_raw( (string) $value ) : sanitize_text_field( (string) $value );
			$old[ $field ] = self::get_field( $type, $field );
			DPC_POS_Security::set_setting( self::setting_key( $type, $field ), $value );
		}
		foreach ( array_keys( $def['secrets'] ) as $field ) {
			$value = $request->get_param( $field );
			if ( null === $value || '' === (string) $value ) {
				continue;
			}
			DPC_POS_Security::set_setting( self::setting_key( $type, $field ), DPC_POS_Crypto::encrypt( (string) $value ) );
			$old[ $field ] = '••••';
		}

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'integration.updated',
				'module'    => 'integrations',
				'resource'  => 'integration',
				'record_id' => $type,
				'old_value' => $old,
			)
		);

		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * POST /integrations/{type}/test — active connection test.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test( $request, $auth ) {
		$type   = sanitize_key( (string) $request->get_param( 'type' ) );
		$result = self::run_test( $type );

		DPC_POS_Security::set_setting(
			'integration_last_test_' . $type,
			array(
				'ok'        => $result['ok'],
				'message'   => $result['message'],
				'checked_at' => gmdate( 'c' ),
			)
		);
		DPC_POS_Security::set_setting( 'integration_last_tested_at', gmdate( 'c' ) );

		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'integration.tested',
				'module'    => 'integrations',
				'resource'  => 'integration',
				'record_id' => $type,
				'result'    => $result['ok'] ? 'success' : 'failure',
			)
		);

		if ( ! $result['ok'] ) {
			return DPC_POS_Auth::error( 'dpc_integration_failed', $result['message'], 400 );
		}
		return rest_ensure_response( $result );
	}

	/**
	 * POST /integrations/{type}/revoke — clears stored credentials.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function revoke( $request, $auth ) {
		$type = sanitize_key( (string) $request->get_param( 'type' ) );
		$def  = self::definitions()[ $type ] ?? null;
		if ( ! $def ) {
			return DPC_POS_Auth::error( 'dpc_invalid_integration', 'Unknown integration type.', 400 );
		}
		foreach ( array_keys( $def['fields'] ) as $field ) {
			DPC_POS_Security::set_setting( self::setting_key( $type, $field ), '' );
		}
		foreach ( array_keys( $def['secrets'] ) as $field ) {
			DPC_POS_Security::set_setting( self::setting_key( $type, $field ), '' );
		}
		DPC_POS_Audit::record(
			array(
				'user_id'   => (int) $auth['user']['id'],
				'action'    => 'integration.revoked',
				'module'    => 'integrations',
				'resource'  => 'integration',
				'record_id' => $type,
			)
		);
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * Performs the actual connection test.
	 *
	 * @param string $type Integration type.
	 * @return array{ok:bool,message:string,details?:mixed}
	 */
	public static function run_test( $type ) {
		switch ( $type ) {
			case 'wordpress':
				return self::test_wordpress();
			case 'woocommerce':
				return self::test_woocommerce();
			case 'supabase':
				return self::test_supabase();
			default:
				return array(
					'ok'      => false,
					'message' => 'Unknown integration type.',
				);
		}
	}

	/**
	 * Tests the WordPress media credentials against /wp/v2/users/me.
	 *
	 * @return array{ok:bool,message:string,details?:mixed}
	 */
	private static function test_wordpress() {
		$username = self::get_field( 'wordpress', 'username' );
		$password = self::get_secret( 'wordpress', 'password' );
		if ( '' === $username || '' === $password ) {
			return array(
				'ok'      => false,
				'message' => 'WordPress media credentials are not configured.',
			);
		}
		$response = wp_remote_get(
			rest_url( 'wp/v2/users/me' ),
			array(
				'timeout' => 15,
				'headers' => array(
					'Authorization' => 'Basic ' . base64_encode( $username . ':' . $password ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
				),
			)
		);
		return self::interpret( $response, 'WordPress media connection OK.' );
	}

	/**
	 * Tests WooCommerce credentials against the system status endpoint.
	 *
	 * @return array{ok:bool,message:string,details?:mixed}
	 */
	private static function test_woocommerce() {
		$url    = untrailingslashit( self::get_field( 'woocommerce', 'url' ) );
		$key    = self::get_secret( 'woocommerce', 'key' );
		$secret = self::get_secret( 'woocommerce', 'secret' );
		if ( '' === $url || '' === $key || '' === $secret ) {
			return array(
				'ok'      => false,
				'message' => 'WooCommerce credentials are not configured.',
			);
		}
		$response = wp_remote_get(
			$url . '/wp-json/wc/v3/system_status',
			array(
				'timeout' => 20,
				'headers' => array(
					'Authorization' => 'Basic ' . base64_encode( $key . ':' . $secret ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
				),
			)
		);
		return self::interpret( $response, 'WooCommerce connection OK.' );
	}

	/**
	 * Tests the optional Supabase service credentials.
	 *
	 * @return array{ok:bool,message:string,details?:mixed}
	 */
	private static function test_supabase() {
		$url = untrailingslashit( self::get_field( 'supabase', 'url' ) );
		$key = self::get_secret( 'supabase', 'service_key' );
		if ( '' === $url || '' === $key ) {
			return array(
				'ok'      => false,
				'message' => 'Supabase is not configured (optional).',
			);
		}
		$response = wp_remote_get(
			$url . '/rest/v1/',
			array(
				'timeout' => 15,
				'headers' => array(
					'apikey'        => $key,
					'Authorization' => 'Bearer ' . $key,
				),
			)
		);
		return self::interpret( $response, 'Supabase connection OK.' );
	}

	/**
	 * Normalizes a wp_remote_* response into a result array.
	 *
	 * @param array|WP_Error $response HTTP response.
	 * @param string         $ok_message Success message.
	 * @return array{ok:bool,message:string,details?:mixed}
	 */
	private static function interpret( $response, $ok_message ) {
		if ( is_wp_error( $response ) ) {
			return array(
				'ok'      => false,
				'message' => $response->get_error_message(),
			);
		}
		$code = (int) wp_remote_retrieve_response_code( $response );
		if ( $code >= 200 && $code < 300 ) {
			return array(
				'ok'      => true,
				'message' => $ok_message,
				'details' => array( 'status' => $code ),
			);
		}
		return array(
			'ok'      => false,
			'message' => sprintf( 'Remote server responded with HTTP %d.', $code ),
		);
	}

	/**
	 * Registers the wp-admin menu entry.
	 *
	 * @return void
	 */
	public function register_menu() {
		add_menu_page(
			'DPC POS',
			'DPC POS',
			'manage_options',
			'dpc-pos',
			array( $this, 'render_admin_page' ),
			'dashicons-store',
			56
		);
	}

	/**
	 * Handles the wp-admin POST forms (nonce + capability checked).
	 *
	 * @return void
	 */
	public function handle_admin_actions() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( empty( $_POST['dpc_pos_action'] ) ) {
			return;
		}
		$action = sanitize_key( wp_unslash( $_POST['dpc_pos_action'] ) );
		check_admin_referer( 'dpc_pos_admin_' . $action );

		if ( 'set_owner_password' === $action ) {
			$this->handle_set_owner_password();
		} elseif ( 'save_integration' === $action ) {
			$this->handle_save_integration();
		}

		wp_safe_redirect( admin_url( 'admin.php?page=dpc-pos&updated=1' ) );
		exit;
	}

	/**
	 * Sets the DPC password for an account (used to bootstrap the Owner).
	 *
	 * @return void
	 */
	private function handle_set_owner_password() {
		global $wpdb;
		$user_id = (int) ( $_POST['user_id'] ?? 0 );
		$password = (string) ( $_POST['new_password'] ?? '' );
		$table    = DPC_POS_RBAC::table( 'users' );
		$user     = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $user_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $user ) {
			return;
		}
		if ( strlen( $password ) < DPC_POS_Auth::min_password_length() ) {
			return;
		}
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
		DPC_POS_Audit::record(
			array(
				'user_id'   => get_current_user_id(),
				'action'    => 'user.password_set',
				'module'    => 'users',
				'resource'  => 'user',
				'record_id' => $user_id,
			)
		);
	}

	/**
	 * Saves integration settings from the wp-admin form.
	 *
	 * @return void
	 */
	private function handle_save_integration() {
		$type = sanitize_key( $_POST['integration_type'] ?? '' );

		// The Application pseudo-integration stores the App URL + allowed origins.
		if ( 'app' === $type ) {
			if ( isset( $_POST['url'] ) ) {
				DPC_POS_Security::set_setting( self::setting_key( 'app', 'url' ), esc_url_raw( wp_unslash( $_POST['url'] ) ) );
			}
			if ( isset( $_POST['allowed_origins'] ) ) {
				$lines   = preg_split( '/\r\n|\r|\n/', (string) wp_unslash( $_POST['allowed_origins'] ) );
				$origins = array();
				foreach ( (array) $lines as $line ) {
					$origin = untrailingslashit( trim( (string) $line ) );
					if ( '' !== $origin && ! in_array( $origin, $origins, true ) ) {
						$origins[] = esc_url_raw( $origin );
					}
				}
				DPC_POS_Security::set_setting( 'integration_app_origins', $origins );
			}
			DPC_POS_Audit::record(
				array(
					'user_id'   => get_current_user_id(),
					'action'    => 'integration.updated',
					'module'    => 'integrations',
					'resource'  => 'integration',
					'record_id' => 'app',
				)
			);
			return;
		}

		if ( ! isset( self::definitions()[ $type ] ) ) {
			return;
		}
		$def = self::definitions()[ $type ];
		foreach ( array_keys( $def['fields'] ) as $field ) {
			if ( isset( $_POST[ $field ] ) ) {
				$value = ( 'url' === $field ) ? esc_url_raw( wp_unslash( $_POST[ $field ] ) ) : sanitize_text_field( wp_unslash( $_POST[ $field ] ) );
				DPC_POS_Security::set_setting( self::setting_key( $type, $field ), $value );
			}
		}
		foreach ( array_keys( $def['secrets'] ) as $field ) {
			if ( ! empty( $_POST[ $field ] ) ) {
				DPC_POS_Security::set_setting( self::setting_key( $type, $field ), DPC_POS_Crypto::encrypt( (string) wp_unslash( $_POST[ $field ] ) ) );
			}
		}
	}

	/**
	 * Renders the wp-admin screen.
	 *
	 * @return void
	 */
	public function render_admin_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		global $wpdb;
		$users_table = DPC_POS_RBAC::table( 'users' );
		$owners      = $wpdb->get_results( "SELECT id, username, email, display_name, password_hash FROM {$users_table} WHERE status = 'active' ORDER BY id ASC", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$app_url       = self::app_url();
		$extra_origins = DPC_POS_Security::get_setting( 'integration_app_origins', array() );
		if ( ! is_array( $extra_origins ) ) {
			$extra_origins = array();
		}
		?>
		<div class="wrap">
			<h1>DPC POS</h1>
			<?php if ( isset( $_GET['updated'] ) ) : ?>
				<div class="notice notice-success is-dismissible"><p>Saved.</p></div>
			<?php endif; ?>

			<h2>DPC POS accounts</h2>
			<p>Set a DPC POS password to bootstrap an account (the first Owner starts without one).</p>
			<table class="widefat striped" style="max-width:900px">
				<thead><tr><th>User</th><th>Email</th><th>Roles</th><th>Password set</th><th>Set password</th></tr></thead>
				<tbody>
				<?php foreach ( (array) $owners as $owner ) : ?>
					<tr>
						<td><?php echo esc_html( $owner['display_name'] ? $owner['display_name'] : $owner['username'] ); ?></td>
						<td><?php echo esc_html( $owner['email'] ); ?></td>
						<td><?php echo esc_html( implode( ', ', DPC_POS_RBAC::get_user_roles( (int) $owner['id'] ) ) ); ?></td>
						<td><?php echo '' !== $owner['password_hash'] ? 'Yes' : '<strong>No</strong>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
						<td>
							<form method="post">
								<?php wp_nonce_field( 'dpc_pos_admin_set_owner_password' ); ?>
								<input type="hidden" name="dpc_pos_action" value="set_owner_password" />
								<input type="hidden" name="user_id" value="<?php echo (int) $owner['id']; ?>" />
								<input type="password" name="new_password" placeholder="New password" autocomplete="new-password" />
								<button class="button button-secondary">Update</button>
							</form>
						</td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>

			<h2>Application</h2>
			<form method="post">
				<?php wp_nonce_field( 'dpc_pos_admin_save_integration' ); ?>
				<input type="hidden" name="dpc_pos_action" value="save_integration" />
				<input type="hidden" name="integration_type" value="app" />
				<table class="form-table" role="presentation">
					<tr><th scope="row"><label for="dpc-app-url">App URL</label></th>
						<td><input name="url" id="dpc-app-url" type="url" class="regular-text" value="<?php echo esc_attr( $app_url ); ?>" /></td></tr>
					<tr><th scope="row"><label for="dpc-app-origins">Additional allowed origins</label></th>
						<td><textarea name="allowed_origins" id="dpc-app-origins" rows="3" class="large-text code" placeholder="http://localhost:8080"><?php echo esc_textarea( implode( "\n", $extra_origins ) ); ?></textarea>
						<p class="description">One origin per line. Allowed to call the API with credentials (CORS + cookies), e.g. a local dev server.</p></td></tr>
				</table>
				<?php submit_button( 'Save application' ); ?>
			</form>

			<h2>Integrations</h2>
			<?php foreach ( self::definitions() as $type => $def ) : ?>
				<h3><?php echo esc_html( $def['label'] ); ?>
					<?php echo self::is_configured( $type ) ? '<span style="color:#46b450">● configured</span>' : '<span style="color:#dc3232">● not configured</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</h3>
				<form method="post">
					<?php wp_nonce_field( 'dpc_pos_admin_save_integration' ); ?>
					<input type="hidden" name="dpc_pos_action" value="save_integration" />
					<input type="hidden" name="integration_type" value="<?php echo esc_attr( $type ); ?>" />
					<table class="form-table" role="presentation">
						<?php foreach ( $def['fields'] as $field => $label ) : ?>
							<tr><th scope="row"><label><?php echo esc_html( $label ); ?></label></th>
								<td><input name="<?php echo esc_attr( $field ); ?>" type="text" class="regular-text" value="<?php echo esc_attr( self::get_field( $type, $field ) ); ?>" /></td></tr>
						<?php endforeach; ?>
						<?php foreach ( $def['secrets'] as $field => $label ) : ?>
							<tr><th scope="row"><label><?php echo esc_html( $label ); ?></label></th>
								<td><input name="<?php echo esc_attr( $field ); ?>" type="password" class="regular-text" placeholder="<?php echo esc_attr( DPC_POS_Crypto::mask( self::get_secret( $type, $field ) ) ); ?>" autocomplete="new-password" />
								<p class="description">Leave blank to keep the stored value.</p></td></tr>
						<?php endforeach; ?>
					</table>
					<?php submit_button( 'Save ' . $def['label'] ); ?>
				</form>
			<?php endforeach; ?>
		</div>
		<?php
	}
}
