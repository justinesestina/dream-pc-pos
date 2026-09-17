/**
 * Warehouse store — WooCommerce-backed (no separate database).
 *
 * WooCommerce has no native warehouse entity, so each warehouse is persisted as
 * a real WC order tagged `_dpc_record = "warehouse"` with all fields in order
 * meta. This mirrors the proven quotations pattern (routes/quotes.ts): the data
 * lives in the WordPress DB, so it survives serverless cold-starts — unlike the
 * old backend/data/warehouses.json file store, which Vercel's read-only
 * filesystem silently downgraded to in-memory.
 *
 * Physical quantities per warehouse live on the product itself
 * (`_dpc_wh_stock` meta) — see lib/inventory-store.ts.
 */
import { woocommerce, type WcOrder, type WcMetaDatum } from "./woocommerce.js";
import type { Warehouse, WarehouseType } from "../types/dto.js";

export const RECORD_KEY = "_dpc_record";

const META = {
  name: "_dpc_wh_name",
  code: "_dpc_wh_code",
  type: "_dpc_wh_type",
  sync: "_dpc_wh_sync",
  address: "_dpc_wh_address",
  phone: "_dpc_wh_phone",
  manager: "_dpc_wh_manager",
  capacity: "_dpc_wh_capacity",
  notes: "_dpc_wh_notes",
  isDefault: "_dpc_wh_default",
  status: "_dpc_wh_status",
};

export const WAREHOUSE_TYPES: WarehouseType[] = ["selling", "storage", "service", "damaged"];

function metaOf(order: WcOrder, key: string): unknown {
  return order.meta_data?.find((m: WcMetaDatum) => m.key === key)?.value;
}
function metaStr(order: WcOrder, key: string): string {
  const v = metaOf(order, key);
  return v === undefined || v === null ? "" : String(v);
}
function metaBool(order: WcOrder, key: string): boolean {
  const v = metaOf(order, key);
  return v === true || v === "true" || v === 1 || v === "1";
}

/** A WC order is a warehouse when it carries the warehouse record marker. */
export function isWarehouseOrder(order: WcOrder): boolean {
  return metaOf(order, RECORD_KEY) === "warehouse";
}

function mapOrderToWarehouse(order: WcOrder): Warehouse {
  const rawType = metaStr(order, META.type) as WarehouseType;
  const type = WAREHOUSE_TYPES.includes(rawType) ? rawType : "storage";
  const capacity = Number(metaOf(order, META.capacity));
  const address = metaStr(order, META.address);
  const phone = metaStr(order, META.phone);
  const manager = metaStr(order, META.manager);
  const notes = metaStr(order, META.notes);

  const warehouse: Warehouse = {
    id: `WH-${order.id}`,
    name: metaStr(order, META.name) || `Warehouse ${order.id}`,
    code: metaStr(order, META.code),
    type,
    sync: metaBool(order, META.sync),
    default: metaBool(order, META.isDefault),
    status: metaStr(order, META.status) === "inactive" ? "inactive" : "active",
    createdAt: order.date_created,
  };
  if (address) warehouse.address = address;
  if (phone) warehouse.phone = phone;
  if (manager) warehouse.manager = manager;
  if (notes) warehouse.notes = notes;
  if (Number.isFinite(capacity) && capacity > 0) warehouse.capacity = capacity;
  return warehouse;
}

function warehouseToMeta(input: Partial<Warehouse>): WcMetaDatum[] {
  const push = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    meta.push({ key, value: value as string | number | boolean });
  };
  const meta: WcMetaDatum[] = [{ key: RECORD_KEY, value: "warehouse" }];
  push(META.name, input.name);
  push(META.code, input.code?.toUpperCase());
  push(META.type, input.type);
  push(META.sync, Boolean(input.sync));
  push(META.address, input.address);
  push(META.phone, input.phone);
  push(META.manager, input.manager);
  push(META.capacity, input.capacity);
  push(META.notes, input.notes);
  push(META.isDefault, Boolean(input.default));
  return meta;
}

function orderIdFromWarehouseId(id: string): number {
  const n = Number(id.startsWith("WH-") ? id.slice(3) : id);
  if (!Number.isFinite(n)) throw new Error(`invalid warehouse id: ${id}`);
  return n;
}

async function allWarehouseOrders(): Promise<WcOrder[]> {
  const orders = await woocommerce.ordersAll();
  return orders.filter(isWarehouseOrder);
}

export async function listWarehouses(): Promise<Warehouse[]> {
  const orders = await allWarehouseOrders();
  return orders
    .map(mapOrderToWarehouse)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getWarehouse(id: string): Promise<Warehouse | undefined> {
  let order: WcOrder;
  try {
    order = await woocommerce.order(orderIdFromWarehouseId(id));
  } catch {
    return undefined;
  }
  if (!isWarehouseOrder(order)) return undefined;
  return mapOrderToWarehouse(order);
}

export async function getWarehouseByCode(code: string): Promise<Warehouse | undefined> {
  const needle = code.trim().toLowerCase();
  if (!needle) return undefined;
  const rows = await allWarehouseOrders();
  const match = rows.find((o) => metaStr(o, META.code).toLowerCase() === needle);
  return match ? mapOrderToWarehouse(match) : undefined;
}

async function clearOtherDefaults(exceptOrderId?: number): Promise<void> {
  const others = (await allWarehouseOrders()).filter((o) => o.id !== exceptOrderId);
  for (const order of others) {
    if (metaBool(order, META.isDefault)) {
      await woocommerce.updateOrder(order.id, {
        meta_data: [{ key: META.isDefault, value: false }],
      });
    }
  }
}

export async function createWarehouse(input: Partial<Warehouse>): Promise<Warehouse> {
  const created = await woocommerce.createOrder({
    status: "pending",
    payment_method: "dpc_warehouse",
    payment_method_title: "Warehouse (DPC NEXUS)",
    customer_note: "Warehouse record — not a sales order",
    set_paid: false,
    meta_data: warehouseToMeta({
      ...input,
      name: String(input.name ?? "").trim(),
      code: String(input.code ?? "").trim().toUpperCase(),
      type: input.type ?? "storage",
      status: input.status === "inactive" ? "inactive" : "active",
    }),
  });
  if (input.default) await clearOtherDefaults(created.id);
  return mapOrderToWarehouse(created);
}

export async function updateWarehouse(
  id: string,
  input: Partial<Warehouse>,
): Promise<Warehouse | undefined> {
  const orderId = orderIdFromWarehouseId(id);
  let current: WcOrder;
  try {
    current = await woocommerce.order(orderId);
  } catch {
    return undefined;
  }
  if (!isWarehouseOrder(current)) return undefined;

  const merged: Partial<Warehouse> = {
    name: input.name !== undefined ? String(input.name).trim() : metaStr(current, META.name),
    code: input.code !== undefined ? String(input.code).trim().toUpperCase() : metaStr(current, META.code),
    type: input.type ?? (metaStr(current, META.type) as WarehouseType),
    sync: input.sync !== undefined ? Boolean(input.sync) : metaBool(current, META.sync),
    address: input.address !== undefined ? input.address : metaStr(current, META.address),
    phone: input.phone !== undefined ? input.phone : metaStr(current, META.phone),
    manager: input.manager !== undefined ? input.manager : metaStr(current, META.manager),
    capacity: input.capacity !== undefined ? input.capacity : Number(metaOf(current, META.capacity)) || undefined,
    notes: input.notes !== undefined ? input.notes : metaStr(current, META.notes),
    default: input.default !== undefined ? Boolean(input.default) : metaBool(current, META.isDefault),
    status: input.status ?? (metaStr(current, META.status) === "inactive" ? "inactive" : "active"),
  };

  const updated = await woocommerce.updateOrder(orderId, { meta_data: warehouseToMeta(merged) });
  if (merged.default) await clearOtherDefaults(orderId);
  return mapOrderToWarehouse(updated);
}

export async function deleteWarehouse(id: string): Promise<boolean> {
  try {
    const deleted = await woocommerce.deleteOrder(orderIdFromWarehouseId(id));
    return Boolean(deleted) && !Array.isArray(deleted);
  } catch {
    return false;
  }
}
