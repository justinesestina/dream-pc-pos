/**
 * Minimal HS256 JWT (Node crypto). Sufficient until Supabase Auth takes over
 * in Phase P4 — the claims shape below mirrors the middleware contract.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return createHmac("sha256", config.jwtSecret).update(data).digest("base64url");
}

/** Payload carried by our JWTs. */
export interface TokenClaims {
  /** POS-side user id (wp user id for now). */
  sub: string;
  /** POS role — one of owner/admin/cashier/inventory. */
  role: string;
  /** WP user id if the session originated from WordPress. */
  wpUserId?: number;
  /** WP roles of the authenticated WordPress user. */
  wpRoles?: string[];
  exp: number;
  iat: number;
}

export function issueToken(
  payload: Omit<TokenClaims, "iat" | "exp">,
): { token: string; expiresIn: number } {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + config.tokenTtlSeconds;
  const claims: TokenClaims = { ...payload, iat, exp };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(claims));
  const signature = sign(`${header}.${body}`);
  return { token: `${header}.${body}.${signature}`, expiresIn: config.tokenTtlSeconds };
}

export function verifyToken(token: string): TokenClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  if (!header || !body || !signature) return null;

  const expected = sign(`${header}.${body}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenClaims;
    if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}