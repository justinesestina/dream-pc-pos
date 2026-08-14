import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { G as num, N as useSimulatedLoad, O as useOps, R as dateShort } from "./_ssr/router-DXywCOrU.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.receiving.index-CT8h7wgc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isToday(iso) {
	const d = new Date(iso);
	const now = /* @__PURE__ */ new Date();
	return d.toDateString() === now.toDateString();
}
function ReceivingIndexPage() {
	const { receipts } = useOps();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return receipts.filter((r) => {
			if (query) {
				if (!`${r.id} ${r.purchaseOrderId} ${r.supplierName}`.toLowerCase().includes(query)) return false;
			}
			if (status !== "all" && r.status !== status) return false;
			return true;
		});
	}, [
		receipts,
		q,
		status
	]);
	const stats = (0, import_react.useMemo)(() => {
		let inProgress = 0;
		let completedToday = 0;
		let discrepancies = 0;
		let units = 0;
		for (const r of receipts) {
			if (r.status === "in_progress") inProgress++;
			if (r.status === "discrepancy") discrepancies++;
			if (r.status !== "in_progress" && isToday(r.receivedAt)) completedToday++;
			units += r.lines.reduce((sum, l) => sum + l.received, 0);
		}
		return {
			inProgress,
			completedToday,
			discrepancies,
			units
		};
	}, [receipts]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Stock Receiving",
				description: "Goods receipts against purchase orders."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In progress",
						numericValue: stats.inProgress,
						format: (n) => num(Math.round(n)),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Completed today",
						numericValue: stats.completedToday,
						format: (n) => num(Math.round(n)),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Discrepancies",
						numericValue: stats.discrepancies,
						format: (n) => num(Math.round(n)),
						accent: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Units received",
						numericValue: stats.units,
						format: (n) => num(Math.round(n)),
						accent: "neutral"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search GR ID, PO or supplier…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					label: "Status",
					options: [
						"in_progress",
						"completed",
						"discrepancy"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: receipts.length,
					noun: "receipts"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "id",
						header: "GR ID",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-foreground",
							children: r.id
						}),
						sortValue: (r) => r.id
					},
					{
						key: "po",
						header: "PO",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
							to: "/purchasing/$poId",
							params: { poId: r.purchaseOrderId },
							children: r.purchaseOrderId
						})
					},
					{
						key: "supplier",
						header: "Supplier",
						cell: (r) => r.supplierName,
						sortValue: (r) => r.supplierName,
						className: "min-w-[10rem]"
					},
					{
						key: "receivedBy",
						header: "Received by",
						cell: (r) => r.receivedBy
					},
					{
						key: "date",
						header: "Date",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono text-xs",
							children: dateShort(r.receivedAt)
						}),
						sortValue: (r) => r.receivedAt
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
						key: "status",
						header: "Status",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status }),
						align: "right"
					}
				],
				loading,
				onRowClick: (r) => navigate({
					to: "/receiving/$receiptId",
					params: { receiptId: r.id }
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No goods receipts match",
					description: "Try clearing the search or filter."
				})
			})] })
		]
	});
}
//#endregion
export { ReceivingIndexPage as component };
