/**
 * DEMO DATA — operations dataset (purchasing, receiving, returns, shifts,
 * assembly/QA, releases).
 *
 * Every record references ids that already exist in demo-data.ts so the whole
 * system reads as one connected shop.
 */
import { products } from "./demo-data";
import type {
  BuildOps,
  CashAdjustment,
  GoodsReceipt,
  PurchaseOrder,
  ReleaseRecord,
  ReturnRequest,
  Shift,
  Supplier,
} from "./ops-types";

const now = Date.now();
const daysAgo = (d: number, h = 10) => {
  const x = new Date(now - d * 86400000);
  x.setHours(h, (d * 11) % 60, 0, 0);
  return x.toISOString();
};
const daysAhead = (d: number, h = 14) => {
  const x = new Date(now + d * 86400000);
  x.setHours(h, 0, 0, 0);
  return x.toISOString();
};

const p = (id: string) => products.find((x) => x.id === id)!;

export const suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Nexlogic Distribution",
    contact: "Arnel Bautista",
    email: "sales@nexlogic.ph",
    phone: "+63 2 8871 3320",
    address: "Gil Puyat Ave, Makati City",
    terms: "Net 30",
    leadTimeDays: 5,
    categories: ["CPU", "Motherboard", "RAM"],
    status: "active",
    rating: 4.6,
    notes: "Primary AMD platform source. Reliable on lead times.",
  },
  {
    id: "sup-2",
    name: "Silicon Bay Trading",
    contact: "Grace Tan",
    email: "orders@siliconbay.ph",
    phone: "+63 2 8534 7781",
    address: "Gilmore Ave, Quezon City",
    terms: "Net 15",
    leadTimeDays: 3,
    categories: ["GPU", "Storage", "PSU"],
    status: "active",
    rating: 4.2,
    notes: "GPU allocations are limited during launch windows.",
  },
  {
    id: "sup-3",
    name: "Pacific Components",
    contact: "Dennis Yu",
    email: "dennis@pacificcomponents.ph",
    phone: "+63 917 662 4410",
    address: "Cebu Business Park, Cebu",
    terms: "50% DP, balance on delivery",
    leadTimeDays: 7,
    categories: ["Case", "Cooling", "Fans", "Accessories"],
    status: "active",
    rating: 3.9,
  },
  {
    id: "sup-4",
    name: "Microsoft PH",
    contact: "Partner Desk",
    email: "partners@microsoft.ph",
    phone: "+63 2 8888 4444",
    address: "BGC, Taguig",
    terms: "Prepaid",
    leadTimeDays: 1,
    categories: ["Software"],
    status: "active",
    rating: 4.8,
  },
  {
    id: "sup-5",
    name: "Eastridge Peripherals",
    contact: "Lloyd Chua",
    email: "lloyd@eastridge.ph",
    phone: "+63 995 118 2204",
    address: "Banawe, Quezon City",
    terms: "Net 15",
    leadTimeDays: 4,
    categories: ["Keyboard", "Mouse", "Headset", "Monitor"],
    status: "inactive",
    rating: 3.4,
    notes: "On hold — repeated short deliveries in Q1.",
  },
];

const line = (productId: string, qty: number, received = 0) => {
  const prod = p(productId);
  return {
    productId,
    name: prod.name,
    sku: prod.sku,
    qty,
    received,
    unitCost: prod.cost,
  };
};

const totalOf = (lines: { qty: number; unitCost: number }[]) =>
  lines.reduce((s, l) => s + l.qty * l.unitCost, 0);

const po = (
  id: string,
  supplierId: string,
  supplierName: string,
  status: PurchaseOrder["status"],
  lines: PurchaseOrder["lines"],
  createdAt: string,
  expectedAt: string,
  extra: Partial<PurchaseOrder> = {},
): PurchaseOrder => ({
  id,
  supplierId,
  supplierName,
  status,
  lines,
  total: totalOf(lines),
  createdAt,
  expectedAt,
  createdBy: "Dana Lim",
  ...extra,
});

export const purchaseOrders: PurchaseOrder[] = [
  po(
    "PO-2026-00142",
    "sup-2",
    "Silicon Bay Trading",
    "received",
    [line("p-gpu-5070", 5, 5), line("p-ssd-990pro", 10, 10), line("p-psu-rm750e", 8, 8)],
    daysAgo(9),
    daysAgo(4),
    { receivedAt: daysAgo(4), notes: "Complete delivery, no discrepancies." },
  ),
  po(
    "PO-2026-00143",
    "sup-1",
    "Nexlogic Distribution",
    "partial",
    [line("p-cpu-7800x3d", 10, 6), line("p-mb-b650m", 8, 8), line("p-ram-fury32", 12, 0)],
    daysAgo(6),
    daysAgo(1),
    { notes: "RAM backordered to next shipment." },
  ),
  po(
    "PO-2026-00144",
    "sup-3",
    "Pacific Components",
    "confirmed",
    [line("p-case-4000d", 6), line("p-cool-ak620", 10), line("p-fan-arctic", 24)],
    daysAgo(3),
    daysAhead(2),
  ),
  po(
    "PO-2026-00145",
    "sup-2",
    "Silicon Bay Trading",
    "submitted",
    [line("p-gpu-5060ti", 6), line("p-ssd-p3plus", 12)],
    daysAgo(1),
    daysAhead(5),
    { notes: "Awaiting supplier confirmation on GPU allocation." },
  ),
  po(
    "PO-2026-00146",
    "sup-4",
    "Microsoft PH",
    "draft",
    [line("p-sw-win11", 15)],
    daysAgo(0, 9),
    daysAhead(3),
  ),
  po(
    "PO-2026-00141",
    "sup-1",
    "Nexlogic Distribution",
    "cancelled",
    [line("p-cpu-14600kf", 6)],
    daysAgo(16),
    daysAgo(9),
    { notes: "Cancelled — pricing changed after quotation expired." },
  ),
];

export const goodsReceipts: GoodsReceipt[] = [
  {
    id: "GR-00318",
    purchaseOrderId: "PO-2026-00142",
    supplierId: "sup-2",
    supplierName: "Silicon Bay Trading",
    status: "completed",
    receivedBy: "Dana Lim",
    receivedAt: daysAgo(4),
    lines: [
      {
        productId: "p-gpu-5070",
        name: p("p-gpu-5070").name,
        sku: p("p-gpu-5070").sku,
        expected: 5,
        received: 5,
        damaged: 0,
        serials: ["SN-5070-A1147", "SN-5070-A1148", "SN-5070-A1149", "SN-5070-A1150", "SN-5070-A1151"],
      },
      {
        productId: "p-ssd-990pro",
        name: p("p-ssd-990pro").name,
        sku: p("p-ssd-990pro").sku,
        expected: 10,
        received: 10,
        damaged: 0,
        serials: [],
      },
      {
        productId: "p-psu-rm750e",
        name: p("p-psu-rm750e").name,
        sku: p("p-psu-rm750e").sku,
        expected: 8,
        received: 8,
        damaged: 0,
        serials: [],
      },
    ],
    notes: "Cartons sealed, spot-checked 3 units.",
  },
  {
    id: "GR-00319",
    purchaseOrderId: "PO-2026-00143",
    supplierId: "sup-1",
    supplierName: "Nexlogic Distribution",
    status: "discrepancy",
    receivedBy: "Dana Lim",
    receivedAt: daysAgo(1),
    lines: [
      {
        productId: "p-cpu-7800x3d",
        name: p("p-cpu-7800x3d").name,
        sku: p("p-cpu-7800x3d").sku,
        expected: 10,
        received: 6,
        damaged: 0,
        serials: ["SN-7800-C2201", "SN-7800-C2202", "SN-7800-C2203"],
      },
      {
        productId: "p-mb-b650m",
        name: p("p-mb-b650m").name,
        sku: p("p-mb-b650m").sku,
        expected: 8,
        received: 8,
        damaged: 1,
        serials: [],
      },
      {
        productId: "p-ram-fury32",
        name: p("p-ram-fury32").name,
        sku: p("p-ram-fury32").sku,
        expected: 12,
        received: 0,
        damaged: 0,
        serials: [],
      },
    ],
    notes: "Short 4 CPUs, 1 board with dented I/O shield. Debit memo requested.",
  },
];

export const returnRequests: ReturnRequest[] = [
  {
    id: "RMA-00214",
    orderId: "DPC-10481",
    customerId: "c-3",
    customerName: "Maria Santiago",
    productId: "p-gpu-5070",
    productName: p("p-gpu-5070").name,
    serial: "SN-5070-A1102",
    qty: 1,
    reason: "Artifacting under load after 3 days",
    condition: "defective",
    resolution: "replacement",
    refundMethod: null,
    refundAmount: 0,
    status: "approved",
    createdAt: daysAgo(2),
    inspectedBy: "Ken Villareal",
    inspectionNotes: "Reproduced artifacts in FurMark within 4 minutes. Supplier RMA raised.",
    restock: false,
  },
  {
    id: "RMA-00213",
    orderId: "DPC-10479",
    customerId: "c-4",
    customerName: "Rafael Ong",
    productId: "p-kb-k70",
    productName: p("p-kb-k70").name,
    qty: 1,
    reason: "Wrong switch type ordered",
    condition: "sealed",
    resolution: "refund",
    refundMethod: "gcash",
    refundAmount: p("p-kb-k70").price,
    status: "refunded",
    createdAt: daysAgo(5),
    inspectedBy: "Mika Santos",
    inspectionNotes: "Box seal intact, returned to sellable stock.",
    restock: true,
  },
  {
    id: "RMA-00215",
    orderId: "DPC-10478",
    customerId: "c-2",
    customerName: "Northline Creatives Inc.",
    productId: "p-mon-odyssey",
    productName: p("p-mon-odyssey").name,
    qty: 2,
    reason: "Dead pixels on both panels",
    condition: "used_good",
    resolution: "none",
    refundMethod: null,
    refundAmount: 0,
    status: "inspection",
    createdAt: daysAgo(0, 11),
    restock: false,
    notes: "Customer requests replacement units from next shipment.",
  },
];

const adj = (
  id: string,
  kind: CashAdjustment["kind"],
  amount: number,
  reason: string,
  at: string,
  actor = "Paolo Cruz",
): CashAdjustment => ({ id, kind, amount, reason, at, actor });

export const shifts: Shift[] = [
  {
    id: "SH-00482",
    cashier: "Paolo Cruz",
    status: "open",
    openedAt: daysAgo(0, 8),
    openingCash: 5000,
    adjustments: [
      adj("ca-1", "cash_out", 850, "Delivery rider reimbursement", daysAgo(0, 11)),
      adj("ca-2", "cash_in", 2000, "Change fund top-up", daysAgo(0, 13)),
    ],
  },
  {
    id: "SH-00481",
    cashier: "Paolo Cruz",
    status: "closed",
    openedAt: daysAgo(1, 8),
    closedAt: daysAgo(1, 20),
    openingCash: 5000,
    countedCash: 18420,
    refunds: 1200,
    tenders: { cash: 14620, gcash: 42500, card: 0, bank: 98500 },
    adjustments: [adj("ca-3", "cash_out", 1000, "Supplier courier fee", daysAgo(1, 15))],
    notes: "Variance −₱200, short change from a cash sale. Logged for review.",
  },
  {
    id: "SH-00480",
    cashier: "Mika Santos",
    status: "closed",
    openedAt: daysAgo(2, 8),
    closedAt: daysAgo(2, 20),
    openingCash: 5000,
    countedCash: 22300,
    refunds: 0,
    tenders: { cash: 17300, gcash: 12800, card: 24500, bank: 0 },
    adjustments: [],
  },
];

const assemblySteps = (done: number): { label: string; done: boolean }[] =>
  [
    "CPU installed",
    "Cooler mounted",
    "RAM installed",
    "Storage installed",
    "Motherboard seated",
    "PSU installed",
    "GPU installed",
    "Cable management",
    "Front panel wiring",
  ].map((label, i) => ({ label, done: i < done }));

const testSet = (
  results: (("pass" | "fail" | null))[],
  readings: (string | undefined)[] = [],
): { label: string; result: "pass" | "fail" | null; reading?: string | undefined }[] =>
  ["CPU stress test", "GPU stress test", "Memory test", "Thermal test", "Stability test"].map(
    (label, i) => ({ label, result: results[i] ?? null, reading: readings[i] }),
  );

export const buildOps: BuildOps[] = [
  {
    buildId: "BUILD-10482",
    stage: "testing",
    assembly: assemblySteps(9),
    tests: testSet(
      ["pass", "pass", "pass", null, null],
      ["Max 78°C @ 30 min", "Max 71°C, 0 artifacts", "4 passes, 0 errors", undefined, undefined],
    ),
    technician: "Mika Santos",
    qaStaff: "Mika Santos",
    notes: "Awaiting thermal soak and 2-hour stability run.",
  },
  {
    buildId: "BUILD-10479",
    stage: "assembly",
    assembly: assemblySteps(6),
    tests: testSet([null, null, null, null, null]),
    technician: "Mika Santos",
    qaStaff: "Mika Santos",
  },
  {
    buildId: "BUILD-10477",
    stage: "ready",
    assembly: assemblySteps(9),
    tests: testSet(
      ["pass", "pass", "pass", "pass", "pass"],
      ["Max 74°C", "Max 68°C", "6 passes, 0 errors", "Idle 34°C", "8h loop clean"],
    ),
    technician: "Justine Ramos",
    qaStaff: "Justine Ramos",
    qaSignedAt: daysAgo(2, 16),
  },
  {
    buildId: "BUILD-10474",
    stage: "released",
    assembly: assemblySteps(9),
    tests: testSet(["pass", "pass", "pass", "pass", "pass"]),
    technician: "Mika Santos",
    qaStaff: "Mika Santos",
    qaSignedAt: daysAgo(6, 15),
  },
];

export const releases: ReleaseRecord[] = [
  {
    id: "REL-00311",
    kind: "build",
    refId: "BUILD-10477",
    customerName: "Maria Santiago",
    method: "pickup",
    scheduledAt: daysAhead(1, 15),
    status: "scheduled",
    notes: "Customer will bring their own monitor for a final check.",
  },
  {
    id: "REL-00310",
    kind: "build",
    refId: "BUILD-10474",
    customerName: "Northline Creatives Inc.",
    method: "delivery",
    scheduledAt: daysAgo(5, 14),
    status: "completed",
    releasedBy: "Dana Lim",
    receivedBy: "R. Manalo (IT Lead)",
    releasedAt: daysAgo(5, 15),
  },
  {
    id: "REL-00312",
    kind: "service",
    refId: "SRV-10478",
    customerName: "Rafael Ong",
    method: "pickup",
    scheduledAt: daysAgo(0, 17),
    status: "released",
    releasedBy: "Paolo Cruz",
    receivedBy: "Rafael Ong",
    releasedAt: daysAgo(0, 17),
  },
];

export const company = {
  name: "Dream PC Build & IT Solutions",
  short: "DPC POS",
  address: "2F Unit 4, Aguinaldo Highway, Bacoor, Cavite",
  phone: "+63 917 555 0142",
  email: "sales@dreampcbuild.ph",
  tin: "009-482-771-000",
};

