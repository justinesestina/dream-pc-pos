import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as daysUntil, L as cn, N as useSimulatedLoad, P as useStore, R as dateShort } from "./_ssr/router-DXywCOrU.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.warranty.index-CZn7hBwL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WARRANTY_STATUSES = [
	"active",
	"expiring",
	"expired",
	"void"
];
var CLAIM_STATUSES = [
	"open",
	"in_review",
	"approved",
	"rejected",
	"closed"
];
function WarrantyPage() {
	const { warranties, claims } = useStore();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [claimQ, setClaimQ] = (0, import_react.useState)("");
	const [claimStatus, setClaimStatus] = (0, import_react.useState)("all");
	const stats = (0, import_react.useMemo)(() => {
		return {
			active: warranties.filter((w) => w.status === "active").length,
			expiringSoon: warranties.filter((w) => {
				const d = daysUntil(w.expiresAt);
				return d >= 0 && d <= 30;
			}).length,
			expired: warranties.filter((w) => w.status === "expired").length,
			openClaims: claims.filter((c) => c.status === "open" || c.status === "in_review").length
		};
	}, [warranties, claims]);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		return warranties.filter((w) => {
			if (status !== "all" && w.status !== status) return false;
			if (term && !((w.serial ?? "").toLowerCase().includes(term) || w.productName.toLowerCase().includes(term) || w.customerName.toLowerCase().includes(term))) return false;
			return true;
		});
	}, [
		warranties,
		q,
		status
	]);
	const columns = [
		{
			key: "serial",
			header: "Serial",
			cell: (w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: w.serial ?? "—" }),
			sortValue: (w) => w.serial ?? ""
		},
		{
			key: "product",
			header: "Product",
			cell: (w) => w.productName,
			sortValue: (w) => w.productName
		},
		{
			key: "customer",
			header: "Customer",
			cell: (w) => w.customerName,
			sortValue: (w) => w.customerName
		},
		{
			key: "start",
			header: "Start",
			cell: (w) => dateShort(w.purchasedAt),
			sortValue: (w) => w.purchasedAt
		},
		{
			key: "expires",
			header: "Expires",
			cell: (w) => {
				const d = daysUntil(w.expiresAt);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("mono", d < 0 ? "text-destructive" : d <= 30 ? "text-warning" : "text-muted-foreground"),
					children: [
						dateShort(w.expiresAt),
						" ",
						d >= 0 ? `(${d}d)` : "(expired)"
					]
				});
			},
			sortValue: (w) => w.expiresAt
		},
		{
			key: "status",
			header: "Status",
			cell: (w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: w.status }),
			sortValue: (w) => w.status
		}
	];
	const filteredClaims = (0, import_react.useMemo)(() => {
		const term = claimQ.trim().toLowerCase();
		return claims.filter((c) => {
			if (claimStatus !== "all" && c.status !== claimStatus) return false;
			if (!term) return true;
			const w = warranties.find((x) => x.id === c.warrantyId);
			return [
				c.id,
				c.warrantyId,
				c.reason,
				c.resolution ?? "",
				c.resolutionNote ?? "",
				w?.serial ?? "",
				w?.productName ?? "",
				w?.customerName ?? "",
				w?.orderId ?? ""
			].join(" ").toLowerCase().includes(term);
		});
	}, [
		claims,
		warranties,
		claimQ,
		claimStatus
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Warranty",
				description: "Warranty registry, coverage windows and claims."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active warranties",
						numericValue: stats.active,
						format: (n) => Math.round(n).toString(),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Expiring in 30 days",
						numericValue: stats.expiringSoon,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Expired",
						numericValue: stats.expired,
						format: (n) => Math.round(n).toString(),
						accent: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open claims",
						numericValue: stats.openClaims,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search serial, product, customer…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					options: WARRANTY_STATUSES,
					label: "Status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: warranties.length,
					noun: "warranties"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns,
				loading,
				onRowClick: (w) => navigate({
					to: "/warranty/$warrantyId",
					params: { warrantyId: w.id }
				}),
				initialSort: {
					key: "expires",
					dir: "asc"
				},
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No warranties match your filters",
					description: "Try adjusting search terms or clearing filters."
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Warranty claims",
				hint: `${claims.length} total`,
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 pr-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
							value: claimQ,
							onChange: setClaimQ,
							placeholder: "Search claim, serial, order, product…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							value: claimStatus,
							onChange: setClaimStatus,
							options: CLAIM_STATUSES,
							label: "Claim status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
							shown: filteredClaims.length,
							total: claims.length,
							noun: "claims"
						})
					]
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: filteredClaims,
					columns: [
						{
							key: "id",
							header: "Claim",
							cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/warranty/claims/$claimId",
								params: { claimId: c.id },
								children: c.id
							})
						},
						{
							key: "warranty",
							header: "Warranty",
							cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/warranty/$warrantyId",
								params: { warrantyId: c.warrantyId },
								children: c.warrantyId
							})
						},
						{
							key: "serial",
							header: "Serial",
							cell: (c) => {
								const w = warranties.find((x) => x.id === c.warrantyId);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: w?.serial ?? "—" });
							}
						},
						{
							key: "product",
							header: "Product",
							cell: (c) => {
								return warranties.find((x) => x.id === c.warrantyId)?.productName ?? "—";
							}
						},
						{
							key: "reason",
							header: "Reason",
							cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-[280px] truncate block text-muted-foreground",
								children: c.reason
							})
						},
						{
							key: "created",
							header: "Filed",
							cell: (c) => dateShort(c.createdAt)
						},
						{
							key: "status",
							header: "Status",
							cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: c.status })
						}
					],
					pageSize: 8,
					onRowClick: (c) => navigate({
						to: "/warranty/claims/$claimId",
						params: { claimId: c.id }
					}),
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No claims match",
						description: "No claims match the current search or filter."
					})
				})
			})
		]
	});
}
//#endregion
export { WarrantyPage as component };
