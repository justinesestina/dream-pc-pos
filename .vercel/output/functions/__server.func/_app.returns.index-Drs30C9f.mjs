import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { G as num, N as useSimulatedLoad, O as useOps, U as money, q as titleCase } from "./_ssr/router-DXywCOrU.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as NewReturnDialog } from "./_ssr/new-return-dialog-C8r59PW9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.returns.index-Drs30C9f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReturnsIndexPage() {
	const { returns } = useOps();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [resolution, setResolution] = (0, import_react.useState)("all");
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return returns.filter((r) => {
			if (query) {
				if (!`${r.id} ${r.orderId} ${r.customerName} ${r.productName}`.toLowerCase().includes(query)) return false;
			}
			if (status !== "all" && r.status !== status) return false;
			if (resolution !== "all" && r.resolution !== resolution) return false;
			return true;
		});
	}, [
		returns,
		q,
		status,
		resolution
	]);
	const stats = (0, import_react.useMemo)(() => {
		let open = 0;
		let awaitingInspection = 0;
		let refundedValue = 0;
		let restocked = 0;
		for (const r of returns) {
			if (![
				"refunded",
				"replaced",
				"rejected"
			].includes(r.status)) open++;
			if (r.status === "requested" || r.status === "inspection") awaitingInspection++;
			if (r.status === "refunded") refundedValue += r.refundAmount;
			if (r.restock) restocked += r.qty;
		}
		return {
			open,
			awaitingInspection,
			refundedValue,
			restocked
		};
	}, [returns]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Returns & Refunds",
				description: "Return requests, inspection outcomes and refunds.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewReturnDialog, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open RMAs",
						numericValue: stats.open,
						format: (n) => num(Math.round(n)),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Awaiting inspection",
						numericValue: stats.awaitingInspection,
						format: (n) => num(Math.round(n)),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Refunded value",
						numericValue: stats.refundedValue,
						format: (n) => money(Math.round(n)),
						accent: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Restocked units",
						numericValue: stats.restocked,
						format: (n) => num(Math.round(n)),
						accent: "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search RMA, order or customer…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					label: "Status",
					options: [
						"requested",
						"inspection",
						"approved",
						"rejected",
						"refunded",
						"replaced"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: resolution,
					onChange: setResolution,
					label: "Resolution",
					options: [
						"refund",
						"replacement",
						"repair",
						"none"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: returns.length,
					noun: "returns"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "id",
						header: "RMA ID",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-foreground",
							children: r.id
						}),
						sortValue: (r) => r.id
					},
					{
						key: "order",
						header: "Order",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
							to: "/orders/$orderId",
							params: { orderId: r.orderId },
							children: r.orderId
						})
					},
					{
						key: "customer",
						header: "Customer",
						cell: (r) => r.customerName,
						sortValue: (r) => r.customerName
					},
					{
						key: "product",
						header: "Product",
						cell: (r) => r.productName,
						className: "min-w-[10rem]"
					},
					{
						key: "qty",
						header: "Qty",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: num(r.qty)
						}),
						align: "right"
					},
					{
						key: "reason",
						header: "Reason",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-xs text-muted-foreground",
							children: r.reason
						}),
						className: "max-w-[12rem]"
					},
					{
						key: "resolution",
						header: "Resolution",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: titleCase(r.resolution)
						})
					},
					{
						key: "refund",
						header: "Refund amount",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: r.refundAmount ? money(r.refundAmount) : "—"
						}),
						sortValue: (r) => r.refundAmount,
						align: "right"
					},
					{
						key: "status",
						header: "Status",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status }),
						align: "right"
					}
				],
				loading,
				onRowClick: (r) => navigate({
					to: "/returns/$returnId",
					params: { returnId: r.id }
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No returns match",
					description: "Try clearing the search or filters."
				})
			})] })
		]
	});
}
//#endregion
export { ReturnsIndexPage as component };
