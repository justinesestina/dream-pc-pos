import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { E as expectedCash, O as useOps, P as useStore, U as money, a as Route$5, q as titleCase, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, o as TotalsRows, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.shifts._shiftId-DvPayODF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var METHODS = [
	"cash",
	"gcash",
	"bank",
	"card"
];
function ShiftDetailPage() {
	const { shiftId } = Route$5.useParams();
	const ops = useOps();
	const { orders } = useStore();
	const shift = ops.shifts.find((s) => s.id === shiftId);
	const [kind, setKind] = (0, import_react.useState)("cash_in");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [reason, setReason] = (0, import_react.useState)("");
	const [counted, setCounted] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [tenders, setTenders] = (0, import_react.useState)({
		cash: "",
		gcash: "",
		bank: "",
		card: ""
	});
	const [refunds, setRefunds] = (0, import_react.useState)("");
	if (!shift) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Shift",
			description: "Shift detail with tender breakdown and variance."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Shift not found",
			description: `No shift matches "${shiftId}".`
		}) })]
	});
	const adjTotal = shift.adjustments.reduce((s, a) => s + (a.kind === "cash_in" ? a.amount : -a.amount), 0);
	const openAt = +new Date(shift.openedAt);
	const closeAt = shift.closedAt ? +new Date(shift.closedAt) : Date.now();
	const cashSales = orders.reduce((sum, o) => {
		if (!o.payment || o.payment.method !== "cash") return sum;
		const at = +new Date(o.payment.at);
		if (at < openAt || at > closeAt) return sum;
		return sum + o.payment.amount;
	}, 0);
	const refundsNum = Number(refunds) || 0;
	const refundsTotal = shift.status === "closed" ? shift.refunds ?? 0 : refundsNum;
	const expected = expectedCash(shift, cashSales, refundsTotal);
	const variance = shift.countedCash !== void 0 ? shift.countedCash - expected : void 0;
	const tenderTotal = shift.tenders ? Object.values(shift.tenders).reduce((a, b) => a + b, 0) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [shift.id, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
					status: shift.status,
					tone: shift.status === "open" ? "success" : "neutral"
				})]
			}),
			description: `Cashier: ${shift.cashier}`,
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted-foreground",
				children: ["Opened ", dateTime(shift.openedAt)]
			}), shift.closedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted-foreground",
				children: ["Closed ", dateTime(shift.closedAt)]
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 lg:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Summary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, {
							className: "p-4",
							rows: [
								{
									label: "Opening cash",
									value: money(shift.openingCash)
								},
								{
									label: "Cash sales (this shift)",
									value: money(cashSales)
								},
								{
									label: "Cash refunds",
									value: money(shift.refunds ?? refundsTotal),
									muted: (shift.refunds ?? refundsTotal) === 0
								},
								{
									label: "Cash adjustments (net)",
									value: money(adjTotal)
								},
								{
									label: "Expected cash",
									value: money(expected),
									strong: true
								},
								...shift.countedCash !== void 0 ? [{
									label: "Counted cash",
									value: money(shift.countedCash)
								}, {
									label: "Variance",
									value: `${(variance ?? 0) > 0 ? "+" : ""}${money(variance ?? 0)}`
								}] : []
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Tender breakdown",
						hint: shift.tenders ? money(tenderTotal) + " total" : "Recorded at close",
						children: shift.tenders ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
							cols: 4,
							items: METHODS.map((m) => ({
								label: titleCase(m),
								value: money(shift.tenders[m]),
								mono: true
							}))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							title: "Tenders not yet recorded",
							description: "Tender breakdown is captured when the shift is closed."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Cash adjustments",
						hint: `${shift.adjustments.length} entries`,
						children: [shift.adjustments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							title: "No adjustments",
							description: "No cash in/out entries for this shift."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y divide-border/60",
							children: shift.adjustments.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 px-4 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] text-foreground",
									children: a.reason
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mono text-[11px] text-subtle",
									children: [
										dateTime(a.at),
										" · ",
										a.actor
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Mono, {
									className: a.kind === "cash_in" ? "text-success" : "text-destructive",
									children: [a.kind === "cash_in" ? "+" : "-", money(a.amount)]
								})]
							}, a.id))
						}), shift.status === "open" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end gap-2 border-t border-border p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: kind,
									onValueChange: (v) => setKind(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 w-28 text-[13px]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "cash_in",
										children: "Cash in"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "cash_out",
										children: "Cash out"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									value: amount,
									onChange: (e) => setAmount(e.target.value),
									placeholder: "Amount",
									className: "h-8 w-28 text-[13px]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: reason,
									onChange: (e) => setReason(e.target.value),
									placeholder: "Reason",
									className: "h-8 flex-1 min-w-[10rem] text-[13px]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => {
										if (!amount || Number(amount) <= 0 || !reason.trim()) {
											toast.error("Amount and reason are required.");
											return;
										}
										ops.addCashAdjustment(shift.id, {
											kind,
											amount: Number(amount),
											reason: reason.trim()
										});
										toast.success("Adjustment recorded.");
										setAmount("");
										setReason("");
									},
									children: "Add"
								})
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5",
				children: shift.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Close shift",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Enter the per-method sales totals and the cashier's physical count. Expected cash includes cash sales and any refunds entered below." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-3",
								children: METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: `tender-${m}`,
										children: titleCase(m)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: `tender-${m}`,
										type: "number",
										min: 0,
										value: tenders[m],
										onChange: (e) => setTenders((t) => ({
											...t,
											[m]: e.target.value
										})),
										placeholder: "0"
									})]
								}, m))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "shift-refunds",
									children: "Cash refunds issued (PHP)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "shift-refunds",
									type: "number",
									min: 0,
									value: refunds,
									onChange: (e) => setRefunds(e.target.value),
									placeholder: "0"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "shift-counted",
									children: "Counted cash (PHP)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "shift-counted",
									type: "number",
									value: counted,
									onChange: (e) => setCounted(e.target.value),
									placeholder: String(expected)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "shift-notes",
									children: "Notes"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "shift-notes",
									value: notes,
									onChange: (e) => setNotes(e.target.value),
									rows: 3
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: () => {
									const parsed = Object.fromEntries(METHODS.map((m) => [m, Number(tenders[m]) || 0]));
									ops.closeShift(shift.id, Number(counted) || 0, parsed, refundsNum, notes.trim() || void 0);
									toast.success(`${shift.id} closed.`);
								},
								children: "Close shift"
							})
						]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Close details",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
						cols: 2,
						items: [
							{
								label: "Notes",
								value: shift.notes ?? "—"
							},
							{
								label: "Counted cash",
								value: shift.countedCash !== void 0 ? money(shift.countedCash) : "—",
								mono: true
							},
							{
								label: "Variance",
								value: variance !== void 0 ? `${variance > 0 ? "+" : ""}${money(variance)}` : "—",
								mono: true
							},
							{
								label: "Cash refunds",
								value: shift.refunds ? money(shift.refunds) : "—",
								mono: true
							}
						]
					})
				})
			})]
		})]
	});
}
//#endregion
export { ShiftDetailPage as component };
