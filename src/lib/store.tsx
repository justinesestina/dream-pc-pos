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
import { VAT_RATE } from "./format";
import type {
  AppNotification,
  AuditLog,
  Build,
  BuildStatus,
  CartLine,
  Customer,
  InventoryItem,
  InventoryMovement,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  Product,
  Quote,
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

interface Snapshot {
  user: User | null;
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
}

function seed(): Snapshot {
  return {
    user: null,
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
  };
}

export const DEMO_CREDENTIALS = {
  email: "demo@dpcnexus.local",
  password: "demo1234",
};

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
): Totals {
  const gross = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const net = Math.max(0, gross + serviceTotal - discount);
  const subtotal = Math.round((net / (1 + VAT_RATE)) * 100) / 100;
  const tax = Math.round((net - subtotal) * 100) / 100;
  return { gross, discount, serviceTotal, net, subtotal, tax, total: net };
}

/* -------------------------------------------------------------- context api */

interface StoreValue extends Snapshot {
  products: Product[];
  hydrated: boolean;
  /* session */
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signInDemo: () => void;
  signOut: () => void;
  switchRole: (role: Role) => void;
  /* lookups */
  productById: (id: string) => Product | undefined;
  invFor: (productId: string) => InventoryItem | undefined;
  availableOf: (productId: string) => number;
  customerById: (id: string | null) => Customer | undefined;
  /* ui */
  setSidebarCollapsed: (v: boolean) => void;
  /* cart */
  addToCart: (productId: string, qty?: number) => { ok: boolean; error?: string };
  setCartQty: (productId: string, qty: number) => void;
  removeCartLine: (productId: string) => void;
  clearCart: () => void;
  setCartDiscount: (v: number) => void;
  setCartCustomer: (id: string | null) => void;
  holdCart: () => void;
  resumeHeldCart: (id: string) => void;
  completeSale: (method: PaymentMethod) => Order;
  /* entities */
  createCustomer: (data: Omit<Customer, "id" | "since" | "status">) => Customer;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createQuote: (data: {
    customerId: string | null;
    items: { productId: string; qty: number }[];
    discount: number;
    serviceTotal: number;
    notes?: string;
    expiresInDays: number;
  }) => Quote;
  setQuoteStatus: (quoteId: string, status: QuoteStatus) => void;
  convertQuoteToOrder: (quoteId: string) => Order | null;
  createBuild: (data: {
    customerId: string | null;
    purpose: string;
    budget: number;
    notes?: string;
  }) => Build;
  updateBuild: (buildId: string, patch: Partial<Build>) => void;
  setBuildStatus: (buildId: string, status: BuildStatus) => void;
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
  adjustStock: (productId: string, delta: number, note: string) => void;
  createClaim: (warrantyId: string, reason: string) => WarrantyClaim;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Snapshot>(() => seed());
  const [hydrated, setHydrated] = useState(false);
  const skipWrite = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Snapshot>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* corrupt demo state — fall back to seed */
    }
    skipWrite.current = false;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (skipWrite.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable — demo continues in memory */
    }
  }, [state]);

  const patch = useCallback((fn: (s: Snapshot) => Snapshot) => {
    setState((prev) => fn(prev));
  }, []);

  const products = demo.products;
  const productById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const invFor = useCallback(
    (productId: string) => state.inventory.find((i) => i.productId === productId),
    [state.inventory],
  );

  const availableOf = useCallback(
    (productId: string) => {
      const p = productById(productId);
      if (p?.isService) return Infinity;
      const inv = state.inventory.find((i) => i.productId === productId);
      if (!inv) return 0;
      return Math.max(0, inv.onHand - inv.reserved);
    },
    [state.inventory, productById],
  );

  const customerById = useCallback(
    (id: string | null) => (id ? state.customers.find((c) => c.id === id) : undefined),
    [state.customers],
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
      const p = productById(l.productId)!;
      return { productId: l.productId, name: p.name, sku: p.sku, qty: l.qty, unitPrice: p.price };
    };

    return {
      ...state,
      products,
      hydrated,

      signIn: (email, password) => {
        const known = demo.demoUsers.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!known || password !== DEMO_CREDENTIALS.password) {
          return { ok: false, error: "Invalid demo credentials." };
        }
        patch((s) => ({ ...s, user: known }));
        return { ok: true };
      },
      signInDemo: () => {
        patch((s) => ({ ...s, user: demo.demoUsers[0] ?? null }));
      },
      signOut: () => patch((s) => ({ ...s, user: null })),
      switchRole: (role) =>
        patch((s) => ({
          ...s,
          user: s.user ? { ...s.user, role } : s.user,
        })),

      productById,
      invFor,
      availableOf,
      customerById,
      setSidebarCollapsed: (v) => patch((s) => ({ ...s, sidebarCollapsed: v })),

      addToCart: (productId, qty = 1) => {
        const p = productById(productId);
        if (!p) return { ok: false, error: "Unknown product." };
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

      completeSale: (method) => {
        const items = state.cart.map(lineFor);
        const serviceTotal = 0;
        const t = computeTotals(items, state.cartDiscount, serviceTotal);
        const id = `DPC-${state.counters.order}`;
        const at = new Date().toISOString();
        const customer = customerById(state.cartCustomerId);
        const payment: Payment = { id: `pay-${id}`, method, amount: t.total, at };
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
          total: t.total,
          payment,
          createdAt: at,
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
          warranties: [
            ...items
              .filter((i) => (productById(i.productId)?.warrantyMonths ?? 0) > 0)
              .map((i) => {
                const p = productById(i.productId)!;
                const exp = new Date();
                exp.setMonth(exp.getMonth() + p.warrantyMonths);
                return {
                  id: `WR-${Math.floor(Math.random() * 9000 + 21000)}`,
                  customerId: state.cartCustomerId ?? "walk-in",
                  customerName: customer?.name ?? "Walk-in Customer",
                  productId: p.id,
                  productName: p.name,
                  orderId: id,
                  purchasedAt: at,
                  expiresAt: exp.toISOString(),
                  status: "active" as const,
                };
              }),
            ...s.warranties,
          ],
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

      updateOrderStatus: (orderId, status) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  timeline: [
                    ...o.timeline.map((t) => (t.state === "active" ? { ...t, state: "done" as const } : t)),
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

      createQuote: ({ customerId, items, discount, serviceTotal, notes, expiresInDays }) => {
        const lines = items.map((i) => {
          const p = productById(i.productId)!;
          return { productId: i.productId, name: p.name, sku: p.sku, qty: i.qty, unitPrice: p.price };
        });
        const t = computeTotals(lines, discount, serviceTotal);
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
          subtotal: t.subtotal,
          tax: t.tax,
          total: t.total,
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

      convertQuoteToOrder: (quoteId) => {
        const quote = state.quotes.find((q) => q.id === quoteId);
        if (!quote) return null;
        const id = `DPC-${state.counters.order}`;
        const at = new Date().toISOString();
        const newOrder: Order = {
          id,
          customerId: quote.customerId,
          customerName: quote.customerName,
          type: quote.buildId ? "custom_build" : "retail",
          status: "pending",
          items: quote.items,
          subtotal: quote.subtotal,
          discount: quote.discount,
          tax: quote.tax,
          serviceTotal: quote.serviceTotal,
          total: quote.total,
          payment: null,
          createdAt: at,
          quoteId: quote.id,
          buildId: quote.buildId,
          cashier: state.user?.name ?? "Demo User",
          timeline: [
            { label: `Converted from quote ${quote.id}`, at, actor: state.user?.name, state: "done" },
            { label: "Awaiting payment", at, state: "active" },
            { label: "Parts reserved", at: "", state: "pending" },
            { label: "Released", at: "", state: "pending" },
          ],
        };
        patch((s) => ({
          ...s,
          orders: [newOrder, ...s.orders],
          quotes: s.quotes.map((q) =>
            q.id === quoteId ? { ...q, status: "converted", orderId: id } : q,
          ),
          inventory: s.inventory.map((inv) => {
            const line = quote.items.find((i) => i.productId === inv.productId);
            if (!line) return inv;
            return { ...inv, reserved: inv.reserved + line.qty };
          }),
          counters: { ...s.counters, order: s.counters.order + 1 },
          auditLogs: log(s, `converted quote ${quoteId} into order ${id}`, id),
        }));
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
          technician: state.user?.role === "technician" ? state.user.name : "Unassigned",
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

      setBuildStatus: (buildId, status) =>
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
        })),

      toggleQaCheck: (buildId, label, v) =>
        patch((s) => ({
          ...s,
          builds: s.builds.map((b) =>
            b.id === buildId
              ? { ...b, qa: b.qa.map((c) => (c.label === label ? { ...c, passed: v } : c)) }
              : b,
          ),
        })),

      finalizeQa: (buildId, result) =>
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
        })),

      quoteFromBuild: (buildId) => {
        const build = state.builds.find((b) => b.id === buildId);
        if (!build) return null;
        const lines = build.components.map((c) => {
          const p = productById(c.productId)!;
          return { productId: c.productId, name: p.name, sku: p.sku, qty: c.qty, unitPrice: p.price };
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
          subtotal: t.subtotal,
          tax: t.tax,
          total: t.total,
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
          technician: state.user?.role === "technician" ? state.user.name : "Unassigned",
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
        };
        patch((s) => ({
          ...s,
          claims: [claim, ...s.claims],
          auditLogs: log(s, `created warranty claim ${claim.id}`, warrantyId),
        }));
        return claim;
      },

      markAllNotificationsRead: () =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      resetDemoData: () =>
        patch((s) => ({ ...seed(), user: s.user, sidebarCollapsed: s.sidebarCollapsed })),
    };
  }, [state, hydrated, products, productById, invFor, availableOf, customerById, patch]);

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
