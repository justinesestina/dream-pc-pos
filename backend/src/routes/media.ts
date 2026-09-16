/**
 * Media upload — lets the app upload a real local image from the browser into
 * the WordPress media library, then attach the returned URL to a product
 * (product images only accept URLs, so "upload" = upload to WP media + URL).
 *
 *   POST /api/v1/media
 *     { "filename": "rtx-4060.png", "data": "data:image/png;base64,iVBORw0KGgo..." }
 *   → 201 { "data": { "mediaId": "123", "url": "https://…/wp-content/uploads/…/file.png" } }
 *
 * Uses a dedicated WordPress application password (env WP_MEDIA_USERNAME +
 * WP_MEDIA_APP_PASSWORD) because WC consumer keys only work on the /wc/v3
 * namespace — WP core media (wp/v2/media) needs a real WP user. Set those two
 * vars in backend/.env and in the Vercel dashboard; otherwise 503
 * MEDIA_NOT_CONFIGURED.
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import { config, mediaConfigured } from "../config.js";

const ALLOWED = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" } as const;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function mimeFor(filename: string): { ext: string; mime: string } {
  const ext = (filename.toLowerCase().match(/\.([a-z0-9]+)$/) ?? [])[1] ?? "jpg";
  const mime = ALLOWED[ext as keyof typeof ALLOWED];
  if (!mime) throw new ApiError(400, "BAD_REQUEST", "unsupported image type — use png, jpg/jpeg, webp or gif");
  return { ext, mime };
}

export function mediaRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.post("/", requireAuth, async (c) => {
    if (!mediaConfigured) {
      throw new ApiError(503, "MEDIA_NOT_CONFIGURED", "Set WP_MEDIA_USERNAME + WP_MEDIA_APP_PASSWORD in backend/.env (a WordPress application password)");
    }

    const body = await c.req.json().catch(() => ({}));
    const filename = String(body.filename ?? "");
    const data = String(body.data ?? "");
    if (!filename || !data) throw new ApiError(400, "BAD_REQUEST", "filename and data (base64) are required");
    const { ext, mime } = mimeFor(filename);

    // Accept either a full data URL ("data:image/png;base64,…") or bare base64.
    const b64 = data.includes(";base64,") ? data.slice(data.indexOf(",") + 1) : data;
    const buf = Buffer.from(b64, "base64");
    if (buf.length === 0) throw new ApiError(400, "BAD_REQUEST", "empty or invalid image data");
    if (buf.length > MAX_BYTES) throw new ApiError(400, "BAD_REQUEST", "image too large — max 10 MB");

    const safeName = `${filename.replace(/[^a-zA-Z0-9.-]/g, "-").replace(/\.(png|jpe?g|webp|gif)$/i, "") || "upload"}-${Date.now()}.${ext}`;
    const credentials = Buffer.from(`${config.wp.mediaUsername}:${config.wp.mediaAppPassword}`).toString("base64");

    let res: Response;
    try {
      res = await fetch(`${config.wp.url}/wp-json/wp/v2/media`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Disposition": `attachment; filename="${safeName}"`,
          "Content-Type": mime,
        },
        body: buf,
      });
    } catch (cause) {
      throw new ApiError(502, "MEDIA_UNREACHABLE", `Cannot reach WordPress media: ${String(cause)}`);
    }

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const wcMessage =
        typeof json === "object" && json !== null && "message" in (json as Record<string, unknown>)
          ? (json as { message?: unknown }).message
          : "HTTP " + res.status;
      throw new ApiError(400, "MEDIA_UPLOAD_FAILED", String(wcMessage));
    }
    const media = json as { id?: unknown; source_url?: unknown };
    const url = typeof media.source_url === "string" ? media.source_url : "";
    if (!url) throw new ApiError(502, "MEDIA_UPLOAD_FAILED", "WordPress accepted the upload but returned no URL");
    return c.json(ok({ mediaId: String(media.id ?? ""), url }), 201);
  });

  return app;
}