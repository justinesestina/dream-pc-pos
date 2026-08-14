import { _ as useNavigate, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { G as num, O as useOps, R as dateShort, U as money, f as Route$17 } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, i as ProgressBar, o as TotalsRows, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { n as PrintButton } from "./_ssr/document-B0S1Nw0D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.purchasing._poId-B92h3mS8.js
var import_jsx_runtime = require_jsx_runtime();
var NEXT_STATUS = {
	draft: "submitted",
	submitted: "confirmed"
};
function PurchaseOrderDetailPage() {
	const { poId } = Route$17.useParams();
	const { poById, setPoStatus, startReceipt, receipts } = useOps();
	const navigate = useNavigate();
	const po = poById(poId);
	if (!po) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Purchase Order",
			description: "Purchase order lines, costs and receiving progress."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Purchase order not found",
			description: `No purchase order matches ${poId}.`
		}) })]
	});
	const inProgressReceipt = receipts.find((r) => r.purchaseOrderId === po.id && r.status === "in_progress");
	const anyReceipt = receipts.find((r) => r.purchaseOrderId === po.id);
	const canReceive = [
		"submitted",
		"confirmed",
		"partial"
	].includes(po.status) && !inProgressReceipt;
	const next = NEXT_STATUS[po.status];
	const handleStartReceiving = () => {
		const receipt = startReceipt(po.id);
		if (!receipt) {
			toast.error("Could not start receiving for this purchase order.");
			return;
		}
		toast.success(`Receiving started — ${receipt.id}`);
		navigate({
			to: "/receiving/$receiptId",
			params: { receiptId: receipt.id }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
					className: "text-[19px] text-foreground",
					children: po.id
				}),
				description: "Purchase order lines, costs and receiving progress.",
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: po.status }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintButton, { label: "Print PO" }),
					next && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setPoStatus(po.id, next),
						children: ["Mark as ", next]
					}),
					po.status !== "cancelled" && po.status !== "received" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "text-destructive",
							children: "Cancel PO"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
						"Cancel ",
						po.id,
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "The purchase order will be marked cancelled. Any partial deliveries already received stay in inventory." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep PO" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						onClick: () => setPoStatus(po.id, "cancelled"),
						children: "Cancel PO"
					})] })] })] }),
					canReceive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: handleStartReceiving,
						children: "Start receiving"
					}),
					anyReceipt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/receiving/$receiptId",
							params: { receiptId: anyReceipt.id },
							children: ["View receipt ", anyReceipt.id]
						})
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Supplier",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 4,
					items: [
						{
							label: "Supplier",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/suppliers/$supplierId",
								params: { supplierId: po.supplierId },
								children: po.supplierName
							})
						},
						{
							label: "Created",
							value: dateShort(po.createdAt)
						},
						{
							label: "Expected",
							value: dateShort(po.expectedAt)
						},
						{
							label: "Created by",
							value: po.createdBy
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Lines",
				hint: `${po.lines.length} line item(s)`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
									children: "Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 text-right font-normal",
									children: "Received"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 text-right font-normal",
									children: "Unit cost"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 text-right font-normal",
									children: "Line total"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 font-normal",
									children: "Progress"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: po.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60 last:border-0",
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
										children: num(l.qty)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono tabular-nums",
										children: num(l.received)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono tabular-nums",
										children: money(l.unitCost)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono tabular-nums",
										children: money(l.qty * l.unitCost)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
											value: l.received / l.qty * 100,
											tone: l.received >= l.qty ? "success" : "info",
											className: "w-20"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mono text-[11px] text-subtle",
											children: [Math.round(l.received / l.qty * 100), "%"]
										})]
									})
								})
							]
						}, l.productId)) })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end border-t border-border p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [{
						label: "Lines total",
						value: money(po.total)
					}, {
						label: "Total",
						value: money(po.total),
						strong: true
					}] })
				})]
			}),
			po.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Notes",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-4 text-[13px] text-muted-foreground",
					children: po.notes
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Status transitions and receiving are simulated locally — no supplier EDI or accounting integration exists in this demo." })
		]
	});
}
//#endregion
export { PurchaseOrderDetailPage as component };
