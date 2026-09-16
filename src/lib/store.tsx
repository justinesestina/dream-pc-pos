/**
 * DPC NEXUS — demo data layer / state container.
 *
 * This is the single seam between the UI and data. Today it is an in-memory
 * store seeded from demo-data.ts and persisted to localStorage. When a real
 * backend is introduced, replace the action bodies with API calls; component
 * code should not need to change.
 *
 * DEMO ONLY: no server, no real auth, no real inventory sync.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as demo from "./demo-data";
import { emitBuildStatus } from "./build-sync";
import { VAT_RATE } from "./format";
import type {
  AppNotification,
  AuditLog,
  Build,
  BuildSlot,
  BuildStatus,
  CartLine,
  Category,
  ClaimEvent,
  Customer,
  InventoryItem,
  InventoryMovement,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  Product,
  Quote,
  QuoteItem,
  QuoteStatus,
  Role,
  SerialNumber,
  ServiceStatus,
  ServiceTicket,
  User,
  Warranty,
  WarrantyClaim,
} from "./types";

const STORAGE_KEY = "dpc-nexus-demo-v1";

/**
 * Bump when the persisted snapshot shape changes incompatibly so that stale
 * localStorage from an older app version is discarded and re-seeded instead
 * of crashing the UI.
 */
const SCHEMA_VERSION = 5;

interface Snapshot {
  schemaVersion: number;
  user: User | null;
  categories: Category[];
  products: Product[];
  inventory: InventoryItem[];
  serials: SerialNumber[];
  customers: Customer[];
  orders: Order[];
  quotes: Quote[];
  builds: Build[];
  services: ServiceTicket[];
  warranties: Warranty[];
  claims: WarrantyClaim[];
  movements: InventoryMovement[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  cart: CartLine[];
  cartDiscount: number;
  cartCustomerId: string | null;
  heldCarts: { id: string; at: string; lines: CartLine[]; customerId: string | null }[];
  counters: { order: number; quote: number; build: number; service: number; customer: number };
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
}

function seed(): Snapshot {
  return {
    schemaVersion: SCHEMA_VERSION,
    user: null,
    categories: structuredClone(demo.categories),
    products: structuredClone(demo.products),
    inventory: structuredClone(demo.inventory),
    serials: structuredClone(demo.serials),
    customers: structuredClone(demo.customers),
    orders: structuredClone(demo.orders),
    quotes: structuredClone(demo.quotes),
    builds: structuredClone(demo.builds),
    services: structuredClone(demo.services),
    warranties: structuredClone(demo.warranties),
    claims: structuredClone(demo.warrantyClaims),
    movements: structuredClone(demo.movements),
    auditLogs: structuredClone(demo.auditLogs),
    notifications: structuredClone(demo.notifications),
    cart: [],
    cartDiscount: 0,
    cartCustomerId: null,
    heldCarts: [],
    counters: { order: 10483, quote: 10246, build: 10483, service: 10483, customer: 7 },
    sidebarCollapsed: false,
    theme: "dark",
  };
}

function emptyState(): Snapshot {
  return {
    schemaVersion: SCHEMA_VERSION,
    user: null,
    categories: [],
    products: [],
    inventory: [],
    serials: [],
    customers: [],
    orders: [],
    quotes: [],
    builds: [],
    services: [],
    warranties: [],
    claims: [],
    movements: [],
    auditLogs: [],
    notifications: [],
    cart: [],
    cartDiscount: 0,
    cartCustomerId: null,
    heldCarts: [],
    counters: { order: 1, quote: 1, build: 1, service: 1, customer: 1 },
    sidebarCollapsed: false,
    theme: "dark",
  };
}

/* ------------------------------------------------------------------ pricing */

export interface Totals {
  gross: number;
  discount: number;
  serviceTotal: number;
  net: number;
  subtotal: number;
  tax: number;
  total: number;
}

export function computeTotals(
  lines: { qty: number; unitPrice: number }[],
  discount = 0,
  serviceTotal = 0,
  shippingFee = 0,
): Totals {
  const gross = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const net = Math.max(0, gross + serviceTotal + shippingFee - discount);
  const subtotal = Math.round((net / (1 + VAT_RATE)) * 100) / 100;
  const tax = Math.round((net - subtotal) * 100) / 100;
  return { gross, discount, serviceTotal, net, subtotal, tax, total: net };
}

/* -------------------------------------------------------------- context api */

interface StoreValue extends Snapshot {
  products: Product[];
  hydrated: boolean;
  loadingWooCommerce: boolean;
  /* session */
  signInAs: (role: Role, password: string) => { ok: boolean; error?: string };
  signInWithUser: (user: User) => void;
  signOut: () => void;
  /* lookups */
  productById: (id: string) => Product | undefined;
  invFor: (productId: string) => InventoryItem | undefined;
  availableOf: (productId: string) => number;
  customerById: (id: string | null) => Customer | undefined;
  categoryById: (id: string) => Category | undefined;
  categoryNameOf: (categoryId: string) => string;
  /* ui */
  setSidebarCollapsed: (v: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  /* cart */
  addToCart: (productId: string, qty?: number) => { ok: boolean; error?: string };
  setCartQty: (productId: string, qty: number) => void;
  removeCartLine: (productId: string) => void;
  clearCart: () => void;
  setCartDiscount: (v: number) => void;
  setCartCustomer: (id: string | null) => void;
  holdCart: () => void;
  resumeHeldCart: (id: string) => void;
  completeSale: (
    method: PaymentMethod,
    opts?: { notes?: string; change?: number; tendered?: number; reference?: string },
  ) => Order;
  /* serials */
  availableSerialsOf: (productId: string) => SerialNumber[];
  setCartLineSerials: (productId: string, serials: string[]) => void;
  registerSerials: (productId: string, serials: string[], ref?: string) => number;
  updateSerial: (
    serialId: string,
    patch: Partial<
      Pick<SerialNumber, "status" | "orderId" | "buildId" | "customerId" | "warrantyUntil">
    >,
  ) => void;
  /* entities */
  createCustomer: (data: Omit<Customer, "id" | "since" | "status">) => Customer;
  createProduct: (
    data: Omit<Product, "id">,
    opts?: { onHand?: number; reorderPoint?: number },
  ) => { ok: boolean; error?: string; product?: Product };
  updateProduct: (
    productId: string,
    patch: Partial<Product>,
    opts?: { onHand?: number; reorderPoint?: number },
  ) => { ok: boolean; error?: string };
  archiveProduct: (productId: string) => void;
  reactivateProduct: (productId: string) => void;
  deleteProduct: (productId: string) => void;
  createCategory: (name: string) => { ok: boolean; error?: string; category?: Category };
  updateCategory: (categoryId: string, patch: Partial<Pick<Category, "name">>) => { ok: boolean; error?: string };
  archiveCategory: (categoryId: string) => void;
  reactivateCategory: (categoryId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createQuote: (data: {
    customerId: string | null;
    items: { productId: string; qty: number }[];
    discount: number;
    serviceTotal: number;
    shippingFee?: number;
    notes?: string;
    expiresInDays: number;
  }) => Quote;
  setQuoteStatus: (quoteId: string, status: QuoteStatus) => void;
  updateQuote: (
    quoteId: string,
    edits: {
      customerId?: string | null;
      items?: QuoteItem[];
      discount?: number;
      serviceTotal?: number;
      shippingFee?: number;
      notes?: string;
      expiresInDays?: number;
    },
  ) => void;
  sendQuote: (quoteId: string, patch: { subject: string; message: string }) => void;
  convertQuoteToOrder: (quoteId: string, downpayment?: { amount: number; method: PaymentMethod }) => Order | null;
  createBuild: (data: {
    customerId: string | null;
    purpose: string;
    budget: number;
    notes?: string;
  }) => Build;
  updateBuild: (buildId: string, patch: Partial<Build>) => void;
  setBuildStatus: (buildId: string, status: BuildStatus) => void;
  addBuildComponent: (buildId: string, slot: BuildSlot, productId: string, qty?: number) => void;
  removeBuildComponent: (buildId: string, productId: string) => void;
  setBuildComponentQty: (buildId: string, productId: string, qty: number) => void;
  toggleQaCheck: (buildId: string, label: string, value: boolean | null) => void;
  finalizeQa: (buildId: string, result: "pass" | "fail") => void;
  quoteFromBuild: (buildId: string) => Quote | null;
  createService: (data: {
    customerId: string;
    device: string;
    issue: string;
    estimatedCost: number;
    labor: number;
  }) => ServiceTicket;
  setServiceStatus: (id: string, status: ServiceStatus) => void;
  updateService: (
    ticketId: string,
    patch: Partial<
      Pick<ServiceTicket, "diagnosis" | "labor" | "actualCost" | "technician" | "notes">
    >,
  ) => void;
  addServicePart: (ticketId: string, productId: string, qty: number) => void;
  removeServicePart: (ticketId: string, productId: string) => void;
  adjustStock: (productId: string, delta: number, note: string) => void;
  createClaim: (warrantyId: string, reason: string) => WarrantyClaim;
  updateClaim: (
    claimId: string,
    patch: { status?: WarrantyClaim["status"]; resolution?: string; resolutionNote?: string },
    label?: string,
  ) => void;
  /** Write a demo audit entry (used for ops-store actions that lack their own audit). */
  audit: (action: string, entity: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  clearDemoData: () => void;
  loadWooCommerceData: (data: {
    categories: Category[];
    products: Product[];
    customers: Customer[];
    orders: Order[];
  }) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Snapshot>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);
  const [loadingWooCommerce, setLoadingWooCommerce] = useState(false);
  const skipWrite = useRef(true);

  useEffect(() => {
    async function initializeStore() {
      try {
        // Check if WooCommerce credentials exist
        let hasWooCommerceCredentials = false;
        try {
          const { getWooCommerceConfig } = await import("./woocommerce-config");
          const config = getWooCommerceConfig();
          hasWooCommerceCredentials = !!config;
        } catch {
          hasWooCommerceCredentials = false;
        }

        if (hasWooCommerceCredentials) {
          // Don't load from localStorage - we'll fetch fresh WooCommerce data
          console.log("WooCommerce credentials found, will fetch fresh data");
          setState((prev) => ({ ...emptyState(), user: prev.user })); // Preserve user session
        } else {
          // Load from localStorage for non-WooCommerce users
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<Snapshot>;
            if (parsed.schemaVersion === SCHEMA_VERSION) {
              setState((prev) => ({ ...prev, ...parsed }));
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      } catch {
        /* corrupt demo state — fall back to seed */
      }
      skipWrite.current = false;
      setHydrated(true);
    }
    initializeStore();
  }, []);

  // Auto-load WooCommerce data if credentials are configured (always sync fresh data)
  useEffect(() => {
    if (!hydrated) return;

    async function autoLoadWooCommerce() {
      try {
        setLoadingWooCommerce(true);
        console.log("Attempting to auto-load WooCommerce data...");
        const { getWooCommerceConfig } = await import("./woocommerce-config");
        const config = getWooCommerceConfig();
        console.log("WooCommerce config:", config);
        if (config) {
          const { testConnection, fullSyncFromWooCommerce } = await import("./woocommerce-sync");
          const connected = await testConnection();
          console.log("WooCommerce connection test:", connected);
          if (connected) {
            const result = await fullSyncFromWooCommerce();
            console.log("WooCommerce sync result:", result);
            setState((prev) => ({
              ...prev,
              categories: result.categories,
              products: result.products,
              customers: result.customers,
              orders: result.orders,
              inventory: result.products.map((p: any) => {
                // Handle infinite stock: if stock_quantity is null/undefined but stock_status is instock, use Infinity
                const onHand = p.stock_quantity !== null && p.stock_quantity !== undefined 
                  ? p.stock_quantity 
                  : (p.stock_status === 'instock' ? Infinity : 0);
                console.log(`Product ${p.id} (${p.name}): stock_quantity=${p.stock_quantity}, stock_status=${p.stock_status}, onHand=${onHand}`);
                return {
                  productId: p.id,
                  onHand: onHand,
                  reserved: 0,
                  damaged: 0,
                  sold: 0,
                  reorderPoint: 5,
                };
              }),
            }));
            console.log("WooCommerce data loaded successfully");
          }
        }
      } catch (error) {
        console.warn("Auto-load WooCommerce data failed:", error);
      } finally {
        setLoadingWooCommerce(false);
      }
    }
    autoLoadWooCommerce();
  }, [hydrated]);

  useEffect(() => {
    if (skipWrite.current) return;
    const timeoutId = setTimeout(() => {
      try {
        const serialized = JSON.stringify(state);
        // Only write if data is reasonable size (< 5MB)
        if (serialized.length < 5 * 1024 * 1024) {
          localStorage.setItem(STORAGE_KEY, serialized);
        }
      } catch {
        /* storage full / unavailable — demo continues in memory */
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [state]);

  useEffect(() => {
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.theme]);

  const patch = useCallback((fn: (s: Snapshot) => Snapshot) => {
    setState((prev) => fn(prev));
  }, []);

  const productById = useCallback(
    (id: string) => state.products.find((p) => p.id === id),
    [state.products],
  );

  const invFor = useCallback(
    (productId: string) => state.inventory.find((i) => i.productId === productId),
    [state.inventory],
  );

  const availableOf = useCallback(
    (productId: string) => {
      const p = state.products.find((p) => p.id === productId);
      if (p?.isService) return Infinity;
      const inv = state.inventory.find((i) => i.productId === productId);
      if (!inv) return 0;
      return Math.max(0, inv.onHand - inv.reserved);
    },
    [state.products, state.inventory],
  );

  const customerById = useCallback(
    (id: string | null) => (id ? state.customers.find((c) => c.id === id) : undefined),
    [state.customers],
  );

  const categoryById = useCallback(
    (id: string) => state.categories.find((c) => c.id === id),
    [state.categories],
  );

  const categoryNameOf = useCallback(
    (categoryId: string) => state.categories.find((c) => c.id === categoryId)?.name ?? "Uncategorized",
    [state.categories],
  );

  const log = (s: Snapshot, action: string, entity: string): AuditLog[] => [
    {
      id: `al-${Math.random().toString(36).slice(2, 9)}`,
      actor: s.user?.name ?? "Demo User",
      role: s.user?.role ?? "owner",
      action,
      entity,
      at: new Date().toISOString(),
    },
    ...s.auditLogs,
  ];

  const notify = (
    s: Snapshot,
    n: Omit<AppNotification, "id" | "at" | "read">,
  ): AppNotification[] => [
    {
      ...n,
      id: `n-${Math.random().toString(36).slice(2, 9)}`,
      at: new Date().toISOString(),
      read: false,
    },
    ...s.notifications,
  ];

  const value: StoreValue = useMemo(() => {
    const lineFor = (l: CartLine) => {
      const p = productById(l.productId);
      return {
        productId: l.productId,
        name: p?.name ?? "Unknown product",
        sku: p?.sku ?? "N/A",
        qty: l.qty,
        unitPrice: p?.price ?? 0,
        serials: l.serials,
      };
    };

    return {
      ...state,
      hydrated,
      loadingWooCommerce,

      signInAs: (role, password) => {
        const u = demo.demoUsers.find((u) => u.role === role);
        if (!u || !u.password || password !== u.password) {
          return {
            ok: false,
            error: "Incorrect password for this role. Use the demo password shown below.",
          };
        }
        patch((s) => ({ ...s, user: u }));
        return { ok: true };
      },
      signInWithUser: (u) => patch((s) => ({ ...s, user: u })),
      signOut: () => patch((s) => ({ ...s, user: null })),

      productById,
      invFor,
      availableOf,
      customerById,
      categoryById,
      categoryNameOf,
      setSidebarCollapsed: (v) => patch((s) => ({ ...s, sidebarCollapsed: v })),
      setTheme: (theme) => patch((s) => ({ ...s, theme })),

      addToCart: (productId, qty = 1) => {
        const p = productById(productId);
        if (!p) return { ok: false, error: "Unknown product." };
        if (p.archived) return { ok: false, error: "This product is archived." };
        const avail = availableOf(productId);
        const existing = state.cart.find((l) => l.productId === productId);
        const nextQty = (existing?.qty ?? 0) + qty;
        if (!p.isService && nextQty > avail) {
          return { ok: false, error: `Only ${avail} available in stock.` };
        }
        patch((s) => ({
          ...s,
          cart: existing
            ? s.cart.map((l) => (l.productId === productId ? { ...l, qty: nextQty } : l))
            : [...s.cart, { productId, qty }],
        }));
        return { ok: true };
      },
      setCartQty: (productId, qty) =>
        patch((s) => ({
          ...s,
          cart:
            qty <= 0
              ? s.cart.filter((l) => l.productId !== productId)
              : s.cart.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        })),
      removeCartLine: (productId) =>
        patch((s) => ({ ...s, cart: s.cart.filter((l) => l.productId !== productId) })),
      clearCart: () => patch((s) => ({ ...s, cart: [], cartDiscount: 0, cartCustomerId: null })),
      setCartDiscount: (v) => patch((s) => ({ ...s, cartDiscount: Math.max(0, v) })),
      setCartCustomer: (id) => patch((s) => ({ ...s, cartCustomerId: id })),
      holdCart: () =>
        patch((s) =>
          s.cart.length === 0
            ? s
            : {
                ...s,
                heldCarts: [
                  {
                    id: `HOLD-${s.heldCarts.length + 1}`,
                    at: new Date().toISOString(),
                    lines: s.cart,
                    customerId: s.cartCustomerId,
                  },
                  ...s.heldCarts,
                ],
                cart: [],
                cartDiscount: 0,
              },
        ),
      resumeHeldCart: (id) =>
        patch((s) => {
          const held = s.heldCarts.find((h) => h.id === id);
          if (!held) return s;
          return {
            ...s,
            cart: held.lines,
            cartCustomerId: held.customerId,
            heldCarts: s.heldCarts.filter((h) => h.id !== id),
          };
        }),

      completeSale: (method, opts = {}) => {
        const items = state.cart.map(lineFor);
        const serviceTotal = items.reduce(
          (sum, i) => (productById(i.productId)?.isService ? sum + i.qty * i.unitPrice : sum),
          0,
        );
        const productItems = items.filter((i) => !productById(i.productId)?.isService);
        const t = computeTotals(productItems, state.cartDiscount, serviceTotal);
        const id = `DPC-${state.counters.order}`;
        const at = new Date().toISOString();
        const customer = customerById(state.cartCustomerId);
        const payment: Payment = {
          id: `pay-${id}`,
          method,
          amount: t.total,
          at,
          reference: opts.reference,
          tendered: opts.tendered,
          change: opts.change,
        };
        const soldSerials = new Map<string, { ser: string; until: string }[]>();
        for (const i of items) {
          const p = productById(i.productId);
          if (!p?.serialTracked || !i.serials?.length) continue;
          const until = new Date();
          until.setMonth(until.getMonth() + p.warrantyMonths);
          soldSerials.set(
            i.productId,
            i.serials.map((ser) => ({ ser, until: until.toISOString() })),
          );
        }
        const newWarranties = items.flatMap((i, lineIdx) => {
          const p = productById(i.productId);
          const sold = soldSerials.get(i.productId);
          if (!p || !sold?.length) return [];
          const exp = new Date();
          exp.setMonth(exp.getMonth() + (p.warrantyMonths ?? 0));
          return sold.map(({ ser }, serialIdx) => ({
            id: `WR-${id}-${lineIdx}-${serialIdx}`,
            customerId: state.cartCustomerId ?? "walk-in",
            customerName: customer?.name ?? "Walk-in Customer",
            productId: p.id,
            productName: p.name,
            serial: ser,
            orderId: id,
            purchasedAt: at,
            expiresAt: exp.toISOString(),
            status: "active" as const,
          }));
        });
        const newOrder: Order = {
          id,
          customerId: state.cartCustomerId,
          customerName: customer?.name ?? "Walk-in Customer",
          type: items.some((i) => productById(i.productId)?.isService) ? "service" : "retail",
          status: "paid",
          items,
          subtotal: t.subtotal,
          discount: state.cartDiscount,
          tax: t.tax,
          serviceTotal,
          shippingFee: 0,
          total: t.total,
          amountPaid: t.total,
          balanceDue: 0,
          payment,
          createdAt: at,
          notes: opts.notes,
          cashier: state.user?.name ?? "Demo User",
          timeline: [
            { label: "Order created", at, actor: state.user?.name, state: "done" },
            { label: "Payment received", at, actor: state.user?.name, state: "done" },
            { label: "Ready for release", at, state: "active" },
            { label: "Released", at: "", state: "pending" },
          ],
        };
        patch((s) => ({
          ...s,
          orders: [newOrder, ...s.orders],
          inventory: s.inventory.map((inv) => {
            const line = items.find((i) => i.productId === inv.productId);
            if (!line) return inv;
            return {
              ...inv,
              onHand: Math.max(0, inv.onHand - line.qty),
              sold: inv.sold + line.qty,
            };
          }),
          movements: [
            ...items.map((i) => ({
              id: `mv-${Math.random().toString(36).slice(2, 9)}`,
              productId: i.productId,
              type: "sold" as const,
              qty: i.qty,
              at,
              actor: s.user?.name ?? "Demo User",
              reference: id,
            })),
            ...s.movements,
          ],
          serials: s.serials.map((sn) => {
            const match = soldSerials.get(sn.productId)?.find((m) => m.ser === sn.serial);
            if (!match) return sn;
            return {
              ...sn,
              status: "sold" as const,
              orderId: id,
              customerId: state.cartCustomerId ?? undefined,
              warrantyUntil: match.until,
            };
          }),
          warranties: [...newWarranties, ...s.warranties],
          counters: { ...s.counters, order: s.counters.order + 1 },
          cart: [],
          cartDiscount: 0,
          cartCustomerId: null,
          notifications: notify(s, {
            title: "Payment completed",
            body: `${id} — ${customer?.name ?? "Walk-in Customer"}`,
            priority: "normal",
            kind: "payment",
          }),
          auditLogs: log(s, `completed order ${id}`, id),
        }));
        return newOrder;
      },

      availableSerialsOf: (productId) =>
        state.serials.filter((sn) => sn.productId === productId && sn.status === "in_stock"),

      setCartLineSerials: (productId, serials) =>
        patch((s) => ({
          ...s,
          cart: s.cart.map((l) => (l.productId === productId ? { ...l, serials } : l)),
        })),

      registerSerials: (productId, serials, ref) => {
        const known = new Set(state.serials.map((sn) => sn.serial.toLowerCase()));
        const fresh = serials
          .map((x) => x.trim())
          .filter(Boolean)
          .filter((x) => !known.has(x.toLowerCase()))
          .map((x) => ({
            id: `sn-${Math.random().toString(36).slice(2, 9)}`,
            serial: x,
            productId,
            status: "in_stock" as const,
          }));
        if (fresh.length === 0) return 0;
        patch((s) => ({
          ...s,
          serials: [...fresh, ...s.serials],
          auditLogs: log(
            s,
            `registered ${fresh.length} serial(s) for ${productId}${ref ? ` (${ref})` : ""}`,
            productId,
          ),
        }));
        return fresh.length;
      },

      updateSerial: (serialId, p) =>
        patch((s) => ({
          ...s,
          serials: s.serials.map((sn) => (sn.id === serialId ? { ...sn, ...p } : sn)),
          auditLogs: log(s, `updated serial ${serialId} (${p.status ?? "modified"})`, serialId),
        })),

      createCustomer: (data) => {
        const customer: Customer = {
          ...data,
          id: `c-${state.counters.customer}`,
          since: new Date().toISOString(),
          status: "active",
        };
        patch((s) => ({
          ...s,
          customers: [customer, ...s.customers],
          counters: { ...s.counters, customer: s.counters.customer + 1 },
          auditLogs: log(s, `created customer ${customer.name}`, customer.id),
        }));
        return customer;
      },

      createProduct: (data, opts = {}) => {
        const sku = data.sku.trim().toUpperCase();
        if (state.products.some((p) => p.sku.toUpperCase() === sku)) {
          return { ok: false, error: `SKU ${sku} already exists in the catalog.` };
        }
        if (!categoryById(data.categoryId)) {
          return { ok: false, error: "Select a valid category." };
        }
        const id = `p-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(Math.random() * 900 + 100)}`;
        const product: Product = {
          ...data,
          id,
          sku,
          productType: data.productType ?? (data.isService ? "service" : "product"),
          archived: false,
        };
        const onHand = Math.max(0, Math.floor(opts.onHand ?? 0));
        const reorderPoint = Math.max(0, Math.floor(opts.reorderPoint ?? 4));
        patch((s) => ({
          ...s,
          products: [product, ...s.products],
          inventory: s.inventory.some((i) => i.productId === id)
            ? s.inventory
            : [
                ...s.inventory,
                { productId: id, onHand, reserved: 0, damaged: 0, sold: 0, reorderPoint },
              ],
          auditLogs: log(s, `created product ${product.name} (${sku})`, id),
        }));
        return { ok: true, product };
      },

      updateProduct: (productId, patchData, opts = {}) => {
        const existing = productById(productId);
        if (!existing) return { ok: false, error: "Product not found." };
        const sku = (patchData.sku ?? existing.sku).trim().toUpperCase();
        if (state.products.some((p) => p.id !== productId && p.sku.toUpperCase() === sku)) {
          return { ok: false, error: `SKU ${sku} already exists in the catalog.` };
        }
        const hasStockPatch = opts.onHand !== undefined || opts.reorderPoint !== undefined;
        const next = { ...patchData, sku } as Partial<Product>;
        if (next.productType === undefined && next.isService !== undefined) {
          next.productType = next.isService ? "service" : "product";
        }
        patch((s) => {
          const newMovements =
            hasStockPatch && opts.onHand !== undefined
              ? [
                  ...s.movements,
                  {
                    id: `mv-${Math.random().toString(36).slice(2, 9)}`,
                    productId,
                    type: "adjusted" as const,
                    qty: opts.onHand - (invFor(productId)?.onHand ?? 0),
                    at: new Date().toISOString(),
                    actor: s.user?.name ?? "Demo User",
                    note: "Stock level edited in product form",
                  },
                ]
              : s.movements;
          return {
            ...s,
            products: s.products.map((p) => (p.id === productId ? { ...p, ...next } : p)),
            inventory: hasStockPatch
              ? s.inventory.map((i) =>
                  i.productId === productId
                    ? {
                        ...i,
                        onHand: opts.onHand !== undefined ? Math.max(0, Math.floor(opts.onHand)) : i.onHand,
                        reorderPoint: opts.reorderPoint !== undefined ? Math.max(0, Math.floor(opts.reorderPoint)) : i.reorderPoint,
                      }
                    : i,
                )
              : s.inventory,
            movements: newMovements,
            auditLogs: log(s, `updated product ${productId} (${sku})`, productId),
          };
        });
        return { ok: true };
      },

      archiveProduct: (productId) =>
        patch((s) => ({
          ...s,
          products: s.products.map((p) => (p.id === productId ? { ...p, archived: true } : p)),
          auditLogs: log(s, `archived product ${productId}`, productId),
        })),

      reactivateProduct: (productId) =>
        patch((s) => ({
          ...s,
          products: s.products.map((p) => (p.id === productId ? { ...p, archived: false } : p)),
          auditLogs: log(s, `reactivated product ${productId}`, productId),
        })),

      deleteProduct: (productId) =>
        patch((s) => ({
          ...s,
          products: s.products.filter((p) => p.id !== productId),
          inventory: s.inventory.filter((i) => i.productId !== productId),
          auditLogs: log(s, `deleted product ${productId}`, productId),
        })),

      createCategory: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return { ok: false, error: "Category name is required." };
        if (state.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
          return { ok: false, error: `Category "${trimmed}" already exists.` };
        }
        const category: Category = {
          id: `cat-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: trimmed,
          archived: false,
          createdAt: new Date().toISOString(),
        };
        patch((s) => ({
          ...s,
          categories: [...s.categories, category],
          auditLogs: log(s, `created category ${category.name}`, category.id),
        }));
        return { ok: true, category };
      },

      updateCategory: (categoryId, patchData) => {
        const existing = categoryById(categoryId);
        if (!existing) return { ok: false, error: "Category not found." };
        const name = (patchData.name ?? existing.name).trim();
        if (!name) return { ok: false, error: "Category name is required." };
        if (state.categories.some((c) => c.id !== categoryId && c.name.toLowerCase() === name.toLowerCase())) {
          return { ok: false, error: `Category "${name}" already exists.` };
        }
        patch((s) => ({
          ...s,
          categories: s.categories.map((c) => (c.id === categoryId ? { ...c, name } : c)),
          auditLogs: log(s, `renamed category ${existing.name} to ${name}`, categoryId),
        }));
        return { ok: true };
      },

      archiveCategory: (categoryId) =>
        patch((s) => ({
          ...s,
          categories: s.categories.map((c) => (c.id === categoryId ? { ...c, archived: true } : c)),
          auditLogs: log(s, `archived category ${categoryId}`, categoryId),
        })),

      reactivateCategory: (categoryId) =>
        patch((s) => ({
          ...s,
          categories: s.categories.map((c) => (c.id === categoryId ? { ...c, archived: false } : c)),
          auditLogs: log(s, `reactivated category ${categoryId}`, categoryId),
        })),

      updateOrderStatus: (orderId, status) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  timeline: [
                    ...o.timeline.map((t) =>
                      t.state === "active" ? { ...t, state: "done" as const } : t,
                    ),
                    {
                      label: `Status set to ${status.replace(/_/g, " ")}`,
                      at: new Date().toISOString(),
                      actor: s.user?.name,
                      state: "active" as const,
                    },
                  ],
                }
              : o,
          ),
          auditLogs: log(s, `set order ${orderId} to ${status}`, orderId),
        })),

      createQuote: ({ customerId, items, discount, serviceTotal, shippingFee = 0, notes, expiresInDays }) => {
        const lines = items.map((i) => {
          const p = productById(i.productId);
          return {
            productId: i.productId,
            name: p?.name ?? "Unknown product",
            sku: p?.sku ?? "N/A",
            qty: i.qty,
            unitPrice: p?.price ?? 0,
          };
        });
        const t = computeTotals(lines, discount, serviceTotal, shippingFee);
        const id = `QT-${state.counters.quote}`;
        const customer = customerById(customerId);
        const quote: Quote = {
          id,
          customerId,
          customerName: customer?.name ?? "Walk-in Customer",
          status: "draft",
          items: lines,
          discount,
          serviceTotal,
          shippingFee,
          subtotal: t.subtotal,
          tax: t.tax,
          total: t.total,
          version: 1,
          revisions: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
          notes,
          preparedBy: state.user?.name ?? "Demo User",
        };
        patch((s) => ({
          ...s,
          quotes: [quote, ...s.quotes],
          counters: { ...s.counters, quote: s.counters.quote + 1 },
          auditLogs: log(s, `created quote ${id}`, id),
        }));
        return quote;
      },

      setQuoteStatus: (quoteId, status) =>
        patch((s) => ({
          ...s,
          quotes: s.quotes.map((q) => (q.id === quoteId ? { ...q, status } : q)),
          auditLogs: log(s, `set quote ${quoteId} to ${status}`, quoteId),
          notifications:
            status === "approved"
              ? notify(s, {
                  title: "Quote approved",
                  body: `${quoteId} was marked approved.`,
                  priority: "high",
                  kind: "quote",
                })
              : s.notifications,
        })),

      updateQuote: (quoteId, edits) => {
        const existing = state.quotes.find((q) => q.id === quoteId);
        if (!existing) return;
        // Save current state as a revision before applying edits
        const revision = {
          version: existing.version ?? 1,
          at: new Date().toISOString(),
          items: existing.items,
          subtotal: existing.subtotal,
          discount: existing.discount,
          serviceTotal: existing.serviceTotal,
          shippingFee: existing.shippingFee ?? 0,
          tax: existing.tax,
          total: existing.total,
          notes: existing.notes,
        };
        const items = edits.items ?? existing.items;
        const discount = edits.discount ?? existing.discount;
        const serviceTotal = edits.serviceTotal ?? existing.serviceTotal;
        const shippingFee = edits.shippingFee ?? existing.shippingFee ?? 0;
        const customerId = edits.customerId !== undefined ? edits.customerId : existing.customerId;
        const customerName =
          customerId == null
            ? existing.customerName
            : customerById(customerId)?.name ?? existing.customerName;
        const t = computeTotals(items, discount, serviceTotal, shippingFee);
        const expiresAt =
          edits.expiresInDays !== undefined
            ? new Date(Date.now() + edits.expiresInDays * 86400000).toISOString()
            : existing.expiresAt;
        const nextVersion = (existing.version ?? 1) + 1;
        patch((s) => ({
          ...s,
          quotes: s.quotes.map((q) =>
            q.id === quoteId
              ? {
                  ...q,
                  customerId,
                  customerName,
                  items,
                  discount,
                  serviceTotal,
                  shippingFee,
                  subtotal: t.subtotal,
                  tax: t.tax,
                  total: t.total,
                  notes: edits.notes ?? q.notes,
                  expiresAt,
                  version: nextVersion,
                  revisions: [...(q.revisions ?? []), revision],
                }
              : q,
          ),
          auditLogs: log(s, `updated quote ${quoteId} to v${nextVersion}`, quoteId),
        }));
      },

      sendQuote: (quoteId, msg) =>
        patch((s) => ({
          ...s,
          quotes: s.quotes.map((q) =>
            q.id === quoteId
              ? {
                  ...q,
                  status: "sent" as const,
                  subject: msg.subject,
                  message: msg.message,
                  sentAt: new Date().toISOString(),
                }
              : q,
          ),
          auditLogs: log(s, `sent quote ${quoteId} to customer`, quoteId),
          notifications: notify(s, {
            title: "Quote sent to customer",
            body: `${quoteId} was sent to ${state.quotes.find((q) => q.id === quoteId)?.customerName ?? "customer"}.`,
            priority: "normal",
            kind: "quote",
          }),
        })),

      convertQuoteToOrder: (quoteId, downpayment) => {
        const quote = state.quotes.find((q) => q.id === quoteId);
        if (!quote) return null;
        const id = `DPC-${state.counters.order}`;
        const at = new Date().toISOString();
        const amountPaid = downpayment?.amount ?? 0;
        const balanceDue = Math.max(0, quote.total - amountPaid);
        const payment: Payment | null = downpayment
          ? { id: `pay-${id}`, method: downpayment.method, amount: downpayment.amount, at }
          : null;
        const isPaid = amountPaid >= quote.total;
        const newOrder: Order = {
          id,
          customerId: quote.customerId,
          customerName: quote.customerName,
          type: quote.buildId ? "custom_build" : "retail",
          status: isPaid ? "paid" : "pending",
          items: quote.items,
          subtotal: quote.subtotal,
          discount: quote.discount,
          tax: quote.tax,
          serviceTotal: quote.serviceTotal,
          shippingFee: quote.shippingFee ?? 0,
          total: quote.total,
          amountPaid,
          balanceDue,
          payment,
          createdAt: at,
          quoteId: quote.id,
          buildId: quote.buildId,
          cashier: state.user?.name ?? "Demo User",
          timeline: [
            {
              label: `Converted from quote ${quote.id}`,
              at,
              actor: state.user?.name,
              state: "done",
            },
            downpayment
              ? {
                  label: isPaid
                    ? `Full payment received (₱${amountPaid.toLocaleString()})`
                    : `Downpayment received (₱${amountPaid.toLocaleString()} of ₱${quote.total.toLocaleString()})`,
                  at,
                  actor: state.user?.name,
                  state: "done" as const,
                }
              : { label: "Awaiting payment", at, state: "active" as const },
            { label: isPaid ? "Ready for release" : "Balance due", at: isPaid ? at : "", state: isPaid ? "active" : "pending" },
            { label: "Released", at: "", state: "pending" },
          ],
        };
        const toReserve = new Map<string, number>();
        for (const l of quote.items) {
          if (productById(l.productId)?.serialTracked) toReserve.set(l.productId, l.qty);
        }
        patch((s) => ({
          ...s,
          orders: [newOrder, ...s.orders],
          quotes: s.quotes.map((q) =>
            q.id === quoteId ? { ...q, status: "converted", orderId: id } : q,
          ),
          builds: quote.buildId
            ? s.builds.map((b) =>
                b.id === quote.buildId
                  ? { ...b, orderId: id, status: "parts_reserved" as const }
                  : b,
              )
            : s.builds,
          inventory: s.inventory.map((inv) => {
            const line = quote.items.find((i) => i.productId === inv.productId);
            if (!line) return inv;
            return { ...inv, reserved: inv.reserved + line.qty };
          }),
          serials: s.serials.map((sn) => {
            const rem = toReserve.get(sn.productId);
            if (rem === undefined || sn.status !== "in_stock" || rem <= 0) return sn;
            toReserve.set(sn.productId, rem - 1);
            return { ...sn, status: "reserved" as const, orderId: id };
          }),
          counters: { ...s.counters, order: s.counters.order + 1 },
          auditLogs: log(s, `converted quote ${quoteId} into order ${id}${downpayment ? ` with ₱${amountPaid.toLocaleString()} downpayment` : ""}`, id),
          notifications: notify(s, {
            title: downpayment ? "Quote converted with downpayment" : "Quote converted to order",
            body: `${quoteId} → ${id}${downpayment ? ` — ₱${amountPaid.toLocaleString()} received, ₱${balanceDue.toLocaleString()} remaining` : ""}`,
            priority: "high",
            kind: "quote",
          }),
        }));
        if (quote.buildId) emitBuildStatus(quote.buildId, "parts_reserved");
        return newOrder;
      },

      createBuild: ({ customerId, purpose, budget, notes }) => {
        const id = `BUILD-${state.counters.build}`;
        const customer = customerById(customerId);
        const build: Build = {
          id,
          customerId,
          customerName: customer?.name ?? "Walk-in Customer",
          purpose,
          budget,
          status: "draft",
          components: [],
          services: [
            { label: "Assembly", amount: 2500 },
            { label: "Windows installation", amount: 1000 },
            { label: "Cable management", amount: 500 },
          ],
          technician: state.user?.name ?? "Unassigned",
          createdAt: new Date().toISOString(),
          notes,
          qa: demo.builds[1]?.qa.map((c) => ({ ...c, passed: null })) ?? [],
          qaResult: null,
        };
        patch((s) => ({
          ...s,
          builds: [build, ...s.builds],
          counters: { ...s.counters, build: s.counters.build + 1 },
          auditLogs: log(s, `created build ${id}`, id),
        }));
        return build;
      },

      updateBuild: (buildId, p) =>
        patch((s) => ({
          ...s,
          builds: s.builds.map((b) => (b.id === buildId ? { ...b, ...p } : b)),
        })),

      addBuildComponent: (buildId, slot, pid, qty = 1) =>
        patch((s) => ({
          ...s,
          builds: s.builds.map((b) => {
            if (b.id !== buildId) return b;
            const existing = b.components.find((c) => c.productId === pid);
            return {
              ...b,
              components: existing
                ? b.components.map((c) => (c.productId === pid ? { ...c, qty: c.qty + qty } : c))
                : [...b.components, { slot, productId: pid, qty }],
            };
          }),
          auditLogs: log(s, `added component ${pid} to ${buildId}`, buildId),
        })),

      removeBuildComponent: (buildId, pid) =>
        patch((s) => ({
          ...s,
          builds: s.builds.map((b) =>
            b.id === buildId
              ? { ...b, components: b.components.filter((c) => c.productId !== pid) }
              : b,
          ),
          auditLogs: log(s, `removed component ${pid} from ${buildId}`, buildId),
        })),

      setBuildComponentQty: (buildId, pid, qty) =>
        patch((s) => ({
          ...s,
          builds: s.builds.map((b) =>
            b.id === buildId
              ? {
                  ...b,
                  components: b.components.map((c) =>
                    c.productId === pid ? { ...c, qty: Math.max(1, Math.floor(qty)) } : c,
                  ),
                }
              : b,
          ),
          auditLogs: log(
            s,
            `set qty ${Math.max(1, Math.floor(qty))} for ${pid} in ${buildId}`,
            buildId,
          ),
        })),

      setBuildStatus: (buildId, status) => {
        emitBuildStatus(buildId, status);
        patch((s) => ({
          ...s,
          builds: s.builds.map((b) => (b.id === buildId ? { ...b, status } : b)),
          auditLogs: log(s, `set build ${buildId} to ${status}`, buildId),
          notifications:
            status === "ready"
              ? notify(s, {
                  title: "Build ready for release",
                  body: `${buildId} is awaiting customer pickup.`,
                  priority: "high",
                  kind: "build",
                })
              : s.notifications,
        }));
      },

      toggleQaCheck: (buildId, label, v) =>
        patch((s) => ({
          ...s,
          builds: s.builds.map((b) =>
            b.id === buildId
              ? { ...b, qa: b.qa.map((c) => (c.label === label ? { ...c, passed: v } : c)) }
              : b,
          ),
        })),

      finalizeQa: (buildId, result) => {
        patch((s) => ({
          ...s,
          builds: s.builds.map((b) =>
            b.id === buildId
              ? { ...b, qaResult: result, status: result === "pass" ? "ready" : b.status }
              : b,
          ),
          auditLogs: log(s, `marked build ${buildId} QA as ${result}`, buildId),
          notifications: notify(s, {
            title: result === "pass" ? "Build QA passed" : "Build QA failed",
            body: `${buildId} QA result recorded.`,
            priority: result === "pass" ? "normal" : "critical",
            kind: "build",
          }),
        }));
        if (result === "pass") emitBuildStatus(buildId, "ready");
      },

      quoteFromBuild: (buildId) => {
        const build = state.builds.find((b) => b.id === buildId);
        if (!build) return null;
        const lines = build.components.map((c) => {
          const p = productById(c.productId);
          return {
            productId: c.productId,
            name: p?.name ?? "Unknown component",
            sku: p?.sku ?? "N/A",
            qty: c.qty,
            unitPrice: p?.price ?? 0,
          };
        });
        const serviceTotal = build.services.reduce((s, x) => s + x.amount, 0);
        const t = computeTotals(lines, 0, serviceTotal);
        const id = `QT-${state.counters.quote}`;
        const quote: Quote = {
          id,
          customerId: build.customerId,
          customerName: build.customerName,
          status: "draft",
          items: lines,
          discount: 0,
          serviceTotal,
          shippingFee: 0,
          subtotal: t.subtotal,
          tax: t.tax,
          total: t.total,
          version: 1,
          revisions: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
          buildId: build.id,
          notes: `Quotation for ${build.purpose}.`,
          preparedBy: state.user?.name ?? "Demo User",
        };
        patch((s) => ({
          ...s,
          quotes: [quote, ...s.quotes],
          builds: s.builds.map((b) =>
            b.id === buildId ? { ...b, quoteId: id, status: "quoted" } : b,
          ),
          counters: { ...s.counters, quote: s.counters.quote + 1 },
          auditLogs: log(s, `generated quote ${id} from ${buildId}`, id),
        }));
        return quote;
      },

      createService: ({ customerId, device, issue, estimatedCost, labor }) => {
        const id = `SRV-${state.counters.service}`;
        const at = new Date().toISOString();
        const customer = customerById(customerId);
        const ticket: ServiceTicket = {
          id,
          customerId,
          customerName: customer?.name ?? "Walk-in Customer",
          device,
          issue,
          status: "received",
          technician: state.user?.name ?? "Unassigned",
          parts: [],
          labor,
          estimatedCost,
          actualCost: null,
          createdAt: at,
          timeline: [
            { label: "Unit received", at, actor: state.user?.name, state: "active" },
            { label: "Diagnostics", at: "", state: "pending" },
            { label: "Repair", at: "", state: "pending" },
            { label: "Ready for release", at: "", state: "pending" },
          ],
        };
        patch((s) => ({
          ...s,
          services: [ticket, ...s.services],
          counters: { ...s.counters, service: s.counters.service + 1 },
          auditLogs: log(s, `created service ticket ${id}`, id),
        }));
        return ticket;
      },

      setServiceStatus: (id, status) =>
        patch((s) => ({
          ...s,
          services: s.services.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  timeline: [
                    ...t.timeline.map((e) =>
                      e.state === "active" ? { ...e, state: "done" as const } : e,
                    ),
                    {
                      label: `Status set to ${status.replace(/_/g, " ")}`,
                      at: new Date().toISOString(),
                      actor: s.user?.name,
                      state: "active" as const,
                    },
                  ],
                }
              : t,
          ),
          auditLogs: log(s, `set service ${id} to ${status}`, id),
        })),

      updateService: (ticketId, p) =>
        patch((s) => ({
          ...s,
          services: s.services.map((t) => (t.id === ticketId ? { ...t, ...p } : t)),
          auditLogs: log(s, `updated service ${ticketId}`, ticketId),
        })),

      addServicePart: (ticketId, productId, qty) =>
        patch((s) => {
          const ticket = s.services.find((t) => t.id === ticketId);
          const prod = s.products.find((p) => p.id === productId);
          if (!ticket || !prod) return s;
          const safeQty = Math.max(1, Math.floor(qty));
          const existing = ticket.parts.find((x) => x.productId === productId);
          const inv = s.inventory.find((i) => i.productId === productId);
          const onHand = inv?.onHand ?? 0;
          const used = existing
            ? Math.min(existing.qty + safeQty, Math.max(0, onHand + (existing?.qty ?? 0)))
            : Math.min(safeQty, onHand);
          return {
            ...s,
            services: s.services.map((t) =>
              t.id === ticketId
                ? {
                    ...t,
                    parts: existing
                      ? t.parts.map((x) => (x.productId === productId ? { ...x, qty: used } : x))
                      : [...t.parts, { productId, name: prod.name, qty: used, price: prod.price }],
                  }
                : t,
            ),
            inventory: s.inventory.map((i) =>
              i.productId === productId
                ? { ...i, onHand: Math.max(0, i.onHand - used + (existing?.qty ?? 0)) }
                : i,
            ),
            movements: [
              {
                id: `mv-${Math.random().toString(36).slice(2, 9)}`,
                productId,
                type: "adjusted" as const,
                qty: -used,
                at: new Date().toISOString(),
                actor: s.user?.name ?? "Demo User",
                note: `Parts used on ${ticketId}`,
              },
              ...s.movements,
            ],
            auditLogs: log(s, `used ${used}× ${prod.name} on ${ticketId}`, ticketId),
          };
        }),

      removeServicePart: (ticketId, productId) =>
        patch((s) => {
          const ticket = s.services.find((t) => t.id === ticketId);
          const part = ticket?.parts.find((x) => x.productId === productId);
          if (!ticket || !part) return s;
          return {
            ...s,
            services: s.services.map((t) =>
              t.id === ticketId
                ? { ...t, parts: t.parts.filter((x) => x.productId !== productId) }
                : t,
            ),
            inventory: s.inventory.map((i) =>
              i.productId === productId ? { ...i, onHand: i.onHand + part.qty } : i,
            ),
            movements: [
              {
                id: `mv-${Math.random().toString(36).slice(2, 9)}`,
                productId,
                type: "received" as const,
                qty: part.qty,
                at: new Date().toISOString(),
                actor: s.user?.name ?? "Demo User",
                note: `Part unassigned from ${ticketId}`,
              },
              ...s.movements,
            ],
            auditLogs: log(s, `removed ${part.qty}× ${part.name} from ${ticketId}`, ticketId),
          };
        }),

      adjustStock: (productId, delta, note) =>
        patch((s) => ({
          ...s,
          inventory: s.inventory.map((i) =>
            i.productId === productId ? { ...i, onHand: Math.max(0, i.onHand + delta) } : i,
          ),
          movements: [
            {
              id: `mv-${Math.random().toString(36).slice(2, 9)}`,
              productId,
              type: delta >= 0 ? ("received" as const) : ("adjusted" as const),
              qty: delta,
              at: new Date().toISOString(),
              actor: s.user?.name ?? "Demo User",
              note,
            },
            ...s.movements,
          ],
          auditLogs: log(s, `adjusted stock (${delta > 0 ? "+" : ""}${delta})`, productId),
        })),

      createClaim: (warrantyId, reason) => {
        const claim: WarrantyClaim = {
          id: `WC-${Math.floor(Math.random() * 900 + 3100)}`,
          warrantyId,
          reason,
          status: "open",
          createdAt: new Date().toISOString(),
          timeline: [
            { label: `Claim opened — ${reason}`, at: new Date().toISOString(), actor: state.user?.name },
          ],
        };
        patch((s) => ({
          ...s,
          claims: [claim, ...s.claims],
          auditLogs: log(s, `created warranty claim ${claim.id}`, warrantyId),
        }));
        return claim;
      },

      updateClaim: (claimId, p, label) =>
        patch((s) => {
          const existing = s.claims.find((c) => c.id === claimId);
          if (!existing) return s;
          const at = new Date().toISOString();
          const event: ClaimEvent = {
            label:
              label ??
              (p.status ? `Status set to ${p.status.replace(/_/g, " ")}` : "Claim updated"),
            at,
            actor: s.user?.name,
          };
          return {
            ...s,
            claims: s.claims.map((c) =>
              c.id === claimId
                ? { ...c, ...p, timeline: [...c.timeline, event] }
                : c,
            ),
            auditLogs: log(s, `updated warranty claim ${claimId}`, claimId),
          };
        }),

      audit: (action, entity) => patch((s) => ({ ...s, auditLogs: log(s, action, entity) })),

      markAllNotificationsRead: () =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      resetDemoData: () =>
        patch((s) => ({ ...seed(), user: s.user, sidebarCollapsed: s.sidebarCollapsed })),

      clearDemoData: () =>
        patch((s) => ({ ...emptyState(), user: s.user, sidebarCollapsed: s.sidebarCollapsed })),

      loadWooCommerceData: (data) =>
        patch((s) => ({
          ...s,
          categories: data.categories,
          products: data.products,
          customers: data.customers,
          orders: data.orders,
          inventory: data.products.map((p: any) => ({
            productId: p.id,
            onHand: p.stock_quantity !== null && p.stock_quantity !== undefined 
              ? p.stock_quantity 
              : (p.stock_status === 'instock' ? Infinity : 0),
            reserved: 0,
            damaged: 0,
            sold: 0,
            reorderPoint: 5,
          })),
          auditLogs: [
            {
              id: `audit-${Date.now()}`,
              actor: s.user?.name ?? "System",
              role: s.user?.role ?? "admin",
              action: "loaded_woocommerce_data",
              entity: "woocommerce",
              at: new Date().toISOString(),
            },
          ],
        })),
    };
  }, [state, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** Simulates network latency so skeleton/loading states are exercised. */
export function useSimulatedLoad(ms = 320) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
