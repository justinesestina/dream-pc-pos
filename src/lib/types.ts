/**
 * DPC POS — domain types.
 *
 * These mirror the intended Supabase schema in docs/DPC-NEXUS-SUPABASE-DATABASE-ARCHITECTURE.md.
 * All demo data conforms to these types so the data layer can be swapped for a real API
 * (via the planned api facade) without touching UI components.
 */

export type Role = "owner" | "admin" | "cashier" | "inventory";

/** Client classification attached to a sale from the POS. */
export type ClientType = "walk-in" | "business" | "household";

/** Project lifecycle mirrors the connector's `dpc_projects.status` column. */
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export type ProjectTaskStatus = "todo" | "in_progress" | "done";

/** A DPC user available as an owner / member / assignee. */
export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  role_slug?: string;
  initials: string;
  avatar_url?: string;
}

export interface ProjectMemberRef {
  id: number;
  name: string;
  initials: string;
  role: string;
  avatar_url?: string;
}

export interface Project {
  id: number;
  code: string;
  name: string;
  customer: string;
  customerType: ClientType;
  status: ProjectStatus;
  startDate: string; // YYYY-MM-DD or ""
  due: string; // YYYY-MM-DD or ""
  owner: number;
  ownerName: string;
  description: string;
  scope: string;
  value: number;
  members: number[];
  memberNames: string[];
  memberDetails: ProjectMemberRef[];
  tasks: number;
  done: number;
}

export interface ProjectTask {
  id: number;
  projectId: number;
  project: string;
  title: string;
  assignee: number;
  assigneeName: string;
  status: ProjectTaskStatus;
  due: string; // YYYY-MM-DD or ""
  duration: string;
}

/** Client-facing input for creating/updating a project. */
export interface ProjectSaveInput {
  name?: string;
  customer?: string;
  customerType?: ClientType;
  status?: ProjectStatus;
  startDate?: string;
  due?: string;
  owner?: number;
  description?: string;
  scope?: string;
  value?: number;
  members?: number[];
}

export interface ProjectTaskSaveInput {
  title?: string;
  assignee?: number;
  status?: ProjectTaskStatus;
  due?: string;
  duration?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  /** Profile photo URL when the signed-in account has one uploaded. */
  avatar_url?: string;
  /** DEMO ONLY: plaintext placeholder credential until a real auth backend exists. */
  password?: string;
  /** Connector RBAC permission slugs, when signed in through the DPC connector. */
  permissions?: string[];
}

export type ProductType = "product" | "service" | "bundle";

/** Brand / tag taxonomy term returned by the backend (WooCommerce-backed). */
export interface CatalogTerm {
  id: string;
  name: string;
  slug: string;
  count: number;
}

/** Product attribute (from the backend `products/attributes` endpoints). */
export interface AttributeMeta {
  id: string;
  name: string;
  slug: string;
  type: "text" | "color" | "select" | "button" | string;
  orderBy: string;
  hasArchives: boolean;
}

/** A single value term belonging to an attribute. */
export type AttributeTerm = CatalogTerm;

/** Selling warehouses push their stock to WooCommerce when sync is on. */
export type WarehouseType = "selling" | "storage" | "service" | "damaged";

/** Custom warehouse record — WooCommerce has no native entity, so it's stored
 *  as a tagged WC order (durable across serverless cold-starts). */
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: WarehouseType;
  /** Push this warehouse's quantity to WooCommerce sellable stock. */
  sync: boolean;
  address?: string | undefined;
  phone?: string | undefined;
  manager?: string | undefined;
  capacity?: number | undefined;
  notes?: string | undefined;
  default: boolean;
  status: "active" | "inactive";
  createdAt: string;
  /** Derived totals returned by the warehouses list endpoint. */
  totalProducts?: number | undefined;
  /** Derived: catalog products with zero quantity in this warehouse. */
  outOfStock?: number | undefined;
  totalQuantity?: number | undefined;
  /** Derived: sum of (qty × cost) for products that carry a cost. */
  totalValue?: number | undefined;
}

/** One product's quantity inside a warehouse (Warehouse Detail → Products). */
export interface WarehouseStockRow {
  /** Client-side row key — mirrors the productId returned by the backend. */
  id: string;
  productId: string;
  name: string;
  sku: string;
  image?: string | undefined;
  quantity: number;
  reserved: number;
  available: number;
  /** Per-unit cost in this warehouse (falls back to the product cost). */
  cost?: number | undefined;
  /** quantity × cost, when a cost is known. */
  value?: number | undefined;
  updatedAt: string;
}

export type WarehouseMovementType =
  "stock_in" | "stock_out" | "transfer_in" | "transfer_out" | "adjustment";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  type: WarehouseMovementType;
  /** Signed: positive increases the warehouse, negative decreases. */
  qty: number;
  reference?: string | undefined;
  note?: string | undefined;
  actor: string;
  at: string;
}

export type TransferStatus = "draft" | "pending" | "approved" | "completed" | "cancelled";

export interface StockTransfer {
  id: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  status: TransferStatus;
  notes?: string | undefined;
  createdBy: string;
  createdAt: string;
  completedAt?: string | undefined;
}

/** Aggregated per-product stock across warehouses (Products page). */
export interface ProductStockInfo {
  productId: string;
  name: string;
  sku: string;
  image?: string | undefined;
  wooStock: number | null;
  wooStatus: string;
  totalPhysical: number;
  /** Sum of (qty × cost) across warehouses that carry a cost. */
  totalValue?: number | undefined;
  warehouses: {
    warehouseId: string;
    name: string;
    quantity: number;
    cost?: number | undefined;
    value?: number | undefined;
  }[];
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  archived: boolean;
  createdAt: string;
  /** stable semantic slug used by build-slot logic; survives category renames. */
  key?: string | undefined;
  /** WooCommerce category fields — present once synced with the backend. */
  slug?: string | undefined;
  parentId?: string | undefined;
  description?: string | undefined;
  display?: "default" | "products" | "subcategories" | "both" | undefined;
  image?: string | undefined;
  /** Number of products assigned to the category (backend taxonomy count). */
  count?: number | undefined;
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
  imageUrl?: string | undefined;
  price: number;
  cost: number;
  serialTracked: boolean;
  warrantyMonths: number;
  location: string;
  supplier: string;
  specs: ProductSpecs;
  isService?: boolean | undefined;
  archived?: boolean | undefined;
  /** WooCommerce stock fields — used to populate POS inventory after API sync. */
  stock_quantity?: number | null;
  stock_status?: string;
  manage_stock?: boolean;
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
  clientType?: ClientType | undefined;
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

export interface QuoteRevision {
  version: number;
  at: string;
  items: QuoteItem[];
  subtotal: number;
  discountType?: "amount" | "percentage";
  discountPercentage?: number;
  discount: number;
  serviceTotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  notes?: string | undefined;
  originalRequest?: string | undefined;
}

export interface Quote {
  id: string;
  customerId: string | null;
  customerName: string;
  status: QuoteStatus;
  items: QuoteItem[];
  discountType?: "amount" | "percentage";
  discountPercentage: number;
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
  notes?: string | undefined;
  originalRequest?: string | undefined;
  subject?: string | undefined;
  message?: string | undefined;
  sentAt?: string | undefined;
  buildId?: string | undefined;
  orderId?: string | undefined;
  preparedBy: string;
}

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
  notes?: string | undefined;
  orderId?: string | undefined;
  quoteId?: string | undefined;
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
