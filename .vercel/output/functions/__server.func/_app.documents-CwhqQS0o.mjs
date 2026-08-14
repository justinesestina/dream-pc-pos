import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Y as FileText } from "./_libs/lucide-react.mjs";
import { I as VAT_RATE, O as useOps, P as useStore, R as dateShort, U as money, W as moneyExact, q as titleCase } from "./_ssr/router-DXywCOrU.mjs";
import { a as PageHeader, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { n as PrintButton, t as DocumentPreview } from "./_ssr/document-B0S1Nw0D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.documents-CwhqQS0o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	"Sales Receipt",
	"Invoice",
	"Quotation",
	"Purchase Order",
	"Service Receipt",
	"Delivery / Release"
];
function DocumentsPage() {
	const { orders, quotes, services, builds, customerById } = useStore();
	const { purchaseOrders, releases, supplierById } = useOps();
	const [q, setQ] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("all");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const entries = (0, import_react.useMemo)(() => {
		const list = [];
		for (const o of orders) {
			const c = customerById(o.customerId);
			list.push({
				id: `doc-${o.id}`,
				kind: o.payment !== null ? "Sales Receipt" : "Invoice",
				reference: o.id,
				issuedAt: o.createdAt,
				status: o.status,
				party: {
					title: "Billed to",
					name: o.customerName,
					lines: [
						c?.address,
						c?.email,
						c?.phone
					]
				},
				lines: o.items.map((i) => ({
					description: i.name,
					sku: i.sku,
					qty: i.qty,
					unitPrice: i.unitPrice
				})),
				totals: [
					{
						label: "Subtotal",
						value: o.subtotal
					},
					...o.discount ? [{
						label: "Discount",
						value: -o.discount
					}] : [],
					...o.serviceTotal ? [{
						label: "Services",
						value: o.serviceTotal
					}] : [],
					{
						label: `VAT (${Math.round(VAT_RATE * 100)}%)`,
						value: o.tax
					},
					...o.payment?.method === "cash" && o.payment.tendered ? [{
						label: "Tendered",
						value: o.payment.tendered
					}] : [],
					...o.payment?.method === "cash" && o.payment.change ? [{
						label: "Change",
						value: -o.payment.change
					}] : [],
					{
						label: "Total",
						value: o.total,
						strong: true
					}
				],
				footer: o.payment ? `Paid via ${titleCase(o.payment.method)}${o.payment.reference ? ` · ref ${o.payment.reference}` : ""}${o.payment.tendered !== void 0 ? ` · tendered ${moneyExact(o.payment.tendered)}` : ""}${o.payment.change ? ` · change ${moneyExact(o.payment.change)}` : ""} · cashier ${o.cashier}` : `Awaiting payment · prepared by ${o.cashier}`,
				amount: o.total
			});
		}
		for (const qt of quotes) {
			const c = customerById(qt.customerId);
			list.push({
				id: `doc-${qt.id}`,
				kind: "Quotation",
				reference: qt.id,
				issuedAt: qt.createdAt,
				status: qt.status,
				party: {
					title: "Prepared for",
					name: qt.customerName,
					lines: [
						c?.address,
						c?.email,
						c?.phone
					]
				},
				lines: qt.items.map((i) => ({
					description: i.name,
					sku: i.sku,
					qty: i.qty,
					unitPrice: i.unitPrice
				})),
				totals: [
					{
						label: "Subtotal",
						value: qt.subtotal
					},
					...qt.discount ? [{
						label: "Discount",
						value: -qt.discount
					}] : [],
					...qt.serviceTotal ? [{
						label: "Services",
						value: qt.serviceTotal
					}] : [],
					{
						label: `VAT (${Math.round(VAT_RATE * 100)}%)`,
						value: qt.tax
					},
					{
						label: "Total",
						value: qt.total,
						strong: true
					}
				],
				footer: `Valid until ${dateShort(qt.expiresAt)} · prepared by ${qt.preparedBy}`,
				amount: qt.total
			});
		}
		for (const po of purchaseOrders) {
			const s = supplierById(po.supplierId);
			list.push({
				id: `doc-${po.id}`,
				kind: "Purchase Order",
				reference: po.id,
				issuedAt: po.createdAt,
				status: po.status,
				party: {
					title: "Supplier",
					name: po.supplierName,
					lines: [
						s?.address,
						s?.email,
						s?.phone
					]
				},
				lines: po.lines.map((l) => ({
					description: l.name,
					sku: l.sku,
					qty: l.qty,
					unitPrice: l.unitCost
				})),
				totals: [{
					label: "Total cost",
					value: po.total,
					strong: true
				}],
				footer: `Expected ${dateShort(po.expectedAt)} · terms ${s?.terms ?? "—"} · raised by ${po.createdBy}`,
				amount: po.total
			});
		}
		for (const t of services) {
			const c = customerById(t.customerId);
			const parts = t.parts.reduce((sum, p) => sum + p.qty * p.price, 0);
			const total = t.actualCost ?? t.estimatedCost;
			list.push({
				id: `doc-${t.id}`,
				kind: "Service Receipt",
				reference: t.id,
				issuedAt: t.createdAt,
				status: t.status,
				party: {
					title: "Customer",
					name: t.customerName,
					lines: [
						t.device,
						c?.email,
						c?.phone
					]
				},
				lines: [...t.parts.map((p) => ({
					description: p.name,
					qty: p.qty,
					unitPrice: p.price
				})), {
					description: `Labor — ${t.issue}`,
					qty: 1,
					unitPrice: t.labor
				}],
				totals: [
					{
						label: "Parts",
						value: parts
					},
					{
						label: "Labor",
						value: t.labor
					},
					{
						label: t.actualCost === null ? "Estimated total" : "Total",
						value: total,
						strong: true
					}
				],
				footer: `Technician ${t.technician}${t.diagnosis ? ` · ${t.diagnosis}` : ""}`,
				amount: total
			});
		}
		for (const r of releases) {
			const order = r.kind === "order" ? orders.find((o) => o.id === r.refId) : void 0;
			const build = r.kind === "build" ? builds.find((b) => b.id === r.refId) : void 0;
			const ticket = r.kind === "service" ? services.find((s) => s.id === r.refId) : void 0;
			const buildOrder = build?.orderId ? orders.find((o) => o.id === build.orderId) : void 0;
			const buildQuote = build?.quoteId ? quotes.find((x) => x.id === build.quoteId) : void 0;
			const amount = order ? order.total : ticket ? ticket.actualCost ?? ticket.estimatedCost : buildOrder?.total ?? buildQuote?.total ?? build?.budget ?? 0;
			list.push({
				id: `doc-${r.id}`,
				kind: "Delivery / Release",
				reference: r.id,
				issuedAt: r.releasedAt ?? r.scheduledAt,
				status: r.status,
				party: {
					title: "Released to",
					name: r.customerName,
					lines: [`${titleCase(r.method)} · scheduled ${dateShort(r.scheduledAt)}`]
				},
				lines: [{
					description: build ? `Custom build ${build.id} — ${build.purpose}` : ticket ? `Service ${ticket.id} — ${ticket.device}` : `Order ${r.refId}`,
					sku: r.refId,
					qty: 1,
					unitPrice: amount
				}],
				totals: [{
					label: "Declared value",
					value: amount,
					strong: true
				}],
				footer: `Released by ${r.releasedBy ?? "—"} · received by ${r.receivedBy ?? "pending"}`,
				amount
			});
		}
		return list.sort((a, b) => a.issuedAt < b.issuedAt ? 1 : -1);
	}, [
		orders,
		quotes,
		services,
		builds,
		purchaseOrders,
		releases,
		customerById,
		supplierById
	]);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		return entries.filter((e) => {
			if (kind !== "all" && e.kind !== kind) return false;
			if (!needle) return true;
			return e.reference.toLowerCase().includes(needle) || e.party.name.toLowerCase().includes(needle) || e.kind.toLowerCase().includes(needle);
		});
	}, [
		entries,
		q,
		kind
	]);
	const active = (0, import_react.useMemo)(() => filtered.find((e) => e.id === selected) ?? filtered[0], [filtered, selected]);
	const stats = (0, import_react.useMemo)(() => {
		const count = (k) => entries.filter((e) => e.kind === k).length;
		return {
			total: entries.length,
			receipts: count("Sales Receipt") + count("Invoice"),
			quotations: count("Quotation"),
			purchase: count("Purchase Order")
		};
	}, [entries]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Documents",
				description: "Receipts, invoices, quotations and release documents.",
				actions: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintButton, { label: "Print document" }) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4 print:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Documents on file",
						numericValue: stats.total,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Receipts & invoices",
						numericValue: stats.receipts,
						format: (n) => Math.round(n).toString(),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Quotations",
						numericValue: stats.quotations,
						format: (n) => Math.round(n).toString(),
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Purchase orders",
						numericValue: stats.purchase,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "min-w-0 print:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
							value: q,
							onChange: setQ,
							placeholder: "Search reference, party or type…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							value: kind,
							onChange: setKind,
							options: KINDS,
							label: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
							shown: filtered.length,
							total: entries.length,
							noun: "documents"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						rows: filtered,
						columns: [
							{
								key: "reference",
								header: "Reference",
								cell: (e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mono inline-flex items-center gap-2 text-[12.5px] text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-subtle" }), e.reference]
								}),
								sortValue: (e) => e.reference
							},
							{
								key: "kind",
								header: "Document",
								cell: (e) => e.kind,
								sortValue: (e) => e.kind
							},
							{
								key: "party",
								header: "Party",
								cell: (e) => e.party.name,
								sortValue: (e) => e.party.name
							},
							{
								key: "issued",
								header: "Issued",
								cell: (e) => dateShort(e.issuedAt),
								sortValue: (e) => e.issuedAt
							},
							{
								key: "status",
								header: "Status",
								cell: (e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: e.status }),
								sortValue: (e) => e.status
							},
							{
								key: "amount",
								header: "Amount",
								align: "right",
								cell: (e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mono tabular-nums",
									children: money(e.amount)
								}),
								sortValue: (e) => e.amount
							}
						],
						pageSize: 10,
						onRowClick: (e) => setSelected(e.id),
						initialSort: {
							key: "issued",
							dir: "desc"
						},
						empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							title: "No documents match your filters",
							description: "Try a different type or search term."
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 xl:sticky xl:top-4 xl:self-start",
					children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentPreview, {
						kind: active.kind,
						reference: active.reference,
						issuedAt: active.issuedAt,
						status: titleCase(active.status),
						party: active.party,
						lines: active.lines,
						totals: active.totals,
						footer: active.footer
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "Nothing to preview",
						description: "Select a document from the register to preview it."
					}) })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, {
				className: "print:hidden",
				children: "Documents are rendered from local demo data and printed through the browser — no BIR-accredited receipt, e-invoicing or thermal printer integration is performed."
			})
		]
	});
}
//#endregion
export { DocumentsPage as component };
