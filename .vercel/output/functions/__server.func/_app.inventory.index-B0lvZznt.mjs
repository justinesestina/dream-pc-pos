import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { h as SlidersHorizontal } from "./_libs/lucide-react.mjs";
import { G as num, L as cn, N as useSimulatedLoad, P as useStore } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, i as Segmented, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.inventory.index-B0lvZznt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdjustStockDialog({ productId, productName, trigger }) {
	const { adjustStock } = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [delta, setDelta] = (0, import_react.useState)("0");
	const [note, setNote] = (0, import_react.useState)("");
	const submit = () => {
		const n = Number(delta);
		if (!Number.isFinite(n) || n === 0) {
			toast.error("Enter a non-zero quantity.");
			return;
		}
		if (!note.trim()) {
			toast.error("A note is required for stock adjustments.");
			return;
		}
		adjustStock(productId, n, note.trim());
		toast.success(`Stock adjusted for ${productName} (${n > 0 ? "+" : ""}${n})`);
		setOpen(false);
		setDelta("0");
		setNote("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			onClick: (e) => e.stopPropagation(),
			children: trigger ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				className: "h-7 gap-1.5 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-3.5" }), " Adjust"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			onClick: (e) => e.stopPropagation(),
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Adjust stock — ", productName] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Positive values increase on-hand quantity, negative values decrease it. This is recorded as a manual adjustment movement." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "delta",
							children: "Quantity delta"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "delta",
							type: "number",
							value: delta,
							onChange: (e) => setDelta(e.target.value),
							className: cn("mono")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "note",
							children: "Note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "note",
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: "Reason for adjustment (e.g. cycle count correction, damage found)",
							rows: 3
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					children: "Save adjustment"
				})] })
			]
		})]
	});
}
function stockStatus(onHand, reorderPoint) {
	if (onHand <= 0) return "out_of_stock";
	if (onHand <= reorderPoint) return "low_stock";
	return "in_stock";
}
function InventoryPage() {
	const { inventory, productById, categories } = useStore();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [onlyReorder, setOnlyReorder] = (0, import_react.useState)("all");
	const rows = (0, import_react.useMemo)(() => inventory.map((i) => ({
		...i,
		id: i.productId
	})), [inventory]);
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return rows.filter((r) => {
			const product = productById(r.productId);
			if (query) {
				if (!`${product?.name ?? ""} ${product?.sku ?? ""}`.toLowerCase().includes(query)) return false;
			}
			if (category !== "all" && product?.categoryId !== category) return false;
			if (onlyReorder === "reorder" && r.onHand > r.reorderPoint) return false;
			return true;
		});
	}, [
		rows,
		q,
		category,
		onlyReorder,
		productById
	]);
	const stats = (0, import_react.useMemo)(() => {
		let onHand = 0;
		let reserved = 0;
		let damaged = 0;
		let below = 0;
		for (const r of rows) {
			onHand += r.onHand;
			reserved += r.reserved;
			damaged += r.damaged;
			if (r.onHand <= r.reorderPoint) below++;
		}
		return {
			onHand,
			reserved,
			damaged,
			below
		};
	}, [rows]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Inventory",
				description: "Stock on hand, reserved units, reorder points and serials."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Units on hand",
						numericValue: stats.onHand,
						format: (n) => num(Math.round(n)),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Reserved",
						numericValue: stats.reserved,
						format: (n) => num(Math.round(n)),
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Damaged",
						numericValue: stats.damaged,
						format: (n) => num(Math.round(n)),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Below reorder point",
						numericValue: stats.below,
						format: (n) => num(Math.round(n)),
						accent: "danger"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search product or SKU…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: category,
					onChange: setCategory,
					options: categories.filter((c) => !c.archived).sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({
						value: c.id,
						label: c.name
					})),
					label: "Category"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
					value: onlyReorder,
					onChange: setOnlyReorder,
					options: [{
						value: "all",
						label: "All"
					}, {
						value: "reorder",
						label: "Needs reorder"
					}]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: rows.length,
					noun: "items"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "sku",
						header: "SKU",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: productById(r.productId)?.sku ?? "—" }),
						sortValue: (r) => productById(r.productId)?.sku ?? ""
					},
					{
						key: "product",
						header: "Product",
						cell: (r) => {
							const p = productById(r.productId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-[13px] text-foreground",
									children: p?.name ?? "Unknown product"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 truncate text-[11px] text-muted-foreground",
									children: p?.brand
								})]
							});
						},
						sortValue: (r) => productById(r.productId)?.name ?? "",
						className: "min-w-[14rem]"
					},
					{
						key: "onhand",
						header: "On hand",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: num(r.onHand)
						}),
						sortValue: (r) => r.onHand,
						align: "right"
					},
					{
						key: "reserved",
						header: "Reserved",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums text-muted-foreground",
							children: num(r.reserved)
						}),
						sortValue: (r) => r.reserved,
						align: "right"
					},
					{
						key: "available",
						header: "Available",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: num(Math.max(0, r.onHand - r.reserved))
						}),
						sortValue: (r) => Math.max(0, r.onHand - r.reserved),
						align: "right"
					},
					{
						key: "damaged",
						header: "Damaged",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums text-muted-foreground",
							children: num(r.damaged)
						}),
						sortValue: (r) => r.damaged,
						align: "right"
					},
					{
						key: "reorder",
						header: "Reorder pt.",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums text-subtle",
							children: num(r.reorderPoint)
						}),
						sortValue: (r) => r.reorderPoint,
						align: "right"
					},
					{
						key: "status",
						header: "Status",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: stockStatus(r.onHand, r.reorderPoint) }),
						align: "right"
					},
					{
						key: "actions",
						header: "",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdjustStockDialog, {
							productId: r.productId,
							productName: productById(r.productId)?.name ?? r.productId
						}),
						align: "right"
					}
				],
				loading,
				onRowClick: (r) => navigate({
					to: "/inventory/$productId",
					params: { productId: r.productId }
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No inventory items match",
					description: "Try clearing the search or filter."
				})
			})] })
		]
	});
}
//#endregion
export { InventoryPage as component };
