/**
 * Stock transfers between warehouses.
 *
 *   GET    /api/v1/transfers          list (optional ?warehouseId=)
 *   GET    /api/v1/transfers/:id      one
 *   POST   /api/v1/transfers          create (validates same-warehouse + availability)
 *   PUT    /api/v1/transfers/:id      update status (draft → pending → approved → completed)
 *   DELETE /api/v1/transfers/:id      delete
 *
 * Completing a transfer moves quantity out of the source and into the
 * destination, writing movement records and re-syncing WooCommerce stock.
 * Persisted as tagged WooCommerce orders (lib/inventory-store.ts).
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError, NotFoundError } from "../lib/errors.js";
import {
  createTransfer,
  deleteTransfer,
  getTransfer,
  listTransfers,
  setTransferStatus,
} from "../lib/inventory-store.js";
import type { TransferStatus } from "../types/dto.js";

const STATUSES: TransferStatus[] = ["draft", "pending", "approved", "completed", "cancelled"];

export function transfersRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  app.get("/", requireAuth, async (c) => {
    const warehouseId = c.req.query("warehouseId");
    const rows = await listTransfers(warehouseId);
    return c.json(ok(rows, { total: rows.length }));
  });

  app.get("/:id", requireAuth, async (c) => {
    const row = await getTransfer(c.req.param("id"));
    if (!row) throw new NotFoundError("Transfer not found");
    return c.json(ok(row));
  });

  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const fromWarehouseId = String(body.fromWarehouseId ?? "").trim();
    const toWarehouseId = String(body.toWarehouseId ?? "").trim();
    const productId = String(body.productId ?? "").trim();
    if (!fromWarehouseId) throw new ApiError(400, "BAD_REQUEST", "fromWarehouseId is required");
    if (!toWarehouseId) throw new ApiError(400, "BAD_REQUEST", "toWarehouseId is required");
    if (!productId) throw new ApiError(400, "BAD_REQUEST", "productId is required");
    const created = await createTransfer({
      fromWarehouseId,
      toWarehouseId,
      productId,
      quantity: Number(body.quantity),
      notes: body.notes ? String(body.notes) : undefined,
      actor: c.get("user").sub,
    });
    return c.json(ok(created), 201);
  });

  app.put("/:id", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    if (body.status !== undefined && !STATUSES.includes(body.status)) {
      throw new ApiError(400, "BAD_REQUEST", `status must be one of: ${STATUSES.join(", ")}`);
    }
    if (body.status === undefined) {
      throw new ApiError(400, "BAD_REQUEST", "status is required");
    }
    const updated = await setTransferStatus(c.req.param("id"), body.status as TransferStatus);
    return c.json(ok(updated));
  });

  app.delete("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const removed = await deleteTransfer(id);
    if (!removed) throw new NotFoundError("Transfer not found");
    return c.json(ok({ id, deleted: true }));
  });

  return app;
}
