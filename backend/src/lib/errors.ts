/** Unified API errors. Every handler either returns an Envelope or throws an
 * ApiError; the global onError in index.ts turns it into an ErrorEnvelope. */

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Not allowed for this role") {
    super(403, "FORBIDDEN", message);
  }
}

export function ok<T>(data: T, meta?: { page?: number; perPage?: number; total?: number }) {
  const isArray = Array.isArray(data);
  return {
    data,
    meta: {
      page: meta?.page ?? 1,
      perPage: meta?.perPage ?? (isArray ? data.length : 1),
      total: meta?.total ?? (isArray ? data.length : 1),
    },
  };
}