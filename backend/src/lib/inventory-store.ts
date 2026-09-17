/**
 * Multi-warehouse inventory store — all state lives in WooCommerce.
 *
 *   • Physical quantity per warehouse → product meta `_dpc_wh_stock`
 *     (a JSON map `{ "WH-123": 15 }`), so the Products page gets totals without
 *     scanning anything.
 *   • Every change → an immutable movement record stored as a tagged WC order
 *     (`_dpc_record = "movement"`).
 *   • Transfers → tagged WC orders (`_dpc_record = "transfer"`) with a status
 *     workflow; completing one applies both sides of the move.
 *   • WooCommerce sellable stock → recomputed from the warehouses flagged
 *     `type: "selling"` + `sync: true`. It is never edited by hand here.
 */
import { woocommerce, type WcOrder, type WcMetaDatum, type WcProduct } from "./woocommerce.js";
import { ApiError, NotFoundError } from "./errors.js";
import {
  RECORD_KEY,
  isWarehouseOrder,
  listWarehouses,
  getWarehouse,
  createWarehouse,
  isWarehouseHydrated,
  markWarehouseHydrated,
} from "./warehouse-store.js";import type {
  ProductStockInfo,
  StockMovement,
  StockTransfer,
  TransferStatus,
  Warehouse,
  WarehouseMovementType,
  WarehouseStockRow,
} from "../types/dto.js";

const STOCK_META = "_dpc_wh_stock";
const STOCK_UPDATED_META = "_dpc_wh_updated";
const COST_META = "_dpc_wh_cost";
const PRODUCT_COST_META = "_dpc_cost";

const M = {
  // movement
  productId: "_dpc_mv_product_id",
  productName: "_dpc_mv_product_name",
  sku: "_dpc_mv_sku",
  warehouseId: "_dpc_mv_warehouse_id",
  warehouseName: "_dpc_mv_warehouse_name",
  type: "_dpc_mv_type",
  qty: "_dpc_mv_qty",
  reference: "_dpc_mv_reference",
  note: "_dpc_mv_note",
  actor: "_dpc_mv_actor",
  idem: "_dpc_mv_idem",
  // transfer
  fromId: "_dpc_tr_from_id",
  fromName: "_dpc_tr_from_name",
  toId: "_dpc_tr_to_id",
  toName: "_dpc_tr_to_name",
  trProductId: "_dpc_tr_product_id",
  trProductName: "_dpc_tr_product_name",
  trSku: "_dpc_tr_sku",
  quantity: "_dpc_tr_quantity",
  status: "_dpc_tr_status",
  notes: "_dpc_tr_notes",
  createdBy: "_dpc_tr_created_by",
  completedAt: "_dpc_tr_completed_at",
};

const TRANSFER_STATUSES: TransferStatus[] = [
  "draft",
  "pending",
  "approved",
  "completed",
  "cancelled",
];

/* --------------------------------------------------------------- meta utils */

function metaOf(order: WcOrder, key: string): unknown {
  return order.meta_data?.find((m: WcMetaDatum) => m.key === key)?.value;
}
function mStr(order: WcOrder, key: string): string {
  const v = metaOf(order, key);
  return v === undefined || v === null ? "" : String(v);
}
function mNum(order: WcOrder, key: string): number {
  return Number(metaOf(order, key)) || 0;
}
export function isMovementOrder(order: WcOrder): boolean {
  return metaOf(order, RECORD_KEY) === "movement";
}
export function isTransferOrder(order: WcOrder): boolean {
  return metaOf(order, RECORD_KEY) === "transfer";
}
function toMeta(values: Record<string, unknown>): WcMetaDatum[] {
  return Object.entries(values)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([key, value]) => ({ key, value: value as string | number | boolean }));
}

/* ------------------------------------------------------------ stock levels */

/** Parse a product's per-warehouse quantity map. */
export function parseStockMap(product: WcProduct): Record<string, number> {
  const raw = product.meta_data?.find((m: WcMetaDatum) => m.key === STOCK_META)?.value;
  if (!raw) return {};
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n) && n !== 0) out[k] = Math.floor(n);
    }
    return out;
  } catch {
    return {};
  }
}

function stockUpdatedAt(product: WcProduct): string {
  const raw = product.meta_data?.find((m: WcMetaDatum) => m.key === STOCK_UPDATED_META)?.value;
  return raw ? String(raw) : product.date_modified || "";
}

/** Parse a product's per-warehouse unit-cost map (`{ "WH-123": 12.5 }`). */
export function parseCostMap(product: WcProduct): Record<string, number> {
  const raw = product.meta_data?.find((m: WcMetaDatum) => m.key === COST_META)?.value;
  if (!raw) return {};
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

/** Product-level default cost (set on the Products page). */
function productCostOf(product: WcProduct): number {
  const raw = product.meta_data?.find((m: WcMetaDatum) => m.key === PRODUCT_COST_META)?.value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Cost used for a product inside a warehouse: per-warehouse, else product default. */
function costInWarehouse(product: WcProduct, warehouseId: string): number {
  const map = parseCostMap(product);
  return map[warehouseId] ?? productCostOf(product);
}

async function fetchProduct(productId: string | number): Promise<WcProduct> {
  let raw: WcProduct;
  try {
    raw = await woocommerce.product(productId);
  } catch {
    throw new NotFoundError(`Product ${productId} not found`);
  }
  if (!raw || Array.isArray(raw)) throw new NotFoundError(`Product ${productId} not found`);
  return raw;
}

async function writeStockMap(productId: string | number, map: Record<string, number>): Promise<void> {
  const now = new Date().toISOString();
  await woocommerce.updateProduct(productId, {
    meta_data: [
      { key: STOCK_META, value: JSON.stringify(map) },
      { key: STOCK_UPDATED_META, value: now },
    ],
  });
}

async function writeCostMap(productId: string | number, map: Record<string, number>): Promise<void> {
  await woocommerce.updateProduct(productId, {
    meta_data: [{ key: COST_META, value: JSON.stringify(map) }],
  });
}

/** Sum the quantities of every warehouse flagged selling + sync + active. */
export async function sellableQuantity(map: Record<string, number>): Promise<number> {
  const warehouses = await listWarehouses();
  let total = 0;
  for (const w of warehouses) {
    if (w.type === "selling" && w.sync && w.status === "active") {
      total += map[w.id] ?? 0;
    }
  }
  return total;
}

/** Recompute WooCommerce stock from the designated selling warehouses. */
export async function syncProductToWoo(productId: string | number): Promise<WcProduct> {
  const product = await fetchProduct(productId);
  const map = parseStockMap(product);
  const sellable = await sellableQuantity(map);
  return woocommerce.setStock(product.id, sellable);
}

/** Aggregate every product's stock (Products page columns). */
export async function listProductStock(): Promise<ProductStockInfo[]> {
  const [products, warehouses] = await Promise.all([woocommerce.products(), listWarehouses()]);
  const nameOf = new Map(warehouses.map((w) => [w.id, w.name]));
  return products.map((p) => buildProductStockInfo(p, nameOf));
}

export async function productStockInfo(productId: string | number): Promise<ProductStockInfo> {
  const [product, warehouses] = await Promise.all([fetchProduct(productId), listWarehouses()]);
  return buildProductStockInfo(product, new Map(warehouses.map((w) => [w.id, w.name])));
}

function buildProductStockInfo(p: WcProduct, nameOf: Map<string, string>): ProductStockInfo {
  const map = parseStockMap(p);
  const costs = parseCostMap(p);
  const fallbackCost = productCostOf(p);
  const perWarehouse = Object.entries(map)
    .filter(([id, qty]) => qty > 0 && nameOf.has(id))
    .map(([id, qty]) => {
      const cost = costs[id] ?? fallbackCost;
      const entry: ProductStockInfo["warehouses"][number] = {
        warehouseId: id,
        name: nameOf.get(id) ?? id,
        quantity: qty,
      };
      if (cost > 0) {
        entry.cost = cost;
        entry.value = Number((qty * cost).toFixed(2));
      }
      return entry;
    });
  const totalValue = perWarehouse.reduce((s, w) => s + (w.value ?? 0), 0);
  const info: ProductStockInfo = {
    productId: String(p.id),
    name: p.name,
    sku: p.sku || String(p.id),
    wooStock: p.stock_quantity,
    wooStatus: p.stock_status,
    totalPhysical: perWarehouse.reduce((s, w) => s + w.quantity, 0),
    warehouses: perWarehouse.sort((a, b) => b.quantity - a.quantity),
    updatedAt: stockUpdatedAt(p),
  };
  if (totalValue > 0) info.totalValue = Number(totalValue.toFixed(2));
  const image = p.images?.[0]?.src;
  if (image) info.image = image;
  return info;
}

/** Warehouse detail → Products tab. Includes every product (qty may be 0). */
export async function warehouseStockRows(warehouseId: string): Promise<WarehouseStockRow[]> {
  const products = await woocommerce.products();
  const rows: WarehouseStockRow[] = products.map((p) => {
    const qty = parseStockMap(p)[warehouseId] ?? 0;
    const cost = costInWarehouse(p, warehouseId);
    const row: WarehouseStockRow = {
      productId: String(p.id),
      name: p.name,
      sku: p.sku || String(p.id),
      quantity: qty,
      reserved: 0,
      available: qty,
      updatedAt: stockUpdatedAt(p),
    };
    if (cost > 0) {
      row.cost = cost;
      row.value = Number((qty * cost).toFixed(2));
    }
    const image = p.images?.[0]?.src;
    if (image) row.image = image;
    return row;
  });
  return rows.sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name));
}

/* -------------------------------------------------------------- movements */

function mapMovement(order: WcOrder): StockMovement {
  const rawType = mStr(order, M.type) as WarehouseMovementType;
  const movement: StockMovement = {
    id: `MV-${order.id}`,
    productId: mStr(order, M.productId),
    productName: mStr(order, M.productName),
    sku: mStr(order, M.sku),
    warehouseId: mStr(order, M.warehouseId),
    warehouseName: mStr(order, M.warehouseName),
    type: rawType || "adjustment",
    qty: mNum(order, M.qty),
    actor: mStr(order, M.actor) || "wordpress",
    at: order.date_created,
  };
  const reference = mStr(order, M.reference);
  const note = mStr(order, M.note);
  if (reference) movement.reference = reference;
  if (note) movement.note = note;
  return movement;
}

export async function listMovements(warehouseId?: string): Promise<StockMovement[]> {
  const orders = await woocommerce.ordersAll();
  return orders
    .filter(isMovementOrder)
    .map(mapMovement)
    .filter((m) => !warehouseId || m.warehouseId === warehouseId);
}

/**
 * Idempotency guard: find a movement already written for a client-supplied
 * key, so a retried / double-clicked mutation is applied at most once.
 */
async function findMovementByIdem(key: string): Promise<StockMovement | undefined> {
  if (!key) return undefined;
  const orders = await woocommerce.ordersAll();
  const found = orders.find((o) => isMovementOrder(o) && mStr(o, M.idem) === key);
  return found ? mapMovement(found) : undefined;
}

/** Find an existing transfer leg (used to make completion idempotent). */
async function findMovementByReference(
  reference: string,
  type: WarehouseMovementType,
): Promise<StockMovement | undefined> {
  const orders = await woocommerce.ordersAll();
  const found = orders.find(
    (o) => isMovementOrder(o) && mStr(o, M.reference) === reference && mStr(o, M.type) === type,
  );
  return found ? mapMovement(found) : undefined;
}

async function recordMovement(input: {
  productId: string;
  productName: string;
  sku: string;
  warehouse: Warehouse;
  type: WarehouseMovementType;
  qty: number;
  reference?: string;
  note?: string;
  actor: string;
  idempotencyKey?: string;
}): Promise<StockMovement> {
  const order = await woocommerce.createOrder({
    status: "pending",
    payment_method: "dpc_movement",
    payment_method_title: "Stock movement (DPC NEXUS)",
    customer_note: "Stock movement log — not a sales order",
    set_paid: false,
    meta_data: toMeta({
      [RECORD_KEY]: "movement",
      [M.productId]: input.productId,
      [M.productName]: input.productName,
      [M.sku]: input.sku,
      [M.warehouseId]: input.warehouse.id,
      [M.warehouseName]: input.warehouse.name,
      [M.type]: input.type,
      [M.qty]: input.qty,
      [M.reference]: input.reference,
      [M.note]: input.note,
      [M.actor]: input.actor,
      [M.idem]: input.idempotencyKey,
    }),
  });
  return mapMovement(order);
}

/** Core mutation: apply a signed delta to one product inside one warehouse. */
async function applyDelta(
  product: WcProduct,
  warehouse: Warehouse,
  delta: number,
  movement: Omit<Parameters<typeof recordMovement>[0], "warehouse" | "productId" | "productName" | "sku">,
): Promise<StockMovement> {
  const map = parseStockMap(product);
  const current = map[warehouse.id] ?? 0;
  const next = current + delta;
  if (next < 0) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `Only ${current} unit(s) available in ${warehouse.name}`,
    );
  }
  if (next === 0) delete map[warehouse.id];
  else map[warehouse.id] = next;

  await writeStockMap(product.id, map);

  const row = await recordMovement({
    productId: String(product.id),
    productName: product.name,
    sku: product.sku || String(product.id),
    warehouse,
    ...movement,
  });

  await syncProductToWoo(product.id);
  return row;
}

/* ------------------------------------------------------------ add stock */

export async function addStock(input: {
  productId: string;
  warehouseId: string;
  quantity: number;
  costPrice?: number;
  supplier?: string;
  reference?: string;
  notes?: string;
  actor: string;
  idempotencyKey?: string;
}): Promise<{ movement: StockMovement; product: ProductStockInfo }> {
  const existing = input.idempotencyKey
    ? await findMovementByIdem(input.idempotencyKey)
    : undefined;
  if (existing) {
    return { movement: existing, product: await productStockInfo(existing.productId) };
  }
  const quantity = Math.floor(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new ApiError(400, "BAD_REQUEST", "quantity must be greater than 0");
  }
  const warehouse = await getWarehouse(input.warehouseId);
  if (!warehouse) throw new NotFoundError("Warehouse not found");
  const product = await fetchProduct(input.productId);

  const noteParts = [
    input.supplier ? `Supplier: ${input.supplier}` : "",
    input.notes ?? "",
  ].filter(Boolean);

  const movement = await applyDelta(product, warehouse, quantity, {
    type: "stock_in",
    qty: quantity,
    reference: input.reference,
    note: noteParts.join(" · "),
    actor: input.actor,
    idempotencyKey: input.idempotencyKey,
  });

  if (input.costPrice !== undefined && Number.isFinite(Number(input.costPrice))) {
    const cost = Number(input.costPrice);
    if (cost > 0) {
      const costMap = parseCostMap(product);
      costMap[warehouse.id] = cost;
      await writeCostMap(product.id, costMap);
      // Seed the product-level cost too when it has never been set.
      if (productCostOf(product) === 0) {
        await woocommerce.updateProduct(product.id, {
          meta_data: [{ key: PRODUCT_COST_META, value: cost }],
        });
      }
    }
  }

  return { movement, product: await productStockInfo(product.id) };
}

/** Manual adjustment (positive or negative) — also used by transfers. */
export async function adjustStock(input: {
  productId: string;
  warehouseId: string;
  delta: number;
  type?: WarehouseMovementType;
  reference?: string;
  note?: string;
  actor: string;
  idempotencyKey?: string;
}): Promise<StockMovement> {
  const existing = input.idempotencyKey
    ? await findMovementByIdem(input.idempotencyKey)
    : undefined;
  if (existing) return existing;

  const delta = Math.floor(Number(input.delta));
  if (!Number.isFinite(delta) || delta === 0) {
    throw new ApiError(400, "BAD_REQUEST", "delta must be a non-zero integer");
  }
  const warehouse = await getWarehouse(input.warehouseId);
  if (!warehouse) throw new NotFoundError("Warehouse not found");
  const product = await fetchProduct(input.productId);
  return applyDelta(product, warehouse, delta, {
    type: input.type ?? "adjustment",
    qty: delta,
    reference: input.reference,
    note: input.note,
    actor: input.actor,
    idempotencyKey: input.idempotencyKey,
  });
}

/**
 * Set a product's absolute quantity (and optional unit cost) in one warehouse.
 * Used by the inline row editor — safe to retry via `idempotencyKey`.
 */
export async function setWarehouseStock(input: {
  productId: string;
  warehouseId: string;
  quantity?: number;
  costPrice?: number;
  note?: string;
  actor: string;
  idempotencyKey?: string;
}): Promise<{ movement?: StockMovement; row: WarehouseStockRow }> {
  const existing = input.idempotencyKey ? await findMovementByIdem(input.idempotencyKey) : undefined;
  const product = await fetchProduct(input.productId);
  const warehouse = await getWarehouse(input.warehouseId);
  if (!warehouse) throw new NotFoundError("Warehouse not found");

  const current = parseStockMap(product)[warehouse.id] ?? 0;
  let target = current;
  if (input.quantity !== undefined) {
    target = Math.floor(Number(input.quantity));
    if (!Number.isFinite(target) || target < 0) {
      throw new ApiError(400, "BAD_REQUEST", "quantity must be 0 or greater");
    }
  }

  // Cost can be saved on its own, even when the quantity is unchanged.
  if (input.costPrice !== undefined && Number.isFinite(Number(input.costPrice))) {
    const cost = Number(input.costPrice);
    const costMap = parseCostMap(product);
    if (cost > 0) costMap[warehouse.id] = cost;
    else delete costMap[warehouse.id];
    await writeCostMap(product.id, costMap);
  }

  let movement: StockMovement | undefined;
  if (!existing) {
    const delta = target - current;
    if (delta !== 0) {
      movement = await applyDelta(product, warehouse, delta, {
        type: "adjustment",
        qty: delta,
        note: input.note,
        actor: input.actor,
        idempotencyKey: input.idempotencyKey,
      });
    }
  } else {
    movement = existing;
  }

  const rows = await warehouseStockRows(warehouse.id);
  const row = rows.find((r) => r.productId === String(product.id));
  if (!row) {
    return {
      ...(movement ? { movement } : {}),
      row: {
        productId: String(product.id),
        name: product.name,
        sku: product.sku || String(product.id),
        quantity: target,
        reserved: 0,
        available: target,
        updatedAt: new Date().toISOString(),
      },
    };
  }
  return { ...(movement ? { movement } : {}), row };
}

/* -------------------------------------------------------------- transfers */

function mapTransfer(order: WcOrder): StockTransfer {
  const rawStatus = mStr(order, M.status) as TransferStatus;
  const transfer: StockTransfer = {
    id: `TR-${order.id}`,
    fromWarehouseId: mStr(order, M.fromId),
    fromWarehouseName: mStr(order, M.fromName),
    toWarehouseId: mStr(order, M.toId),
    toWarehouseName: mStr(order, M.toName),
    productId: mStr(order, M.trProductId),
    productName: mStr(order, M.trProductName),
    sku: mStr(order, M.trSku),
    quantity: mNum(order, M.quantity),
    status: TRANSFER_STATUSES.includes(rawStatus) ? rawStatus : "draft",
    createdBy: mStr(order, M.createdBy) || "wordpress",
    createdAt: order.date_created,
  };
  const notes = mStr(order, M.notes);
  const completedAt = mStr(order, M.completedAt);
  if (notes) transfer.notes = notes;
  if (completedAt) transfer.completedAt = completedAt;
  return transfer;
}

function transferIdToOrderId(id: string): number {
  const n = Number(id.startsWith("TR-") ? id.slice(3) : id);
  if (!Number.isFinite(n)) throw new ApiError(400, "BAD_REQUEST", "invalid transfer id");
  return n;
}

export async function listTransfers(warehouseId?: string): Promise<StockTransfer[]> {
  const orders = await woocommerce.ordersAll();
  return orders
    .filter(isTransferOrder)
    .map(mapTransfer)
    .filter(
      (t) => !warehouseId || t.fromWarehouseId === warehouseId || t.toWarehouseId === warehouseId,
    );
}

export async function getTransfer(id: string): Promise<StockTransfer | undefined> {
  let order: WcOrder;
  try {
    order = await woocommerce.order(transferIdToOrderId(id));
  } catch {
    return undefined;
  }
  if (!isTransferOrder(order)) return undefined;
  return mapTransfer(order);
}

export async function createTransfer(input: {
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  notes?: string;
  actor: string;
}): Promise<StockTransfer> {
  const quantity = Math.floor(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new ApiError(400, "BAD_REQUEST", "quantity must be greater than 0");
  }
  if (input.fromWarehouseId === input.toWarehouseId) {
    throw new ApiError(400, "BAD_REQUEST", "cannot transfer to the same warehouse");
  }
  const from = await getWarehouse(input.fromWarehouseId);
  if (!from) throw new NotFoundError("Source warehouse not found");
  const to = await getWarehouse(input.toWarehouseId);
  if (!to) throw new NotFoundError("Destination warehouse not found");
  const product = await fetchProduct(input.productId);

  const available = parseStockMap(product)[from.id] ?? 0;
  if (quantity > available) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `Only ${available} unit(s) available in ${from.name}`,
    );
  }

  const order = await woocommerce.createOrder({
    status: "pending",
    payment_method: "dpc_transfer",
    payment_method_title: "Stock transfer (DPC NEXUS)",
    customer_note: "Stock transfer — not a sales order",
    set_paid: false,
    meta_data: toMeta({
      [RECORD_KEY]: "transfer",
      [M.fromId]: from.id,
      [M.fromName]: from.name,
      [M.toId]: to.id,
      [M.toName]: to.name,
      [M.trProductId]: String(product.id),
      [M.trProductName]: product.name,
      [M.trSku]: product.sku || String(product.id),
      [M.quantity]: quantity,
      [M.status]: "draft",
      [M.notes]: input.notes,
      [M.createdBy]: input.actor,
    }),
  });
  return mapTransfer(order);
}

export async function setTransferStatus(
  id: string,
  status: TransferStatus,
  idempotencyKey?: string,
): Promise<StockTransfer> {
  const orderId = transferIdToOrderId(id);
  let order: WcOrder;
  try {
    order = await woocommerce.order(orderId);
  } catch {
    throw new NotFoundError("Transfer not found");
  }
  if (!isTransferOrder(order)) throw new NotFoundError("Transfer not found");
  const transfer = mapTransfer(order);

  if (status === "completed" && transfer.status === "cancelled") {
    throw new ApiError(400, "BAD_REQUEST", "a cancelled transfer cannot be completed");
  }
  if (transfer.status === "completed" && status !== "completed") {
    throw new ApiError(400, "BAD_REQUEST", "a completed transfer cannot be reopened");
  }

  if (status === "completed" && transfer.status !== "completed") {
    // Idempotency: a retried / double-clicked completion must not move stock
    // twice. If either leg (client key or this transfer's reference) already
    // exists, treat the request as already applied and just settle the status.
    const already =
      (idempotencyKey ? await findMovementByIdem(idempotencyKey) : undefined) ??
      (await findMovementByReference(transfer.id, "transfer_out"));
    if (!already) {
      const from = await getWarehouse(transfer.fromWarehouseId);
      const to = await getWarehouse(transfer.toWarehouseId);
      if (!from || !to) throw new NotFoundError("Transfer warehouse not found");
      // Take from source, give to destination (validates availability).
      await adjustStock({
        productId: transfer.productId,
        warehouseId: from.id,
        delta: -transfer.quantity,
        type: "transfer_out",
        reference: transfer.id,
        note: `Transfer to ${to.name}`,
        actor: transfer.createdBy,
        ...(idempotencyKey ? { idempotencyKey: `${idempotencyKey}:out` } : {}),
      });
      await adjustStock({
        productId: transfer.productId,
        warehouseId: to.id,
        delta: transfer.quantity,
        type: "transfer_in",
        reference: transfer.id,
        note: `Transfer from ${from.name}`,
        actor: transfer.createdBy,
        ...(idempotencyKey ? { idempotencyKey: `${idempotencyKey}:in` } : {}),
      });
    }
    const settled = await woocommerce.updateOrder(orderId, {
      meta_data: toMeta({
        [M.status]: "completed",
        [M.completedAt]: new Date().toISOString(),
      }),
    });
    return mapTransfer(settled);
  }

  const updated = await woocommerce.updateOrder(orderId, {
    meta_data: toMeta({ [M.status]: status }),
  });
  return mapTransfer(updated);
}

export async function deleteTransfer(id: string): Promise<boolean> {
  try {
    const deleted = await woocommerce.deleteOrder(transferIdToOrderId(id));
    return Boolean(deleted) && !Array.isArray(deleted);
  } catch {
    return false;
  }
}

/* ------------------------------------------------- selling warehouse */

/**
 * Guarantee a default "WooCommerce" selling warehouse exists, and seed its
 * quantities from the storefront's own stock exactly once. This makes the
 * WooCommerce/Selling location visible, transferable and editable like any
 * other warehouse. Hydration runs once per warehouse (marker meta) so it never
 * overwrites later Add/Deduct/Transfer edits.
 */
export async function ensureSellingWarehouse(): Promise<Warehouse> {
  const warehouses = await listWarehouses();
  let selling = warehouses.find((w) => w.type === "selling");
  if (!selling) {
    selling = await createWarehouse({
      name: "WooCommerce",
      code: "WOO",
      type: "selling",
      sync: true,
      default: true,
      status: "active",
      notes: "Storefront stock — kept in sync with WooCommerce.",
    });
  }
  if (!(await isWarehouseHydrated(selling.id))) {
    const done = await hydrateSellingWarehouse(selling);
    if (done) await markWarehouseHydrated(selling.id);
  }
  return selling;
}

/**
 * Copy each managed product's WooCommerce stock into the selling warehouse.
 * Bounded per call so a large catalog never exceeds the serverless timeout;
 * returns `true` only once every product has been seeded (then it's marked done
 * and never re-run). Products already carrying an entry are skipped cheaply.
 */
const HYDRATE_BATCH = 25;
async function hydrateSellingWarehouse(warehouse: Warehouse): Promise<boolean> {
  const products = await woocommerce.products();
  let written = 0;
  let remaining = 0;
  for (const p of products) {
    if (!p.manage_stock) continue;
    const qty = typeof p.stock_quantity === "number" ? Math.floor(p.stock_quantity) : 0;
    if (qty <= 0) continue;
    const map = parseStockMap(p);
    if (map[warehouse.id] !== undefined) continue;
    if (written >= HYDRATE_BATCH) {
      remaining++;
      continue;
    }
    map[warehouse.id] = qty;
    await writeStockMap(p.id, map);
    written++;
  }
  return remaining === 0;
}

/** Warehouse list totals (Total Products / Out of Stock / Total Quantity / Total Value). */
export async function warehouseTotals(): Promise<
  Map<
    string,
    { totalProducts: number; outOfStock: number; totalQuantity: number; totalValue: number }
  >
> {
  const rows = await listProductStock();
  const totals = new Map<
    string,
    { totalProducts: number; outOfStock: number; totalQuantity: number; totalValue: number }
  >();
  for (const row of rows) {
    for (const w of row.warehouses) {
      const entry = totals.get(w.warehouseId) ?? {
        totalProducts: 0,
        outOfStock: 0,
        totalQuantity: 0,
        totalValue: 0,
      };
      entry.totalProducts += 1;
      entry.totalQuantity += w.quantity;
      entry.totalValue += w.value ?? 0;
      totals.set(w.warehouseId, entry);
    }
  }
  for (const entry of totals.values()) {
    entry.outOfStock = Math.max(0, rows.length - entry.totalProducts);
    entry.totalValue = Number(entry.totalValue.toFixed(2));
  }
  return totals;
}

export { isWarehouseOrder };
