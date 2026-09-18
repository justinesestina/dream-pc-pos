<?php
/**
 * Reversible encryption for integration secrets stored server-side.
 *
 * Uses libsodium when available, otherwise OpenSSL AES-256-CBC with an HMAC.
 * The key is derived from the site's AUTH_KEY, so secrets are not portable
 * across sites (that is intentional). Secrets are never returned to clients.
 *
 * @package DPC_POS_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Secret encryption helpers.
 */
class DPC_POS_Crypto {

	/**
	 * Derives a 32-byte encryption key from the site salt.
	 *
	 * @return string Raw binary key.
	 */
	private static function key() {
		$salt = defined( 'AUTH_KEY' ) && AUTH_KEY ? AUTH_KEY : 'dpc-pos-fallback-key';
		return hash( 'sha256', 'dpc-pos-connector|' . $salt, true );
	}

	/**
	 * Encrypts a secret for storage in the database.
	 *
	 * @param string $plain Plaintext secret.
	 * @return string Versioned ciphertext.
	 */
	public static function encrypt( $plain ) {
		$plain = (string) $plain;
		if ( '' === $plain ) {
			return '';
		}

		if ( function_exists( 'sodium_crypto_secretbox' ) ) {
			$key   = sodium_crypto_generichash( self::key(), '', SODIUM_CRYPTO_SECRETBOX_KEYBYTES );
			$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$box   = sodium_crypto_secretbox( $plain, $nonce, $key );
			return 'sodium:' . base64_encode( $nonce . $box );
		}

		$key    = self::key();
		$iv     = random_bytes( 16 );
		$cipher = openssl_encrypt( $plain, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv );
		if ( false === $cipher ) {
			return '';
		}
		$mac = hash_hmac( 'sha256', $iv . $cipher, $key, true );
		return 'openssl:' . base64_encode( $iv . $mac . $cipher );
	}

	/**
	 * Decrypts a stored secret.
	 *
	 * @param string $stored Ciphertext produced by {@see encrypt()}.
	 * @return string Plaintext, or empty string when it cannot be read.
	 */
	public static function decrypt( $stored ) {
		$stored = (string) $stored;
		if ( '' === $stored ) {
			return '';
		}

		if ( 0 === strpos( $stored, 'sodium:' ) ) {
			if ( ! function_exists( 'sodium_crypto_secretbox_open' ) ) {
				return '';
			}
			$raw = base64_decode( substr( $stored, 7 ), true );
			if ( false === $raw || strlen( $raw ) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
				return '';
			}
			$nonce = substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$box   = substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$key   = sodium_crypto_generichash( self::key(), '', SODIUM_CRYPTO_SECRETBOX_KEYBYTES );
			$plain = sodium_crypto_secretbox_open( $box, $nonce, $key );
			return is_string( $plain ) ? $plain : '';
		}

		if ( 0 === strpos( $stored, 'openssl:' ) ) {
			$raw = base64_decode( substr( $stored, 8 ), true );
			if ( false === $raw || strlen( $raw ) <= 32 ) {
				return '';
			}
			$key    = self::key();
			$iv     = substr( $raw, 0, 16 );
			$mac    = substr( $raw, 16, 32 );
			$cipher = substr( $raw, 48 );
			$expect = hash_hmac( 'sha256', $iv . $cipher, $key, true );
			if ( ! hash_equals( $expect, $mac ) ) {
				return '';
			}
			$plain = openssl_decrypt( $cipher, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv );
			return false === $plain ? '' : $plain;
		}

		return '';
	}

	/**
	 * Masks a secret for display (never reveals the full value).
	 *
	 * @param string $secret Plaintext secret.
	 * @return string
	 */
	public static function mask( $secret ) {
		$secret = (string) $secret;
		if ( '' === $secret ) {
			return '';
		}
		$tail = substr( $secret, -4 );
		return '••••' . $tail;
	}
}
