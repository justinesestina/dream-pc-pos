<?php
/**
 * Catalog data (products + categories) served straight from WooCommerce.
 *
 * These endpoints are the connector-native replacement for the catalog routes
 * that previously lived in the Node backend. Responses use the same envelope
 * (`{ data, meta }`) so the frontend api-client can consume them unchanged.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Read access to the WooCommerce catalog, mapped to the frontend DTOs.
 */
class DPC_POS_Catalog {

	/**
	 * WooCommerce product type => frontend ProductType.
	 *
	 * @return array<string,string>
	 */
	private static function type_map() {
		return array(
			'simple'   => 'product',
			'variable' => 'product',
			'grouped'  => 'product',
			'external' => 'product',
			'service'  => 'service',
			'bundle'   => 'bundle',
		);
	}

	/**
	 * True when WooCommerce is available.
	 *
	 * @return bool
	 */
	private static function wc_active() {
		return class_exists( 'WooCommerce' ) && function_exists( 'wc_get_products' );
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
	 * Wraps a payload in the single-object envelope used by the frontend.
	 *
	 * @param mixed $item Payload.
	 * @return WP_REST_Response
	 */
	private static function single( $item ) {
		return rest_ensure_response( array( 'data' => $item ) );
	}

	/**
	 * Maps a WC_Product to the frontend Product DTO.
	 *
	 * @param WC_Product $product WooCommerce product.
	 * @return array
	 */
	private static function map_product( $product ) {
		$id     = $product->get_id();
		$cats   = $product->get_category_ids();
		$cat_id = $cats ? (int) $cats[0] : 0;
		$cat_name = $cat_id ? (string) get_term_field( 'name', $cat_id, 'product_cat' ) : '';

		$brand = (string) $product->get_meta( '_dpc_brand', true );
		$attrs = array();
		foreach ( $product->get_attributes() as $attribute ) {
			if ( ! $attribute instanceof WC_Product_Attribute ) {
				continue;
			}
			$label = wc_attribute_label( $attribute->get_name() );
			if ( $attribute->is_taxonomy() ) {
				$options = wc_get_product_terms( $id, $attribute->get_name(), array( 'fields' => 'names' ) );
			} else {
				$options = $attribute->get_options();
			}
			$value          = implode( ', ', array_map( 'strval', (array) $options ) );
			$attrs[ $label ] = $value;
			if ( '' === $brand && false !== stripos( $label, 'brand' ) ) {
				$brand = $value;
			}
		}

		$regular = (string) $product->get_regular_price();
		$sale    = (string) $product->get_sale_price();
		$type    = $product->get_type();
		$map     = self::type_map();

		$serial = $product->get_meta( '_dpc_serial_tracked', true );

		$created  = $product->get_date_created();
		$modified = $product->get_date_modified();
		$image_id = $product->get_image_id();

		return array(
			'id'              => (string) $id,
			'sku'             => $product->get_sku() ? $product->get_sku() : (string) $id,
			'name'            => $product->get_name(),
			'brand'           => $brand,
			'categoryId'      => $cat_id ? (string) $cat_id : '',
			'categoryName'    => $cat_name,
			'productType'     => isset( $map[ $type ] ) ? $map[ $type ] : 'product',
			'description'     => $product->get_description() ? $product->get_description() : $product->get_short_description(),
			'price'           => '' === $regular ? 0.0 : (float) $regular,
			'salePrice'       => '' === $sale ? null : (float) $sale,
			'cost'            => (float) $product->get_meta( '_dpc_cost', true ),
			'serialTracked'   => ( true === $serial || 'true' === $serial || '1' === (string) $serial ),
			'warrantyMonths'  => (int) $product->get_meta( '_dpc_warranty_months', true ),
			'location'        => (string) $product->get_meta( '_dpc_location', true ),
			'supplier'        => (string) $product->get_meta( '_dpc_supplier', true ),
			'specs'           => $attrs,
			'status'          => $product->get_status(),
			'stock_quantity'  => $product->get_stock_quantity(),
			'stock_status'    => $product->get_stock_status(),
			'manage_stock'    => $product->get_manage_stock(),
			'imageUrl'        => self::product_image_url( $product ),
			'dateCreated'     => $created ? $created->date( 'c' ) : '',
			'dateModified'    => $modified ? $modified->date( 'c' ) : '',
		);
	}

	/**
	 * Maps a product_cat term to the frontend Category DTO.
	 *
	 * @param WP_Term $term Category term.
	 * @return array
	 */
	private static function map_category( $term ) {
		$thumb_id = (int) get_term_meta( $term->term_id, 'thumbnail_id', true );
		$display  = (string) get_term_meta( $term->term_id, 'display_type', true );
		$image    = $thumb_id ? (string) wp_get_attachment_image_url( $thumb_id, 'full' ) : '';
		if ( '' === $image ) {
			$image = (string) get_term_meta( $term->term_id, '_dpc_image_url', true );
		}

		return array(
			'id'          => (string) $term->term_id,
			'name'        => $term->name,
			'slug'        => $term->slug,
			'parentId'    => $term->parent ? (string) $term->parent : '',
			'description' => $term->description,
			'display'     => '' !== $display ? $display : 'default',
			'image'       => $image,
			'archived'    => false,
			'createdAt'   => '',
			'key'         => $term->slug,
			'count'       => (int) $term->count,
		);
	}

	/**
	 * GET /products
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_products( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}

		$args = array(
			'limit'   => -1,
			'status'  => array( 'publish', 'draft', 'private', 'pending' ),
			'orderby' => 'title',
			'order'   => 'ASC',
		);
		$search = (string) $request->get_param( 'search' );
		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		$products = wc_get_products( $args );
		$items    = array();
		foreach ( (array) $products as $product ) {
			if ( $product instanceof WC_Product ) {
				$items[] = self::map_product( $product );
			}
		}

		return self::envelope( $items );
	}

	/**
	 * GET /products/{id}
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_product( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id      = (int) $request->get_param( 'id' );
		$product = $id ? wc_get_product( $id ) : false;
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}
		return rest_ensure_response( array( 'data' => self::map_product( $product ) ) );
	}

	/**
	 * GET /categories
	 *
	 * @param WP_REST_Request $request REST request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_categories( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$terms = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return $terms;
		}

		$items = array();
		foreach ( (array) $terms as $term ) {
			if ( $term instanceof WP_Term ) {
				$items[] = self::map_category( $term );
			}
		}
		return self::envelope( $items );
	}

	/**
	 * Resolves a product image URL (attachment first, then stored URL meta).
	 *
	 * @param WC_Product $product Product.
	 * @return string
	 */
	private static function product_image_url( $product ) {
		$image_id = $product->get_image_id();
		if ( $image_id ) {
			$url = wp_get_attachment_image_url( $image_id, 'full' );
			if ( $url ) {
				return $url;
			}
		}
		return (string) $product->get_meta( '_dpc_image_url', true );
	}

	/**
	 * Applies the editable product fields onto a WC_Product.
	 *
	 * @param WC_Product $product Product.
	 * @param array      $body    Request body.
	 * @param bool       $creating Whether this is a create.
	 * @return WP_Error|null
	 */
	private static function apply_product_input( $product, array $body, $creating ) {
		if ( $creating || isset( $body['name'] ) ) {
			$name = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
			if ( '' === $name ) {
				return new WP_Error( 'dpc_bad_request', 'name is required', array( 'status' => 400 ) );
			}
			$product->set_name( $name );
		}

		if ( isset( $body['price'] ) && is_numeric( $body['price'] ) ) {
			$product->set_regular_price( (string) (float) $body['price'] );
		}
		if ( array_key_exists( 'salePrice', $body ) ) {
			if ( null === $body['salePrice'] || '' === $body['salePrice'] ) {
				$product->set_sale_price( '' );
			} elseif ( is_numeric( $body['salePrice'] ) ) {
				$product->set_sale_price( (string) (float) $body['salePrice'] );
			}
		}
		if ( isset( $body['stock_quantity'] ) && is_numeric( $body['stock_quantity'] ) ) {
			$product->set_manage_stock( true );
			$product->set_stock_quantity( max( 0, (int) floor( (float) $body['stock_quantity'] ) ) );
		}
		if ( isset( $body['manage_stock'] ) ) {
			$product->set_manage_stock( (bool) $body['manage_stock'] );
		}
		if ( isset( $body['stock_status'] ) && '' !== $body['stock_status'] ) {
			$allowed = array( 'instock', 'outofstock', 'onbackorder' );
			if ( ! in_array( $body['stock_status'], $allowed, true ) ) {
				return new WP_Error( 'dpc_bad_request', 'stock_status must be one of: instock, outofstock, onbackorder', array( 'status' => 400 ) );
			}
			$product->set_stock_status( $body['stock_status'] );
		}
		if ( isset( $body['sku'] ) ) {
			try {
				$product->set_sku( (string) $body['sku'] );
			} catch ( Exception $e ) {
				return new WP_Error( 'dpc_bad_request', 'SKU already in use.', array( 'status' => 409 ) );
			}
		}
		if ( isset( $body['description'] ) ) {
			$product->set_description( (string) $body['description'] );
		}
		if ( isset( $body['status'] ) && '' !== $body['status'] ) {
			$product->set_status( (string) $body['status'] );
		}
		if ( ! empty( $body['categoryId'] ) ) {
			$product->set_category_ids( array( (int) $body['categoryId'] ) );
		}
		if ( array_key_exists( 'imageUrl', $body ) ) {
			$url = trim( (string) $body['imageUrl'] );
			$product->update_meta_data( '_dpc_image_url', $url );
			if ( '' !== $url ) {
				$attachment_id = attachment_url_to_postid( $url );
				if ( $attachment_id ) {
					$product->set_image_id( $attachment_id );
				}
			} else {
				$product->set_image_id( 0 );
			}
		}

		if ( isset( $body['cost'] ) ) {
			$product->update_meta_data( '_dpc_cost', (float) $body['cost'] );
		}
		if ( isset( $body['brand'] ) ) {
			$product->update_meta_data( '_dpc_brand', (string) $body['brand'] );
		}
		if ( isset( $body['warrantyMonths'] ) ) {
			$product->update_meta_data( '_dpc_warranty_months', max( 0, (int) floor( (float) $body['warrantyMonths'] ) ) );
		}
		if ( isset( $body['serialTracked'] ) ) {
			$product->update_meta_data( '_dpc_serial_tracked', (bool) $body['serialTracked'] );
		}
		if ( isset( $body['location'] ) ) {
			$product->update_meta_data( '_dpc_location', (string) $body['location'] );
		}
		if ( isset( $body['supplier'] ) ) {
			$product->update_meta_data( '_dpc_supplier', (string) $body['supplier'] );
		}
		return null;
	}

	/**
	 * POST /products
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_product( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body    = (array) $request->get_json_params();
		$product = new WC_Product_Simple();
		$error   = self::apply_product_input( $product, $body, true );
		if ( is_wp_error( $error ) ) {
			return $error;
		}
		$product->set_status( isset( $body['status'] ) && '' !== $body['status'] ? (string) $body['status'] : 'publish' );
		try {
			$product->save();
		} catch ( Exception $e ) {
			return new WP_Error( 'dpc_error', $e->getMessage(), array( 'status' => 400 ) );
		}
		return self::single( self::map_product( wc_get_product( $product->get_id() ) ) );
	}

	/**
	 * PUT /products/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_product( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id      = (int) $request->get_param( 'id' );
		$product = $id ? wc_get_product( $id ) : false;
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}
		$body  = (array) $request->get_json_params();
		$error = self::apply_product_input( $product, $body, false );
		if ( is_wp_error( $error ) ) {
			return $error;
		}
		try {
			$product->save();
		} catch ( Exception $e ) {
			return new WP_Error( 'dpc_error', $e->getMessage(), array( 'status' => 400 ) );
		}
		return self::single( self::map_product( wc_get_product( $id ) ) );
	}

	/**
	 * PUT /products/{id}/stock
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_product_stock( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id      = (int) $request->get_param( 'id' );
		$product = $id ? wc_get_product( $id ) : false;
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}
		$body = (array) $request->get_json_params();
		if ( ! isset( $body['stock_quantity'] ) || ! is_numeric( $body['stock_quantity'] ) ) {
			return new WP_Error( 'dpc_bad_request', 'stock_quantity is required', array( 'status' => 400 ) );
		}
		$product->set_manage_stock( true );
		$product->set_stock_quantity( max( 0, (int) floor( (float) $body['stock_quantity'] ) ) );
		$product->save();
		return self::single( self::map_product( wc_get_product( $id ) ) );
	}

	/**
	 * DELETE /products/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_product( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id      = (int) $request->get_param( 'id' );
		$product = $id ? wc_get_product( $id ) : false;
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'dpc_not_found', 'Product not found.', array( 'status' => 404 ) );
		}
		$product->delete( true );
		return self::single( array( 'id' => (string) $id, 'deleted' => true ) );
	}

	/* ------------------------------------------------------------ categories */

	/**
	 * GET /categories/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_category( $request, $auth ) {
		$term = get_term( (int) $request->get_param( 'id' ), 'product_cat' );
		if ( ! $term instanceof WP_Term ) {
			return new WP_Error( 'dpc_not_found', 'Category not found.', array( 'status' => 404 ) );
		}
		return self::single( self::map_category( $term ) );
	}

	/**
	 * Applies category term meta (display type + image).
	 *
	 * @param int    $term_id Term id.
	 * @param array  $body    Request body.
	 * @return void
	 */
	private static function apply_category_meta( $term_id, array $body ) {
		if ( isset( $body['display'] ) ) {
			update_term_meta( $term_id, 'display_type', (string) $body['display'] );
		}
		if ( array_key_exists( 'image', $body ) ) {
			$url = trim( (string) $body['image'] );
			update_term_meta( $term_id, '_dpc_image_url', $url );
			$attachment_id = '' !== $url ? attachment_url_to_postid( $url ) : 0;
			if ( $attachment_id ) {
				update_term_meta( $term_id, 'thumbnail_id', $attachment_id );
			} else {
				delete_term_meta( $term_id, 'thumbnail_id' );
			}
		}
	}

	/**
	 * POST /categories
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_category( $request, $auth ) {
		$body = (array) $request->get_json_params();
		$name = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
		if ( '' === $name ) {
			return new WP_Error( 'dpc_bad_request', 'name is required', array( 'status' => 400 ) );
		}
		$args = array();
		if ( ! empty( $body['slug'] ) ) {
			$args['slug'] = (string) $body['slug'];
		}
		if ( ! empty( $body['parentId'] ) ) {
			$args['parent'] = (int) $body['parentId'];
		}
		if ( isset( $body['description'] ) ) {
			$args['description'] = (string) $body['description'];
		}
		$result = wp_insert_term( $name, 'product_cat', $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		self::apply_category_meta( $result['term_id'], $body );
		$term = get_term( $result['term_id'], 'product_cat' );
		return self::single( self::map_category( $term ) );
	}

	/**
	 * PUT /categories/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_category( $request, $auth ) {
		$id   = (int) $request->get_param( 'id' );
		$body = (array) $request->get_json_params();
		$args = array();
		if ( isset( $body['name'] ) && '' !== trim( (string) $body['name'] ) ) {
			$args['name'] = (string) $body['name'];
		}
		if ( isset( $body['slug'] ) ) {
			$args['slug'] = (string) $body['slug'];
		}
		if ( isset( $body['parentId'] ) ) {
			$args['parent'] = $body['parentId'] ? (int) $body['parentId'] : 0;
		}
		if ( isset( $body['description'] ) ) {
			$args['description'] = (string) $body['description'];
		}
		$result = wp_update_term( $id, 'product_cat', $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		self::apply_category_meta( $id, $body );
		$term = get_term( $id, 'product_cat' );
		return self::single( self::map_category( $term ) );
	}

	/**
	 * DELETE /categories/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_category( $request, $auth ) {
		$id = (int) $request->get_param( 'id' );
		if ( ! wp_delete_term( $id, 'product_cat' ) ) {
			return new WP_Error( 'dpc_not_found', 'Category not found.', array( 'status' => 404 ) );
		}
		return self::single( array( 'id' => (string) $id, 'deleted' => true ) );
	}
}
