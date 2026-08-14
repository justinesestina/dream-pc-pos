import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { N as useSimulatedLoad, P as useStore, R as dateShort, U as money, q as titleCase } from "./_ssr/router-DXywCOrU.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.orders.index-3Qc3H7hE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ORDER_STATUSES = [
	"pending",
	"paid",
	"processing",
	"assembly",
	"testing",
	"ready",
	"completed",
	"cancelled",
	"refunded"
];
var ORDER_TYPES = [
	"retail",
	"custom_build",
	"service"
];
var PAYMENT_METHODS = [
	"cash",
	"gcash",
	"bank",
	"card"
];
function OrdersIndexPage() {
	const { orders } = useStore();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [type, setType] = (0, import_react.useState)("all");
	const [method, setMethod] = (0, import_react.useState)("all");
	const stats = (0, import_react.useMemo)(() => {
		const today = (/* @__PURE__ */ new Date()).toDateString();
		const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
		const revenueToday = ordersToday.reduce((s, o) => s + o.total, 0);
		const pendingFulfillment = orders.filter((o) => [
			"paid",
			"processing",
			"assembly",
			"testing"
		].includes(o.status)).length;
		const unpaid = orders.filter((o) => o.status === "pending" || !o.payment).length;
		return {
			ordersToday: ordersToday.length,
			revenueToday,
			pendingFulfillment,
			unpaid
		};
	}, [orders]);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		return orders.filter((o) => {
			if (status !== "all" && o.status !== status) return false;
			if (type !== "all" && o.type !== type) return false;
			if (method !== "all" && o.payment?.method !== method) return false;
			if (term && !(o.id.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term))) return false;
			return true;
		});
	}, [
		orders,
		q,
		status,
		type,
		method
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Orders",
				description: "Transaction history with payment and fulfillment status."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Orders today",
						numericValue: stats.ordersToday,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Revenue today",
						numericValue: stats.revenueToday,
						format: money,
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending fulfillment",
						numericValue: stats.pendingFulfillment,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Unpaid / pending",
						numericValue: stats.unpaid,
						format: (n) => Math.round(n).toString(),
						accent: "danger"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search order ID or customer…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					options: ORDER_STATUSES,
					label: "Status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: type,
					onChange: setType,
					options: ORDER_TYPES,
					label: "Type"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: method,
					onChange: setMethod,
					options: PAYMENT_METHODS,
					label: "Payment"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: orders.length,
					noun: "orders"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "id",
						header: "Order ID",
						cell: (o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-[13px] text-foreground",
							children: o.id
						}),
						sortValue: (o) => o.id
					},
					{
						key: "date",
						header: "Date",
						cell: (o) => dateShort(o.createdAt),
						sortValue: (o) => o.createdAt
					},
					{
						key: "customer",
						header: "Customer",
						cell: (o) => o.customerName,
						sortValue: (o) => o.customerName
					},
					{
						key: "type",
						header: "Type",
						cell: (o) => titleCase(o.type),
						sortValue: (o) => o.type
					},
					{
						key: "items",
						header: "Items",
						cell: (o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono",
							children: o.items.reduce((s, i) => s + i.qty, 0)
						}),
						align: "right",
						sortValue: (o) => o.items.reduce((s, i) => s + i.qty, 0)
					},
					{
						key: "total",
						header: "Total",
						cell: (o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: money(o.total)
						}),
						align: "right",
						sortValue: (o) => o.total
					},
					{
						key: "payment",
						header: "Payment",
						cell: (o) => o.payment ? titleCase(o.payment.method) : "—",
						sortValue: (o) => o.payment?.method ?? ""
					},
					{
						key: "status",
						header: "Status",
						cell: (o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.status }),
						sortValue: (o) => o.status
					}
				],
				loading,
				onRowClick: (o) => navigate({
					to: "/orders/$orderId",
					params: { orderId: o.id }
				}),
				initialSort: {
					key: "date",
					dir: "desc"
				},
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No orders match your filters",
					description: "Try adjusting search terms or clearing filters."
				})
			})] })
		]
	});
}
//#endregion
export { OrdersIndexPage as component };
