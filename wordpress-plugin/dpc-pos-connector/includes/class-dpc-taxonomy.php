<?php
/**
 * Product taxonomies: brands, tags and attributes (+ terms), served from
 * WooCommerce. Categories live with the rest of the catalog in
 * class-dpc-catalog.php.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Brand / tag / attribute CRUD.
 */
class DPC_POS_Taxonomy {

	const BRAND_TAXONOMY = 'product_brand';
	const TAG_TAXONOMY   = 'product_tag';

	/**
	 * True when WooCommerce is available.
	 *
	 * @return bool
	 */
	private static function wc_active() {
		return class_exists( 'WooCommerce' );
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
	 * Maps a term to the tag/brand DTO.
	 *
	 * @param WP_Term $term Term.
	 * @return array
	 */
	private static function map_term( $term ) {
		return array(
			'id'   => (string) $term->term_id,
			'name' => $term->name,
			'slug' => $term->slug ? $term->slug : '',
			'count' => (int) $term->count,
		);
	}

	/**
	 * Maps a term to the brand DTO.
	 *
	 * @param WP_Term $term Term.
	 * @return array
	 */
	private static function map_brand( $term ) {
		return array(
			'id'          => (string) $term->term_id,
			'name'        => $term->name,
			'slug'        => $term->slug ? $term->slug : '',
			'description' => $term->description ? $term->description : '',
			'count'       => (int) $term->count,
		);
	}

	/**
	 * Fetches every term for a taxonomy.
	 *
	 * @param string $taxonomy Taxonomy.
	 * @return WP_Term[]|WP_Error
	 */
	private static function all_terms( $taxonomy ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return new WP_Error( 'dpc_taxonomy_missing', 'Taxonomy "' . $taxonomy . '" is not registered.', array( 'status' => 502 ) );
		}
		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return $terms;
		}
		return (array) $terms;
	}

	/* --------------------------------------------------------- generic CRUD */

	/**
	 * GET brand/tag list.
	 *
	 * @param string $taxonomy Taxonomy.
	 * @param bool   $brand    Whether this is the brand shape.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function list_route( $taxonomy, $brand ) {
		$terms = self::all_terms( $taxonomy );
		if ( is_wp_error( $terms ) ) {
			return $terms;
		}
		$items = array();
		foreach ( $terms as $term ) {
			if ( $term instanceof WP_Term ) {
				$items[] = $brand ? self::map_brand( $term ) : self::map_term( $term );
			}
		}
		return self::envelope( $items );
	}

	/**
	 * POST brand/tag.
	 *
	 * @param WP_REST_Request $request  Request.
	 * @param string          $taxonomy Taxonomy.
	 * @param bool            $brand    Brand shape.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function create_route( $request, $taxonomy, $brand ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return new WP_Error( 'dpc_taxonomy_missing', 'Taxonomy "' . $taxonomy . '" is not registered.', array( 'status' => 502 ) );
		}
		$body = (array) $request->get_json_params();
		$name = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
		if ( '' === $name ) {
			return new WP_Error( 'dpc_bad_request', 'name is required', array( 'status' => 400 ) );
		}
		$args = array();
		if ( ! empty( $body['slug'] ) ) {
			$args['slug'] = (string) $body['slug'];
		}
		$result = wp_insert_term( $name, $taxonomy, $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$term = get_term( $result['term_id'], $taxonomy );
		return self::single( $brand ? self::map_brand( $term ) : self::map_term( $term ) );
	}

	/**
	 * PUT brand/tag.
	 *
	 * @param WP_REST_Request $request  Request.
	 * @param string          $taxonomy Taxonomy.
	 * @param bool            $brand    Brand shape.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function update_route( $request, $taxonomy, $brand ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return new WP_Error( 'dpc_taxonomy_missing', 'Taxonomy "' . $taxonomy . '" is not registered.', array( 'status' => 502 ) );
		}
		$id   = (int) $request->get_param( 'id' );
		$body = (array) $request->get_json_params();
		$args = array();
		if ( isset( $body['name'] ) && '' !== trim( (string) $body['name'] ) ) {
			$args['name'] = (string) $body['name'];
		}
		$result = wp_update_term( $id, $taxonomy, $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$term = get_term( $result['term_id'], $taxonomy );
		return self::single( $brand ? self::map_brand( $term ) : self::map_term( $term ) );
	}

	/**
	 * DELETE brand/tag.
	 *
	 * @param WP_REST_Request $request  Request.
	 * @param string          $taxonomy Taxonomy.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function delete_route( $request, $taxonomy ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return new WP_Error( 'dpc_taxonomy_missing', 'Taxonomy "' . $taxonomy . '" is not registered.', array( 'status' => 502 ) );
		}
		$id = (int) $request->get_param( 'id' );
		if ( ! wp_delete_term( $id, $taxonomy ) ) {
			return new WP_Error( 'dpc_not_found', 'Term not found.', array( 'status' => 404 ) );
		}
		return self::single( array( 'id' => (string) $id, 'deleted' => true ) );
	}

	/* ------------------------------------------------------------- brands */

	/**
	 * GET /brands
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_brands( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		return self::list_route( self::BRAND_TAXONOMY, true );
	}

	/**
	 * GET /brands/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_brand( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$term = get_term( (int) $request->get_param( 'id' ), self::BRAND_TAXONOMY );
		if ( ! $term instanceof WP_Term ) {
			return new WP_Error( 'dpc_not_found', 'Brand not found.', array( 'status' => 404 ) );
		}
		return self::single( self::map_brand( $term ) );
	}

	/**
	 * POST /brands
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_brand( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		return self::create_route( $request, self::BRAND_TAXONOMY, true );
	}

	/**
	 * PUT /brands/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_brand( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		return self::update_route( $request, self::BRAND_TAXONOMY, true );
	}

	/**
	 * DELETE /brands/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_brand( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		return self::delete_route( $request, self::BRAND_TAXONOMY );
	}

	/* --------------------------------------------------------------- tags */

	/**
	 * GET /tags
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_tags( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		return self::list_route( self::TAG_TAXONOMY, false );
	}

	/**
	 * POST /tags
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_tag( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		return self::create_route( $request, self::TAG_TAXONOMY, false );
	}

	/**
	 * PUT /tags/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_tag( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		return self::update_route( $request, self::TAG_TAXONOMY, false );
	}

	/**
	 * DELETE /tags/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_tag( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		return self::delete_route( $request, self::TAG_TAXONOMY );
	}

	/* --------------------------------------------------------- attributes */

	/**
	 * Maps a WC attribute taxonomy row to the frontend DTO.
	 *
	 * @param object $row Attribute row.
	 * @return array
	 */
	private static function map_attribute( $row ) {
		$slug = wc_attribute_taxonomy_name( $row->attribute_name );
		return array(
			'id'          => (string) $row->attribute_id,
			'name'        => $row->attribute_label ? $row->attribute_label : $row->attribute_name,
			'slug'        => $slug,
			'type'        => $row->attribute_type,
			'orderBy'     => $row->attribute_orderby,
			'hasArchives' => (bool) $row->attribute_public,
		);
	}

	/**
	 * Ensures an attribute taxonomy is registered for term operations.
	 *
	 * @param string $name Attribute name (without `pa_`).
	 * @return string Taxonomy name.
	 */
	private static function attribute_taxonomy( $name ) {
		$taxonomy = wc_attribute_taxonomy_name( $name );
		if ( ! taxonomy_exists( $taxonomy ) ) {
			register_taxonomy(
				$taxonomy,
				array( 'product' ),
				array(
					'hierarchical' => false,
					'show_ui'      => false,
					'query_var'    => true,
					'rewrite'      => false,
				)
			);
		}
		return $taxonomy;
	}

	/**
	 * Resolves an attribute id to its taxonomy name.
	 *
	 * @param int $id Attribute id.
	 * @return string|WP_Error
	 */
	private static function attribute_taxonomy_by_id( $id ) {
		$row = wc_get_attribute( $id );
		if ( ! $row ) {
			return new WP_Error( 'dpc_not_found', 'Attribute not found.', array( 'status' => 404 ) );
		}
		return self::attribute_taxonomy( $row->attribute_name );
	}

	/**
	 * GET /attributes
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_attributes( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$items = array();
		foreach ( (array) wc_get_attribute_taxonomies() as $row ) {
			$items[] = self::map_attribute( $row );
		}
		return self::envelope( $items );
	}

	/**
	 * POST /attributes
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_attribute( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body = (array) $request->get_json_params();
		$name = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
		if ( '' === $name ) {
			return new WP_Error( 'dpc_bad_request', 'name is required', array( 'status' => 400 ) );
		}
		$valid_types = array( 'text', 'color', 'select', 'button' );
		$type        = isset( $body['type'] ) && in_array( $body['type'], $valid_types, true ) ? $body['type'] : 'text';
		$args        = array(
			'name'         => $name,
			'type'         => $type,
			'order_by'     => 'menu_order',
			'has_archives' => false,
		);
		if ( ! empty( $body['slug'] ) ) {
			$args['slug'] = (string) $body['slug'];
		}
		$id = wc_create_attribute( $args );
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		delete_transient( 'wc_attribute_taxonomies' );
		$row = wc_get_attribute( $id );
		if ( ! $row ) {
			return new WP_Error( 'dpc_error', 'Attribute created but not found.', array( 'status' => 500 ) );
		}
		return self::single( self::map_attribute( $row ) );
	}

	/**
	 * PUT /attributes/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_attribute( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id   = (int) $request->get_param( 'id' );
		$body = (array) $request->get_json_params();
		$args = array();
		if ( isset( $body['name'] ) && '' !== trim( (string) $body['name'] ) ) {
			$args['name'] = (string) $body['name'];
		}
		$result = wc_update_attribute( $id, $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		delete_transient( 'wc_attribute_taxonomies' );
		$row = wc_get_attribute( $id );
		if ( ! $row ) {
			return new WP_Error( 'dpc_not_found', 'Attribute not found.', array( 'status' => 404 ) );
		}
		return self::single( self::map_attribute( $row ) );
	}

	/**
	 * DELETE /attributes/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_attribute( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$id = (int) $request->get_param( 'id' );
		if ( ! wc_get_attribute( $id ) ) {
			return new WP_Error( 'dpc_not_found', 'Attribute not found.', array( 'status' => 404 ) );
		}
		$deleted = wc_delete_attribute( $id );
		if ( is_wp_error( $deleted ) ) {
			return $deleted;
		}
		delete_transient( 'wc_attribute_taxonomies' );
		return self::single( array( 'id' => (string) $id, 'deleted' => true ) );
	}

	/**
	 * GET /attributes/{id}/terms
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_attribute_terms( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$taxonomy = self::attribute_taxonomy_by_id( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $taxonomy ) ) {
			return $taxonomy;
		}
		$terms = self::all_terms( $taxonomy );
		if ( is_wp_error( $terms ) ) {
			return $terms;
		}
		$items = array();
		foreach ( $terms as $term ) {
			if ( $term instanceof WP_Term ) {
				$items[] = self::map_term( $term );
			}
		}
		return self::envelope( $items );
	}

	/**
	 * POST /attributes/{id}/terms
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_attribute_term( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body = (array) $request->get_json_params();
		$name = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
		if ( '' === $name ) {
			return new WP_Error( 'dpc_bad_request', 'name is required', array( 'status' => 400 ) );
		}
		$taxonomy = self::attribute_taxonomy_by_id( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $taxonomy ) ) {
			return $taxonomy;
		}
		$args = array();
		if ( ! empty( $body['slug'] ) ) {
			$args['slug'] = (string) $body['slug'];
		}
		$result = wp_insert_term( $name, $taxonomy, $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$term = get_term( $result['term_id'], $taxonomy );
		return self::single( self::map_term( $term ) );
	}

	/**
	 * PUT /attributes/{id}/terms/{termId}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_attribute_term( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$body = (array) $request->get_json_params();
		$args = array();
		if ( isset( $body['name'] ) && '' !== trim( (string) $body['name'] ) ) {
			$args['name'] = (string) $body['name'];
		}
		if ( isset( $body['slug'] ) ) {
			$args['slug'] = (string) $body['slug'];
		}
		$taxonomy = self::attribute_taxonomy_by_id( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $taxonomy ) ) {
			return $taxonomy;
		}
		$result = wp_update_term( (int) $request->get_param( 'termId' ), $taxonomy, $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$term = get_term( $result['term_id'], $taxonomy );
		return self::single( self::map_term( $term ) );
	}

	/**
	 * DELETE /attributes/{id}/terms/{termId}
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_attribute_term( $request, $auth ) {
		if ( ! self::wc_active() ) {
			return self::no_wc();
		}
		$taxonomy = self::attribute_taxonomy_by_id( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $taxonomy ) ) {
			return $taxonomy;
		}
		$term_id = (int) $request->get_param( 'termId' );
		if ( ! wp_delete_term( $term_id, $taxonomy ) ) {
			return new WP_Error( 'dpc_not_found', 'Term not found.', array( 'status' => 404 ) );
		}
		return self::single(
			array(
				'attributeId' => (string) $request->get_param( 'id' ),
				'termId'      => (string) $term_id,
				'deleted'     => true,
			)
		);
	}
}
