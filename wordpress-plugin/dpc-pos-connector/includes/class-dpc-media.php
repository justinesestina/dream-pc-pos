<?php
/**
 * Media upload — writes a browser-supplied base64 image into the WordPress
 * media library and returns an attachment URL the Products page can attach.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Media upload handler.
 */
class DPC_POS_Media {

	const MAX_BYTES = 10 * 1024 * 1024;

	/**
	 * POST /media
	 *
	 * @param WP_REST_Request $request Request.
	 * @param array           $auth    Auth context.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function upload( $request, $auth ) {
		$body     = (array) $request->get_json_params();
		$filename = isset( $body['filename'] ) ? (string) $body['filename'] : '';
		$data     = isset( $body['data'] ) ? (string) $body['data'] : '';
		if ( '' === $filename || '' === $data ) {
			return new WP_Error( 'dpc_bad_request', 'filename and data (base64) are required', array( 'status' => 400 ) );
		}

		$allowed = array(
			'png'  => 'image/png',
			'jpg'  => 'image/jpeg',
			'jpeg' => 'image/jpeg',
			'webp' => 'image/webp',
			'gif'  => 'image/gif',
		);
		if ( ! preg_match( '/\.([a-z0-9]+)$/i', $filename, $m ) ) {
			$ext = 'jpg';
		} else {
			$ext = strtolower( $m[1] );
		}
		if ( ! isset( $allowed[ $ext ] ) ) {
			return new WP_Error( 'dpc_bad_request', 'unsupported image type - use png, jpg/jpeg, webp or gif', array( 'status' => 400 ) );
		}
		$mime = $allowed[ $ext ];

		$b64 = false !== strpos( $data, ';base64,' ) ? substr( $data, strpos( $data, ',' ) + 1 ) : $data;
		$buf = base64_decode( $b64, true );
		if ( false === $buf || '' === $buf ) {
			return new WP_Error( 'dpc_bad_request', 'empty or invalid image data', array( 'status' => 400 ) );
		}
		if ( strlen( $buf ) > self::MAX_BYTES ) {
			return new WP_Error( 'dpc_bad_request', 'image too large - max 10 MB', array( 'status' => 400 ) );
		}

		$safe = preg_replace( '/[^a-zA-Z0-9.-]/', '-', $filename );
		$safe = preg_replace( '/\.(png|jpe?g|webp|gif)$/i', '', (string) $safe );
		if ( '' === $safe ) {
			$safe = 'upload';
		}
		$safe_name = $safe . '-' . time() . '.' . $ext;

		$upload   = wp_upload_bits( $safe_name, null, $buf );
		if ( ! empty( $upload['error'] ) ) {
			return new WP_Error( 'dpc_error', $upload['error'], array( 'status' => 500 ) );
		}

		$filetype  = wp_check_filetype( $safe_name, null );
		$attachment = array(
			'post_mime_type' => $filetype['type'] ? $filetype['type'] : $mime,
			'post_title'     => preg_replace( '/\.[^.]+$/', '', $filename ),
			'post_content'   => '',
			'post_status'    => 'inherit',
		);
		$attach_id = wp_insert_attachment( $attachment, $upload['file'] );
		if ( is_wp_error( $attach_id ) || ! $attach_id ) {
			return new WP_Error( 'dpc_error', 'Could not save the attachment.', array( 'status' => 500 ) );
		}
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$meta = wp_generate_attachment_metadata( $attach_id, $upload['file'] );
		wp_update_attachment_metadata( $attach_id, $meta );

		$url = wp_get_attachment_url( $attach_id );
		if ( ! $url ) {
			return new WP_Error( 'dpc_error', 'WordPress accepted the upload but returned no URL.', array( 'status' => 500 ) );
		}
		return rest_ensure_response(
			array(
				'data' => array(
					'mediaId' => (string) $attach_id,
					'url'     => $url,
				),
			)
		);
	}
}