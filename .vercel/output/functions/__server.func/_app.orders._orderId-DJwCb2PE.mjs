import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { P as useStore, U as money, W as moneyExact, h as Route$21, q as titleCase, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, o as TotalsRows, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
import { n as PrintButton } from "./_ssr/document-B0S1Nw0D.mjs";
import { t as Timeline } from "./_ssr/timeline-DiNIO4ot.mjs";
import { t as NewReturnDialog } from "./_ssr/new-return-dialog-C8r59PW9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.orders._orderId-DJwCb2PE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NEXT_STATUS = {
	pending: ["paid", "cancelled"],
	paid: [
		"processing",
		"cancelled",
		"refunded"
	],
	processing: [
		"assembly",
		"ready",
		"cancelled"
	],
	assembly: ["testing", "cancelled"],
	testing: ["ready", "cancelled"],
	ready: ["completed"],
	completed: ["refunded"]
};
function OrdersOrderidPage() {
	const { orderId } = Route$21.useParams();
	const { orders, customerById, updateOrderStatus, warranties, createClaim } = useStore();
	const navigate = useNavigate();
	const order = orders.find((o) => o.id === orderId);
	const [claimOpen, setClaimOpen] = (0, import_react.useState)(false);
	const [claimWarrantyId, setClaimWarrantyId] = (0, import_react.useState)(null);
	const [claimReason, setClaimReason] = (0, import_react.useState)("");
	if (!order) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Order detail",
			description: "Line items, payment breakdown and receipt actions."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Order not found",
			description: `No order matches "${orderId}". It may have been removed from the demo dataset.`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => navigate({ to: "/orders" }),
				children: "Back to orders"
			})
		}) })]
	});
	const customer = customerById(order.customerId);
	const nextOptions = NEXT_STATUS[order.status] ?? [];
	const orderWarranties = warranties.filter((w) => w.orderId === order.id);
	const isReturnable = order.status !== "pending" && order.status !== "cancelled";
	const advance = (status) => {
		updateOrderStatus(order.id, status);
		toast.success(`Order ${order.id} set to ${titleCase(status)}`);
	};
	const claimWarranty = claimWarrantyId ? warranties.find((w) => w.id === claimWarrantyId) : void 0;
	const fileClaim = () => {
		if (!claimWarranty || !claimReason.trim()) return;
		const claim = createClaim(claimWarranty.id, claimReason.trim());
		toast.success(`Warranty claim ${claim.id} filed for serial ${claimWarranty.serial}.`);
		setClaimReason("");
		setClaimWarrantyId(null);
		setClaimOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono",
					children: order.id
				}),
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: order.status }),
				description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					titleCase(order.type),
					" order for",
					" ",
					order.customerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
						to: "/customers/$customerId",
						params: { customerId: order.customerId },
						children: order.customerName
					}) : order.customerName,
					" ",
					"· placed ",
					dateTime(order.createdAt)
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintButton, { label: "Print receipt" }),
					nextOptions.filter((s) => s !== "cancelled" && s !== "refunded").map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => advance(s),
						children: ["Mark ", titleCase(s)]
					}, s)),
					nextOptions.includes("cancelled") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							children: "Cancel"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
						"Cancel order ",
						order.id,
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "The order will be marked cancelled and can no longer be advanced toward fulfillment. This can be undone only by moving it through a forward workflow." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						onClick: () => advance("cancelled"),
						children: "Cancel order"
					})] })] })] }),
					nextOptions.includes("refunded") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							children: "Refund"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
						"Refund order ",
						order.id,
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
						"Records a refund of ",
						money(order.total),
						" against this order and marks it refunded. Issued refunds are tracked in the shift and returns workflows."
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						onClick: () => advance("refunded"),
						children: "Issue refund"
					})] })] })] }),
					isReturnable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewReturnDialog, { order })
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: claimOpen,
				onOpenChange: setClaimOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "File a warranty claim" }), claimWarranty && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mono text-xs text-muted-foreground",
						children: [
							claimWarranty.productName,
							" · serial ",
							claimWarranty.serial
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "claim-reason",
							children: "Reason"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "claim-reason",
							rows: 3,
							value: claimReason,
							onChange: (e) => setClaimReason(e.target.value),
							placeholder: "Describe the fault or defect"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setClaimOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: fileClaim,
						disabled: !claimReason.trim(),
						children: "File claim"
					})] })
				] })
			}),
			(order.buildId || order.quoteId) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4 text-xs text-muted-foreground",
				children: [order.quoteId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"From quote",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
						to: "/quotes/$quoteId",
						params: { quoteId: order.quoteId },
						children: order.quoteId
					})
				] }), order.buildId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Linked build",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
						to: "/builds/$buildId",
						params: { buildId: order.buildId },
						children: order.buildId
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Line items",
						hint: `${order.items.length} SKU(s)`,
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
											children: "Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "label-tech px-4 py-2.5 text-right font-normal",
											children: "Qty"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "label-tech px-4 py-2.5 text-right font-normal",
											children: "Unit price"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "label-tech px-4 py-2.5 text-right font-normal",
											children: "Line total"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: order.items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/60 last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "mono px-4 py-2.5 text-xs text-muted-foreground",
											children: it.sku
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-foreground",
												children: it.name
											}), it.serials && it.serials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mono mt-0.5 text-[10.5px] text-subtle",
												children: [
													"S/N:",
													" ",
													it.serials.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: "/serials",
														search: { serial: s },
														className: "underline decoration-border underline-offset-2 transition-colors hover:text-foreground",
														children: s
													}, s))
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "mono px-4 py-2.5 text-right tabular-nums",
											children: it.qty
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "mono px-4 py-2.5 text-right tabular-nums",
											children: moneyExact(it.unitPrice)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "mono px-4 py-2.5 text-right tabular-nums",
											children: moneyExact(it.qty * it.unitPrice)
										})
									]
								}, it.productId)) })]
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Timeline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { events: order.timeline })
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Totals",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [
									{
										label: "Subtotal",
										value: moneyExact(order.subtotal)
									},
									{
										label: "Discount",
										value: `−${moneyExact(order.discount)}`,
										muted: order.discount === 0
									},
									{
										label: "Service total",
										value: moneyExact(order.serviceTotal),
										muted: order.serviceTotal === 0
									},
									{
										label: "VAT (12%)",
										value: moneyExact(order.tax)
									},
									{
										label: "Total",
										value: money(order.total),
										strong: true
									}
								] })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Payment",
							children: order.payment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
								cols: 2,
								items: [
									{
										label: "Method",
										value: titleCase(order.payment.method)
									},
									{
										label: "Amount",
										value: moneyExact(order.payment.amount),
										mono: true
									},
									{
										label: "Reference",
										value: order.payment.reference ?? "—",
										mono: true
									},
									{
										label: "Tendered",
										value: order.payment.tendered !== void 0 ? moneyExact(order.payment.tendered) : "—",
										mono: true
									},
									{
										label: "Change",
										value: order.payment.change ? moneyExact(order.payment.change) : "—",
										mono: true
									},
									{
										label: "Paid at",
										value: dateTime(order.payment.at)
									}
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									title: "No payment recorded",
									description: "This order has not been paid yet."
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Warranties",
							children: orderWarranties.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border/60",
								children: orderWarranties.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 px-4 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/warranty/$warrantyId",
											params: { warrantyId: w.id },
											className: "mono block text-xs text-foreground underline decoration-border underline-offset-2 hover:text-foreground",
											children: w.serial
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-[11.5px] text-muted-foreground",
											children: [
												w.productName,
												" · expires ",
												dateTime(w.expiresAt)
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "shrink-0",
										onClick: () => {
											setClaimWarrantyId(w.id);
											setClaimOpen(true);
										},
										children: "File claim"
									})]
								}, w.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									title: "No warranties",
									description: "No covered serials were sold with this order."
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Customer & cashier",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
								cols: 2,
								items: [
									{
										label: "Customer",
										value: order.customerName
									},
									{
										label: "Contact",
										value: customer?.phone ?? customer?.email ?? "Walk-in"
									},
									{
										label: "Cashier",
										value: order.cashier
									},
									{
										label: "Order type",
										value: titleCase(order.type)
									}
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Status transitions and refunds are simulated locally — no payment gateway or inventory reversal is triggered." })
					]
				})]
			})
		]
	});
}
//#endregion
export { OrdersOrderidPage as component };
