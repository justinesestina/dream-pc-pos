/**
 * DPC NEXUS — Backend DTOs (the contract the frontend needs).
 *
 * These types are a server-side MIRROR of the canonical frontend types:
 *   - src/lib/types.ts      (main domains)
 *   - src/lib/ops-types.ts  (operations domains)
 *
 * The frontend must never change shape without this file being updated too
 * (see docs/BACKEND-INTEGRATION-PLAN.md §1 / §3.2). Every HTTP response body
 * is one of these types (or `data` inside an envelope).
 */

/* --------------------------------------------------------------- base types */

export type Role = "owner" | "admin" | "cashier" | "inventory";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  /** Only present in the demo/transitional world — a real backend never returns a password. */
  password?: string;
}

export type PaymentMethod = "cash" | "gcash" | "bank" | "card";

/** Response envelope used by every list endpoint (see plan §4.1). */
export interface Envelope<T> {
  data: T;
  meta: {
    page: number;
    perPage: number;
    total: number;
  };
}

/** Error envelope returned on any 4xx/5xx (see plan §4.1). */
export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/* --------------------------------------------------------------- catalog */

export type ProductType = "product" | "service" | "bundle";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  display?: "default" | "products" | "subcategories" | "both";
  image?: string;
  archived: boolean;
  createdAt: string;
  key?: string;
}

export interface ProductSpecs {
  socket?: string;
  memoryType?: "DDR4" | "DDR5";
  wattage?: number;
  tdp?: number;
  formFactor?: string;
  [key: string]: string | number | undefined;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  productType?: ProductType;
  description?: string;
  price: number;
  cost: number;
  serialTracked: boolean;
  warrantyMonths: number;
  location: string;
  supplier: string;
  specs: ProductSpecs;
  isService?: boolean;
  archived?: boolean;
  /** Preserved from WooCommerce stock payload (see woocommerce mapping). */
  stock_quantity?: number | null;
  stock_status?: string;
  manage_stock?: boolean;
}

/* ------------------------------------------------------------- inventory */

export interface InventoryItem {
  productId: string;
  onHand: number;
  reserved: number;
  damaged: number;
  sold: number;
  reorderPoint: number;
}

export type MovementType = "received" | "reserved" | "sold" | "adjusted" | "damaged" | "returned";

export interface InventoryMovement {
  id: string;
  productId: string;
  type: MovementType;
  qty: number;
  at: string;
  actor: string;
  reference?: string;
  note?: string;
}

/* --------------------------------------------------------------- serials */

export type SerialStatus = "in_stock" | "reserved" | "installed" | "sold" | "rma";

export interface SerialNumber {
  id: string;
  serial: string;
  productId: string;
  status: SerialStatus;
  orderId?: string;
  buildId?: string;
  customerId?: string;
  warrantyUntil?: string;
}

/* ------------------------------------------------------------ customers */

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "individual" | "business";
  address: string;
  since: string;
  status: "active" | "inactive";
  notes?: string;
}

/* --------------------------------------------------------------- orders */

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "assembly"
  | "testing"
  | "ready"
  | "completed"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  serials?: string[];
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  at: string;
  reference?: string;
  tendered?: number;
  change?: number;
}

export interface TimelineEvent {
  label: string;
  at: string;
  actor?: string;
  note?: string;
  state: "done" | "active" | "pending";
}

export interface Order {
  id: string;
  customerId: string | null;
  customerName: string;
  type: "retail" | "custom_build" | "service";
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  serviceTotal: number;
  shippingFee: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  payment: Payment | null;
  createdAt: string;
  buildId?: string;
  quoteId?: string;
  notes?: string;
  timeline: TimelineEvent[];
  cashier: string;
}

/* --------------------------------------------------------------- quotes */

export type QuoteStatus = "draft" | "sent" | "pending" | "approved" | "rejected" | "expired" | "converted";

export interface QuoteItem {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
}

export interface QuoteRevision {
  version: number;
  at: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  serviceTotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface Quote {
  id: string;
  customerId: string | null;
  customerName: string;
  status: QuoteStatus;
  items: QuoteItem[];
  discount: number;
  serviceTotal: number;
  shippingFee: number;
  subtotal: number;
  tax: number;
  total: number;
  version: number;
  revisions: QuoteRevision[];
  createdAt: string;
  expiresAt: string;
  notes?: string;
  subject?: string;
  message?: string;
  sentAt?: string;
  buildId?: string;
  orderId?: string;
  preparedBy: string;
}

/* ---------------------------------------------------------------- builds */

export type BuildStatus =
  | "draft"
  | "quoted"
  | "approved"
  | "parts_reserved"
  | "assembly"
  | "testing"
  | "ready"
  | "released"
  | "cancelled";

export type BuildSlot =
  | "CPU"
  | "Motherboard"
  | "RAM"
  | "GPU"
  | "Storage"
  | "PSU"
  | "Case"
  | "Cooling"
  | "Fans"
  | "Software"
  | "Accessories";

export interface BuildComponent {
  slot: BuildSlot;
  productId: string;
  qty: number;
}

export interface BuildService {
  label: string;
  amount: number;
}

export interface QaCheck {
  label: string;
  group: "hardware" | "testing";
  passed: boolean | null;
}

export interface Build {
  id: string;
  customerId: string | null;
  customerName: string;
  purpose: string;
  budget: number;
  status: BuildStatus;
  components: BuildComponent[];
  services: BuildService[];
  technician: string;
  createdAt: string;
  notes?: string;
  orderId?: string;
  quoteId?: string;
  qa: QaCheck[];
  qaResult: "pass" | "fail" | null;
}

/* -------------------------------------------------------------- services */

export type ServiceStatus =
  | "received"
  | "diagnosing"
  | "waiting_customer"
  | "waiting_parts"
  | "in_repair"
  | "ready"
  | "released"
  | "cancelled";

export interface ServicePart {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface ServiceTicket {
  id: string;
  customerId: string;
  customerName: string;
  device: string;
  issue: string;
  diagnosis?: string;
  status: ServiceStatus;
  technician: string;
  parts: ServicePart[];
  labor: number;
  estimatedCost: number;
  actualCost: number | null;
  createdAt: string;
  notes?: string;
  timeline: TimelineEvent[];
}

/* -------------------------------------------------------------- warranty */

export type WarrantyStatus = "active" | "expiring" | "expired" | "void";

export interface ClaimEvent {
  label: string;
  at: string;
  actor?: string;
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  reason: string;
  status: "open" | "in_review" | "approved" | "rejected" | "closed";
  createdAt: string;
  resolution?: string;
  resolutionNote?: string;
  timeline: ClaimEvent[];
}

export interface Warranty {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  serial?: string;
  orderId: string;
  purchasedAt: string;
  expiresAt: string;
  status: WarrantyStatus;
}

/* ------------------------------------------------------------- audit + ntf */

export interface AuditLog {
  id: string;
  actor: string;
  role: Role;
  action: string;
  entity: string;
  at: string;
}

export type NotificationPriority = "critical" | "high" | "normal";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  at: string;
  read: boolean;
  kind: "stock" | "quote" | "build" | "warranty" | "service" | "payment";
}

export interface CartLine {
  productId: string;
  qty: number;
  serials?: string[];
}

/* ======================================================================= *\
 *  Operations domains (mirror of src/lib/ops-types.ts)                    *
\* ======================================================================= */

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
  notes?: string;
}

export type PurchaseStatus = "draft" | "submitted" | "confirmed" | "partial" | "received" | "cancelled";

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
  receivedAt?: string;
  createdBy: string;
  notes?: string;
}

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
  notes?: string;
}

export type ReturnStatus = "requested" | "inspection" | "approved" | "rejected" | "refunded" | "replaced";
export type ReturnResolution = "refund" | "replacement" | "repair" | "none";

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string | null;
  customerName: string;
  productId: string;
  productName: string;
  serial?: string;
  qty: number;
  reason: string;
  condition: "sealed" | "used_good" | "used_damaged" | "defective";
  resolution: ReturnResolution;
  refundMethod: PaymentMethod | null;
  refundAmount: number;
  status: ReturnStatus;
  createdAt: string;
  inspectedBy?: string;
  inspectionNotes?: string;
  notes?: string;
  restock: boolean;
  restockedAt?: string;
}

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
  closedAt?: string;
  openingCash: number;
  adjustments: CashAdjustment[];
  countedCash?: number;
  tenders?: Record<PaymentMethod, number>;
  refunds?: number;
  notes?: string;
}

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
  reading?: string;
}

export interface BuildOps {
  buildId: string;
  stage: AssemblyStageId;
  assembly: AssemblyStep[];
  tests: TestResult[];
  technician: string;
  qaStaff: string;
  notes?: string;
  qaSignedAt?: string;
}

export interface ReleaseRecord {
  id: string;
  kind: "build" | "service" | "order";
  refId: string;
  customerName: string;
  method: "pickup" | "delivery";
  scheduledAt: string;
  status: "scheduled" | "released" | "completed";
  releasedBy?: string;
  receivedBy?: string;
  releasedAt?: string;
  completedAt?: string;
  notes?: string;
}