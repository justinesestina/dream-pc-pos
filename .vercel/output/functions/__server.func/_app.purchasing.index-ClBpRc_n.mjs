import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { T as Plus, d as Trash2 } from "./_libs/lucide-react.mjs";
import { B as daysUntil, G as num, N as useSimulatedLoad, O as useOps, P as useStore, R as dateShort, U as money } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.purchasing.index-ClBpRc_n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewPurchaseOrderDialog() {
	const { products } = useStore();
	const { suppliers, createPurchaseOrder } = useOps();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [supplierId, setSupplierId] = (0, import_react.useState)("");
	const [expectedAt, setExpectedAt] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([{
		productId: "",
		qty: "1",
		unitCost: ""
	}]);
	const total = (0, import_react.useMemo)(() => lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unitCost) || 0), 0), [lines]);
	const reset = () => {
		setSupplierId("");
		setExpectedAt("");
		setLines([{
			productId: "",
			qty: "1",
			unitCost: ""
		}]);
	};
	const updateLine = (i, patch) => setLines((prev) => prev.map((l, idx) => idx === i ? {
		...l,
		...patch
	} : l));
	const addLine = () => setLines((prev) => [...prev, {
		productId: "",
		qty: "1",
		unitCost: ""
	}]);
	const removeLine = (i) => setLines((prev) => prev.filter((_, idx) => idx !== i));
	const submit = () => {
		if (!supplierId) {
			toast.error("Select a supplier.");
			return;
		}
		if (!expectedAt) {
			toast.error("Set an expected delivery date.");
			return;
		}
		const validLines = lines.filter((l) => l.productId && Number(l.qty) > 0).map((l) => {
			const p = products.find((x) => x.id === l.productId);
			return {
				productId: p.id,
				name: p.name,
				sku: p.sku,
				qty: Number(l.qty),
				unitCost: Number(l.unitCost) || p.cost
			};
		});
		if (validLines.length === 0) {
			toast.error("Add at least one line with a product and quantity.");
			return;
		}
		const po = createPurchaseOrder({
			supplierId,
			lines: validLines,
			expectedAt: new Date(expectedAt).toISOString()
		});
		if (!po) {
			toast.error("Could not create purchase order.");
			return;
		}
		toast.success(`Purchase order ${po.id} created.`);
		setOpen(false);
		reset();
		navigate({
			to: "/purchasing/$poId",
			params: { poId: po.id }
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New purchase order"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New purchase order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Pick a supplier, add product lines and set the expected delivery date." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "po-supplier",
									children: "Supplier"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: supplierId,
									onValueChange: setSupplierId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "po-supplier",
										className: "w-full",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select supplier" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s.id,
										children: s.name
									}, s.id)) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "expected",
									children: "Expected delivery"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "expected",
									type: "date",
									value: expectedAt,
									onChange: (e) => setExpectedAt(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "po-lines",
									children: "Lines"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 gap-1 text-xs",
									onClick: addLine,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add line"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2 rounded-md border border-border p-2",
								children: lines.map((l, i) => {
									const product = products.find((p) => p.id === l.productId);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: l.productId,
												onValueChange: (v) => {
													const p = products.find((x) => x.id === v);
													updateLine(i, {
														productId: v,
														unitCost: p ? String(p.cost) : l.unitCost
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 flex-1 text-xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Product" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: p.id,
													children: [
														p.name,
														" (",
														p.sku,
														")"
													]
												}, p.id)) })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: 1,
												value: l.qty,
												onChange: (e) => updateLine(i, { qty: e.target.value }),
												className: "h-8 w-16 text-xs",
												placeholder: "Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: 0,
												value: l.unitCost,
												onChange: (e) => updateLine(i, { unitCost: e.target.value }),
												className: "h-8 w-24 text-xs",
												placeholder: product ? String(product.cost) : "Cost"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "icon",
												variant: "ghost",
												className: "size-7 shrink-0 text-muted-foreground",
												onClick: () => removeLine(i),
												disabled: lines.length === 1,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
											})
										]
									}, i);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mono text-right text-xs text-muted-foreground",
							children: ["Estimated total: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: money(total)
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
					children: "Create purchase order"
				})] })
			]
		})]
	});
}
var OPEN_STATUSES = [
	"draft",
	"submitted",
	"confirmed",
	"partial"
];
function PurchasingIndexPage() {
	const { purchaseOrders, suppliers } = useOps();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [supplier, setSupplier] = (0, import_react.useState)("all");
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return purchaseOrders.filter((po) => {
			if (query) {
				if (!`${po.id} ${po.supplierName}`.toLowerCase().includes(query)) return false;
			}
			if (status !== "all" && po.status !== status) return false;
			if (supplier !== "all" && po.supplierId !== supplier) return false;
			return true;
		});
	}, [
		purchaseOrders,
		q,
		status,
		supplier
	]);
	const stats = (0, import_react.useMemo)(() => {
		const now = /* @__PURE__ */ new Date();
		let openCount = 0;
		let valueOnOrder = 0;
		let overdue = 0;
		let receivedThisMonth = 0;
		for (const po of purchaseOrders) {
			if (OPEN_STATUSES.includes(po.status)) {
				openCount++;
				valueOnOrder += po.total;
				if (daysUntil(po.expectedAt) < 0) overdue++;
			}
			if (po.status === "received" && po.receivedAt && new Date(po.receivedAt).getMonth() === now.getMonth() && new Date(po.receivedAt).getFullYear() === now.getFullYear()) receivedThisMonth++;
		}
		return {
			openCount,
			valueOnOrder,
			overdue,
			receivedThisMonth
		};
	}, [purchaseOrders]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Purchasing",
				description: "Purchase orders, supplier commitments and expected deliveries.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewPurchaseOrderDialog, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open POs",
						numericValue: stats.openCount,
						format: (n) => num(Math.round(n)),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Value on order",
						numericValue: stats.valueOnOrder,
						format: (n) => money(Math.round(n)),
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Overdue deliveries",
						numericValue: stats.overdue,
						format: (n) => num(Math.round(n)),
						accent: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Received this month",
						numericValue: stats.receivedThisMonth,
						format: (n) => num(Math.round(n)),
						accent: "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search PO ID or supplier…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					label: "Status",
					options: [
						"draft",
						"submitted",
						"confirmed",
						"partial",
						"received",
						"cancelled"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: supplier,
					onChange: setSupplier,
					label: "Supplier",
					options: suppliers.map((s) => s.id)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: purchaseOrders.length,
					noun: "purchase orders"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "id",
						header: "PO ID",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-foreground",
							children: r.id
						}),
						sortValue: (r) => r.id
					},
					{
						key: "supplier",
						header: "Supplier",
						cell: (r) => r.supplierName,
						sortValue: (r) => r.supplierName,
						className: "min-w-[10rem]"
					},
					{
						key: "created",
						header: "Created",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono text-xs",
							children: dateShort(r.createdAt)
						}),
						sortValue: (r) => r.createdAt
					},
					{
						key: "expected",
						header: "Expected",
						cell: (r) => {
							const overdue = daysUntil(r.expectedAt) < 0 && !["received", "cancelled"].includes(r.status);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: overdue ? "mono text-xs text-destructive" : "mono text-xs",
								children: dateShort(r.expectedAt)
							});
						},
						sortValue: (r) => r.expectedAt
					},
					{
						key: "lines",
						header: "Lines",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: num(r.lines.length)
						}),
						sortValue: (r) => r.lines.length,
						align: "right"
					},
					{
						key: "total",
						header: "Total",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: money(r.total)
						}),
						sortValue: (r) => r.total,
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
					to: "/purchasing/$poId",
					params: { poId: r.id }
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No purchase orders match",
					description: "Try clearing the search or filters."
				})
			})] })
		]
	});
}
//#endregion
export { PurchasingIndexPage as component };
