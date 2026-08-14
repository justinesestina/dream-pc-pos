import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { Ot as ArrowLeft, P as PackageCheck, S as RotateCcw, c as Undo2, v as ShieldX } from "./_libs/lucide-react.mjs";
import { O as useOps, P as useStore, U as money, c as Route$9, q as titleCase, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, o as TotalsRows, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
import { t as Timeline } from "./_ssr/timeline-DiNIO4ot.mjs";
import { t as Switch } from "./_ssr/switch-D0Hxoaz3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.returns._returnId-C02nEkra.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CONDITION_LABEL = {
	sealed: "Sealed / unopened",
	used_good: "Used — good condition",
	used_damaged: "Used — damaged",
	defective: "Defective"
};
var RESOLUTIONS = [
	"refund",
	"replacement",
	"repair",
	"none"
];
var METHODS = [
	"cash",
	"gcash",
	"bank",
	"card"
];
/** Frontend-only lifecycle used to render the RMA progress timeline. */
function buildTimeline(r) {
	const order = [
		"requested",
		"inspection",
		"approved",
		"refunded"
	];
	const terminal = r.status === "rejected" || r.status === "refunded" || r.status === "replaced";
	const idx = order.indexOf(r.status);
	const stateFor = (step) => {
		if (r.status === "rejected") return step === 0 || step === 1 ? "done" : "pending";
		if (idx < 0) return step <= 2 ? "done" : "pending";
		if (step < idx) return "done";
		if (step === idx) return terminal ? "done" : "active";
		return "pending";
	};
	const events = [{
		label: "Return requested",
		at: r.createdAt,
		actor: r.customerName,
		state: stateFor(0),
		note: r.reason
	}, {
		label: "Inspection",
		at: r.inspectedBy ? r.createdAt : "",
		actor: r.inspectedBy ?? void 0,
		note: r.inspectionNotes ?? void 0,
		state: stateFor(1)
	}];
	if (r.status === "rejected") {
		events.push({
			label: "Rejected",
			at: r.createdAt,
			actor: r.inspectedBy ?? void 0,
			note: r.inspectionNotes ?? "Return did not pass inspection.",
			state: "done"
		});
		return events;
	}
	events.push({
		label: `Approved — ${titleCase(r.resolution)}`,
		at: idx >= 2 ? r.createdAt : "",
		actor: r.inspectedBy ?? void 0,
		state: stateFor(2)
	});
	events.push({
		label: r.status === "replaced" ? "Replacement issued" : r.resolution === "replacement" ? "Replacement pending" : `Refund ${r.status === "refunded" ? "issued" : "pending"}`,
		at: r.status === "refunded" || r.status === "replaced" ? r.createdAt : "",
		note: r.refundAmount ? `${money(r.refundAmount)} via ${r.refundMethod ? titleCase(r.refundMethod) : "—"}` : void 0,
		state: r.status === "refunded" || r.status === "replaced" ? "done" : stateFor(3)
	});
	return events;
}
function ReturnDetailPage() {
	const { returnId } = Route$9.useParams();
	const navigate = useNavigate();
	const { returnById, setReturnStatus, updateReturn, actor } = useOps();
	const { orders, customerById, productById, invFor, adjustStock, serials, updateSerial } = useStore();
	const rma = returnById(returnId);
	const order = (0, import_react.useMemo)(() => orders.find((o) => o.id === rma?.orderId), [orders, rma?.orderId]);
	const customer = customerById(rma?.customerId ?? null);
	const product = rma ? productById(rma.productId) : void 0;
	const inv = rma ? invFor(rma.productId) : void 0;
	const serial = (0, import_react.useMemo)(() => rma?.serial ? serials.find((s) => s.serial === rma.serial) : void 0, [serials, rma?.serial]);
	const [notes, setNotes] = (0, import_react.useState)(rma?.inspectionNotes ?? "");
	const [resolution, setResolution] = (0, import_react.useState)(rma?.resolution ?? "refund");
	const [method, setMethod] = (0, import_react.useState)(rma?.refundMethod ?? "cash");
	const [amount, setAmount] = (0, import_react.useState)(String(rma?.refundAmount ?? 0));
	const [restock, setRestock] = (0, import_react.useState)(rma?.restock ?? false);
	if (!rma) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Return Request",
			description: "Inspection, approval and refund workflow for a return."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Return not found",
			description: `No RMA with reference ${returnId} exists in the demo dataset.`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => navigate({ to: "/returns" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1.5 size-3.5" }), " Back to returns"]
			})
		}) })]
	});
	const closed = rma.status === "refunded" || rma.status === "replaced" || rma.status === "rejected";
	const refundValue = Number.parseFloat(amount) || 0;
	const orderLine = order?.items.find((i) => i.productId === rma.productId);
	const maxRefund = orderLine ? orderLine.unitPrice * rma.qty : rma.refundAmount;
	const overRefund = refundValue > maxRefund && maxRefund > 0;
	function startInspection() {
		setReturnStatus(rma.id, "inspection", { inspectedBy: actor });
		toast.success(`${rma.id} moved to inspection.`, { description: `Assigned to ${actor}.` });
	}
	function saveInspection() {
		updateReturn(rma.id, {
			inspectionNotes: notes,
			inspectedBy: actor,
			resolution,
			restock
		});
		toast.success("Inspection notes saved.");
	}
	function approve() {
		updateReturn(rma.id, {
			inspectionNotes: notes,
			inspectedBy: actor,
			resolution,
			restock,
			refundMethod: resolution === "refund" ? method : null,
			refundAmount: resolution === "refund" ? refundValue : 0
		});
		setReturnStatus(rma.id, "approved");
		toast.success(`${rma.id} approved.`, { description: `Resolution: ${titleCase(resolution)}.` });
	}
	function reject() {
		updateReturn(rma.id, {
			inspectionNotes: notes || "Rejected after inspection.",
			inspectedBy: actor,
			resolution: "none",
			refundAmount: 0,
			refundMethod: null,
			restock: false
		});
		setReturnStatus(rma.id, "rejected");
		toast.error(`${rma.id} rejected.`);
	}
	function settle() {
		const next = resolution === "replacement" ? "replaced" : "refunded";
		const shouldRestock = restock && !rma.restockedAt;
		updateReturn(rma.id, {
			refundMethod: next === "refunded" ? method : null,
			refundAmount: next === "refunded" ? refundValue : 0,
			restock,
			...shouldRestock ? { restockedAt: (/* @__PURE__ */ new Date()).toISOString() } : {}
		});
		setReturnStatus(rma.id, next);
		if (shouldRestock) adjustStock(rma.productId, rma.qty, `Return restock — ${rma.id}`);
		if (serial) updateSerial(serial.id, { status: shouldRestock ? "in_stock" : "rma" });
		toast.success(next === "refunded" ? `Refund of ${money(refundValue)} recorded.` : "Replacement issued.", { description: shouldRestock ? `${rma.qty} unit(s) returned to available stock.` : rma.restockedAt ? "Stock was already restored for this RMA." : "No inventory adjustment applied." });
	}
	function reopen() {
		setReturnStatus(rma.id, "inspection", { inspectedBy: actor });
		toast.info(`${rma.id} reopened for inspection.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: rma.id,
				description: `${rma.productName} · ${rma.customerName}`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: rma.status }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => navigate({ to: "/returns" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1.5 size-3.5" }), " Returns"]
						}),
						closed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: reopen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "mr-1.5 size-3.5" }), " Reopen"]
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Return details",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, { items: [
							{
								label: "Order",
								value: order ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
									to: "/orders/$orderId",
									params: { orderId: order.id },
									children: order.id
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: rma.orderId })
							},
							{
								label: "Customer",
								value: customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
									to: "/customers/$customerId",
									params: { customerId: customer.id },
									children: customer.name
								}) : rma.customerName
							},
							{
								label: "Product",
								value: product ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
									to: "/products/$productId",
									params: { productId: product.id },
									children: product.name
								}) : rma.productName
							},
							{
								label: "Serial",
								value: rma.serial ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
									className: "text-foreground",
									children: rma.serial
								}) : "Not serialised"
							},
							{
								label: "Quantity",
								value: rma.qty,
								mono: true
							},
							{
								label: "Condition",
								value: CONDITION_LABEL[rma.condition]
							},
							{
								label: "Requested",
								value: dateTime(rma.createdAt)
							},
							{
								label: "Inspected by",
								value: rma.inspectedBy ?? "Unassigned"
							},
							{
								label: "Resolution",
								value: titleCase(rma.resolution)
							}
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label-tech",
								children: "Customer reason"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[13px] text-foreground",
								children: rma.reason
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Inspection & decision",
						hint: closed ? "This RMA is closed — reopen to make changes." : "Record findings, then approve or reject.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "rma-notes",
										children: "Inspection notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "rma-notes",
										value: notes,
										disabled: closed,
										onChange: (e) => setNotes(e.target.value),
										placeholder: "Findings, tested behaviour, physical condition…"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "rma-resolution",
												children: "Resolution"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: resolution,
												onValueChange: (v) => setResolution(v),
												disabled: closed,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													id: "rma-resolution",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: RESOLUTIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: r,
													children: titleCase(r)
												}, r)) })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "rma-amount",
													children: "Refund amount"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "rma-amount",
													type: "number",
													inputMode: "decimal",
													value: amount,
													disabled: closed || resolution !== "refund",
													onChange: (e) => setAmount(e.target.value)
												}),
												overRefund && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[11px] text-danger",
													children: [
														"Exceeds line value of ",
														money(maxRefund),
														"."
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "rma-method",
												children: "Refund method"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: method,
												onValueChange: (v) => setMethod(v),
												disabled: closed || resolution !== "refund",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													id: "rma-method",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: m,
													children: titleCase(m)
												}, m)) })]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between rounded-md border border-border bg-elevated/40 px-3 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[13px] text-foreground",
											children: "Restock on settlement"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												"Returns ",
												rma.qty,
												" unit(s) of ",
												rma.productName,
												" to available stock."
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: restock,
										onCheckedChange: setRestock,
										disabled: closed
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2 border-t border-border pt-4",
									children: [
										rma.status === "requested" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											onClick: startInspection,
											children: "Start inspection"
										}),
										rma.status === "inspection" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: saveInspection,
												children: "Save notes"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												onClick: approve,
												disabled: overRefund,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "mr-1.5 size-3.5" }), " Approve"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "destructive",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldX, { className: "mr-1.5 size-3.5" }), " Reject"]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Reject this return?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [rma.id, " will be closed as rejected with no refund and no inventory adjustment. You can reopen it afterwards in this demo."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
												onClick: reject,
												children: "Reject return"
											})] })] })] })
										] }),
										rma.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												disabled: overRefund,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mr-1.5 size-3.5" }), resolution === "replacement" ? "Issue replacement" : `Issue refund ${money(refundValue)}`]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
											"Settle ",
											rma.id,
											"?"
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
											resolution === "replacement" ? "A replacement unit will be marked as issued." : `${money(refundValue)} will be recorded as refunded via ${titleCase(method)}.`,
											" ",
											restock ? `${rma.qty} unit(s) will be added back to available stock.` : "No inventory adjustment will be applied.",
											" ",
											"This is simulated demo state — no money moves."
										] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
											onClick: settle,
											children: "Confirm"
										})] })] })] }),
										closed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												"Closed as ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-foreground",
													children: titleCase(rma.status)
												}),
												rma.status === "refunded" ? ` · ${money(rma.refundAmount)} via ${rma.refundMethod ? titleCase(rma.refundMethod) : "—"}` : ""
											]
										})
									]
								})
							]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Financials",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [
								{
									label: "Line value",
									value: money(maxRefund)
								},
								{
									label: "Requested refund",
									value: money(rma.refundAmount || refundValue)
								},
								{
									label: "Method",
									value: rma.refundMethod ? titleCase(rma.refundMethod) : "—"
								},
								{
									label: "Settled",
									value: rma.status === "refunded" ? money(rma.refundAmount) : money(0),
									strong: true
								}
							] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Inventory impact",
							hint: "Simulated adjustment",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
								cols: 2,
								items: [
									{
										label: "On hand",
										value: inv ? inv.onHand : "—",
										mono: true
									},
									{
										label: "Reserved",
										value: inv ? inv.reserved : "—",
										mono: true
									},
									{
										label: "Damaged",
										value: inv ? inv.damaged : "—",
										mono: true
									},
									{
										label: "Restock",
										value: rma.restockedAt ? `Applied ${dateTime(rma.restockedAt)}` : restock ? `+${rma.qty} on settle` : "None",
										mono: true
									}
								]
							}), serial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "label-tech",
									children: "Serial status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mono mt-1 text-xs text-foreground",
									children: [
										serial.serial,
										" · ",
										titleCase(serial.status)
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Timeline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { events: buildTimeline(rma) })
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Returns are settled against local demo state only — no payment gateway refund, accounting entry or supplier RMA is created." })
		]
	});
}
//#endregion
export { ReturnDetailPage as component };
