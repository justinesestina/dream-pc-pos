<?php
/**
 * Warehouses, multi-warehouse stock, movements and transfers.
 *
 * A port of the previous Node backend's warehouse-store / inventory-store. All
 * state lives in WooCommerce: warehouses, movements and transfers are tagged
 * orders, physical quantities per warehouse live on product meta, and the
 * storefront's own sellable stock is recomputed from the selling warehouses.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Warehouse + inventory reads and writes.
 */
class DPC_POS_Inventory {

	const RECORD_KEY         = '_dpc_record';
	const STOCK_META         = '_dpc_wh_stock';
	const STOCK_UPDATED_META = '_dpc_wh_updated';
	const COST_META          = '_dpc_wh_cost';
	const PRODUCT_COST_META  = '_dpc_cost';
	const HYDRATE_BATCH      = 25;

	/**
	 * Warehouse order meta keys.
	 *
	 * @return array<string,string>
	 */
	private static function wh_meta() {
		return array(
			'name'     => '_dpc_wh_name',
			'code'     => '_dpc_wh_code',
			'type'     => '_dpc_wh_type',
			'sync'     => '_dpc_wh_sync',
			'address'  => '_dpc_wh_address',
			'phone'    => '_dpc_wh_phone',
			'manager'  => '_dpc_wh_manager',
			'capacity' => '_dpc_wh_capacity',
			'notes'    => '_dpc_wh_notes',
			'default'  => '_dpc_wh_default',
			'status'   => '_dpc_wh_status',
			'hydrated' => '_dpc_wh_hydrated',
		);
	}

	/**
	 * Movement order meta keys.
	 *
	 * @return array<string,string>
	 */
	private static function mv_meta() {
		return array(
			'productId'     => '_dpc_mv_product_id',
			'productName'   => '_dpc_mv_product_name',
			'sku'           => '_dpc_mv_sku',
			'warehouseId'   => '_dpc_mv_warehouse_id',
			'warehouseName' => '_dpc_mv_warehouse_name',
			'type'          => '_dpc_mv_type',
			'qty'           => '_dpc_mv_qty',
			'reference'     => '_dpc_mv_reference',
			'note'          => '_dpc_mv_note',
			'actor'         => '_dpc_mv_actor',
			'idem'          => '_dpc_mv_idem',
		);
	}

	/**
	 * Transfer order meta keys.
	 *
	 * @return array<string,string>
	 */
	private static function tr_meta() {
		return array(
			'fromId'      => '_dpc_tr_from_id',
			'fromName'    => '_dpc_tr_from_name',
			'toId'        => '_dpc_tr_to_id',
			'toName'      => '_dpc_tr_to_name',
			'productId'   => '_dpc_tr_product_id',
			'productName' => '_dpc_tr_product_name',
			'sku'         => '_dpc_tr_sku',
			'quantity'    => '_dpc_tr_quantity',
			'status'      => '_dpc_tr_status',
			'notes'       => '_dpc_tr_notes',
			'createdBy'   => '_dpc_tr_created_by',
			'completedAt' => '_dpc_tr_completed_at',
		);
	}

	/**
	 * Valid warehouse types.
	 *
	 * @return string[]
	 */
	private static function warehouse_types() {
		return array( 'selling', 'storage', 'service', 'damaged' );
	}

	/**
	 * Valid transfer statuses.
	 *
	 * @return string[]
	 */
	private static function transfer_statuses() {
		return array( 'draft', 'pending', 'approved', 'completed', 'cancelled' );
	}

	/* --------------------------------------------------------------- helpers */

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
	 * Wraps a list in the frontend envelope.
	 *
	 * @param array $items Items.
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
	 * Reads an order meta value.
	 *
	 * @param WC_Order $order Order.
	 * @param string   $key   Meta key.
	 * @return mixed
	 */
	private static function meta_of( $order, $key ) {
		return $order->get_meta( $key, true );
	}

	/**
	 * String meta reader.
	 *
	 * @param WC_Order $order   Order.
	 * @param string   $key     Meta key.
	 * @param string   $default Fallback.
	 * @return string
	 */
	private static function text( $order, $key, $default = '' ) {
		$value = self::meta_of( $order, $key );
		return ( '' === $value || null === $value ) ? $default : (string) $value;
	}

	/**
	 * Numeric meta reader.
	 *
	 * @param WC_Order $order   Order.
	 * @param string   $key     Meta key.
	 * @param float    $default Fallback.
	 * @return float
	 */
	private static function num( $order, $key, $default = 0.0 ) {
		$value = self::meta_of( $order, $key );
		return is_numeric( $value ) ? (float) $value : $default;
	}

	/**
	 * Boolean meta reader.
	 *
	 * @param WC_Order $order Order.
	 * @param string   $key   Meta key.
	 * @return bool
	 */
	private static function bool_meta( $order, $key ) {
		$value = self::meta_of( $order, $key );
		return true === $value || 'true' === $value || 1 === $value || '1' === (string) $value;
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

	/* ------------------------------------------------------------ warehouses */

	/**
	 * True when an order is a warehouse record.
	 *
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	private static function is_warehouse( $order ) {
		return 'warehouse' === self::text( $order, self::RECORD_KEY );
	}

	/**
	 * Maps a WC order to the Warehouse DTO.
	 *
	 * @param WC_Order $order Order.
	 * @return array
	 */
	private static function map_warehouse( $order ) {
		$keys   = self::wh_meta();
		$raw    = self::text( $order, $keys['type'], 'storage' );
		$type   = in_array( $raw, self::warehouse_types(), true ) ? $raw : 'storage';
		$cap    = self::num( $order, $keys['capacity'] );
		$id     = $order->get_id();
		$created = $order->get_date_created();

		$warehouse = array(
			'id'        => 'WH-' . $id,
			'name'      => self::text( $order, $keys['name'], 'Warehouse ' . $id ),
			'code'      => self::text( $order, $keys['code'] ),
			'type'      => $type,
			'sync'      => self::bool_meta( $order, $keys['sync'] ),
			'default'   => self::bool_meta( $order, $keys['default'] ),
			'status'    => 'inactive' === self::text( $order, $keys['status'] ) ? 'inactive' : 'active',
			'createdAt' => $created ? $created->date( 'c' ) : '',
		);

		foreach ( array( 'address', 'phone', 'manager', 'notes' ) as $field ) {
			$value = self::text( $order, $keys[ $field ] );
			if ( '' !== $value ) {
				$warehouse[ $field ] = $value;
			}
		}
		if ( is_finite( $cap ) && $cap > 0 ) {
			$warehouse['capacity'] = $cap;
		}
		return $warehouse;
	}

	/**
	 * Builds warehouse order meta from input.
	 *
	 * @param array $input Partial warehouse input.
	 * @return array<string,mixed>
	 */
	private static function warehouse_meta( array $input ) {
		$keys = self::wh_meta();
		$meta = array( self::RECORD_KEY => 'warehouse' );
		$set  = function ( $key, $value ) use ( &$meta ) {
			if ( null !== $value ) {
				$meta[ $key ] = $value;
			}
		};
		$set( $keys['name'], isset( $input['name'] ) ? $input['name'] : null );
		$set( $keys['code'], isset( $input['code'] ) ? strtoupper( (string) $input['code'] ) : null );
		$set( $keys['type'], isset( $input['type'] ) ? $input['type'] : null );
		$set( $keys['sync'], isset( $input['sync'] ) ? (bool) $input['sync'] : false );
		$set( $keys['address'], isset( $input['address'] ) ? $input['address'] : null );
		$set( $keys['phone'], isset( $input['phone'] ) ? $input['phone'] : null );
		$set( $keys['manager'], isset( $input['manager'] ) ? $input['manager'] : null );
		$set( $keys['capacity'], isset( $input['capacity'] ) ? $input['capacity'] : null );
		$set( $keys['notes'], isset( $input['notes'] ) ? $input['notes'] : null );
		$set( $keys['default'], isset( $input['default'] ) ? (bool) $input['default'] : false );
		$set( $keys['status'], isset( $input['status'] ) ? $input['status'] : null );
		return $meta;
	}

	/**
	 * Numeric order id from a `WH-123` id.
	 *
	 * @param string $id Warehouse id.
	 * @return int
	 */
	private static function warehouse_order_id( $id ) {
		return (int) ( 0 === strpos( $id, 'WH-' ) ? substr( $id, 3 ) : $id );
	}

	/**
	 * All warehouse orders.
	 *
	 * @return WC_Order[]
	 */
	private static function warehouse_orders() {
		$out = array();
		foreach ( self::all_orders() as $order ) {
			if ( self::is_warehouse( $order ) ) {
				$out[] = $order;
			}
		}
		return $out;
	}

	/**
	 * Lists warehouses sorted by name.
	 *
	 * @return array
	 */
	private static function list_warehouses() {
		$rows = array();
		foreach ( self::warehouse_orders() as $order ) {
			$rows[] = self::map_warehouse( $order );
		}
		usort(
			$rows,
			function ( $a, $b ) {
				return strcasecmp( $a['name'], $b['name'] );
			}
		);
		return $rows;
	}

	/**
	 * Loads one warehouse.
	 *
	 * @param string $id Warehouse id.
	 * @return array|null
	 */
	private static function get_warehouse( $id ) {
		$order = wc_get_order( self::warehouse_order_id( $id ) );
		if ( ! $order instanceof WC_Order || ! self::is_warehouse( $order ) ) {
			return null;
		}
		return self::map_warehouse( $order );
	}

	/**
	 * Finds a warehouse by its code.
	 *
	 * @param string $code Warehouse code.
	 * @return array|null
	 */
	private static function get_warehouse_by_code( $code ) {
		$needle = strtolower( trim( (string) $code ) );
		if ( '' === $needle ) {
			return null;
		}
		$keys = self::wh_meta();
		foreach ( self::warehouse_orders() as $order ) {
			if ( strtolower( self::text( $order, $keys['code'] ) ) === $needle ) {
				return self::map_warehouse( $order );
			}
		}
		return null;
	}

	/**
	 * Clears the default flag on every other warehouse.
	 *
	 * @param int $except_order_id Order to keep.
	 * @return void
	 */
	private static function clear_other_defaults( $except_order_id = 0 ) {
		$keys = self::wh_meta();
		foreach ( self::warehouse_orders() as $order ) {
			if ( $order->get_id() !== $except_order_id && self::bool_meta( $order, $keys['default'] ) ) {
				$order->update_meta_data( $keys['default'], false );
				$order->save();
			}
		}
	}

	/**
	 * Creates a warehouse.
	 *
	 * @param array $input Partial warehouse.
	 * @return array
	 */
	private static function create_warehouse( array $input ) {
		$created = self::create_record_order(
			'dpc_warehouse',
			'Warehouse (DPC NEXUS)',
			'Warehouse record - not a sales order',
			self::warehouse_meta( $input )
		);
		if ( ! empty( $input['default'] ) ) {
			self::clear_other_defaults( $created->get_id() );
		}
		return self::map_warehouse( $created );
	}

	/**
	 * Updates a warehouse with merged fields.
	 *
	 * @param string $id    Warehouse id.
	 * @param array  $input Partial warehouse.
	 * @return array|null
	 */
	private static function update_warehouse( $id, array $input ) {
		$order_id = self::warehouse_order_id( $id );
		$order    = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order || ! self::is_warehouse( $order ) ) {
			return null;
		}
		$keys = self::wh_meta();

		$merged = array(
			'name'     => isset( $input['name'] ) ? trim( (string) $input['name'] ) : self::text( $order, $keys['name'] ),
			'code'     => isset( $input['code'] ) ? strtoupper( trim( (string) $input['code'] ) ) : self::text( $order, $keys['code'] ),
			'type'     => isset( $input['type'] ) ? $input['type'] : self::text( $order, $keys['type'], 'storage' ),
			'sync'     => isset( $input['sync'] ) ? (bool) $input['sync'] : self::bool_meta( $order, $keys['sync'] ),
			'address'  => isset( $input['address'] ) ? $input['address'] : self::text( $order, $keys['address'] ),
			'phone'    => isset( $input['phone'] ) ? $input['phone'] : self::text( $order, $keys['phone'] ),
			'manager'  => isset( $input['manager'] ) ? $input['manager'] : self::text( $order, $keys['manager'] ),
			'capacity' => isset( $input['capacity'] ) ? $input['capacity'] : ( self::num( $order, $keys['capacity'] ) ? self::num( $order, $keys['capacity'] ) : null ),
			'notes'    => isset( $input['notes'] ) ? $input['notes'] : self::text( $order, $keys['notes'] ),
			'default'  => isset( $input['default'] ) ? (bool) $input['default'] : self::bool_meta( $order, $keys['default'] ),
			'status'   => isset( $input['status'] ) ? $input['status'] : ( 'inactive' === self::text( $order, $keys['status'] ) ? 'inactive' : 'active' ),
		);

		foreach ( self::warehouse_meta( $merged ) as $key => $value ) {
			$order->update_meta_data( $key, $value );
		}
		$order->save();
		if ( $merged['default'] ) {
			self::clear_other_defaults( $order_id );
		}
		return self::map_warehouse( $order );
	}

	/**
	 * Force-deletes a warehouse.
	 *
	 * @param string $id Warehouse id.
	 * @return bool
	 */
	private static function delete_warehouse( $id ) {
		$order = wc_get_order( self::warehouse_order_id( $id ) );
		if ( ! $order instanceof WC_Order || ! self::is_warehouse( $order ) ) {
			return false;
		}
		return (bool) $order->delete( true );
	}

	/**
	 * True when the selling warehouse has been seeded from WooCommerce stock.
	 *
	 * @param string $id Warehouse id.
	 * @return bool
	 */
	private static function is_warehouse_hydrated( $id ) {
		$order = wc_get_order( self::warehouse_order_id( $id ) );
		if ( ! $order instanceof WC_Order ) {
			return false;
		}
		return self::bool_meta( $order, self::wh_meta()['hydrated'] );
	}

	/**
	 * Marks a warehouse as hydrated.
	 *
	 * @param string $id Warehouse id.
	 * @return void
	 */
	private static function mark_warehouse_hydrated( $id ) {
		$order = wc_get_order( self::warehouse_order_id( $id ) );
		if ( $order instanceof WC_Order ) {
			$order->update_meta_data( self::wh_meta()['hydrated'], true );
			$order->save();
		}
	}

	/* ---------------------------------------------------------- stock levels */

	/**
	 * Parses a product's per-warehouse quantity map.
	 *
	 * @param WC_Product $product Product.
	 * @return array<string,int>
	 */
	private static function parse_stock_map( $product ) {
		$raw = $product->get_meta( self::STOCK_META, true );
		if ( is_string( $raw ) ) {
			$raw = json_decode( $raw, true );
		}
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $key => $value ) {
			$n = (float) $value;
			if ( is_finite( $n ) && 0.0 !== $n ) {
				$out[ (string) $key ] = (int) floor( $n );
			}
		}
		return $out;
	}

	/**
	 * Parses a product's per-warehouse cost map.
	 *
	 * @param WC_Product $product Product.
	 * @return array<string,float>
	 */
	private static function parse_cost_map( $product ) {
		$raw = $product->get_meta( self::COST_META, true );
		if ( is_string( $raw ) ) {
			$raw = json_decode( $raw, true );
		}
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $key => $value ) {
			$n = (float) $value;
			if ( is_finite( $n ) && $n > 0 ) {
				$out[ (string) $key ] = $n;
			}
		}
		return $out;
	}

	/**
	 * Product-level default cost.
	 *
	 * @param WC_Product $product Product.
	 * @return float
	 */
	private static function product_cost( $product ) {
		$n = (float) $product->get_meta( self::PRODUCT_COST_META, true );
		return $n > 0 ? $n : 0.0;
	}

	/**
	 * Cost for a product inside a warehouse (per-warehouse else product default).
	 *
	 * @param WC_Product $product      Product.
	 * @param string     $warehouse_id Warehouse id.
	 * @return float
	 */
	private static function cost_in_warehouse( $product, $warehouse_id ) {
		$map = self::parse_cost_map( $product );
		return isset( $map[ $warehouse_id ] ) ? $map[ $warehouse_id ] : self::product_cost( $product );
	}

	/**
	 * Writes the per-warehouse quantity map (+ updated stamp).
	 *
	 * @param WC_Product $product Product.
	 * @param array      $map     Quantity map.
	 * @return void
	 */
	private static function write_stock_map( $product, array $map ) {
		$product->update_meta_data( self::STOCK_META, wp_json_encode( $map ) );
		$product->update_meta_data( self::STOCK_UPDATED_META, gmdate( 'c' ) );
		$product->save();
	}

	/**
	 * Writes the per-warehouse cost map.
	 *
	 * @param WC_Product $product Product.
	 * @param array      $map     Cost map.
	 * @return void
	 */
	private static function write_cost_map( $product, array $map ) {
		$product->update_meta_data( self::COST_META, wp_json_encode( $map ) );
		$product->save();
	}

	/**
	 * Stock updated timestamp.
	 *
	 * @param WC_Product $product Product.
	 * @return string
	 */
	private static function stock_updated_at( $product ) {
		$raw = $product->get_meta( self::STOCK_UPDATED_META, true );
		if ( '' !== $raw && null !== $raw ) {
			return (string) $raw;
		}
		$modified = $product->get_date_modified();
		return $modified ? $modified->date( 'c' ) : '';
	}

	/**
	 * Sums quantities from selling + sync + active warehouses.
	 *
	 * @param array $map Quantity map.
	 * @return int
	 */
	private static function sellable_quantity( array $map ) {
		$total = 0;
		foreach ( self::list_warehouses() as $w ) {
			if ( 'selling' === $w['type'] && ! empty( $w['sync'] ) && 'active' === $w['status'] ) {
				$total += isset( $map[ $w['id'] ] ) ? $map[ $w['id'] ] : 0;
			}
		}
		return $total;
	}

	/**
	 * Recomputes WooCommerce stock from the selling warehouses.
	 *
	 * @param WC_Product $product Product.
	 * @return void
	 */
	private static function sync_product_to_woo( $product ) {
		$map      = self::parse_stock_map( $product );
		$sellable = self::sellable_quantity( $map );
		$product->set_manage_stock( true );
		$product->set_stock_quantity( max( 0, (int) $sellable ) );
		$product->save();
	}

	/**
	 * Builds the ProductStockInfo DTO.
	 *
	 * @param WC_Product $product Product.
	 * @param array      $name_of Warehouse id => name.
	 * @return array
	 */
	private static function build_product_stock_info( $product, array $name_of ) {
		$map          = self::parse_stock_map( $product );
		$costs        = self::parse_cost_map( $product );
		$fallback     = self::product_cost( $product );
		$per          = array();
		$total_phys   = 0;
		foreach ( $map as $id => $qty ) {
			if ( $qty <= 0 || ! isset( $name_of[ $id ] ) ) {
				continue;
			}
			$cost  = isset( $costs[ $id ] ) ? $costs[ $id ] : $fallback;
			$entry = array(
				'warehouseId' => (string) $id,
				'name'        => $name_of[ $id ],
				'quantity'    => $qty,
			);
			if ( $cost > 0 ) {
				$entry['cost']  = $cost;
				$entry['value'] = round( $qty * $cost, 2 );
			}
			$per[]      = $entry;
			$total_phys += $qty;
		}
		usort(
			$per,
			function ( $a, $b ) {
				return $b['quantity'] - $a['quantity'];
			}
		);

		$total_value = 0.0;
		foreach ( $per as $entry ) {
			if ( isset( $entry['value'] ) ) {
				$total_value += $entry['value'];
			}
		}

		$info = array(
			'productId'     => (string) $product->get_id(),
			'name'          => $product->get_name(),
			'sku'           => $product->get_sku() ? $product->get_sku() : (string) $product->get_id(),
			'wooStock'      => $product->get_stock_quantity(),
			'wooStatus'     => $product->get_stock_status(),
			'totalPhysical' => $total_phys,
			'warehouses'    => $per,
			'updatedAt'     => self::stock_updated_at( $product ),
		);
		if ( $total_value > 0 ) {
			$info['totalValue'] = round( $total_value, 2 );
		}
		$image_id = $product->get_image_id();
		if ( $image_id ) {
			$info['image'] = wp_get_attachment_image_url( $image_id, 'full' );
		}
		return $info;
	}

	/**
	 * Warehouse id => name map.
	 *
	 * @return array<string,string>
	 */
	private static function warehouse_names() {
		$out = array();
		foreach ( self::list_warehouses() as $w ) {
			$out[ $w['id'] ] = $w['name'];
		}
		return $out;
	}

	/**
	 * Every product's aggregate stock.
	 *
	 * @return array
	 */
	private static function list_product_stock() {
		$products = wc_get_products( array( 'limit' => -1 ) );
		$names    = self::warehouse_names();
		$out      = array();
		foreach ( (array) $products as $product ) {
			if ( $product instanceof WC_Product ) {
				$out[] = self::build_product_stock_info( $product, $names );
			}
		}
		return $out;
	}

	/**
	 * One product's stock info.
	 *
	 * @param string $product_id Product id.
	 * @return array|null
	 */
	private static function product_stock_info( $product_id ) {
		$product = wc_get_product( (int) $product_id );
		if ( ! $product instanceof WC_Product ) {
			return null;
		}
		return self::build_product_stock_info( $product, self::warehouse_names() );
	}

	/**
	 * Warehouse detail -> product stock rows.
	 *
	 * @param string $warehouse_id Warehouse id.
	 * @return array
	 */
	private static function warehouse_stock_rows( $warehouse_id ) {
		$products = wc_get_products( array( 'limit' => -1 ) );
		$rows     = array();
		foreach ( (array) $products as $product ) {
			if ( ! $product instanceof WC_Product ) {
				continue;
			}
			$map     = self::parse_stock_map( $product );
			$qty     = isset( $map[ $warehouse_id ] ) ? $map[ $warehouse_id ] : 0;
			$cost    = self::cost_in_warehouse( $product, $warehouse_id );
			$row     = array(
				'productId' => (string) $product->get_id(),
				'name'      => $product->get_name(),
				'sku'       => $product->get_sku() ? $product->get_sku() : (string) $product->get_id(),
				'quantity'  => $qty,
				'reserved'  => 0,
				'available' => $qty,
				'updatedAt' => self::stock_updated_at( $product ),
			);
			if ( $cost > 0 ) {
				$row['cost']  = $cost;
				$row['value'] = round( $qty * $cost, 2 );
			}
			$image_id = $product->get_image_id();
			if ( $image_id ) {
				$row['image'] = wp_get_attachment_image_url( $image_id, 'full' );
			}
			$rows[] = $row;
		}
		usort(
			$rows,
			function ( $a, $b ) {
				if ( $b['quantity'] === $a['quantity'] ) {
					return strcasecmp( $a['name'], $b['name'] );
				}
				return $b['quantity'] - $a['quantity'];
			}
		);
		return $rows;
	}

	/* ------------------------------------------------------------- movements */

	/**
	 * True when an order is a movement record.
	 *
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	private static function is_movement( $order ) {
		return 'movement' === self::text( $order, self::RECORD_KEY );
	}

	/**
	 * True when an order is a transfer record.
	 *
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	private static function is_transfer( $order ) {
		return 'transfer' === self::text( $order, self::RECORD_KEY );
	}

	/**
	 * Maps a movement order.
	 *
	 * @param WC_Order $order Order.
	 * @return array
	 */
	private static function map_movement( $order ) {
		$k       = self::mv_meta();
		$created = $order->get_date_created();
		$type    = self::text( $order, $k['type'] );
		$m       = array(
			'id'            => 'MV-' . $order->get_id(),
			'productId'     => self::text( $order, $k['productId'] ),
			'productName'   => self::text( $order, $k['productName'] ),
			'sku'           => self::text( $order, $k['sku'] ),
			'warehouseId'   => self::text( $order, $k['warehouseId'] ),
			'warehouseName' => self::text( $order, $k['warehouseName'] ),
			'type'          => '' !== $type ? $type : 'adjustment',
			'qty'           => self::num( $order, $k['qty'] ),
			'actor'         => self::text( $order, $k['actor'], 'wordpress' ),
			'at'            => $created ? $created->date( 'c' ) : '',
		);
		$reference = self::text( $order, $k['reference'] );
		$note      = self::text( $order, $k['note'] );
		if ( '' !== $reference ) {
			$m['reference'] = $reference;
		}
		if ( '' !== $note ) {
			$m['note'] = $note;
		}
		return $m;
	}

	/**
	 * Movement log filtered by warehouse.
	 *
	 * @param string $warehouse_id Optional warehouse id.
	 * @return array
	 */
	private static function list_movements( $warehouse_id = '' ) {
		$out = array();
		foreach ( self::all_orders() as $order ) {
			if ( self::is_movement( $order ) ) {
				$m = self::map_movement( $order );
				if ( '' === $warehouse_id || $m['warehouseId'] === $warehouse_id ) {
					$out[] = $m;
				}
			}
		}
		return $out;
	}

	/**
	 * Finds a movement by idempotency key.
	 *
	 * @param string $key Idempotency key.
	 * @return array|null
	 */
	private static function find_movement_by_idem( $key ) {
		if ( '' === $key ) {
			return null;
		}
		$k = self::mv_meta();
		foreach ( self::all_orders() as $order ) {
			if ( self::is_movement( $order ) && self::text( $order, $k['idem'] ) === $key ) {
				return self::map_movement( $order );
			}
		}
		return null;
	}

	/**
	 * Finds a movement by reference + type.
	 *
	 * @param string $reference Reference.
	 * @param string $type      Movement type.
	 * @return array|null
	 */
	private static function find_movement_by_reference( $reference, $type ) {
		$k = self::mv_meta();
		foreach ( self::all_orders() as $order ) {
			if ( self::is_movement( $order )
				&& self::text( $order, $k['reference'] ) === $reference
				&& self::text( $order, $k['type'] ) === $type ) {
				return self::map_movement( $order );
			}
		}
		return null;
	}

	/**
	 * Records an immutable movement.
	 *
	 * @param array $input Movement input.
	 * @return array
	 */
	private static function record_movement( array $input ) {
		$k     = self::mv_meta();
		$order = self::create_record_order(
			'dpc_movement',
			'Stock movement (DPC NEXUS)',
			'Stock movement log - not a sales order',
			array(
				self::RECORD_KEY => 'movement',
				$k['productId']  => $input['productId'],
				$k['productName'] => $input['productName'],
				$k['sku']        => $input['sku'],
				$k['warehouseId'] => $input['warehouse']['id'],
				$k['warehouseName'] => $input['warehouse']['name'],
				$k['type']       => $input['type'],
				$k['qty']        => $input['qty'],
				$k['reference']  => isset( $input['reference'] ) ? $input['reference'] : null,
				$k['note']       => isset( $input['note'] ) ? $input['note'] : null,
				$k['actor']      => $input['actor'],
				$k['idem']       => isset( $input['idempotencyKey'] ) ? $input['idempotencyKey'] : null,
			)
		);
		return self::map_movement( $order );
	}

	/**
	 * Applies a signed delta and logs a movement.
	 *
	 * @param WC_Product $product   Product.
	 * @param array      $warehouse Warehouse DTO.
	 * @param int        $delta     Signed change.
	 * @param array      $movement  Movement fields.
	 * @return array|WP_Error
	 */
	private static function apply_delta( $product, $warehouse, $delta, array $movement ) {
		$map     = self::parse_stock_map( $product );
		$current = isset( $map[ $warehouse['id'] ] ) ? $map[ $warehouse['id'] ] : 0;
		$next    = $current + $delta;
		if ( $next < 0 ) {
			return new WP_Error(
				'dpc_bad_request',
				sprintf( 'Only %d unit(s) available in %s', $current, $warehouse['name'] ),
				array( 'status' => 400 )
			);
		}
		if ( 0 === $next ) {
			unset( $map[ $warehouse['id'] ] );
		} else {
			$map[ $warehouse['id'] ] = $next;
		}
		self::write_stock_map( $product, $map );

		$row = self::record_movement(
			array_merge(
				$movement,
				array(
					'productId'   => (string) $product->get_id(),
					'productName' => $product->get_name(),
					'sku'         => $product->get_sku() ? $product->get_sku() : (string) $product->get_id(),
					'warehouse'   => $warehouse,
				)
			)
		);
		self::sync_product_to_woo( $product );
		return $row;
	}

	/**
	 * Add stock (positive) with optional cost + supplier note.
	 *
	 * @param array $input Input.
	 * @return array|WP_Error
	 */
	private static function add_stock( array $input ) {
		$idem = isset( $input['idempotencyKey'] ) ? (string) $input['idempotencyKey'] : '';
		if ( '' !== $idem ) {
			$existing = self::find_movement_by_idem( $idem );
			if ( $existing ) {
				return array(
					'movement' => $existing,
					'product'  => self::product_stock_info( $existing['productId'] ),
				);
			}
		}

		$quantity = (int) floor( (float) $input['quantity'] );
		if ( $quantity <= 0 ) {
			return new WP_Error( 'dpc_bad_request', 'quantity must be greater than 0', array( 'status' => 400 ) );
		}
		$warehouse = self::get_warehouse( $input['warehouseId'] );
		if ( ! $warehouse ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		$product = wc_get_product( (int) $input['productId'] );
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}

		$note_parts = array();
		if ( ! empty( $input['supplier'] ) ) {
			$note_parts[] = 'Supplier: ' . $input['supplier'];
		}
		if ( ! empty( $input['notes'] ) ) {
			$note_parts[] = $input['notes'];
		}

		$movement = self::apply_delta(
			$product,
			$warehouse,
			$quantity,
			array(
				'type'           => 'stock_in',
				'qty'            => $quantity,
				'reference'      => isset( $input['reference'] ) ? $input['reference'] : null,
				'note'           => implode( ' - ', $note_parts ),
				'actor'          => $input['actor'],
				'idempotencyKey' => '' !== $idem ? $idem : null,
			)
		);
		if ( is_wp_error( $movement ) ) {
			return $movement;
		}

		if ( isset( $input['costPrice'] ) && is_numeric( $input['costPrice'] ) && (float) $input['costPrice'] > 0 ) {
			$cost    = (float) $input['costPrice'];
			$costmap = self::parse_cost_map( $product );
			$costmap[ $warehouse['id'] ] = $cost;
			self::write_cost_map( $product, $costmap );
			if ( 0.0 === self::product_cost( $product ) ) {
				$product->update_meta_data( self::PRODUCT_COST_META, $cost );
				$product->save();
			}
		}

		return array(
			'movement' => $movement,
			'product'  => self::product_stock_info( $product->get_id() ),
		);
	}

	/**
	 * Manual signed adjustment.
	 *
	 * @param array $input Input.
	 * @return array|WP_Error
	 */
	private static function adjust_stock( array $input ) {
		$idem = isset( $input['idempotencyKey'] ) ? (string) $input['idempotencyKey'] : '';
		if ( '' !== $idem ) {
			$existing = self::find_movement_by_idem( $idem );
			if ( $existing ) {
				return $existing;
			}
		}
		$delta = (int) floor( (float) $input['delta'] );
		if ( 0 === $delta ) {
			return new WP_Error( 'dpc_bad_request', 'delta must be a non-zero integer', array( 'status' => 400 ) );
		}
		$warehouse = self::get_warehouse( $input['warehouseId'] );
		if ( ! $warehouse ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		$product = wc_get_product( (int) $input['productId'] );
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}
		return self::apply_delta(
			$product,
			$warehouse,
			$delta,
			array(
				'type'           => isset( $input['type'] ) ? $input['type'] : 'adjustment',
				'qty'            => $delta,
				'reference'      => isset( $input['reference'] ) ? $input['reference'] : null,
				'note'           => isset( $input['note'] ) ? $input['note'] : null,
				'actor'          => $input['actor'],
				'idempotencyKey' => '' !== $idem ? $idem : null,
			)
		);
	}

	/**
	 * Sets absolute quantity / cost for one product in one warehouse.
	 *
	 * @param array $input Input.
	 * @return array|WP_Error
	 */
	private static function set_warehouse_stock( array $input ) {
		$idem    = isset( $input['idempotencyKey'] ) ? (string) $input['idempotencyKey'] : '';
		$product = wc_get_product( (int) $input['productId'] );
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}
		$warehouse = self::get_warehouse( $input['warehouseId'] );
		if ( ! $warehouse ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}

		$map     = self::parse_stock_map( $product );
		$current = isset( $map[ $warehouse['id'] ] ) ? $map[ $warehouse['id'] ] : 0;
		$target  = $current;
		if ( isset( $input['quantity'] ) ) {
			$target = (int) floor( (float) $input['quantity'] );
			if ( $target < 0 ) {
				return new WP_Error( 'dpc_bad_request', 'quantity must be 0 or greater', array( 'status' => 400 ) );
			}
		}

		if ( isset( $input['costPrice'] ) && is_numeric( $input['costPrice'] ) ) {
			$cost    = (float) $input['costPrice'];
			$costmap = self::parse_cost_map( $product );
			if ( $cost > 0 ) {
				$costmap[ $warehouse['id'] ] = $cost;
			} else {
				unset( $costmap[ $warehouse['id'] ] );
			}
			self::write_cost_map( $product, $costmap );
		}

		$movement = null;
		$existing = '' !== $idem ? self::find_movement_by_idem( $idem ) : null;
		if ( $existing ) {
			$movement = $existing;
		} else {
			$delta = $target - $current;
			if ( 0 !== $delta ) {
				$movement = self::apply_delta(
					$product,
					$warehouse,
					$delta,
					array(
						'type'           => 'adjustment',
						'qty'            => $delta,
						'note'           => isset( $input['note'] ) ? $input['note'] : null,
						'actor'          => $input['actor'],
						'idempotencyKey' => '' !== $idem ? $idem : null,
					)
				);
				if ( is_wp_error( $movement ) ) {
					return $movement;
				}
			}
		}

		$row = null;
		foreach ( self::warehouse_stock_rows( $warehouse['id'] ) as $candidate ) {
			if ( $candidate['productId'] === (string) $product->get_id() ) {
				$row = $candidate;
				break;
			}
		}
		if ( ! $row ) {
			$row = array(
				'productId' => (string) $product->get_id(),
				'name'      => $product->get_name(),
				'sku'       => $product->get_sku() ? $product->get_sku() : (string) $product->get_id(),
				'quantity'  => $target,
				'reserved'  => 0,
				'available' => $target,
				'updatedAt' => gmdate( 'c' ),
			);
		}

		$result = array();
		if ( $movement ) {
			$result['movement'] = $movement;
		}
		$result['row'] = $row;
		return $result;
	}

	/* ------------------------------------------------------------- transfers */

	/**
	 * Maps a transfer order.
	 *
	 * @param WC_Order $order Order.
	 * @return array
	 */
	private static function map_transfer( $order ) {
		$k       = self::tr_meta();
		$created = $order->get_date_created();
		$status  = self::text( $order, $k['status'] );
		$t       = array(
			'id'                => 'TR-' . $order->get_id(),
			'fromWarehouseId'   => self::text( $order, $k['fromId'] ),
			'fromWarehouseName' => self::text( $order, $k['fromName'] ),
			'toWarehouseId'     => self::text( $order, $k['toId'] ),
			'toWarehouseName'   => self::text( $order, $k['toName'] ),
			'productId'         => self::text( $order, $k['productId'] ),
			'productName'       => self::text( $order, $k['productName'] ),
			'sku'               => self::text( $order, $k['sku'] ),
			'quantity'          => (int) self::num( $order, $k['quantity'] ),
			'status'            => in_array( $status, self::transfer_statuses(), true ) ? $status : 'draft',
			'createdBy'         => self::text( $order, $k['createdBy'], 'wordpress' ),
			'createdAt'         => $created ? $created->date( 'c' ) : '',
		);
		$notes       = self::text( $order, $k['notes'] );
		$completed   = self::text( $order, $k['completedAt'] );
		if ( '' !== $notes ) {
			$t['notes'] = $notes;
		}
		if ( '' !== $completed ) {
			$t['completedAt'] = $completed;
		}
		return $t;
	}

	/**
	 * Numeric order id from `TR-123`.
	 *
	 * @param string $id Transfer id.
	 * @return int
	 */
	private static function transfer_order_id( $id ) {
		return (int) ( 0 === strpos( $id, 'TR-' ) ? substr( $id, 3 ) : $id );
	}

	/**
	 * Lists transfers, optionally by warehouse.
	 *
	 * @param string $warehouse_id Optional warehouse id.
	 * @return array
	 */
	private static function list_transfers( $warehouse_id = '' ) {
		$out = array();
		foreach ( self::all_orders() as $order ) {
			if ( self::is_transfer( $order ) ) {
				$t = self::map_transfer( $order );
				if ( '' === $warehouse_id || $t['fromWarehouseId'] === $warehouse_id || $t['toWarehouseId'] === $warehouse_id ) {
					$out[] = $t;
				}
			}
		}
		return $out;
	}

	/**
	 * Loads one transfer.
	 *
	 * @param string $id Transfer id.
	 * @return array|null
	 */
	private static function get_transfer( $id ) {
		$order = wc_get_order( self::transfer_order_id( $id ) );
		if ( ! $order instanceof WC_Order || ! self::is_transfer( $order ) ) {
			return null;
		}
		return self::map_transfer( $order );
	}

	/**
	 * Creates a draft transfer.
	 *
	 * @param array $input Input.
	 * @return array|WP_Error
	 */
	private static function create_transfer( array $input ) {
		$quantity = (int) floor( (float) $input['quantity'] );
		if ( $quantity <= 0 ) {
			return new WP_Error( 'dpc_bad_request', 'quantity must be greater than 0', array( 'status' => 400 ) );
		}
		if ( $input['fromWarehouseId'] === $input['toWarehouseId'] ) {
			return new WP_Error( 'dpc_bad_request', 'cannot transfer to the same warehouse', array( 'status' => 400 ) );
		}
		$from = self::get_warehouse( $input['fromWarehouseId'] );
		if ( ! $from ) {
			return new WP_Error( 'dpc_not_found', 'Source warehouse not found.', array( 'status' => 404 ) );
		}
		$to = self::get_warehouse( $input['toWarehouseId'] );
		if ( ! $to ) {
			return new WP_Error( 'dpc_not_found', 'Destination warehouse not found.', array( 'status' => 404 ) );
		}
		$product = wc_get_product( (int) $input['productId'] );
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}

		$map       = self::parse_stock_map( $product );
		$available = isset( $map[ $from['id'] ] ) ? $map[ $from['id'] ] : 0;
		if ( $quantity > $available ) {
			return new WP_Error(
				'dpc_bad_request',
				sprintf( 'Only %d unit(s) available in %s', $available, $from['name'] ),
				array( 'status' => 400 )
			);
		}

		$k     = self::tr_meta();
		$order = self::create_record_order(
			'dpc_transfer',
			'Stock transfer (DPC NEXUS)',
			'Stock transfer - not a sales order',
			array(
				self::RECORD_KEY  => 'transfer',
				$k['fromId']      => $from['id'],
				$k['fromName']    => $from['name'],
				$k['toId']        => $to['id'],
				$k['toName']      => $to['name'],
				$k['productId']   => (string) $product->get_id(),
				$k['productName'] => $product->get_name(),
				$k['sku']         => $product->get_sku() ? $product->get_sku() : (string) $product->get_id(),
				$k['quantity']    => $quantity,
				$k['status']      => 'draft',
				$k['notes']       => isset( $input['notes'] ) ? $input['notes'] : null,
				$k['createdBy']   => $input['actor'],
			)
		);
		return self::map_transfer( $order );
	}

	/**
	 * Moves a transfer to a new status (completing moves the stock).
	 *
	 * @param string $id              Transfer id.
	 * @param string $status          New status.
	 * @param string $idempotency_key Optional idempotency key.
	 * @return array|WP_Error
	 */
	private static function set_transfer_status( $id, $status, $idempotency_key = '' ) {
		$order_id = self::transfer_order_id( $id );
		$order    = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order || ! self::is_transfer( $order ) ) {
			return new WP_Error( 'dpc_not_found', 'Transfer not found.', array( 'status' => 404 ) );
		}
		$transfer = self::map_transfer( $order );
		$k        = self::tr_meta();

		if ( 'completed' === $status && 'cancelled' === $transfer['status'] ) {
			return new WP_Error( 'dpc_bad_request', 'a cancelled transfer cannot be completed', array( 'status' => 400 ) );
		}
		if ( 'completed' === $transfer['status'] && 'completed' !== $status ) {
			return new WP_Error( 'dpc_bad_request', 'a completed transfer cannot be reopened', array( 'status' => 400 ) );
		}

		if ( 'completed' === $status && 'completed' !== $transfer['status'] ) {
			$already = '' !== $idempotency_key ? self::find_movement_by_idem( $idempotency_key ) : null;
			if ( ! $already ) {
				$already = self::find_movement_by_reference( $transfer['id'], 'transfer_out' );
			}
			if ( ! $already ) {
				$from = self::get_warehouse( $transfer['fromWarehouseId'] );
				$to   = self::get_warehouse( $transfer['toWarehouseId'] );
				if ( ! $from || ! $to ) {
					return new WP_Error( 'dpc_not_found', 'Transfer warehouse not found.', array( 'status' => 404 ) );
				}
				$out = self::adjust_stock(
					array(
						'productId'      => $transfer['productId'],
						'warehouseId'    => $from['id'],
						'delta'          => -$transfer['quantity'],
						'type'           => 'transfer_out',
						'reference'      => $transfer['id'],
						'note'           => 'Transfer to ' . $to['name'],
						'actor'          => $transfer['createdBy'],
						'idempotencyKey' => '' !== $idempotency_key ? $idempotency_key . ':out' : '',
					)
				);
				if ( is_wp_error( $out ) ) {
					return $out;
				}
				$in = self::adjust_stock(
					array(
						'productId'      => $transfer['productId'],
						'warehouseId'    => $to['id'],
						'delta'          => $transfer['quantity'],
						'type'           => 'transfer_in',
						'reference'      => $transfer['id'],
						'note'           => 'Transfer from ' . $from['name'],
						'actor'          => $transfer['createdBy'],
						'idempotencyKey' => '' !== $idempotency_key ? $idempotency_key . ':in' : '',
					)
				);
				if ( is_wp_error( $in ) ) {
					return $in;
				}
			}
			$order->update_meta_data( $k['status'], 'completed' );
			$order->update_meta_data( $k['completedAt'], gmdate( 'c' ) );
			$order->save();
			return self::map_transfer( $order );
		}

		$order->update_meta_data( $k['status'], $status );
		$order->save();
		return self::map_transfer( $order );
	}

	/**
	 * Force-deletes a transfer.
	 *
	 * @param string $id Transfer id.
	 * @return bool
	 */
	private static function delete_transfer( $id ) {
		$order = wc_get_order( self::transfer_order_id( $id ) );
		if ( ! $order instanceof WC_Order || ! self::is_transfer( $order ) ) {
			return false;
		}
		return (bool) $order->delete( true );
	}

	/* ------------------------------------------------- selling warehouse */

	/**
	 * Ensures the default WooCommerce selling warehouse exists + seeds it once.
	 *
	 * @return array
	 */
	private static function ensure_selling_warehouse() {
		$selling = null;
		foreach ( self::list_warehouses() as $w ) {
			if ( 'selling' === $w['type'] ) {
				$selling = $w;
				break;
			}
		}
		if ( ! $selling ) {
			$selling = self::create_warehouse(
				array(
					'name'   => 'WooCommerce',
					'code'   => 'WOO',
					'type'   => 'selling',
					'sync'   => true,
					'default' => true,
					'status' => 'active',
					'notes'  => 'Storefront stock - kept in sync with WooCommerce.',
				)
			);
		}
		if ( ! self::is_warehouse_hydrated( $selling['id'] ) ) {
			if ( self::hydrate_selling_warehouse( $selling ) ) {
				self::mark_warehouse_hydrated( $selling['id'] );
			}
		}
		return $selling;
	}

	/**
	 * Seeds the selling warehouse from WooCommerce stock (bounded per call).
	 *
	 * @param array $warehouse Warehouse DTO.
	 * @return bool
	 */
	private static function hydrate_selling_warehouse( $warehouse ) {
		$products  = wc_get_products( array( 'limit' => -1 ) );
		$written   = 0;
		$remaining = 0;
		foreach ( (array) $products as $product ) {
			if ( ! $product instanceof WC_Product || ! $product->get_manage_stock() ) {
				continue;
			}
			$qty = $product->get_stock_quantity();
			$qty = is_numeric( $qty ) ? (int) floor( (float) $qty ) : 0;
			if ( $qty <= 0 ) {
				continue;
			}
			$map = self::parse_stock_map( $product );
			if ( isset( $map[ $warehouse['id'] ] ) ) {
				continue;
			}
			if ( $written >= self::HYDRATE_BATCH ) {
				$remaining++;
				continue;
			}
			$map[ $warehouse['id'] ] = $qty;
			self::write_stock_map( $product, $map );
			$written++;
		}
		return 0 === $remaining;
	}

	/**
	 * Warehouse totals keyed by warehouse id.
	 *
	 * @return array<string,array>
	 */
	private static function warehouse_totals() {
		$rows   = self::list_product_stock();
		$totals = array();
		foreach ( $rows as $row ) {
			foreach ( $row['warehouses'] as $w ) {
				$id = $w['warehouseId'];
				if ( ! isset( $totals[ $id ] ) ) {
					$totals[ $id ] = array(
						'totalProducts' => 0,
						'outOfStock'    => 0,
						'totalQuantity' => 0,
						'totalValue'    => 0.0,
					);
				}
				$totals[ $id ]['totalProducts']++;
				$totals[ $id ]['totalQuantity'] += $w['quantity'];
				$totals[ $id ]['totalValue']    += isset( $w['value'] ) ? $w['value'] : 0;
			}
		}
		foreach ( $totals as $id => $entry ) {
			$entry['outOfStock']          = max( 0, count( $rows ) - $entry['totalProducts'] );
			$entry['totalValue']          = round( $entry['totalValue'], 2 );
			$totals[ $id ]                = $entry;
		}
		return $totals;
	}

	/**
	 * Adds derived totals to a warehouse row.
	 *
	 * @param array $warehouse Warehouse DTO.
	 * @param array $totals    Totals map.
	 * @return array
	 */
	private static function with_totals( $warehouse, $totals ) {
		$t = isset( $totals[ $warehouse['id'] ] ) ? $totals[ $warehouse['id'] ] : array();
		$warehouse['totalProducts'] = isset( $t['totalProducts'] ) ? $t['totalProducts'] : 0;
		$warehouse['outOfStock']    = isset( $t['outOfStock'] ) ? $t['outOfStock'] : 0;
		$warehouse['totalQuantity'] = isset( $t['totalQuantity'] ) ? $t['totalQuantity'] : 0;
		$warehouse['totalValue']    = isset( $t['totalValue'] ) ? $t['totalValue'] : 0;
		return $warehouse;
	}

	/* ============================================================ handlers */

	/**
	 * GET /warehouses
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_warehouses_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		self::ensure_selling_warehouse();
		$totals = self::warehouse_totals();
		$rows   = array();
		foreach ( self::list_warehouses() as $w ) {
			$rows[] = self::with_totals( $w, $totals );
		}
		return self::envelope( $rows );
	}

	/**
	 * GET /warehouses/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_warehouse_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$row = self::get_warehouse( $request->get_param( 'id' ) );
		if ( ! $row ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		return self::single( self::with_totals( $row, self::warehouse_totals() ) );
	}

	/**
	 * POST /warehouses
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_warehouse_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body = (array) $request->get_json_params();
		$name = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
		$code = isset( $body['code'] ) ? trim( (string) $body['code'] ) : '';
		if ( '' === $name ) {
			return new WP_Error( 'dpc_bad_request', 'name is required', array( 'status' => 400 ) );
		}
		if ( '' === $code ) {
			return new WP_Error( 'dpc_bad_request', 'code is required', array( 'status' => 400 ) );
		}
		if ( isset( $body['type'] ) && ! in_array( $body['type'], self::warehouse_types(), true ) ) {
			return new WP_Error( 'dpc_bad_request', 'type must be one of: ' . implode( ', ', self::warehouse_types() ), array( 'status' => 400 ) );
		}
		if ( self::get_warehouse_by_code( $code ) ) {
			return new WP_Error( 'dpc_conflict', 'code "' . $code . '" is already in use', array( 'status' => 409 ) );
		}
		return self::single( self::create_warehouse( $body ) );
	}

	/**
	 * PUT /warehouses/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_warehouse_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id   = $request->get_param( 'id' );
		$body = (array) $request->get_json_params();
		if ( ! self::get_warehouse( $id ) ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		if ( isset( $body['type'] ) && ! in_array( $body['type'], self::warehouse_types(), true ) ) {
			return new WP_Error( 'dpc_bad_request', 'type must be one of: ' . implode( ', ', self::warehouse_types() ), array( 'status' => 400 ) );
		}
		if ( isset( $body['code'] ) ) {
			$code = trim( (string) $body['code'] );
			if ( '' === $code ) {
				return new WP_Error( 'dpc_bad_request', 'code is required', array( 'status' => 400 ) );
			}
			$dup = self::get_warehouse_by_code( $code );
			if ( $dup && $dup['id'] !== $id ) {
				return new WP_Error( 'dpc_conflict', 'code "' . $code . '" is already in use', array( 'status' => 409 ) );
			}
		}
		$updated = self::update_warehouse( $id, $body );
		if ( ! $updated ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		return self::single( $updated );
	}

	/**
	 * DELETE /warehouses/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_warehouse_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id = $request->get_param( 'id' );
		if ( ! self::delete_warehouse( $id ) ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		return self::single( array( 'id' => $id, 'deleted' => true ) );
	}

	/**
	 * GET /warehouses/{id}/stock
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function warehouse_stock_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id = $request->get_param( 'id' );
		if ( ! self::get_warehouse( $id ) ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		return self::envelope( self::warehouse_stock_rows( $id ) );
	}

	/**
	 * POST /warehouses/{id}/stock
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function add_stock_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$warehouse_id = $request->get_param( 'id' );
		if ( ! self::get_warehouse( $warehouse_id ) ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		$body       = (array) $request->get_json_params();
		$product_id = isset( $body['productId'] ) ? trim( (string) $body['productId'] ) : '';
		if ( '' === $product_id ) {
			return new WP_Error( 'dpc_bad_request', 'productId is required', array( 'status' => 400 ) );
		}
		$result = self::add_stock(
			array(
				'productId'      => $product_id,
				'warehouseId'    => $warehouse_id,
				'quantity'       => isset( $body['quantity'] ) ? $body['quantity'] : 0,
				'costPrice'      => isset( $body['costPrice'] ) ? $body['costPrice'] : null,
				'supplier'       => ! empty( $body['supplier'] ) ? (string) $body['supplier'] : '',
				'reference'      => ! empty( $body['reference'] ) ? (string) $body['reference'] : '',
				'notes'          => ! empty( $body['notes'] ) ? (string) $body['notes'] : '',
				'actor'          => isset( $auth['user_id'] ) ? (string) $auth['user_id'] : 'wordpress',
				'idempotencyKey' => ! empty( $body['idempotencyKey'] ) ? (string) $body['idempotencyKey'] : '',
			)
		);
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return self::single( $result );
	}

	/**
	 * PUT /warehouses/{id}/stock/{productId}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function set_stock_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$warehouse_id = $request->get_param( 'id' );
		if ( ! self::get_warehouse( $warehouse_id ) ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		$body = (array) $request->get_json_params();
		if ( ! isset( $body['quantity'] ) && ! isset( $body['costPrice'] ) ) {
			return new WP_Error( 'dpc_bad_request', 'quantity or costPrice is required', array( 'status' => 400 ) );
		}
		$input = array(
			'productId'      => $request->get_param( 'productId' ),
			'warehouseId'    => $warehouse_id,
			'costPrice'      => isset( $body['costPrice'] ) ? $body['costPrice'] : null,
			'note'           => ! empty( $body['note'] ) ? (string) $body['note'] : '',
			'actor'          => isset( $auth['user_id'] ) ? (string) $auth['user_id'] : 'wordpress',
			'idempotencyKey' => ! empty( $body['idempotencyKey'] ) ? (string) $body['idempotencyKey'] : '',
		);
		if ( isset( $body['quantity'] ) ) {
			$input['quantity'] = $body['quantity'];
		}
		$result = self::set_warehouse_stock( $input );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return self::single( $result );
	}

	/**
	 * GET /warehouses/{id}/movements
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function warehouse_movements_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id = $request->get_param( 'id' );
		if ( ! self::get_warehouse( $id ) ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		return self::envelope( self::list_movements( $id ) );
	}

	/**
	 * GET /warehouses/{id}/transfers
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function warehouse_transfers_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id = $request->get_param( 'id' );
		if ( ! self::get_warehouse( $id ) ) {
			return new WP_Error( 'dpc_not_found', 'Warehouse not found.', array( 'status' => 404 ) );
		}
		return self::envelope( self::list_transfers( $id ) );
	}

	/**
	 * GET /inventory/stock
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function inventory_stock_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		self::ensure_selling_warehouse();
		return self::envelope( self::list_product_stock() );
	}

	/**
	 * GET /inventory/stock/{productId}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function inventory_product_stock_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$row = self::product_stock_info( $request->get_param( 'productId' ) );
		if ( ! $row ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}
		return self::single( $row );
	}

	/**
	 * GET /inventory/movements
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function inventory_movements_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$warehouse_id = (string) $request->get_param( 'warehouseId' );
		$product_id   = (string) $request->get_param( 'productId' );
		$rows         = self::list_movements( $warehouse_id );
		if ( '' !== $product_id ) {
			$rows = array_values(
				array_filter(
					$rows,
					function ( $r ) use ( $product_id ) {
						return $r['productId'] === $product_id;
					}
				)
			);
		}
		return self::envelope( $rows );
	}

	/**
	 * POST /inventory/stock/{productId}/adjust
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function inventory_adjust_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body         = (array) $request->get_json_params();
		$warehouse_id = isset( $body['warehouseId'] ) ? trim( (string) $body['warehouseId'] ) : '';
		if ( '' === $warehouse_id ) {
			return new WP_Error( 'dpc_bad_request', 'warehouseId is required', array( 'status' => 400 ) );
		}
		$delta = isset( $body['delta'] ) ? $body['delta'] : ( isset( $body['quantity'] ) ? $body['quantity'] : 0 );
		$result = self::adjust_stock(
			array(
				'productId'      => $request->get_param( 'productId' ),
				'warehouseId'    => $warehouse_id,
				'delta'          => $delta,
				'reference'      => ! empty( $body['reference'] ) ? (string) $body['reference'] : '',
				'note'           => ! empty( $body['note'] ) ? (string) $body['note'] : '',
				'actor'          => isset( $auth['user_id'] ) ? (string) $auth['user_id'] : 'wordpress',
				'idempotencyKey' => ! empty( $body['idempotencyKey'] ) ? (string) $body['idempotencyKey'] : '',
			)
		);
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return self::single( $result );
	}

	/**
	 * GET /transfers
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_transfers_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$warehouse_id = (string) $request->get_param( 'warehouseId' );
		return self::envelope( self::list_transfers( $warehouse_id ) );
	}

	/**
	 * GET /transfers/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_transfer_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$row = self::get_transfer( $request->get_param( 'id' ) );
		if ( ! $row ) {
			return new WP_Error( 'dpc_not_found', 'Transfer not found.', array( 'status' => 404 ) );
		}
		return self::single( $row );
	}

	/**
	 * POST /transfers
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_transfer_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body    = (array) $request->get_json_params();
		$from    = isset( $body['fromWarehouseId'] ) ? trim( (string) $body['fromWarehouseId'] ) : '';
		$to      = isset( $body['toWarehouseId'] ) ? trim( (string) $body['toWarehouseId'] ) : '';
		$product = isset( $body['productId'] ) ? trim( (string) $body['productId'] ) : '';
		if ( '' === $from ) {
			return new WP_Error( 'dpc_bad_request', 'fromWarehouseId is required', array( 'status' => 400 ) );
		}
		if ( '' === $to ) {
			return new WP_Error( 'dpc_bad_request', 'toWarehouseId is required', array( 'status' => 400 ) );
		}
		if ( '' === $product ) {
			return new WP_Error( 'dpc_bad_request', 'productId is required', array( 'status' => 400 ) );
		}
		$result = self::create_transfer(
			array(
				'fromWarehouseId' => $from,
				'toWarehouseId'   => $to,
				'productId'       => $product,
				'quantity'        => isset( $body['quantity'] ) ? $body['quantity'] : 0,
				'notes'           => ! empty( $body['notes'] ) ? (string) $body['notes'] : '',
				'actor'           => isset( $auth['user_id'] ) ? (string) $auth['user_id'] : 'wordpress',
			)
		);
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return self::single( $result );
	}

	/**
	 * PUT /transfers/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_transfer_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body = (array) $request->get_json_params();
		if ( ! isset( $body['status'] ) ) {
			return new WP_Error( 'dpc_bad_request', 'status is required', array( 'status' => 400 ) );
		}
		if ( ! in_array( $body['status'], self::transfer_statuses(), true ) ) {
			return new WP_Error( 'dpc_bad_request', 'status must be one of: ' . implode( ', ', self::transfer_statuses() ), array( 'status' => 400 ) );
		}
		$result = self::set_transfer_status(
			$request->get_param( 'id' ),
			$body['status'],
			! empty( $body['idempotencyKey'] ) ? (string) $body['idempotencyKey'] : ''
		);
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return self::single( $result );
	}

	/**
	 * DELETE /transfers/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_transfer_route( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id = $request->get_param( 'id' );
		if ( ! self::delete_transfer( $id ) ) {
			return new WP_Error( 'dpc_not_found', 'Transfer not found.', array( 'status' => 404 ) );
		}
		return self::single( array( 'id' => $id, 'deleted' => true ) );
	}
}
