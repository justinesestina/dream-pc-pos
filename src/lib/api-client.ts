/**
 * DPC NEXUS — Frontend API client for the backend service.
 *
 * Handles authenticated requests to the Hono backend (backend/src/server.ts).
 * Currently supports: media upload (image → WP media library → permanent URL).
 */

/** Base URL of the backend API. Defaults to localhost:8787 in dev. */
const API_BASE =
  (import.meta.env?.["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:8787";

// ---------------------------------------------------------------------------
// Auth helpers — pull JWT token from localStorage (set at login)
// ---------------------------------------------------------------------------

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem("dpc-nexus-auth-token");
    return raw || null;
  } catch {
    return null;
  }
}

function getWpCredentials(): { username: string; appPassword: string } | null {
  try {
    const raw = localStorage.getItem("dpc-nexus-wp-credentials");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.username && parsed?.appPassword) return parsed;
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Media upload
// ---------------------------------------------------------------------------

export interface MediaUploadResult {
  ok: boolean;
  url?: string;
  mediaId?: string;
  error?: string;
}

/**
 * Upload a local image file to the backend, which forwards it to the
 * WordPress media library. Returns the permanent public URL.
 *
 * Flow: Browser file → base64 → POST /api/v1/media → WP media library → URL
 *
 * @param file - The File object from an <input type="file">
 * @returns The permanent WordPress media URL or an error
 */
export async function uploadImageToBackend(file: File): Promise<MediaUploadResult> {
  // Validate file
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB frontend limit
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Image file size must be less than 5MB" };
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: "Unsupported image type. Use PNG, JPG, WebP, or GIF." };
  }

  // Read file as base64 data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  // Build request body
  const body: Record<string, string> = {
    filename: file.name,
    data: dataUrl,
  };

  // Attach WP credentials if available (for media upload auth)
  const wpCreds = getWpCredentials();
  if (wpCreds) {
    body.username = wpCreds.username;
    body.appPassword = wpCreds.appPassword;
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/media`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        json?.error?.message || json?.message || `Upload failed (HTTP ${res.status})`;
      return { ok: false, error: errMsg };
    }

    const url = json?.data?.url;
    const mediaId = json?.data?.mediaId;
    if (!url) {
      return { ok: false, error: "Backend returned no image URL" };
    }

    return { ok: true, url, mediaId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return {
      ok: false,
      error: `Could not reach the backend server. Make sure the backend is running. (${message})`,
    };
  }
}
