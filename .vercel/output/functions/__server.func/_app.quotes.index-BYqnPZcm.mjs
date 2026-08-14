import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as daysUntil, L as cn, N as useSimulatedLoad, P as useStore, R as dateShort, U as money } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.quotes.index-BYqnPZcm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var QUOTE_STATUSES = [
	"draft",
	"sent",
	"pending",
	"approved",
	"rejected",
	"expired",
	"converted"
];
function QuotesIndexPage() {
	const { quotes } = useStore();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [expiringOnly, setExpiringOnly] = (0, import_react.useState)(false);
	const stats = (0, import_react.useMemo)(() => {
		const open = quotes.filter((q) => [
			"draft",
			"sent",
			"pending"
		].includes(q.status));
		const totalQuoted = open.reduce((s, q) => s + q.total, 0);
		const decided = quotes.filter((q) => q.status === "approved" || q.status === "rejected" || q.status === "converted");
		const converted = quotes.filter((q) => q.status === "approved" || q.status === "converted");
		const conversionRate = decided.length ? converted.length / decided.length * 100 : 0;
		const expiringSoon = quotes.filter((q) => ["sent", "pending"].includes(q.status) && daysUntil(q.expiresAt) <= 7 && daysUntil(q.expiresAt) >= 0).length;
		return {
			open: open.length,
			totalQuoted,
			conversionRate,
			expiringSoon
		};
	}, [quotes]);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		return quotes.filter((quote) => {
			if (status !== "all" && quote.status !== status) return false;
			if (expiringOnly && daysUntil(quote.expiresAt) > 7) return false;
			if (term && !(quote.id.toLowerCase().includes(term) || quote.customerName.toLowerCase().includes(term))) return false;
			return true;
		});
	}, [
		quotes,
		q,
		status,
		expiringOnly
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Quotes",
				description: "Quotations, validity windows and conversion to orders."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open quotes",
						numericValue: stats.open,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total quoted value",
						numericValue: stats.totalQuoted,
						format: money,
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Approval conversion",
						numericValue: stats.conversionRate,
						format: (n) => `${n.toFixed(0)}%`,
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Expiring within 7d",
						numericValue: stats.expiringSoon,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search quote ID or customer…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					options: QUOTE_STATUSES,
					label: "Status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: expiringOnly ? "default" : "outline",
					onClick: () => setExpiringOnly((v) => !v),
					className: "h-8 text-xs",
					children: "Expiring ≤ 7 days"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: quotes.length,
					noun: "quotes"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "id",
						header: "Quote ID",
						cell: (qt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-[13px] text-foreground",
							children: qt.id
						}),
						sortValue: (qt) => qt.id
					},
					{
						key: "date",
						header: "Date",
						cell: (qt) => dateShort(qt.createdAt),
						sortValue: (qt) => qt.createdAt
					},
					{
						key: "customer",
						header: "Customer",
						cell: (qt) => qt.customerName,
						sortValue: (qt) => qt.customerName
					},
					{
						key: "items",
						header: "Items",
						cell: (qt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono",
							children: qt.items.reduce((s, i) => s + i.qty, 0)
						}),
						align: "right",
						sortValue: (qt) => qt.items.reduce((s, i) => s + i.qty, 0)
					},
					{
						key: "total",
						header: "Total",
						cell: (qt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: money(qt.total)
						}),
						align: "right",
						sortValue: (qt) => qt.total
					},
					{
						key: "expires",
						header: "Valid until",
						cell: (qt) => {
							const days = daysUntil(qt.expiresAt);
							const near = ["sent", "pending"].includes(qt.status) && days <= 7;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("mono", near && (days < 0 ? "text-destructive" : "text-warning")),
								children: [dateShort(qt.expiresAt), near && ` (${days < 0 ? "expired" : `${days}d left`})`]
							});
						},
						sortValue: (qt) => qt.expiresAt
					},
					{
						key: "status",
						header: "Status",
						cell: (qt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: qt.status }),
						sortValue: (qt) => qt.status
					}
				],
				loading,
				onRowClick: (qt) => navigate({
					to: "/quotes/$quoteId",
					params: { quoteId: qt.id }
				}),
				initialSort: {
					key: "date",
					dir: "desc"
				},
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No quotes match your filters",
					description: "Try adjusting search terms or clearing filters."
				})
			})] })
		]
	});
}
//#endregion
export { QuotesIndexPage as component };
