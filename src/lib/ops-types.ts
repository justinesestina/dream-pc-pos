/**
 * DPC NEXUS — operations domain types (Phase 2).
 *
 * Purchasing, receiving, returns, cashier shifts and build assembly/QA/release
 * state. These live alongside src/lib/types.ts and reference the same entity
 * ids (products, customers, orders, builds, services).
 *
 * DEMO ONLY — no backend, no real money movement, no real authorization.
 */
import type { PaymentMethod } from "./types";

/* ------------------------------------------------------------- purchasing */

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  terms: string;
  leadTimeDays: number;
  categories: string[];
  status: "active" | "inactive";
  rating: number;
  notes?: string | undefined;
}

export type PurchaseStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "partial"
  | "received"
  | "cancelled";

export interface PurchaseLine {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  received: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseStatus;
  lines: PurchaseLine[];
  total: number;
  createdAt: string;
  expectedAt: string;
  receivedAt?: string | undefined;
  createdBy: string;
  notes?: string | undefined;
}

/* -------------------------------------------------------------- receiving */

export type ReceiptStatus = "in_progress" | "completed" | "discrepancy";

export interface ReceivingLine {
  productId: string;
  name: string;
  sku: string;
  expected: number;
  received: number;
  damaged: number;
  serials: string[];
}

export interface GoodsReceipt {
  id: string;
  purchaseOrderId: string;
  supplierId: string;
  supplierName: string;
  status: ReceiptStatus;
  lines: ReceivingLine[];
  receivedBy: string;
  receivedAt: string;
  notes?: string | undefined;
}

/* ----------------------------------------------------------------- returns */

export type ReturnStatus =
  | "requested"
  | "inspection"
  | "approved"
  | "rejected"
  | "refunded"
  | "replaced";

export type ReturnResolution = "refund" | "replacement" | "repair" | "none";

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string | null;
  customerName: string;
  productId: string;
  productName: string;
  serial?: string | undefined;
  qty: number;
  reason: string;
  condition: "sealed" | "used_good" | "used_damaged" | "defective";
  resolution: ReturnResolution;
  refundMethod: PaymentMethod | null;
  refundAmount: number;
  status: ReturnStatus;
  createdAt: string;
  inspectedBy?: string | undefined;
  inspectionNotes?: string | undefined;
  notes?: string | undefined;
  restock: boolean;
  /** Set once restock is applied so reopening + re-settling never double-adjusts stock. */
  restockedAt?: string | undefined;
}

/* ------------------------------------------------------------- cash drawer */

export interface CashAdjustment {
  id: string;
  kind: "cash_in" | "cash_out";
  amount: number;
  reason: string;
  at: string;
  actor: string;
}

export interface Shift {
  id: string;
  cashier: string;
  status: "open" | "closed";
  openedAt: string;
  closedAt?: string | undefined;
  openingCash: number;
  adjustments: CashAdjustment[];
  /** Recorded at close — demo values entered by the cashier. */
  countedCash?: number | undefined;
  /** Payment-method breakdown captured at close time. */
  tenders?: Record<PaymentMethod, number> | undefined;
  refunds?: number | undefined;
  notes?: string | undefined;
}

/* ---------------------------------------------------- assembly / QA / release */

export type AssemblyStageId =
  | "quote"
  | "approved"
  | "parts_reserved"
  | "assembly"
  | "cable_management"
  | "bios"
  | "os_install"
  | "drivers"
  | "testing"
  | "qa"
  | "ready"
  | "release"
  | "released";

export interface AssemblyStage {
  id: AssemblyStageId;
  label: string;
  group: "sales" | "assembly" | "validation" | "handover";
}

export const ASSEMBLY_STAGES: AssemblyStage[] = [
  { id: "quote", label: "Quote", group: "sales" },
  { id: "approved", label: "Approved", group: "sales" },
  { id: "parts_reserved", label: "Parts reserved", group: "sales" },
  { id: "assembly", label: "Assembly", group: "assembly" },
  { id: "cable_management", label: "Cable management", group: "assembly" },
  { id: "bios", label: "BIOS / firmware", group: "assembly" },
  { id: "os_install", label: "OS installation", group: "assembly" },
  { id: "drivers", label: "Driver installation", group: "assembly" },
  { id: "testing", label: "Testing", group: "validation" },
  { id: "qa", label: "QA", group: "validation" },
  { id: "ready", label: "Ready", group: "handover" },
  { id: "release", label: "Pickup / delivery", group: "handover" },
  { id: "released", label: "Released", group: "handover" },
];

export interface AssemblyStep {
  label: string;
  done: boolean;
}

export interface TestResult {
  label: string;
  result: "pass" | "fail" | null;
  reading?: string | undefined;
}

export interface BuildOps {
  buildId: string;
  stage: AssemblyStageId;
  assembly: AssemblyStep[];
  tests: TestResult[];
  technician: string;
  qaStaff: string;
  notes?: string | undefined;
  qaSignedAt?: string | undefined;
}

/* --------------------------------------------------------------- release */

export interface ReleaseRecord {
  id: string;
  kind: "build" | "service" | "order";
  refId: string;
  customerName: string;
  method: "pickup" | "delivery";
  scheduledAt: string;
  status: "scheduled" | "released" | "completed";
  releasedBy?: string | undefined;
  receivedBy?: string | undefined;
  releasedAt?: string | undefined;
  completedAt?: string | undefined;
  notes?: string | undefined;
}
