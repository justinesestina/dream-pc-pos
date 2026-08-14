import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { T as Plus } from "../_libs/lucide-react.mjs";
import { O as useOps, P as useStore } from "./router-DXywCOrU.mjs";
import { t as Button } from "./button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-BfrlgkCy.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CUklKTiM.mjs";
import { t as Input } from "./input-DjMJnh0q.mjs";
import { t as Label } from "./label-DIE5zrQN.mjs";
import { t as Textarea } from "./textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-return-dialog-C8r59PW9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewReturnDialog({ order }) {
	const { orders, productById } = useStore();
	const { createReturn } = useOps();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [orderId, setOrderId] = (0, import_react.useState)(order?.id ?? "");
	const [productId, setProductId] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [reason, setReason] = (0, import_react.useState)("");
	const [condition, setCondition] = (0, import_react.useState)("used_good");
	const reset = () => {
		setOrderId(order?.id ?? "");
		setProductId("");
		setQty("1");
		setReason("");
		setCondition("used_good");
	};
	const selectedOrder = (0, import_react.useMemo)(() => orders.find((o) => o.id === orderId), [orders, orderId]);
	const effective = order ?? selectedOrder;
	const availableItems = effective?.items ?? [];
	const submit = () => {
		if (!effective) {
			toast.error("Select an order.");
			return;
		}
		const item = availableItems.find((i) => i.productId === productId);
		if (!item) {
			toast.error("Select the returned product.");
			return;
		}
		if (!reason.trim()) {
			toast.error("Enter a return reason.");
			return;
		}
		const product = productById(productId);
		const rma = createReturn({
			orderId: effective.id,
			customerId: effective.customerId,
			customerName: effective.customerName,
			productId,
			productName: product?.name ?? item.name,
			qty: Number(qty) || 1,
			reason: reason.trim(),
			condition,
			resolution: "none",
			refundMethod: null,
			refundAmount: 0,
			restock: false
		});
		toast.success(`Return ${rma.id} created.`);
		setOpen(false);
		reset();
		navigate({
			to: "/returns/$returnId",
			params: { returnId: rma.id }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (v) => {
			setOpen(v);
			if (!v) reset();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "h-8 gap-1.5 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New return"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New return request" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create an RMA against an existing order." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						!order && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rma-order",
								children: "Order"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: orderId,
								onValueChange: (v) => {
									setOrderId(v);
									setProductId("");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "rma-order",
									className: "w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select order" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: o.id,
									children: [
										o.id,
										" — ",
										o.customerName
									]
								}, o.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "rma-product",
									children: "Product"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: productId,
									onValueChange: setProductId,
									disabled: !effective,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "rma-product",
										className: "w-full",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select item" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableItems.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: i.productId,
										children: i.name
									}, i.productId)) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "qty",
									children: "Quantity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "qty",
									type: "number",
									min: 1,
									value: qty,
									onChange: (e) => setQty(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rma-condition",
								children: "Condition"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: condition,
								onValueChange: (v) => setCondition(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "rma-condition",
									className: "w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "sealed",
										children: "Sealed"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "used_good",
										children: "Used — good"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "used_damaged",
										children: "Used — damaged"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "defective",
										children: "Defective"
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "reason",
								children: "Reason"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "reason",
								rows: 3,
								value: reason,
								onChange: (e) => setReason(e.target.value),
								placeholder: "Customer-reported reason for the return"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					children: "Create return"
				})] })
			]
		})]
	});
}
//#endregion
export { NewReturnDialog as t };
