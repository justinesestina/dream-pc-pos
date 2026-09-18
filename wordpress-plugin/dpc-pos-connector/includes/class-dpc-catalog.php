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
			'imageUrl'        => $image_id ? wp_get_attachment_image_url( $image_id, 'full' ) : '',
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

		return array(
			'id'          => (string) $term->term_id,
			'name'        => $term->name,
			'slug'        => $term->slug,
			'parentId'    => $term->parent ? (string) $term->parent : '',
			'description' => $term->description,
			'display'     => '' !== $display ? $display : 'default',
			'image'       => $thumb_id ? (string) wp_get_attachment_image_url( $thumb_id, 'full' ) : '',
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
}
