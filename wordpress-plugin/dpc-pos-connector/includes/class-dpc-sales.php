<?php
/**
 * Sales data served straight from WooCommerce: customers, orders, quotations
 * and supplier records.
 *
 * Quotations and suppliers are WooCommerce orders tagged in order meta (the
 * same convention the previous Node backend used), so they need no extra table.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Read access to customers, orders, quotes and suppliers.
 */
class DPC_POS_Sales {

	/**
	 * Order meta key marking a non-sales record.
	 */
	const RECORD_KEY = '_dpc_record';

	/**
	 * Quote statuses accepted by the POS.
	 *
	 * @return string[]
	 */
	private static function quote_statuses() {
		return array( 'draft', 'sent', 'pending', 'approved', 'rejected', 'expired', 'converted' );
	}

	/**
	 * True when WooCommerce is available.
	 *
	 * @return bool
	 */
	private static function wc_active() {
		return class_exists( 'WooCommerce' ) && function_exists( 'wc_get_orders' );
	}

	/**
	 * Standard error for a missing WooCommerce.
	 *
	 * @return WP_Error
	 */
	private static function no_wc() {
		return new WP_Error( 'dpc_woocommerce_missing', 'WooCommerce is not active.', array( 'status' => 503 ) );
	}

	/**
	 * Wraps a payload in the list envelope used by the frontend.
	 *
	 * @param array $items List of DTOs.
	 * @return WP_REST_Response
	 */
	private static function envelope( array $items ) {
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

	/**
	 * Every shop order, newest first.
	 *
	 * @return WC_Order[]
	 */
	private static function all_orders() {
		$statuses = array();
		foreach ( array_keys( wc_get_order_statuses() ) as $status ) {
			$statuses[] = 0 === strpos( $status, 'wc-' ) ? substr( $status, 3 ) : $status;
		}

		$orders = wc_get_orders(
			array(
				'limit'   => -1,
				'type'    => 'shop_order',
				'status'  => $statuses,
				'orderby' => 'date',
				'order'   => 'DESC',
			)
		);

		$out = array();
		foreach ( (array) $orders as $order ) {
			if ( $order instanceof WC_Order ) {
				$out[] = $order;
			}
		}
		return $out;
	}

	/**
	 * Reads a string order meta value.
	 *
	 * @param WC_Order $order   Order.
	 * @param string   $key     Meta key.
	 * @param string   $default Fallback.
	 * @return string
	 */
	private static function text( $order, $key, $default = '' ) {
		$value = $order->get_meta( $key, true );
		return ( '' === $value || null === $value ) ? $default : (string) $value;
	}

	/**
	 * Reads a numeric order meta value.
	 *
	 * @param WC_Order $order   Order.
	 * @param string   $key     Meta key.
	 * @param float    $default Fallback.
	 * @return float
	 */
	private static function number( $order, $key, $default = 0.0 ) {
		$value = $order->get_meta( $key, true );
		return is_numeric( $value ) ? (float) $value : $default;
	}

	/**
	 * JSON-decodes an order meta value that may already be an array.
	 *
	 * @param WC_Order $order Order.
	 * @param string   $key   Meta key.
	 * @return array
	 */
	private static function json_list( $order, $key ) {
		$raw = $order->get_meta( $key, true );
		if ( is_array( $raw ) ) {
			return $raw;
		}
		if ( ! is_string( $raw ) || '' === $raw ) {
			return array();
		}
		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) ? $decoded : array();
	}

	/**
	 * True when an order is an internal record, not a sale.
	 *
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	private static function is_internal( $order ) {
		if ( 'yes' === self::text( $order, '_dpc_is_quote' ) ) {
			return true;
		}
		$record = self::text( $order, self::RECORD_KEY );
		return in_array( $record, array( 'supplier', 'warehouse', 'movement', 'transfer' ), true );
	}

	// -----------------------------------------------------------------------
	// Customers
	// -----------------------------------------------------------------------

	/**
	 * Maps a WC_Customer to the frontend Customer DTO.
	 *
	 * @param WC_Customer $customer Customer.
	 * @return array
	 */
	private static function map_customer( $customer ) {
		$name = trim( $customer->get_first_name() . ' ' . $customer->get_last_name() );
		$email = (string) $customer->get_email();
		if ( '' === $name ) {
			$name = $email;
		}
		$created = $customer->get_date_created();
		$address = array_values( array_filter( array( $customer->get_billing_address_1(), $customer->get_billing_city() ) ) );

		return array(
			'id'      => $customer->get_id() ? (string) $customer->get_id() : $email,
			'name'    => $name,
			'email'   => $email,
			'phone'   => (string) $customer->get_billing_phone(),
			'type'    => 'individual',
			'address' => implode( ', ', $address ),
			'since'   => $created ? $created->date( 'c' ) : '',
			'status'  => 'active',
		);
	}

	/**
	 * GET /customers
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_customers( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}

		$items = array();

		if ( function_exists( 'wc_get_customers' ) ) {
			foreach ( (array) wc_get_customers( array( 'limit' => -1 ) ) as $customer ) {
				if ( $customer instanceof WC_Customer ) {
					$items[] = self::map_customer( $customer );
				}
			}
		} else {
			$users = get_users(
				array(
					'role'   => 'customer',
					'number' => -1,
				)
			);
			foreach ( (array) $users as $user ) {
				$first = (string) get_user_meta( $user->ID, 'first_name', true );
				$last  = (string) get_user_meta( $user->ID, 'last_name', true );
				$name  = trim( $first . ' ' . $last );
				if ( '' === $name ) {
					$name = (string) $user->display_name;
				}
				$address = array_values(
					array_filter(
						array(
							(string) get_user_meta( $user->ID, 'billing_address_1', true ),
							(string) get_user_meta( $user->ID, 'billing_city', true ),
						)
					)
				);
				$items[] = array(
					'id'      => (string) $user->ID,
					'name'    => $name,
					'email'   => (string) $user->user_email,
					'phone'   => (string) get_user_meta( $user->ID, 'billing_phone', true ),
					'type'    => 'individual',
					'address' => implode( ', ', $address ),
					'since'   => (string) $user->user_registered,
					'status'  => 'active',
				);
			}
		}

		return self::envelope( $items );
	}

	// -----------------------------------------------------------------------
	// Orders
	// -----------------------------------------------------------------------

	/**
	 * Maps a WC order status to the frontend OrderStatus.
	 *
	 * @param string $status WooCommerce status (no `wc-` prefix).
	 * @return string
	 */
	private static function order_status( $status ) {
		$map = array(
			'pending'    => 'pending',
			'processing' => 'processing',
			'on-hold'    => 'processing',
			'completed'  => 'completed',
			'cancelled'  => 'cancelled',
			'refunded'   => 'refunded',
			'failed'     => 'cancelled',
		);
		return isset( $map[ $status ] ) ? $map[ $status ] : 'pending';
	}

	/**
	 * Maps a WC_Order to the frontend Order DTO.
	 *
	 * @param WC_Order $order Order.
	 * @return array
	 */
	private static function map_order( $order ) {
		$first = $order->get_billing_first_name();
		$last  = $order->get_billing_last_name();
		$name  = trim( $first . ' ' . $last );

		$override = self::text( $order, '_dpc_status' );
		$status   = in_array( $override, array( 'pending', 'paid', 'processing', 'assembly', 'testing', 'ready', 'completed', 'cancelled', 'refunded' ), true )
			? $override
			: self::order_status( $order->get_status() );

		$items = array();
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			$product = $item->get_product();
			$items[] = array(
				'productId' => (string) $item->get_product_id(),
				'name'      => $item->get_name(),
				'sku'       => $product ? (string) $product->get_sku() : '',
				'qty'       => (int) $item->get_quantity(),
				'unitPrice' => (float) $item->get_total(),
			);
		}

		$total   = (float) $order->get_total();
		$created = $order->get_date_created();

		return array(
			'id'           => (string) $order->get_id(),
			'customerId'   => $order->get_customer_id() ? (string) $order->get_customer_id() : null,
			'customerName' => '' !== $name ? $name : ( $order->get_billing_email() ? $order->get_billing_email() : 'Guest' ),
			'type'         => 'retail',
			'status'       => $status,
			'items'        => $items,
			'subtotal'     => $total,
			'discount'     => (float) $order->get_discount_total(),
			'tax'          => (float) $order->get_total_tax(),
			'serviceTotal' => 0,
			'shippingFee'  => (float) $order->get_shipping_total(),
			'total'        => $total,
			'amountPaid'   => 0,
			'balanceDue'   => $total,
			'payment'      => null,
			'createdAt'    => $created ? $created->date( 'c' ) : '',
			'cashier'      => 'wordpress',
			'timeline'     => array(),
		);
	}

	/**
	 * GET /orders
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_orders( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$items = array();
		foreach ( self::all_orders() as $order ) {
			if ( ! self::is_internal( $order ) ) {
				$items[] = self::map_order( $order );
			}
		}
		return self::envelope( $items );
	}

	// -----------------------------------------------------------------------
	// Quotes (orders tagged `_dpc_is_quote=yes`)
	// -----------------------------------------------------------------------

	/**
	 * Parses the stored quote line items.
	 *
	 * @param WC_Order $order Order.
	 * @return array
	 */
	private static function quote_items( $order ) {
		$items = array();
		foreach ( self::json_list( $order, '_dpc_quote_line_items' ) as $it ) {
			if ( ! is_array( $it ) ) {
				continue;
			}
			$items[] = array(
				'productId' => isset( $it['productId'] ) ? (string) $it['productId'] : '',
				'name'      => isset( $it['name'] ) ? (string) $it['name'] : '',
				'sku'       => isset( $it['sku'] ) ? (string) $it['sku'] : '',
				'qty'       => isset( $it['qty'] ) ? (int) $it['qty'] : 1,
				'unitPrice' => isset( $it['unitPrice'] ) ? (float) $it['unitPrice'] : 0.0,
			);
		}
		return $items;
	}

	/**
	 * Maps a quote order to the frontend Quote DTO.
	 *
	 * @param WC_Order $order Order.
	 * @return array
	 */
	private static function map_quote( $order ) {
		$items    = self::quote_items( $order );
		$subtotal = 0.0;
		foreach ( $items as $it ) {
			$subtotal += $it['qty'] * $it['unitPrice'];
		}
		$discount     = self::number( $order, '_dpc_quote_discount' );
		$service      = self::number( $order, '_dpc_quote_service_total' );
		$shipping     = self::number( $order, '_dpc_quote_shipping' );
		$tax          = self::number( $order, '_dpc_quote_tax' );
		$total_meta   = self::number( $order, '_dpc_quote_total' );
		$total        = $total_meta > 0 ? $total_meta : ( $subtotal - $discount + $service + $shipping + $tax );

		$status = self::text( $order, '_dpc_quote_status' );
		$status = in_array( $status, self::quote_statuses(), true ) ? $status : 'draft';

		$first = $order->get_billing_first_name();
		$last  = $order->get_billing_last_name();
		$name  = self::text( $order, '_dpc_quote_customer' );
		if ( '' === $name ) {
			$name = trim( $first . ' ' . $last );
		}
		if ( '' === $name ) {
			$name = 'Guest';
		}

		$created = $order->get_date_created();

		$quote = array(
			'id'           => 'Q-' . $order->get_id(),
			'customerId'   => self::text( $order, '_dpc_quote_customer_id' ) ? self::text( $order, '_dpc_quote_customer_id' ) : null,
			'customerName' => $name,
			'status'       => $status,
			'items'        => $items,
			'discount'     => $discount,
			'serviceTotal' => $service,
			'shippingFee'  => $shipping,
			'subtotal'     => $subtotal,
			'tax'          => $tax,
			'total'        => $total,
			'version'      => (int) self::number( $order, '_dpc_quote_version', 1 ),
			'revisions'    => self::json_list( $order, '_dpc_quote_revisions' ),
			'createdAt'    => $created ? $created->date( 'c' ) : '',
			'expiresAt'    => self::text( $order, '_dpc_quote_expires', gmdate( 'c', time() + 14 * 86400 ) ),
			'preparedBy'   => self::text( $order, '_dpc_quote_prepared_by', 'wordpress' ),
		);

		foreach ( array(
			'notes'   => '_dpc_quote_notes',
			'subject' => '_dpc_quote_subject',
			'message' => '_dpc_quote_message',
			'sentAt'  => '_dpc_quote_sent_at',
		) as $field => $key ) {
			$value = self::text( $order, $key );
			if ( '' !== $value ) {
				$quote[ $field ] = $value;
			}
		}

		return $quote;
	}

	/**
	 * GET /quotes
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_quotes( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$items = array();
		foreach ( self::all_orders() as $order ) {
			if ( 'yes' === self::text( $order, '_dpc_is_quote' ) ) {
				$items[] = self::map_quote( $order );
			}
		}
		return self::envelope( $items );
	}

	// -----------------------------------------------------------------------
	// Suppliers (orders tagged `_dpc_record=supplier`)
	// -----------------------------------------------------------------------

	/**
	 * Parses a string-list order meta value.
	 *
	 * @param WC_Order $order Order.
	 * @param string   $key   Meta key.
	 * @return string[]
	 */
	private static function text_list( $order, $key ) {
		$raw = $order->get_meta( $key, true );
		if ( is_array( $raw ) ) {
			return array_values( array_filter( array_map( 'strval', $raw ) ) );
		}
		$decoded = is_string( $raw ) ? json_decode( $raw, true ) : null;
		if ( is_array( $decoded ) ) {
			return array_values( array_filter( array_map( 'strval', $decoded ) ) );
		}
		if ( ! is_string( $raw ) || '' === $raw ) {
			return array();
		}
		return array_values( array_filter( array_map( 'trim', explode( ',', $raw ) ) ) );
	}

	/**
	 * Maps a supplier order to the frontend Supplier DTO.
	 *
	 * @param WC_Order $order Order.
	 * @return array
	 */
	private static function map_supplier( $order ) {
		$id = $order->get_id();

		$supplier = array(
			'id'           => 'SUP-' . $id,
			'name'         => self::text( $order, '_dpc_supplier_name', 'Supplier ' . $id ),
			'contact'      => self::text( $order, '_dpc_supplier_contact' ),
			'email'        => self::text( $order, '_dpc_supplier_email' ),
			'phone'        => self::text( $order, '_dpc_supplier_phone' ),
			'address'      => self::text( $order, '_dpc_supplier_address' ),
			'terms'        => self::text( $order, '_dpc_supplier_terms', 'Net 30' ),
			'leadTimeDays' => max( 1, (int) self::number( $order, '_dpc_supplier_lead_time_days', 1 ) ),
			'categories'   => self::text_list( $order, '_dpc_supplier_categories' ),
			'productIds'   => self::text_list( $order, '_dpc_supplier_product_ids' ),
			'status'       => 'inactive' === self::text( $order, '_dpc_supplier_status' ) ? 'inactive' : 'active',
			'rating'       => max( 0.0, self::number( $order, '_dpc_supplier_rating' ) ),
		);

		$notes = self::text( $order, '_dpc_supplier_notes' );
		if ( '' !== $notes ) {
			$supplier['notes'] = $notes;
		}

		return $supplier;
	}

	/**
	 * GET /suppliers
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_suppliers( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$items = array();
		foreach ( self::all_orders() as $order ) {
			if ( 'supplier' === self::text( $order, self::RECORD_KEY ) ) {
				$items[] = self::map_supplier( $order );
			}
		}
		usort(
			$items,
			function ( $a, $b ) {
				return strcasecmp( $a['name'], $b['name'] );
			}
		);
		return self::envelope( $items );
	}
}
