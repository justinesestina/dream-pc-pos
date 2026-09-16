/**
 * POST /api/v1/auth/login  — WordPress username + application password
 * GET  /api/v1/auth/me     — current session (Bearer token)
 *
 * Supabase Auth replaces this endpoint in Phase P4; the response shape stays
 * `{ data: { token, expiresIn, user } }` so the frontend needs no changes.
 */
import { Hono } from "hono";
import { verifyWordPressUser, WordpressAuthError } from "../lib/wordpress-auth.js";
import { issueToken } from "../lib/token.js";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import type { User } from "../types/dto.js";

function initialsOf(name: string): string {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "?";
}

export function authRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.post("/login", async (c) => {
    const body = await c.req.json().catch(() => null);
    const username = String(body?.username ?? "");
    const appPassword = String(body?.appPassword ?? "");
    if (!username || !appPassword) {
      throw new ApiError(400, "BAD_REQUEST", "username and appPassword are required");
    }

    try {
      const { wpUser, role } = await verifyWordPressUser(username, appPassword);
      const { token, expiresIn } = issueToken({
        sub: String(wpUser.id),
        role,
        wpUserId: wpUser.id,
        wpRoles: wpUser.roles,
      });

      const user: User = {
        id: String(wpUser.id),
        name: wpUser.name,
        email: wpUser.email ?? `${wpUser.id}@wordpress.local`,
        role,
        initials: initialsOf(wpUser.name),
      };

      return c.json({ data: { token, expiresIn, user } });
    } catch (err) {
      if (err instanceof WordpressAuthError) {
        throw new ApiError(401, "WP_AUTH_FAILED", err.message);
      }
      throw err;
    }
  });

  app.get("/me", requireAuth, (c) => {
    const claims = c.get("user");
    return c.json(
      ok({
        sub: claims.sub,
        role: claims.role,
        wpUserId: claims.wpUserId,
        wpRoles: claims.wpRoles,
      }),
    );
  });

  return app;
}