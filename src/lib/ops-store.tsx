/**
 * DPC POS — operations state container (Phase 2).
 *
 * Sits beside StoreProvider and owns purchasing, receiving, returns, cashier
 * shifts and build assembly/QA/release state.
 * Persisted to localStorage; swap the action bodies for API calls when a
 * backend lands. DEMO ONLY.
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
import * as seedData from "./ops-data";
import type {
  AssemblyStageId,
  BuildOps,
  CashAdjustment,
  GoodsReceipt,
  PurchaseOrder,
  PurchaseStatus,
  ReleaseRecord,
  ReturnRequest,
  ReturnStatus,
  Shift,
  Supplier,
} from "./ops-types";
import { ASSEMBLY_STAGES } from "./ops-types";
import { onBuildStatus } from "./build-sync";
import { stageForStatus } from "./build-state";
import type { PaymentMethod } from "./types";
import {
  createBackendSupplier,
  fetchBackendSuppliers,
  updateBackendSupplier,
} from "./api-client";

const STORAGE_KEY = "dpc-nexus-ops-v1";

/**
 * Bump when the persisted snapshot shape changes incompatibly so that stale
 * localStorage from an older app version is discarded and re-seeded instead
 * of crashing the UI.
 */
const SCHEMA_VERSION = 4;

interface OpsSnapshot {
  schemaVersion: number;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  receipts: GoodsReceipt[];
  returns: ReturnRequest[];
  shifts: Shift[];
  buildOps: BuildOps[];
  releases: ReleaseRecord[];
  counters: { po: number; gr: number; rma: number; shift: number; rel: number };
}

function seed(): OpsSnapshot {
  return {
    schemaVersion: SCHEMA_VERSION,
    suppliers: [],
    purchaseOrders: structuredClone(seedData.purchaseOrders),
    receipts: structuredClone(seedData.goodsReceipts),
    returns: structuredClone(seedData.returnRequests),
    shifts: structuredClone(seedData.shifts),
    buildOps: structuredClone(seedData.buildOps),
    releases: structuredClone(seedData.releases),
    counters: { po: 147, gr: 320, rma: 216, shift: 483, rel: 313 },
  };
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export function defaultBuildOps(buildId: string): BuildOps {
  return {
    buildId,
    stage: "quote",
    assembly: [
      "CPU installed",
      "Cooler mounted",
      "RAM installed",
      "Storage installed",
      "Motherboard seated",
      "PSU installed",
      "GPU installed",
      "Cable management",
      "Front panel wiring",
    ].map((label) => ({ label, done: false })),
    tests: ["CPU stress test", "GPU stress test", "Memory test", "Thermal test", "Stability test"].map(
      (label) => ({ label, result: null }),
    ),
    technician: "Unassigned",
    qaStaff: "Unassigned",
  };
}

export function stageProgress(stage: AssemblyStageId) {
  const i = ASSEMBLY_STAGES.findIndex((s) => s.id === stage);
  return Math.round(((i + 1) / ASSEMBLY_STAGES.length) * 100);
}

interface OpsValue extends OpsSnapshot {
  hydrated: boolean;
  actor: string;
  /* lookups */
  supplierById: (id: string) => Supplier | undefined;
  poById: (id: string) => PurchaseOrder | undefined;
  receiptById: (id: string) => GoodsReceipt | undefined;
  returnById: (id: string) => ReturnRequest | undefined;
  opsForBuild: (buildId: string) => BuildOps;
  openShift: Shift | undefined;
  /* purchasing */
  setPoStatus: (id: string, status: PurchaseStatus) => void;
  createSupplier: (data: Omit<Supplier, "id" | "rating" | "status">) => Promise<Supplier | null>;
  updateSupplier: (id: string, patch: Partial<Supplier>) => Promise<Supplier | null>;
  setSupplierProducts: (supplierId: string, productIds: string[]) => void;
  createPurchaseOrder: (data: {
    supplierId: string;
    lines: { productId: string; name: string; sku: string; qty: number; unitCost: number }[];
    expectedAt: string;
    notes?: string;
  }) => PurchaseOrder | null;
  /* receiving */
  startReceipt: (purchaseOrderId: string) => GoodsReceipt | null;
  updateReceiptLine: (
    receiptId: string,
    productId: string,
    patch: { received?: number; damaged?: number; serials?: string[] },
  ) => void;
  setReceiptNotes: (receiptId: string, notes: string) => void;
  completeReceipt: (
    receiptId: string,
    onStock: (productId: string, qty: number, ref: string) => void,
    onSerials?: (productId: string, serials: string[], ref: string) => void,
  ) => void;
  /* returns */
  createReturn: (data: Omit<ReturnRequest, "id" | "createdAt" | "status">) => ReturnRequest;
  setReturnStatus: (id: string, status: ReturnStatus, patch?: Partial<ReturnRequest>) => void;
  updateReturn: (id: string, patch: Partial<ReturnRequest>) => void;
  /* shifts */
  openNewShift: (openingCash: number, cashier: string) => Shift;
  addCashAdjustment: (shiftId: string, a: Omit<CashAdjustment, "id" | "at" | "actor">) => void;
  closeShift: (
    shiftId: string,
    countedCash: number,
    tenders: Record<PaymentMethod, number>,
    refunds: number,
    notes?: string,
  ) => void;
  /* build ops */
  setBuildStage: (buildId: string, stage: AssemblyStageId) => void;
  toggleAssemblyStep: (buildId: string, label: string, done: boolean) => void;
  setTestResult: (
    buildId: string,
    label: string,
    result: "pass" | "fail" | null,
    reading?: string,
  ) => void;
  signQa: (buildId: string, qaStaff: string) => void;
  assignBuildStaff: (buildId: string, patch: { technician?: string; qaStaff?: string }) => void;
  /* releases */
  createRelease: (data: Omit<ReleaseRecord, "id" | "status">) => ReleaseRecord;
  markReleaseReleased: (id: string, releasedBy: string) => void;
  completeRelease: (id: string, receivedBy: string) => void;
  resetOpsData: () => void;
}

const Ctx = createContext<OpsValue | null>(null);

export function OpsProvider({ children, actor = "System" }: { children: ReactNode; actor?: string }) {
  const [state, setState] = useState<OpsSnapshot>(() => seed());
  const [hydrated, setHydrated] = useState(false);
  const skip = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OpsSnapshot>;
        if (parsed.schemaVersion === SCHEMA_VERSION) {
          const { suppliers: _localSuppliers, ...localOps } = parsed;
          setState((prev) => ({ ...prev, ...localOps, suppliers: prev.suppliers }));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      /* corrupt demo state — keep the seed */
    }
    skip.current = false;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void fetchBackendSuppliers().then((suppliers) => {
      if (suppliers) setState((current) => ({ ...current, suppliers }));
    });
  }, [hydrated]);

  useEffect(() => {
    if (skip.current) return;
    const timeoutId = setTimeout(() => {
      try {
        const { suppliers: _remoteSuppliers, ...localOps } = state;
        const serialized = JSON.stringify(localOps);
        // Only write if data is reasonable size (< 5MB)
        if (serialized.length < 5 * 1024 * 1024) {
          localStorage.setItem(STORAGE_KEY, serialized);
        }
      } catch {
        /* ignore */
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [state]);

  const patch = useCallback((fn: (s: OpsSnapshot) => OpsSnapshot) => setState(fn), []);

  useEffect(
    () =>
      onBuildStatus((buildId, status) => {
        patch((s) => ({
          ...s,
          buildOps: upsertOps(s.buildOps, buildId, (o) => ({
            ...o,
            stage: stageForStatus(status, o.stage),
          })),
        }));
      }),
    [patch],
  );

  const value: OpsValue = useMemo(() => {
    const find = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id);

    return {
      ...state,
      hydrated,
      actor,

      supplierById: (id) => find(state.suppliers, id),
      poById: (id) => find(state.purchaseOrders, id),
      receiptById: (id) => find(state.receipts, id),
      returnById: (id) => find(state.returns, id),
      opsForBuild: (buildId) =>
        state.buildOps.find((b) => b.buildId === buildId) ?? defaultBuildOps(buildId),
      openShift: state.shifts.find((s) => s.status === "open"),

      setPoStatus: (id, status) =>
        patch((s) => ({
          ...s,
          purchaseOrders: s.purchaseOrders.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status,
                  receivedAt: status === "received" ? new Date().toISOString() : p.receivedAt,
                }
              : p,
          ),
        })),

      createSupplier: async (data) => {
        const supplier = await createBackendSupplier(data);
        if (supplier) patch((s) => ({ ...s, suppliers: [supplier, ...s.suppliers] }));
        return supplier;
      },

      updateSupplier: async (id, p) => {
        const supplier = await updateBackendSupplier(id, p);
        if (supplier) patch((s) => ({
          ...s,
          suppliers: s.suppliers.map((sp) => (sp.id === id ? supplier : sp)),
        }));
        return supplier;
      },

      setSupplierProducts: (supplierId, productIds) =>
        patch((s) => ({
          ...s,
          suppliers: s.suppliers.map((supplier) =>
            supplier.id === supplierId ? { ...supplier, productIds } : supplier,
          ),
        })),

      createPurchaseOrder: ({ supplierId, lines, expectedAt, notes }) => {
        const supplier = find(state.suppliers, supplierId);
        if (!supplier || lines.length === 0) return null;
        const id = `PO-2026-${String(state.counters.po).padStart(5, "0")}`;
        const order: PurchaseOrder = {
          id,
          supplierId,
          supplierName: supplier.name,
          status: "draft",
          lines: lines.map((l) => ({ ...l, received: 0 })),
          total: lines.reduce((sum, l) => sum + l.qty * l.unitCost, 0),
          createdAt: new Date().toISOString(),
          expectedAt,
          createdBy: actor,
          notes,
        };
        patch((s) => ({
          ...s,
          purchaseOrders: [order, ...s.purchaseOrders],
          counters: { ...s.counters, po: s.counters.po + 1 },
        }));
        return order;
      },

      startReceipt: (purchaseOrderId) => {
        const po = find(state.purchaseOrders, purchaseOrderId);
        if (!po) return null;
        const existing = state.receipts.find(
          (r) => r.purchaseOrderId === purchaseOrderId && r.status === "in_progress",
        );
        if (existing) return existing;
        const id = `GR-${String(state.counters.gr).padStart(5, "0")}`;
        const receipt: GoodsReceipt = {
          id,
          purchaseOrderId,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          status: "in_progress",
          receivedBy: actor,
          receivedAt: new Date().toISOString(),
          lines: po.lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            sku: l.sku,
            expected: l.qty - l.received,
            received: 0,
            damaged: 0,
            serials: [],
          })),
        };
        patch((s) => ({
          ...s,
          receipts: [receipt, ...s.receipts],
          counters: { ...s.counters, gr: s.counters.gr + 1 },
        }));
        return receipt;
      },

      updateReceiptLine: (receiptId, productId, p) =>
        patch((s) => ({
          ...s,
          receipts: s.receipts.map((r) =>
            r.id === receiptId
              ? {
                  ...r,
                  lines: r.lines.map((l) =>
                    l.productId === productId
                      ? {
                          ...l,
                          ...p,
                          received:
                            p.received !== undefined
                              ? Math.max(0, Math.min(l.expected, p.received))
                              : l.received,
                        }
                      : l,
                  ),
                }
              : r,
          ),
        })),

      setReceiptNotes: (receiptId, notes) =>
        patch((s) => ({
          ...s,
          receipts: s.receipts.map((r) => (r.id === receiptId ? { ...r, notes } : r)),
        })),

      completeReceipt: (receiptId, onStock, onSerials) => {
        const receipt = find(state.receipts, receiptId);
        if (!receipt) return;
        const discrepancy = receipt.lines.some(
          (l) => l.received !== l.expected || l.damaged > 0,
        );
        receipt.lines.forEach((l) => {
          const good = Math.max(0, l.received - l.damaged);
          if (good > 0) onStock(l.productId, good, receipt.id);
        });
        if (onSerials) {
          receipt.lines.forEach((l) => {
            if (l.serials.length > 0) onSerials(l.productId, l.serials, receipt.id);
          });
        }
        patch((s) => ({
          ...s,
          receipts: s.receipts.map((r) =>
            r.id === receiptId
              ? {
                  ...r,
                  status: discrepancy ? "discrepancy" : "completed",
                  receivedAt: new Date().toISOString(),
                  receivedBy: actor,
                }
              : r,
          ),
          purchaseOrders: s.purchaseOrders.map((p) => {
            if (p.id !== receipt.purchaseOrderId) return p;
            const lines = p.lines.map((pl) => {
              const rl = receipt.lines.find((l) => l.productId === pl.productId);
              return rl ? { ...pl, received: Math.min(pl.qty, pl.received + rl.received) } : pl;
            });
            const complete = lines.every((l) => l.received >= l.qty);
            return {
              ...p,
              lines,
              status: complete ? ("received" as const) : ("partial" as const),
              receivedAt: complete ? new Date().toISOString() : p.receivedAt,
            };
          }),
        }));
      },

      createReturn: (data) => {
        const id = `RMA-${String(state.counters.rma).padStart(5, "0")}`;
        const req: ReturnRequest = {
          ...data,
          id,
          status: "requested",
          createdAt: new Date().toISOString(),
        };
        patch((s) => ({
          ...s,
          returns: [req, ...s.returns],
          counters: { ...s.counters, rma: s.counters.rma + 1 },
        }));
        return req;
      },

      setReturnStatus: (id, status, p = {}) =>
        patch((s) => ({
          ...s,
          returns: s.returns.map((r) => (r.id === id ? { ...r, ...p, status } : r)),
        })),

      updateReturn: (id, p) =>
        patch((s) => ({
          ...s,
          returns: s.returns.map((r) => (r.id === id ? { ...r, ...p } : r)),
        })),

      openNewShift: (openingCash, cashier) => {
        const shift: Shift = {
          id: `SH-${String(state.counters.shift).padStart(5, "0")}`,
          cashier,
          status: "open",
          openedAt: new Date().toISOString(),
          openingCash,
          adjustments: [],
        };
        patch((s) => ({
          ...s,
          shifts: [shift, ...s.shifts.map((x) => (x.status === "open" ? { ...x, status: "closed" as const, closedAt: new Date().toISOString() } : x))],
          counters: { ...s.counters, shift: s.counters.shift + 1 },
        }));
        return shift;
      },

      addCashAdjustment: (shiftId, a) =>
        patch((s) => ({
          ...s,
          shifts: s.shifts.map((sh) =>
            sh.id === shiftId
              ? {
                  ...sh,
                  adjustments: [
                    { ...a, id: uid("ca"), at: new Date().toISOString(), actor },
                    ...sh.adjustments,
                  ],
                }
              : sh,
          ),
        })),

      closeShift: (shiftId, countedCash, tenders, refunds, notes) =>
        patch((s) => ({
          ...s,
          shifts: s.shifts.map((sh) =>
            sh.id === shiftId
              ? { ...sh, status: "closed", closedAt: new Date().toISOString(), countedCash, tenders, refunds, notes }
              : sh,
          ),
        })),

      setBuildStage: (buildId, stage) =>
        patch((s) => ({ ...s, buildOps: upsertOps(s.buildOps, buildId, (o) => ({ ...o, stage })) })),

      toggleAssemblyStep: (buildId, label, done) =>
        patch((s) => ({
          ...s,
          buildOps: upsertOps(s.buildOps, buildId, (o) => ({
            ...o,
            assembly: o.assembly.map((a) => (a.label === label ? { ...a, done } : a)),
          })),
        })),

      setTestResult: (buildId, label, result, reading) =>
        patch((s) => ({
          ...s,
          buildOps: upsertOps(s.buildOps, buildId, (o) => ({
            ...o,
            tests: o.tests.map((t) =>
              t.label === label ? { ...t, result, reading: reading ?? t.reading } : t,
            ),
          })),
        })),

      signQa: (buildId, qaStaff) =>
        patch((s) => ({
          ...s,
          buildOps: upsertOps(s.buildOps, buildId, (o) => ({
            ...o,
            qaStaff,
            qaSignedAt: new Date().toISOString(),
            stage: o.tests.every((t) => t.result === "pass") ? "ready" : o.stage,
          })),
        })),

      assignBuildStaff: (buildId, p) =>
        patch((s) => ({ ...s, buildOps: upsertOps(s.buildOps, buildId, (o) => ({ ...o, ...p })) })),

      createRelease: (data) => {
        const rec: ReleaseRecord = {
          ...data,
          id: `REL-${String(state.counters.rel).padStart(5, "0")}`,
          status: "scheduled",
        };
        patch((s) => ({
          ...s,
          releases: [rec, ...s.releases],
          counters: { ...s.counters, rel: s.counters.rel + 1 },
        }));
        return rec;
      },

      markReleaseReleased: (id, releasedBy) =>
        patch((s) => ({
          ...s,
          releases: s.releases.map((r) =>
            r.id === id && r.status === "scheduled"
              ? { ...r, status: "released", releasedBy, releasedAt: new Date().toISOString() }
              : r,
          ),
        })),

      completeRelease: (id, receivedBy) =>
        patch((s) => ({
          ...s,
          releases: s.releases.map((r) =>
            r.id === id && r.status === "released"
              ? { ...r, status: "completed", receivedBy, completedAt: new Date().toISOString() }
              : r,
          ),
        })),

      resetOpsData: () => patch(() => seed()),
    };
  }, [state, hydrated, actor]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function upsertOps(list: BuildOps[], buildId: string, fn: (o: BuildOps) => BuildOps): BuildOps[] {
  const existing = list.find((o) => o.buildId === buildId);
  if (!existing) return [fn(defaultBuildOps(buildId)), ...list];
  return list.map((o) => (o.buildId === buildId ? fn(o) : o));
}

export function useOps() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOps must be used inside <OpsProvider>");
  return ctx;
}

/** Expected cash in drawer for a shift, given cash sales and refunds. */
export function expectedCash(shift: Shift, cashSales: number, cashRefunds = 0) {
  const adjustments = shift.adjustments.reduce(
    (sum, a) => sum + (a.kind === "cash_in" ? a.amount : -a.amount),
    0,
  );
  return shift.openingCash + cashSales + adjustments - cashRefunds;
}
