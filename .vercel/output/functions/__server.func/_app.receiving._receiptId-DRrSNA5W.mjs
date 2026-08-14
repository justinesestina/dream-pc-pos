import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { G as num, L as cn, O as useOps, P as useStore, R as dateShort, u as Route$13 } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.receiving._receiptId-DRrSNA5W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReceiptDetailPage() {
	const { receiptId } = Route$13.useParams();
	const { receiptById, updateReceiptLine, setReceiptNotes, completeReceipt } = useOps();
	const { adjustStock, registerSerials, productById } = useStore();
	const receipt = receiptById(receiptId);
	const [notesDraft, setNotesDraft] = (0, import_react.useState)(receipt?.notes ?? "");
	if (!receipt) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Goods Receipt",
			description: "Receive items, record damage and capture serial numbers."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Receipt not found",
			description: `No goods receipt matches ${receiptId}.`
		}) })]
	});
	const locked = receipt.status !== "in_progress";
	const serialIssue = receipt.lines.find((l) => {
		if (!productById(l.productId)?.serialTracked || l.received === 0) return false;
		return l.serials.length !== l.received;
	});
	const handleComplete = () => {
		if (serialIssue) {
			toast.error(`${serialIssue.name}: expected ${serialIssue.received} serial number(s) but found ${serialIssue.serials.length}.`);
			return;
		}
		completeReceipt(receipt.id, (productId, qty, ref) => adjustStock(productId, qty, `Goods receipt ${ref}`), (productId, serials, ref) => registerSerials(productId, serials, ref));
		toast.success(`Receipt ${receipt.id} completed and stock posted.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
					className: "text-[19px] text-foreground",
					children: receipt.id
				}),
				description: "Receive items, record damage and capture serial numbers.",
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: receipt.status }),
				actions: !locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: handleComplete,
					children: "Complete receipt"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Reference",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 4,
					items: [
						{
							label: "Purchase order",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/purchasing/$poId",
								params: { poId: receipt.purchaseOrderId },
								children: receipt.purchaseOrderId
							})
						},
						{
							label: "Supplier",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/suppliers/$supplierId",
								params: { supplierId: receipt.supplierId },
								children: receipt.supplierName
							})
						},
						{
							label: "Received by",
							value: receipt.receivedBy
						},
						{
							label: "Date",
							value: dateShort(receipt.receivedAt)
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Lines",
				hint: "Enter received and damaged quantities per line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full border-collapse text-left text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 font-normal",
									children: "SKU"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 font-normal",
									children: "Product"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 text-right font-normal",
									children: "Expected"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 text-right font-normal",
									children: "Received"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 text-right font-normal",
									children: "Damaged"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 font-normal",
									children: "Serials"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: receipt.lines.map((l) => {
							const mismatch = l.received !== l.expected || l.damaged > 0;
							const serialCount = l.serials.length;
							const dupSerials = serialCount !== new Set(l.serials).size;
							const serialMismatch = l.received > 0 && serialCount !== l.received;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: cn("border-b border-border/60 last:border-0", mismatch && "bg-warning/5"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: l.sku })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-foreground",
										children: l.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono tabular-nums",
											children: num(l.expected)
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 0,
											disabled: locked,
											value: l.received,
											onChange: (e) => {
												const r = Math.min(Math.max(0, Number(e.target.value) || 0), l.expected);
												updateReceiptLine(receipt.id, l.productId, {
													received: r,
													damaged: Math.min(l.damaged, r)
												});
											},
											className: cn("h-8 w-20 text-right", mismatch && "border-warning/50 text-warning")
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 0,
											disabled: locked,
											value: l.damaged,
											onChange: (e) => {
												const d = Math.max(0, Number(e.target.value) || 0);
												updateReceiptLine(receipt.id, l.productId, { damaged: Math.min(d, l.received) });
											},
											className: "h-8 w-20 text-right"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												disabled: locked,
												placeholder: "Comma-separated serials",
												defaultValue: l.serials.join(", "),
												onBlur: (e) => updateReceiptLine(receipt.id, l.productId, { serials: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }),
												className: cn("h-8 min-w-[12rem] text-xs", (serialMismatch || dupSerials) && "border-warning/50")
											}),
											serialMismatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-[11px] text-warning",
												children: [
													serialCount,
													" serial(s) entered, ",
													l.received,
													" expected."
												]
											}),
											dupSerials && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[11px] text-destructive",
												children: "Duplicate serials detected."
											})
										]
									})
								]
							}, l.productId);
						}) })]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Notes",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2 p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 3,
						disabled: locked,
						value: notesDraft,
						onChange: (e) => setNotesDraft(e.target.value),
						onBlur: () => setReceiptNotes(receipt.id, notesDraft),
						placeholder: "Notes about condition, shortages or supplier communication"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Completing this receipt posts stock movements to inventory via the demo store — no warehouse scanner integration exists." })
		]
	});
}
//#endregion
export { ReceiptDetailPage as component };
