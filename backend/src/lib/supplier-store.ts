/** WooCommerce-backed supplier records and direct supplier/product assignments. */
import { woocommerce, type WcMetaDatum, type WcOrder } from "./woocommerce.js";
import type { Supplier } from "../types/dto.js";

const RECORD_KEY = "_dpc_record";
const RECORD_VALUE = "supplier";
const META = {
  name: "_dpc_supplier_name",
  contact: "_dpc_supplier_contact",
  email: "_dpc_supplier_email",
  phone: "_dpc_supplier_phone",
  address: "_dpc_supplier_address",
  terms: "_dpc_supplier_terms",
  leadTimeDays: "_dpc_supplier_lead_time_days",
  categories: "_dpc_supplier_categories",
  productIds: "_dpc_supplier_product_ids",
  status: "_dpc_supplier_status",
  rating: "_dpc_supplier_rating",
  notes: "_dpc_supplier_notes",
};

function metaOf(order: WcOrder, key: string): unknown {
  return order.meta_data?.find((item: WcMetaDatum) => item.key === key)?.value;
}

function text(order: WcOrder, key: string): string {
  return String(metaOf(order, key) ?? "");
}

function numberValue(order: WcOrder, key: string, fallback: number): number {
  const value = Number(metaOf(order, key));
  return Number.isFinite(value) ? value : fallback;
}

function list(order: WcOrder, key: string): string[] {
  const raw = metaOf(order, key);
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return String(raw ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  }
}

export function isSupplierOrder(order: WcOrder): boolean {
  return metaOf(order, RECORD_KEY) === RECORD_VALUE;
}

function mapOrder(order: WcOrder): Supplier {
  return {
    id: `SUP-${order.id}`,
    name: text(order, META.name) || `Supplier ${order.id}`,
    contact: text(order, META.contact),
    email: text(order, META.email),
    phone: text(order, META.phone),
    address: text(order, META.address),
    terms: text(order, META.terms) || "Net 30",
    leadTimeDays: Math.max(1, numberValue(order, META.leadTimeDays, 1)),
    categories: list(order, META.categories),
    productIds: list(order, META.productIds),
    status: text(order, META.status) === "inactive" ? "inactive" : "active",
    rating: Math.max(0, numberValue(order, META.rating, 0)),
    notes: text(order, META.notes) || undefined,
  };
}

function toMeta(input: Partial<Supplier>): WcMetaDatum[] {
  const meta: WcMetaDatum[] = [{ key: RECORD_KEY, value: RECORD_VALUE }];
  const push = (key: string, value: string | number | boolean | null | undefined) => {
    if (value !== undefined && value !== null) meta.push({ key, value });
  };
  push(META.name, input.name);
  push(META.contact, input.contact);
  push(META.email, input.email);
  push(META.phone, input.phone);
  push(META.address, input.address);
  push(META.terms, input.terms);
  push(META.leadTimeDays, input.leadTimeDays);
  push(META.categories, JSON.stringify(input.categories ?? []));
  push(META.productIds, JSON.stringify(input.productIds ?? []));
  push(META.status, input.status ?? "active");
  push(META.rating, input.rating ?? 0);
  push(META.notes, input.notes);
  return meta;
}

async function allSupplierOrders(): Promise<WcOrder[]> {
  return (await woocommerce.ordersAll()).filter(isSupplierOrder);
}

function orderId(id: string): number {
  const value = Number(id.replace(/^SUP-/, ""));
  if (!Number.isFinite(value)) throw new Error(`Invalid supplier id: ${id}`);
  return value;
}

export async function listSuppliers(): Promise<Supplier[]> {
  const rows = await allSupplierOrders();
  return rows.map(mapOrder).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSupplier(id: string): Promise<Supplier | undefined> {
  try {
    const row = await woocommerce.order(orderId(id));
    return isSupplierOrder(row) ? mapOrder(row) : undefined;
  } catch {
    return undefined;
  }
}

export async function getSupplierByName(name: string): Promise<Supplier | undefined> {
  const needle = name.trim().toLowerCase();
  return (await allSupplierOrders()).map(mapOrder).find((item) => item.name.toLowerCase() === needle);
}

export async function createSupplier(input: Partial<Supplier>): Promise<Supplier> {
  const created = await woocommerce.createOrder({
    status: "pending",
    payment_method: "dpc_supplier",
    payment_method_title: "Supplier (DPC NEXUS)",
    customer_note: "Supplier record — not a sales order",
    set_paid: false,
    meta_data: toMeta({ ...input, status: input.status === "inactive" ? "inactive" : "active" }),
  });
  return mapOrder(created);
}

export async function updateSupplier(id: string, input: Partial<Supplier>): Promise<Supplier | undefined> {
  const current = await getSupplier(id);
  if (!current) return undefined;
  const updated = await woocommerce.updateOrder(orderId(id), {
    meta_data: toMeta({ ...current, ...input }),
  });
  return mapOrder(updated);
}

export async function deleteSupplier(id: string): Promise<boolean> {
  try {
    const deleted = await woocommerce.deleteOrder(orderId(id));
    return Boolean(deleted) && !Array.isArray(deleted);
  } catch {
    return false;
  }
}