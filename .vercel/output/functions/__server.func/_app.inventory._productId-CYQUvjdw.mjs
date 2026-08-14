import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { j as Package } from "./_libs/lucide-react.mjs";
import { G as num, P as useStore, g as Route$23, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, i as ProgressBar, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.inventory._productId-CYQUvjdw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InventoryItemPage() {
	const { productId } = Route$23.useParams();
	const { productById, invFor, serials, movements, adjustStock } = useStore();
	const product = productById(productId);
	const inv = invFor(productId);
	const [delta, setDelta] = (0, import_react.useState)("0");
	const [note, setNote] = (0, import_react.useState)("");
	const productSerials = (0, import_react.useMemo)(() => serials.filter((s) => s.productId === productId), [serials, productId]);
	const productMovements = (0, import_react.useMemo)(() => movements.filter((m) => m.productId === productId).sort((a, b) => +new Date(b.at) - +new Date(a.at)), [movements, productId]);
	if (!product) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Stock Item",
			description: "Stock levels, movements and serial numbers for one product."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Product not found",
			description: "This inventory item does not exist."
		}) })]
	});
	const onHand = inv?.onHand ?? 0;
	const reorderPoint = inv?.reorderPoint ?? 0;
	const reserved = inv?.reserved ?? 0;
	const available = Math.max(0, onHand - reserved);
	const ratio = reorderPoint > 0 ? Math.min(100, onHand / (reorderPoint * 2) * 100) : 100;
	const tone = onHand <= 0 ? "warning" : onHand <= reorderPoint ? "warning" : "success";
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
		toast.success(`Stock adjusted (${n > 0 ? "+" : ""}${n})`);
		setDelta("0");
		setNote("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: `Stock — ${product.name}`,
				description: "Stock levels, movements and serial numbers for one product.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: product.sku }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "outline",
					className: "gap-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/products/$productId",
						params: { productId: product.id },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-3.5" }), " View product"]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "On hand",
						numericValue: onHand,
						format: (n) => num(Math.round(n)),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Reserved",
						numericValue: reserved,
						format: (n) => num(Math.round(n)),
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Available",
						numericValue: available,
						format: (n) => num(Math.round(n)),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Damaged",
						numericValue: inv?.damaged ?? 0,
						format: (n) => num(Math.round(n)),
						accent: "warning"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Reorder status",
				hint: `Reorder point: ${num(reorderPoint)}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["On hand: ", num(onHand)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: onHand <= 0 ? "out_of_stock" : onHand <= reorderPoint ? "low_stock" : "in_stock" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
						value: ratio,
						tone
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Adjust stock",
				hint: "Manual correction, recorded as a movement",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-[10rem_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "inv-delta",
								children: "Quantity delta"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "inv-delta",
								type: "number",
								className: "mono",
								value: delta,
								onChange: (e) => setDelta(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "inv-note",
								children: "Note"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "inv-note",
								value: note,
								onChange: (e) => setNote(e.target.value),
								rows: 2,
								placeholder: "Reason for adjustment"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Adjustments write directly to local demo state; no backend sync occurs." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: submit,
							className: "shrink-0",
							children: "Save adjustment"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Serial numbers",
				hint: `${productSerials.length} tracked units`,
				children: productSerials.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No serials tracked",
					description: "This product has no individual serial records."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border",
					children: productSerials.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-4 px-4 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-xs",
							children: s.serial
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [s.orderId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/orders/$orderId",
								params: { orderId: s.orderId },
								children: s.orderId
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: s.status })]
						})]
					}, s.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Movement history",
				hint: `${productMovements.length} recorded movements`,
				children: productMovements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No movement history" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full border-collapse text-left text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 font-normal",
									children: "Type"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 text-right font-normal",
									children: "Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 font-normal",
									children: "Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 font-normal",
									children: "Actor"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "label-tech px-4 py-2.5 font-normal",
									children: "Reference / note"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: productMovements.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60 last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										status: m.type,
										tone: "neutral"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: `px-4 py-2.5 text-right mono tabular-nums ${m.qty >= 0 ? "text-success" : "text-destructive"}`,
									children: [m.qty >= 0 ? "+" : "", m.qty]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5 text-xs text-muted-foreground",
									children: dateTime(m.at)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5 text-xs text-muted-foreground",
									children: m.actor
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5 text-xs text-muted-foreground",
									children: m.reference ?? m.note ?? "—"
								})
							]
						}, m.id)) })]
					})
				})
			})
		]
	});
}
//#endregion
export { InventoryItemPage as component };
