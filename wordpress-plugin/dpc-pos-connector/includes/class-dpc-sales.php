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
	 * Wraps a single object in the frontend envelope.
	 *
	 * @param mixed $item Payload.
	 * @return WP_REST_Response
	 */
	private static function single( $item ) {
		return rest_ensure_response( array( 'data' => $item ) );
	}

	/**
	 * Creates a tagged internal WooCommerce order.
	 *
	 * @param string $payment_method Payment method slug.
	 * @param string $title          Payment method title.
	 * @param string $note           Customer note.
	 * @param array  $meta           Meta key => value (arrays are JSON-encoded).
	 * @return WC_Order
	 */
	private static function create_record_order( $payment_method, $title, $note, array $meta ) {
		$order = wc_create_order( array( 'status' => 'pending' ) );
		$order->set_payment_method( $payment_method );
		$order->set_payment_method_title( $title );
		$order->set_customer_note( $note );
		foreach ( $meta as $key => $value ) {
			if ( null === $value || '' === $value ) {
				continue;
			}
			if ( is_array( $value ) || is_object( $value ) ) {
				$value = wp_json_encode( $value );
			}
			$order->update_meta_data( $key, $value );
		}
		$order->set_status( 'pending' );
		$order->save();
		return $order;
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

	/* ============================================================ handlers */

	/**
	 * POST /customers
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_customer( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body  = (array) $request->get_json_params();
		$name  = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
		$email = isset( $body['email'] ) ? trim( (string) $body['email'] ) : '';
		if ( '' === $name || '' === $email ) {
			return new WP_Error( 'dpc_bad_request', 'name and email are required', array( 'status' => 400 ) );
		}
		if ( email_exists( $email ) ) {
			return new WP_Error( 'dpc_conflict', 'A customer with that email already exists.', array( 'status' => 409 ) );
		}

		$parts     = preg_split( '/\s+/', $name );
		$first     = array_shift( $parts );
		$last      = implode( ' ', $parts );
		$phone     = isset( $body['phone'] ) ? trim( (string) $body['phone'] ) : '';
		$address   = isset( $body['address'] ) ? trim( (string) $body['address'] ) : '';

		$customer = new WC_Customer();
		$customer->set_email( $email );
		$customer->set_first_name( $first );
		if ( '' !== $last ) {
			$customer->set_last_name( $last );
		}
		if ( '' !== $phone ) {
			$customer->set_billing_phone( $phone );
		}
		if ( '' !== $address ) {
			$customer->set_billing_address_1( $address );
		}
		try {
			$customer->save();
		} catch ( Exception $e ) {
			return new WP_Error( 'dpc_error', $e->getMessage(), array( 'status' => 400 ) );
		}

		$created = wc_get_customer( $customer->get_id() );
		$dto     = self::map_customer( $created ? $created : $customer );
		$dto['type'] = ( isset( $body['type'] ) && 'business' === $body['type'] ) ? 'business' : 'individual';
		return self::single( $dto );
	}

	/**
	 * Order status (DPC) => WooCommerce status.
	 *
	 * @return array<string,string>
	 */
	private static function order_status_to_wc() {
		return array(
			'pending'    => 'pending',
			'paid'       => 'processing',
			'processing' => 'processing',
			'assembly'   => 'processing',
			'testing'    => 'processing',
			'ready'      => 'processing',
			'completed'  => 'completed',
			'cancelled'  => 'cancelled',
			'refunded'   => 'refunded',
		);
	}

	/**
	 * POST /orders
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_order( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body  = (array) $request->get_json_params();
		$items = isset( $body['items'] ) && is_array( $body['items'] ) ? $body['items'] : array();

		$order = wc_create_order( array( 'status' => 'pending' ) );
		$count = 0;
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$product_id = isset( $item['productId'] ) ? (int) $item['productId'] : ( isset( $item['product_id'] ) ? (int) $item['product_id'] : 0 );
			$qty        = isset( $item['qty'] ) ? (int) $item['qty'] : ( isset( $item['quantity'] ) ? (int) $item['quantity'] : 1 );
			if ( $product_id <= 0 ) {
				return new WP_Error( 'dpc_bad_request', 'each item needs a productId', array( 'status' => 400 ) );
			}
			$product = wc_get_product( $product_id );
			if ( ! $product instanceof WC_Product ) {
				continue;
			}
			$order->add_product( $product, max( 1, $qty ) );
			$count++;
		}
		if ( 0 === $count ) {
			return new WP_Error( 'dpc_bad_request', 'order needs at least one line item', array( 'status' => 400 ) );
		}

		if ( ! empty( $body['customerName'] ) ) {
			$parts = explode( ' ', trim( (string) $body['customerName'] ) );
			$first = ! empty( $parts[0] ) ? $parts[0] : 'Guest';
			$last  = count( $parts ) > 1 ? implode( ' ', array_slice( $parts, 1 ) ) : 'Customer';
			$order->set_billing_first_name( $first );
			$order->set_billing_last_name( $last );
			$order->set_billing_email( isset( $body['email'] ) ? (string) $body['email'] : '' );
		}
		if ( ! empty( $body['notes'] ) ) {
			$order->set_customer_note( (string) $body['notes'] );
		}
		$method = ! empty( $body['paymentMethod'] ) ? (string) $body['paymentMethod'] : 'bacs';
		$order->set_payment_method( $method );
		$order->set_payment_method_title( $method );
		$order->calculate_totals();
		$order->save();
		if ( ! empty( $body['setPaid'] ) ) {
			$order->payment_complete();
		}
		return self::single( self::map_order( wc_get_order( $order->get_id() ) ) );
	}

	/**
	 * PUT /orders/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_order( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$order = wc_get_order( (int) $request->get_param( 'id' ) );
		if ( ! $order instanceof WC_Order ) {
			return new WP_Error( 'dpc_not_found', 'Order not found.', array( 'status' => 404 ) );
		}
		$body   = (array) $request->get_json_params();
		$status = isset( $body['status'] ) ? (string) $body['status'] : '';
		$map    = self::order_status_to_wc();
		if ( ! isset( $map[ $status ] ) ) {
			return new WP_Error( 'dpc_bad_request', 'status must be one of ' . implode( ', ', array_keys( $map ) ), array( 'status' => 400 ) );
		}
		$order->set_status( $map[ $status ] );
		$order->update_meta_data( '_dpc_status', $status );
		$order->save();
		return self::single( self::map_order( wc_get_order( $order->get_id() ) ) );
	}

	/**
	 * Normalizes quote line items from a request body.
	 *
	 * @param mixed $raw Raw items.
	 * @return array
	 */
	private static function normalize_quote_items( $raw ) {
		$items = array();
		if ( ! is_array( $raw ) ) {
			return $items;
		}
		foreach ( $raw as $it ) {
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
	 * Quote meta key map.
	 *
	 * @return array<string,string>
	 */
	private static function quote_meta() {
		return array(
			'isQuote'      => '_dpc_is_quote',
			'status'       => '_dpc_quote_status',
			'version'      => '_dpc_quote_version',
			'lineItems'    => '_dpc_quote_line_items',
			'discount'     => '_dpc_quote_discount',
			'serviceTotal' => '_dpc_quote_service_total',
			'shippingFee'  => '_dpc_quote_shipping',
			'tax'          => '_dpc_quote_tax',
			'subtotal'     => '_dpc_quote_subtotal',
			'total'        => '_dpc_quote_total',
			'notes'        => '_dpc_quote_notes',
			'revisions'    => '_dpc_quote_revisions',
			'customerName' => '_dpc_quote_customer',
			'customerId'   => '_dpc_quote_customer_id',
			'preparedBy'   => '_dpc_quote_prepared_by',
			'expiresAt'    => '_dpc_quote_expires',
			'subject'      => '_dpc_quote_subject',
			'message'      => '_dpc_quote_message',
			'sentAt'       => '_dpc_quote_sent_at',
		);
	}

	/**
	 * Attaches line items to an order when the products exist.
	 *
	 * @param WC_Order $order Order.
	 * @param array    $items Quote items.
	 * @return void
	 */
	private static function add_line_items( $order, array $items ) {
		foreach ( $items as $item ) {
			$product = ! empty( $item['productId'] ) ? wc_get_product( (int) $item['productId'] ) : false;
			if ( $product instanceof WC_Product ) {
				$order->add_product( $product, max( 1, (int) $item['qty'] ) );
			}
		}
		$order->calculate_totals();
	}

	/**
	 * POST /quotes
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_quote( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body    = (array) $request->get_json_params();
		$k       = self::quote_meta();
		$items   = self::normalize_quote_items( isset( $body['items'] ) ? $body['items'] : array() );
		$subtotal = 0.0;
		foreach ( $items as $it ) {
			$subtotal += $it['qty'] * $it['unitPrice'];
		}
		$discount     = isset( $body['discount'] ) ? (float) $body['discount'] : 0.0;
		$service      = isset( $body['serviceTotal'] ) ? (float) $body['serviceTotal'] : 0.0;
		$shipping     = isset( $body['shippingFee'] ) ? (float) $body['shippingFee'] : 0.0;
		$tax          = isset( $body['tax'] ) ? (float) $body['tax'] : 0.0;
		$total        = $subtotal - $discount + $service + $shipping + $tax;
		$customer     = ! empty( $body['customerName'] ) ? trim( (string) $body['customerName'] ) : 'Guest';
		$prepared_by  = isset( $auth['user_id'] ) ? (string) $auth['user_id'] : 'wordpress';

		$order = self::create_record_order(
			'dpc_quote',
			'Quotation (DPC NEXUS)',
			'Quotation - not a sales order',
			array(
				$k['isQuote']    => 'yes',
				$k['status']     => 'draft',
				$k['version']    => 1,
				$k['lineItems']  => $items,
				$k['discount']   => $discount,
				$k['serviceTotal'] => $service,
				$k['shippingFee'] => $shipping,
				$k['tax']        => $tax,
				$k['subtotal']   => $subtotal,
				$k['total']      => $total,
				$k['notes']      => isset( $body['notes'] ) ? (string) $body['notes'] : null,
				$k['customerName'] => $customer,
				$k['customerId'] => ! empty( $body['customerId'] ) ? (string) $body['customerId'] : null,
				$k['preparedBy'] => $prepared_by,
				$k['expiresAt']  => gmdate( 'c', time() + 14 * 86400 ),
				$k['subject']    => isset( $body['subject'] ) ? (string) $body['subject'] : null,
				$k['message']    => isset( $body['message'] ) ? (string) $body['message'] : null,
			)
		);
		self::add_line_items( $order, $items );
		$order->save();
		return self::single( self::map_quote( wc_get_order( $order->get_id() ) ) );
	}

	/**
	 * PUT /quotes/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_quote( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id    = $request->get_param( 'id' );
		$order = wc_get_order( self::quote_order_id( $id ) );
		if ( ! $order instanceof WC_Order || 'yes' !== self::text( $order, '_dpc_is_quote' ) ) {
			return new WP_Error( 'dpc_not_found', 'Quote not found.', array( 'status' => 404 ) );
		}
		$k     = self::quote_meta();
		$quote = self::map_quote( $order );
		$body  = (array) $request->get_json_params();

		$status = isset( $body['status'] ) && in_array( $body['status'], self::quote_statuses(), true ) ? $body['status'] : $quote['status'];
		$items  = $quote['items'];
		$version = $quote['version'];
		$revisions = $quote['revisions'];
		$sent_at = isset( $quote['sentAt'] ) ? $quote['sentAt'] : '';
		if ( isset( $body['items'] ) && is_array( $body['items'] ) ) {
			$items     = self::normalize_quote_items( $body['items'] );
			$version   = $quote['version'] + 1;
			$revisions[] = array(
				'version'      => $quote['version'],
				'at'           => gmdate( 'c' ),
				'items'        => $quote['items'],
				'subtotal'     => $quote['subtotal'],
				'discount'     => $quote['discount'],
				'serviceTotal' => $quote['serviceTotal'],
				'shippingFee'  => $quote['shippingFee'],
				'tax'          => $quote['tax'],
				'total'        => $quote['total'],
				'notes'        => isset( $quote['notes'] ) ? $quote['notes'] : '',
			);
			$revisions = array_slice( $revisions, -20 );
		}
		if ( array_key_exists( 'sentAt', $body ) ) {
			$sent_at = (string) $body['sentAt'];
		}

		$subtotal = 0.0;
		foreach ( $items as $it ) {
			$subtotal += $it['qty'] * $it['unitPrice'];
		}
		$discount = array_key_exists( 'discount', $body ) ? (float) $body['discount'] : $quote['discount'];
		$service  = array_key_exists( 'serviceTotal', $body ) ? (float) $body['serviceTotal'] : $quote['serviceTotal'];
		$shipping = array_key_exists( 'shippingFee', $body ) ? (float) $body['shippingFee'] : $quote['shippingFee'];
		$tax      = array_key_exists( 'tax', $body ) ? (float) $body['tax'] : $quote['tax'];
		$total    = $subtotal - $discount + $service + $shipping + $tax;

		$order->update_meta_data(
			$k['isQuote'],
			'yes'
		);
		$updates = array(
			$k['status']       => $status,
			$k['version']      => $version,
			$k['lineItems']    => $items,
			$k['discount']     => $discount,
			$k['serviceTotal'] => $service,
			$k['shippingFee']  => $shipping,
			$k['tax']          => $tax,
			$k['subtotal']     => $subtotal,
			$k['total']        => $total,
			$k['notes']        => array_key_exists( 'notes', $body ) ? (string) $body['notes'] : ( isset( $quote['notes'] ) ? $quote['notes'] : '' ),
			$k['customerId']   => $quote['customerId'] ? $quote['customerId'] : '',
			$k['preparedBy']   => $quote['preparedBy'],
			$k['sentAt']       => $sent_at,
			$k['subject']      => array_key_exists( 'subject', $body ) ? (string) $body['subject'] : ( isset( $quote['subject'] ) ? $quote['subject'] : '' ),
			$k['message']      => array_key_exists( 'message', $body ) ? (string) $body['message'] : ( isset( $quote['message'] ) ? $quote['message'] : '' ),
			$k['revisions']    => $revisions,
		);
		foreach ( $updates as $key => $value ) {
			if ( is_array( $value ) ) {
				$value = wp_json_encode( $value );
			}
			$order->update_meta_data( $key, $value );
		}
		$order->save();
		return self::single( self::map_quote( wc_get_order( $order->get_id() ) ) );
	}

	/**
	 * DELETE /quotes/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_quote( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id    = $request->get_param( 'id' );
		$order = wc_get_order( self::quote_order_id( $id ) );
		if ( ! $order instanceof WC_Order || 'yes' !== self::text( $order, '_dpc_is_quote' ) ) {
			return new WP_Error( 'dpc_not_found', 'Quote not found.', array( 'status' => 404 ) );
		}
		$order_id = $order->get_id();
		$order->delete( true );
		return self::single( array( 'id' => 'Q-' . $order_id, 'deleted' => true ) );
	}

	/**
	 * Numeric order id from a `Q-123` quote id.
	 *
	 * @param string $id Quote id.
	 * @return int
	 */
	private static function quote_order_id( $id ) {
		return (int) ( 0 === strpos( (string) $id, 'Q-' ) ? substr( $id, 2 ) : $id );
	}

	/* ------------------------------------------------------------ suppliers */

	/**
	 * Supplier meta key map.
	 *
	 * @return array<string,string>
	 */
	private static function supplier_meta() {
		return array(
			'name'         => '_dpc_supplier_name',
			'contact'      => '_dpc_supplier_contact',
			'email'        => '_dpc_supplier_email',
			'phone'        => '_dpc_supplier_phone',
			'address'      => '_dpc_supplier_address',
			'terms'        => '_dpc_supplier_terms',
			'leadTimeDays' => '_dpc_supplier_lead_time_days',
			'categories'   => '_dpc_supplier_categories',
			'productIds'   => '_dpc_supplier_product_ids',
			'status'       => '_dpc_supplier_status',
			'rating'       => '_dpc_supplier_rating',
			'notes'        => '_dpc_supplier_notes',
		);
	}

	/**
	 * Builds supplier meta from input.
	 *
	 * @param array $input Supplier fields (list keys as arrays).
	 * @return array<string,mixed>
	 */
	private static function supplier_meta_values( array $input ) {
		$k    = self::supplier_meta();
		$meta = array( self::RECORD_KEY => 'supplier' );
		foreach ( array( 'name', 'contact', 'email', 'phone', 'address', 'terms', 'leadTimeDays', 'status', 'rating', 'notes' ) as $field ) {
			if ( array_key_exists( $field, $input ) && null !== $input[ $field ] ) {
				$meta[ $k[ $field ] ] = $input[ $field ];
			}
		}
		$meta[ $k['categories'] ] = isset( $input['categories'] ) ? wp_json_encode( array_values( $input['categories'] ) ) : '[]';
		$meta[ $k['productIds'] ]  = isset( $input['productIds'] ) ? wp_json_encode( array_values( $input['productIds'] ) ) : '[]';
		return $meta;
	}

	/**
	 * Gets one supplier.
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_supplier( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id    = self::supplier_order_id( $request->get_param( 'id' ) );
		$order = wc_get_order( $id );
		if ( ! $order instanceof WC_Order || 'supplier' !== self::text( $order, self::RECORD_KEY ) ) {
			return new WP_Error( 'dpc_not_found', 'Supplier not found.', array( 'status' => 404 ) );
		}
		return self::single( self::map_supplier( $order ) );
	}

	/**
	 * POST /suppliers
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_supplier( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body    = (array) $request->get_json_params();
		$name    = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
		$contact = isset( $body['contact'] ) ? trim( (string) $body['contact'] ) : '';
		if ( '' === $name || '' === $contact ) {
			return new WP_Error( 'dpc_bad_request', 'name and contact are required', array( 'status' => 400 ) );
		}
		foreach ( self::all_orders() as $order ) {
			if ( 'supplier' === self::text( $order, self::RECORD_KEY )
				&& strtolower( self::text( $order, '_dpc_supplier_name' ) ) === strtolower( $name ) ) {
				return new WP_Error( 'dpc_conflict', 'supplier name already exists', array( 'status' => 409 ) );
			}
		}
		$input = array(
			'name'         => $name,
			'contact'      => $contact,
			'email'        => isset( $body['email'] ) ? trim( (string) $body['email'] ) : '',
			'phone'        => isset( $body['phone'] ) ? trim( (string) $body['phone'] ) : '',
			'address'      => isset( $body['address'] ) ? trim( (string) $body['address'] ) : '',
			'terms'        => ! empty( $body['terms'] ) ? trim( (string) $body['terms'] ) : 'Net 30',
			'leadTimeDays' => max( 1, (int) ( isset( $body['leadTimeDays'] ) ? $body['leadTimeDays'] : 1 ) ),
			'categories'   => isset( $body['categories'] ) && is_array( $body['categories'] ) ? array_map( 'strval', $body['categories'] ) : array(),
			'productIds'   => isset( $body['productIds'] ) && is_array( $body['productIds'] ) ? array_map( 'strval', $body['productIds'] ) : array(),
			'status'       => ( isset( $body['status'] ) && 'inactive' === $body['status'] ) ? 'inactive' : 'active',
			'rating'       => isset( $body['rating'] ) ? (float) $body['rating'] : 0.0,
			'notes'        => isset( $body['notes'] ) ? (string) $body['notes'] : null,
		);
		$order = self::create_record_order(
			'dpc_supplier',
			'Supplier (DPC NEXUS)',
			'Supplier record - not a sales order',
			self::supplier_meta_values( $input )
		);
		return self::single( self::map_supplier( $order ) );
	}

	/**
	 * PUT /suppliers/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_supplier( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$order = wc_get_order( self::supplier_order_id( $request->get_param( 'id' ) ) );
		if ( ! $order instanceof WC_Order || 'supplier' !== self::text( $order, self::RECORD_KEY ) ) {
			return new WP_Error( 'dpc_not_found', 'Supplier not found.', array( 'status' => 404 ) );
		}
		$body = (array) $request->get_json_params();
		if ( isset( $body['productIds'] ) && ! is_array( $body['productIds'] ) ) {
			return new WP_Error( 'dpc_bad_request', 'productIds must be an array', array( 'status' => 400 ) );
		}
		$current = self::map_supplier( $order );
		$merged  = array(
			'name'         => isset( $body['name'] ) ? (string) $body['name'] : $current['name'],
			'contact'      => isset( $body['contact'] ) ? (string) $body['contact'] : $current['contact'],
			'email'        => isset( $body['email'] ) ? (string) $body['email'] : $current['email'],
			'phone'        => isset( $body['phone'] ) ? (string) $body['phone'] : $current['phone'],
			'address'      => isset( $body['address'] ) ? (string) $body['address'] : $current['address'],
			'terms'        => isset( $body['terms'] ) ? (string) $body['terms'] : $current['terms'],
			'leadTimeDays' => isset( $body['leadTimeDays'] ) ? max( 1, (int) $body['leadTimeDays'] ) : $current['leadTimeDays'],
			'categories'   => isset( $body['categories'] ) && is_array( $body['categories'] ) ? array_map( 'strval', $body['categories'] ) : $current['categories'],
			'productIds'   => isset( $body['productIds'] ) && is_array( $body['productIds'] ) ? array_map( 'strval', $body['productIds'] ) : $current['productIds'],
			'status'       => isset( $body['status'] ) ? ( 'inactive' === $body['status'] ? 'inactive' : 'active' ) : $current['status'],
			'rating'       => isset( $body['rating'] ) ? (float) $body['rating'] : $current['rating'],
			'notes'        => isset( $body['notes'] ) ? (string) $body['notes'] : ( isset( $current['notes'] ) ? $current['notes'] : '' ),
		);
		foreach ( self::supplier_meta_values( $merged ) as $key => $value ) {
			$order->update_meta_data( $key, $value );
		}
		$order->save();
		return self::single( self::map_supplier( $order ) );
	}

	/**
	 * DELETE /suppliers/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_supplier( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id    = $request->get_param( 'id' );
		$order = wc_get_order( self::supplier_order_id( $id ) );
		if ( ! $order instanceof WC_Order || 'supplier' !== self::text( $order, self::RECORD_KEY ) ) {
			return new WP_Error( 'dpc_not_found', 'Supplier not found.', array( 'status' => 404 ) );
		}
		$order->delete( true );
		return self::single( array( 'id' => $id, 'deleted' => true ) );
	}

	/**
	 * Numeric order id from a `SUP-123` supplier id.
	 *
	 * @param string $id Supplier id.
	 * @return int
	 */
	private static function supplier_order_id( $id ) {
		return (int) preg_replace( '/^SUP-/', '', (string) $id );
	}
}
