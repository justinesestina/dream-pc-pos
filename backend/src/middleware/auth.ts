/**
 * Auth middleware. Reads `Authorization: Bearer <jwt>` (issued by
 * POST /api/v1/auth/login), verifies it, and exposes `c.var.user` to handlers.
 */
import type { Context, MiddlewareHandler } from "hono";
import { verifyToken, type TokenClaims } from "../lib/token.js";
import { UnauthorizedError } from "../lib/errors.js";

export interface AppVars {
  user: TokenClaims;
}

export const requireAuth: MiddlewareHandler<{ Variables: AppVars }> = async (c, next) => {
  const header = c.req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) throw new UnauthorizedError("Missing Bearer token");

  const claims = verifyToken(token);
  if (!claims) throw new UnauthorizedError("Invalid or expired token");

  // Manual env injection for demo route stubs.
  (c as Context & { env: Record<string, unknown> }).env.user = claims;
  c.set("user", claims);
  await next();
};