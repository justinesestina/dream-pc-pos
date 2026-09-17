/**
 * Warehouse store — a small file-backed "table" for warehouse records.
 *
 * WooCommerce has no native warehouse entity, so warehouses live in a
 * backend-managed JSON table at `backend/data/warehouses.json`. Writes are
 * atomic (tmp + rename). On read-only filesystems (serverless) the store
 * degrades to in-memory and the fact is surfaced via `isPersistent()`.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Warehouse } from "../types/dto.js";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "warehouses.json");

let cache: Warehouse[] | null = null;
let persistent = false;

async function load(): Promise<Warehouse[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    cache = JSON.parse(raw) as Warehouse[];
    persistent = true;
  } catch {
    cache = [];
    persistent = false;
  }
  return cache;
}

async function save(rows: Warehouse[]): Promise<void> {
  cache = rows;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
    await fs.rename(tmp, DATA_FILE);
    persistent = true;
  } catch {
    persistent = false;
  }
}

export function isWarehouseStorePersistent(): boolean {
  return persistent;
}

export async function listWarehouses(): Promise<Warehouse[]> {
  return load();
}

export async function getWarehouse(id: string): Promise<Warehouse | undefined> {
  return (await load()).find((w) => w.id === id);
}

export async function getWarehouseByCode(code: string): Promise<Warehouse | undefined> {
  const needle = code.trim().toLowerCase();
  return (await load()).find((w) => w.code.toLowerCase() === needle);
}

function nextId(rows: Warehouse[]): string {
  let n = rows.length + 1;
  const used = new Set(rows.map((w) => w.id));
  while (used.has(`WH-${String(n).padStart(4, "0")}`)) n += 1;
  return `WH-${String(n).padStart(4, "0")}`;
}

export async function createWarehouse(input: Partial<Warehouse>): Promise<Warehouse> {
  const rows = await load();
  const now = new Date().toISOString();
  const warehouse: Warehouse = {
    id: nextId(rows),
    name: String(input.name ?? "").trim(),
    code: String(input.code ?? "")
      .trim()
      .toUpperCase(),
    type: (input.type as Warehouse["type"]) ?? "branch",
    address: input.address ? String(input.address) : undefined,
    phone: input.phone ? String(input.phone) : undefined,
    manager: input.manager ? String(input.manager) : undefined,
    capacity: input.capacity === undefined ? undefined : Number(input.capacity) || undefined,
    notes: input.notes ? String(input.notes) : undefined,
    default: Boolean(input.default),
    status: input.status === "inactive" ? "inactive" : "active",
    createdAt: now,
  };
  if (warehouse.default) {
    for (const w of rows) w.default = false;
  }
  rows.push(warehouse);
  await save(rows);
  return warehouse;
}

export async function updateWarehouse(
  id: string,
  input: Partial<Warehouse>,
): Promise<Warehouse | undefined> {
  const rows = await load();
  const current = rows.find((w) => w.id === id);
  if (!current) return undefined;
  if (input.name !== undefined) current.name = String(input.name).trim();
  if (input.code !== undefined) current.code = String(input.code).trim().toUpperCase();
  if (input.type !== undefined) current.type = input.type as Warehouse["type"];
  if (input.address !== undefined) {
    current.address = input.address ? String(input.address) : undefined;
  }
  if (input.phone !== undefined) current.phone = input.phone ? String(input.phone) : undefined;
  if (input.manager !== undefined) {
    current.manager = input.manager ? String(input.manager) : undefined;
  }
  if (input.capacity !== undefined) {
    current.capacity = Number(input.capacity) || undefined;
  }
  if (input.notes !== undefined) current.notes = input.notes ? String(input.notes) : undefined;
  if (input.status === "active" || input.status === "inactive") {
    current.status = input.status;
  }
  if (input.default) {
    for (const w of rows) w.default = false;
    current.default = true;
  } else if (input.default === false) {
    current.default = false;
  }
  await save(rows);
  return current;
}

export async function deleteWarehouse(id: string): Promise<boolean> {
  const rows = await load();
  const next = rows.filter((w) => w.id !== id);
  if (next.length === rows.length) return false;
  await save(next);
  return true;
}
