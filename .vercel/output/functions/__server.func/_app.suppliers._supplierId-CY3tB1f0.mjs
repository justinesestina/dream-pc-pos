import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { G as num, O as useOps, R as dateShort, U as money, i as Route$3 } from "./_ssr/router-DXywCOrU.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, o as TotalsRows, r as KeyValueGrid } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.suppliers._supplierId-CY3tB1f0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SupplierDetailPage() {
	const { supplierId } = Route$3.useParams();
	const { supplierById, purchaseOrders } = useOps();
	const navigate = useNavigate();
	const supplier = supplierById(supplierId);
	const orders = (0, import_react.useMemo)(() => purchaseOrders.filter((p) => p.supplierId === supplierId), [purchaseOrders, supplierId]);
	const spend = (0, import_react.useMemo)(() => {
		const total = orders.reduce((sum, o) => sum + o.total, 0);
		const received = orders.filter((o) => o.status === "received").reduce((sum, o) => sum + o.total, 0);
		return {
			total,
			received,
			open: total - received
		};
	}, [orders]);
	if (!supplier) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Supplier",
			description: "Supplier profile, purchase history and supplied products."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Supplier not found",
			description: `No supplier matches ${supplierId}.`
		}) })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: supplier.name,
				description: "Supplier profile, purchase history and supplied products.",
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: supplier.status })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Contact",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 4,
					items: [
						{
							label: "Contact",
							value: supplier.contact
						},
						{
							label: "Email",
							value: supplier.email
						},
						{
							label: "Phone",
							value: supplier.phone,
							mono: true
						},
						{
							label: "Address",
							value: supplier.address
						},
						{
							label: "Terms",
							value: supplier.terms,
							mono: true
						},
						{
							label: "Lead time",
							value: `${supplier.leadTimeDays} days`
						},
						{
							label: "Rating",
							value: supplier.rating.toFixed(1)
						},
						{
							label: "Categories",
							value: supplier.categories.join(", ")
						}
					]
				}), supplier.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "border-t border-border px-4 py-3 text-[13px] text-muted-foreground",
					children: supplier.notes
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [{
							label: "Total spend",
							value: money(spend.total),
							strong: true
						}] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [{
							label: "Received value",
							value: money(spend.received)
						}] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [{
							label: "Outstanding value",
							value: money(spend.open)
						}] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Purchase orders",
				hint: `${orders.length} order(s) with this supplier`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: orders,
					columns: [
						{
							key: "id",
							header: "PO ID",
							cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
								className: "text-foreground",
								children: r.id
							}),
							sortValue: (r) => r.id
						},
						{
							key: "created",
							header: "Created",
							cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-xs",
								children: dateShort(r.createdAt)
							}),
							sortValue: (r) => r.createdAt
						},
						{
							key: "expected",
							header: "Expected",
							cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-xs",
								children: dateShort(r.expectedAt)
							}),
							sortValue: (r) => r.expectedAt
						},
						{
							key: "lines",
							header: "Lines",
							cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono tabular-nums",
								children: num(r.lines.length)
							}),
							align: "right"
						},
						{
							key: "total",
							header: "Total",
							cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono tabular-nums",
								children: money(r.total)
							}),
							sortValue: (r) => r.total,
							align: "right"
						},
						{
							key: "status",
							header: "Status",
							cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status }),
							align: "right"
						}
					],
					onRowClick: (r) => navigate({
						to: "/purchasing/$poId",
						params: { poId: r.id }
					}),
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No purchase orders yet",
						description: "This supplier has no purchase orders on record."
					})
				})
			})
		]
	});
}
//#endregion
export { SupplierDetailPage as component };
