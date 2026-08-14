/**
 * DPC NEXUS — domain types.
 *
 * These mirror the intended backend schema (see mock-api.ts). All demo data
 * conforms to these types so the data layer can be swapped for a real API
 * without touching UI components.
 */

export type Role = "owner" | "admin" | "cashier" | "technician" | "inventory";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  /** DEMO ONLY: plaintext placeholder credential until a real auth backend exists. */
  password?: string;
}

export type ProductType = "product" | "service" | "bundle";

export interface Category {
  id: string;
  name: string;
  archived: boolean;
  createdAt: string;
  /** stable semantic slug used by build-slot logic; survives category renames. */
  key?: string | undefined;
}

export interface ProductSpecs {
  socket?: string | undefined;
  memoryType?: "DDR4" | "DDR5" | undefined;
  wattage?: number | undefined;
  tdp?: number | undefined;
  formFactor?: string | undefined;
  [key: string]: string | number | undefined;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  productType?: ProductType | undefined;
  description?: string | undefined;
  price: number;
  cost: number;
  serialTracked: boolean;
  warrantyMonths: number;
  location: string;
  supplier: string;
  specs: ProductSpecs;
  isService?: boolean | undefined;
  archived?: boolean | undefined;
}

export interface InventoryItem {
  productId: string;
  onHand: number;
  reserved: number;
  damaged: number;
  sold: number;
  reorderPoint: number;
}

export type SerialStatus = "in_stock" | "reserved" | "installed" | "sold" | "rma";

export interface SerialNumber {
  id: string;
  serial: string;
  productId: string;
  status: SerialStatus;
  orderId?: string | undefined;
  buildId?: string | undefined;
  customerId?: string | undefined;
  warrantyUntil?: string | undefined;
}

export type MovementType = "received" | "reserved" | "sold" | "adjusted" | "damaged" | "returned";

export interface InventoryMovement {
  id: string;
  productId: string;
  type: MovementType;
  qty: number;
  at: string;
  actor: string;
  reference?: string | undefined;
  note?: string | undefined;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "individual" | "business";
  address: string;
  since: string;
  status: "active" | "inactive";
  notes?: string | undefined;
}

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

export type PaymentMethod = "cash" | "gcash" | "bank" | "card";

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  serials?: string[] | undefined;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  at: string;
  reference?: string | undefined;
  tendered?: number | undefined;
  change?: number | undefined;
}

export interface TimelineEvent {
  label: string;
  at: string;
  actor?: string | undefined;
  note?: string | undefined;
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
  total: number;
  payment: Payment | null;
  createdAt: string;
  buildId?: string | undefined;
  quoteId?: string | undefined;
  notes?: string | undefined;
  timeline: TimelineEvent[];
  cashier: string;
}

export type QuoteStatus =
  "draft" | "sent" | "pending" | "approved" | "rejected" | "expired" | "converted";

export interface QuoteItem {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  customerId: string | null;
  customerName: string;
  status: QuoteStatus;
  items: QuoteItem[];
  discount: number;
  serviceTotal: number;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  expiresAt: string;
  notes?: string | undefined;
  buildId?: string | undefined;
  orderId?: string | undefined;
  preparedBy: string;
}

export type BuildStatus =
  | "draft"
  | "consultation"
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
  notes?: string | undefined;
  orderId?: string | undefined;
  quoteId?: string | undefined;
  consultationId?: string | undefined;
  qa: QaCheck[];
  qaResult: "pass" | "fail" | null;
}

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
  diagnosis?: string | undefined;
  status: ServiceStatus;
  technician: string;
  parts: ServicePart[];
  labor: number;
  estimatedCost: number;
  actualCost: number | null;
  createdAt: string;
  notes?: string | undefined;
  timeline: TimelineEvent[];
}

export type WarrantyStatus = "active" | "expiring" | "expired" | "void";

export interface ClaimEvent {
  label: string;
  at: string;
  actor?: string | undefined;
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  reason: string;
  status: "open" | "in_review" | "approved" | "rejected" | "closed";
  createdAt: string;
  resolution?: string | undefined;
  resolutionNote?: string | undefined;
  timeline: ClaimEvent[];
}

export interface Warranty {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  serial?: string | undefined;
  orderId: string;
  purchasedAt: string;
  expiresAt: string;
  status: WarrantyStatus;
}

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
  serials?: string[] | undefined;
}
