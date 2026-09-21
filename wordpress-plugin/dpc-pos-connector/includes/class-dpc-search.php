<?php
/**
 * Global search across products, orders, quotes and customers.
 *
 * A lightweight port of the previous Node backend's search route: scan the
 * live WooCommerce-backed objects and return routeable command-palette results.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

require_once dirname( __FILE__ ) . '/class-dpc-rbac.php';

/**
 * Global search handler.
 */
class DPC_POS_Search {

	/**
	 * GET /search?q=...
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response
	 */
	public static function search( $request, $auth ) {
		$q = trim( (string) $request->get_param( 'q' ) );
		if ( '' === $q ) {
			return self::result( array() );
		}
		$query  = strtolower( $q );
		$result = array();

		$nav_pages = array(
			array( 'id' => 'dashboard', 'type' => 'dashboard', 'label' => 'Dashboard', 'subtitle' => 'Overview and KPIs', 'route' => '/dashboard' ),
			array( 'id' => 'orders', 'type' => 'page', 'label' => 'Orders', 'subtitle' => 'Sale history and fulfilment', 'route' => '/orders' ),
			array( 'id' => 'customers', 'type' => 'page', 'label' => 'Customers', 'subtitle' => 'People and accounts', 'route' => '/customers' ),
			array( 'id' => 'products', 'type' => 'page', 'label' => 'Products', 'subtitle' => 'Catalog and inventory', 'route' => '/products' ),
			array( 'id' => 'quotes', 'type' => 'page', 'label' => 'Quotes', 'subtitle' => 'Customer quotes and approvals', 'route' => '/quotes' ),
			array( 'id' => 'pos', 'type' => 'page', 'label' => 'Point of Sale', 'subtitle' => 'New sale checkout', 'route' => '/pos' ),
			array( 'id' => 'users', 'type' => 'page', 'label' => 'Users', 'subtitle' => 'User management and roles', 'route' => '/administration/users' ),
			array( 'id' => 'projects', 'type' => 'page', 'label' => 'Projects', 'subtitle' => 'Project management and tasks', 'route' => '/projects' ),
		);
		foreach ( $nav_pages as $page ) {
			$haystack = strtolower( $page['label'] . ' ' . $page['subtitle'] . ' ' . $page['type'] . ' ' . $page['route'] );
			if ( false !== strpos( $haystack, $query ) ) {
				$result[] = $page;
			}
		}

		if ( class_exists( 'WooCommerce' ) && function_exists( 'wc_get_products' ) ) {
			$products = wc_get_products(
				array(
					'limit'  => -1,
					'status' => array( 'publish' ),
				)
			);
			foreach ( (array) $products as $product ) {
				if ( ! $product instanceof WC_Product ) {
					continue;
				}
				$brand     = (string) $product->get_meta( '_dpc_brand', true );
				$haystack  = strtolower(
					implode(
						' ',
						array_filter(
							array(
								$product->get_id(),
								$product->get_name(),
								$product->get_sku(),
								$product->get_slug(),
								$brand,
							)
						)
					)
				);
				foreach ( $product->get_attributes() as $attribute ) {
					if ( ! $attribute instanceof WC_Product_Attribute ) {
						continue;
					}
					$haystack .= ' ' . strtolower( wc_attribute_label( $attribute->get_name() ) );
					foreach ( (array) $attribute->get_options() as $option ) {
						$haystack .= ' ' . strtolower( (string) $option );
					}
				}
				if ( false === strpos( $haystack, $query ) ) {
					continue;
				}
				$entry = array(
					'id'       => 'product-' . $product->get_id(),
					'type'     => 'products',
					'label'    => $product->get_name(),
					'subtitle' => ( $product->get_sku() ? $product->get_sku() : $product->get_id() ) . ' | ' . ( '' !== $brand ? $brand : 'General' ),
					'route'    => '/products/' . $product->get_id(),
				);
				$image_id = $product->get_image_id();
				if ( $image_id ) {
					$entry['imageUrl'] = wp_get_attachment_image_url( $image_id, 'full' );
				}
				$result[] = $entry;
			}

			$orders = wc_get_orders(
				array(
					'limit'  => -1,
					'type'   => 'shop_order',
					'status' => array_keys( wc_get_order_statuses() ),
				)
			);
			foreach ( (array) $orders as $order ) {
				if ( ! $order instanceof WC_Order ) {
					continue;
				}
				$is_quote = 'yes' === (string) $order->get_meta( '_dpc_is_quote', true );
				$name     = trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() );
				if ( '' === $name ) {
					$name = $order->get_billing_email() ? $order->get_billing_email() : 'Guest';
				}
				$item_names = '';
				foreach ( $order->get_items() as $item ) {
					$item_names .= ' ' . $item->get_name();
				}
				$haystack = strtolower( $order->get_id() . ' ' . $name . ' ' . $order->get_status() . ' ' . $item_names );
				if ( false === strpos( $haystack, $query ) ) {
					continue;
				}
				$result[] = array(
					'id'       => ( $is_quote ? 'quote-' : 'order-' ) . $order->get_id(),
					'type'     => $is_quote ? 'quotes' : 'orders',
					'label'    => ( $is_quote ? 'Quote ' : 'Order ' ) . $order->get_id(),
					'subtitle' => $name . ' | ' . $order->get_status(),
					'route'    => $is_quote ? '/quotes/' . $order->get_id() : '/orders/' . $order->get_id(),
				);
			}
		}

		// Search DPC users
		global $wpdb;
		$users_table = DPC_POS_RBAC::table( 'users' );
		$like = '%' . $wpdb->esc_like( $q ) . '%';
		$user_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, username, email, display_name, avatar_url, phone FROM {$users_table} WHERE username LIKE %s OR email LIKE %s OR display_name LIKE %s OR phone LIKE %s LIMIT 10",
				$like,
				$like,
				$like,
				$like
			),
			ARRAY_A
		);
		foreach ( (array) $user_rows as $user_row ) {
			$phone = isset( $user_row['phone'] ) ? $user_row['phone'] : '';
			$haystack = strtolower( $user_row['username'] . ' ' . $user_row['email'] . ' ' . $user_row['display_name'] . ' ' . $phone );
			if ( false !== strpos( $haystack, $query ) ) {
				$entry = array(
					'id'       => 'user-' . $user_row['id'],
					'type'     => 'users',
					'label'    => $user_row['display_name'],
					'subtitle' => $user_row['username'] . ' | ' . $user_row['email'],
					'route'    => '/administration/users/' . $user_row['id'] . '/profile',
				);
				if ( ! empty( $user_row['avatar_url'] ) ) {
					$entry['imageUrl'] = $user_row['avatar_url'];
				}
				$result[] = $entry;
			}
		}

		// Search DPC projects
		$projects_table = DPC_POS_RBAC::table( 'projects' );
		$project_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, name, status, customer FROM {$projects_table} WHERE name LIKE %s OR customer LIKE %s LIMIT 10",
				$like,
				$like
			),
			ARRAY_A
		);
		foreach ( (array) $project_rows as $project_row ) {
			$customer = isset( $project_row['customer'] ) ? $project_row['customer'] : '';
			$haystack = strtolower( $project_row['name'] . ' ' . $customer . ' ' . $project_row['status'] );
			if ( false !== strpos( $haystack, $query ) ) {
				$result[] = array(
					'id'       => 'project-' . $project_row['id'],
					'type'     => 'projects',
					'label'    => $project_row['name'],
					'subtitle' => $customer ? $customer . ' | ' . $project_row['status'] : $project_row['status'],
					'route'    => '/projects?projectId=' . $project_row['id'],
				);
			}
		}

		return self::result( self::dedupe( $result, 16 ) );
	}

	/**
	 * Dedupes results by type:id and caps the length.
	 *
	 * @param array $items Results.
	 * @param int   $limit Max results.
	 * @return array
	 */
	private static function dedupe( array $items, $limit ) {
		$seen = array();
		$out  = array();
		foreach ( $items as $item ) {
			$key = $item['type'] . ':' . $item['id'];
			if ( isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$out[]        = $item;
			if ( count( $out ) >= $limit ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * Envelope wrapper.
	 *
	 * @param array $items Items.
	 * @return WP_REST_Response
	 */
	private static function result( array $items ) {
		return rest_ensure_response(
			array(
				'data' => $items,
				'meta' => array(
					'page'    => 1,
					'perPage' => count( $items ),
					'total'   => count( $items ),
				),
			)
		);
	}
}