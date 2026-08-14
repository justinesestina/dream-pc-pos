import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { r as Wallet } from "./_libs/lucide-react.mjs";
import { O as useOps, U as money, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.shifts.index-UDEExolC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function shiftCash(s) {
	const adj = s.adjustments.reduce((sum, a) => sum + (a.kind === "cash_in" ? a.amount : -a.amount), 0);
	return s.openingCash + adj;
}
function ShiftsIndexPage() {
	const ops = useOps();
	const navigate = useNavigate();
	const [opening, setOpening] = (0, import_react.useState)("");
	const [cashier, setCashier] = (0, import_react.useState)(ops.actor);
	const open = ops.openShift;
	const shifts = ops.shifts;
	const lastClosed = shifts.find((s) => s.status === "closed" && s.countedCash !== void 0);
	const lastVariance = lastClosed ? (lastClosed.countedCash ?? 0) - shiftCash(lastClosed) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Cash Drawer",
				description: "Cashier shifts, cash movements and end-of-shift reconciliation."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Shift status",
						value: open ? "Open" : "Closed",
						accent: open ? "success" : "neutral",
						hint: open ? open.id : "No active shift"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Cash on hand",
						value: open ? money(shiftCash(open)) : "—",
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Adjustments this shift",
						numericValue: open ? open.adjustments.length : 0,
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Variance last close",
						value: lastClosed ? money(lastVariance) : "—",
						accent: lastVariance === 0 ? "neutral" : lastVariance > 0 ? "success" : "danger"
					})
				]
			}),
			!open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Open a new shift",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "shift-cashier",
								children: "Cashier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "shift-cashier",
								value: cashier,
								onChange: (e) => setCashier(e.target.value),
								className: "w-48"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "shift-opening",
								children: "Opening cash (PHP)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "shift-opening",
								type: "number",
								value: opening,
								onChange: (e) => setOpening(e.target.value),
								className: "w-40",
								placeholder: "5000"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								const shift = ops.openNewShift(Number(opening) || 0, cashier || "Cashier");
								toast.success(`${shift.id} opened.`);
								setOpening("");
								navigate({
									to: "/shifts/$shiftId",
									params: { shiftId: shift.id }
								});
							},
							children: "Open shift"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between border-b border-border px-4 py-2.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-foreground",
					children: "Shift history"
				})
			}), shifts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No shifts recorded",
				icon: Wallet
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: shifts,
				columns: [
					{
						key: "id",
						header: "Shift ID",
						cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-foreground",
							children: s.id
						}),
						sortValue: (s) => s.id
					},
					{
						key: "cashier",
						header: "Cashier",
						cell: (s) => s.cashier
					},
					{
						key: "opened",
						header: "Opened",
						cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: dateTime(s.openedAt) }),
						sortValue: (s) => s.openedAt
					},
					{
						key: "closed",
						header: "Closed",
						cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: s.closedAt ? dateTime(s.closedAt) : "—" })
					},
					{
						key: "opening",
						header: "Opening cash",
						align: "right",
						cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: money(s.openingCash) })
					},
					{
						key: "counted",
						header: "Counted",
						align: "right",
						cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: s.countedCash !== void 0 ? money(s.countedCash) : "—" })
					},
					{
						key: "variance",
						header: "Variance",
						align: "right",
						cell: (s) => {
							if (s.countedCash === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "—"
							});
							const v = s.countedCash - shiftCash(s);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Mono, {
								className: v === 0 ? "text-muted-foreground" : v > 0 ? "text-success" : "text-destructive",
								children: [v > 0 ? "+" : "", money(v)]
							});
						}
					},
					{
						key: "status",
						header: "Status",
						cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							status: s.status,
							tone: s.status === "open" ? "success" : "neutral"
						})
					}
				],
				pageSize: 15,
				initialSort: {
					key: "opened",
					dir: "desc"
				},
				onRowClick: (s) => navigate({
					to: "/shifts/$shiftId",
					params: { shiftId: s.id }
				})
			})] })
		]
	});
}
//#endregion
export { ShiftsIndexPage as component };
