import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { Mt as ArchiveRestore, O as Pencil, bt as Boxes, jt as Archive } from "./_libs/lucide-react.mjs";
import { G as num, P as useStore, U as money, p as Route$19, q as titleCase, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, n as KeyValue, r as KeyValueGrid } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as ProductFormDialog } from "./_ssr/product-form-dialog-C7AMjbeP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.products._productId-rDMxmtzb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductsProductidPage() {
	const { productId } = Route$19.useParams();
	useNavigate();
	const { productById, invFor, serials, movements, categoryNameOf, archiveProduct, reactivateProduct } = useStore();
	const product = productById(productId);
	const inv = invFor(productId);
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const productSerials = (0, import_react.useMemo)(() => serials.filter((s) => s.productId === productId), [serials, productId]);
	const productMovements = (0, import_react.useMemo)(() => movements.filter((m) => m.productId === productId).sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 20), [movements, productId]);
	if (!product) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Product detail",
			description: "Specifications, pricing, stock and movement history."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Product not found",
			description: "This product may have been removed from the catalog."
		}) })]
	});
	const margin = product.price > 0 ? (product.price - product.cost) / product.price * 100 : 0;
	const available = Math.max(0, (inv?.onHand ?? 0) - (inv?.reserved ?? 0));
	const categoryName = categoryNameOf(product.categoryId);
	const typeLabel = product.productType === "service" ? "Service" : product.productType === "bundle" ? "Bundle / Package" : "Product";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: product.name,
				description: `${product.brand} · ${categoryName} · ${product.sku}`,
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: "active",
						tone: "neutral",
						label: typeLabel
					}), product.archived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: "inactive",
						label: "Archived"
					})]
				}),
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: product.sku }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: ["Price ", money(product.price)]
				})] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "outline",
							className: "gap-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/inventory/$productId",
								params: { productId: product.id },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, { className: "size-3.5" }), " View inventory"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "gap-1.5",
							onClick: () => setEditOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" }), " Edit"]
						}),
						product.archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "gap-1.5",
							onClick: () => {
								reactivateProduct(product.id);
								toast.success(`${product.name} reactivated.`);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveRestore, { className: "size-3.5" }), " Reactivate"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							className: "gap-1.5 text-muted-foreground",
							onClick: () => {
								archiveProduct(product.id);
								toast.success(`${product.name} archived.`);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "size-3.5" }), " Archive"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductFormDialog, {
				open: editOpen,
				onOpenChange: setEditOpen,
				product
			}),
			product.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Description",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-3 text-[13px] leading-relaxed text-muted-foreground",
					children: product.description
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Overview",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 4,
					items: [
						{
							label: "SKU",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
								className: "text-xs",
								children: product.sku
							})
						},
						{
							label: "Brand",
							value: product.brand
						},
						{
							label: "Category",
							value: categoryName
						},
						{
							label: "Type",
							value: typeLabel
						},
						{
							label: "Price",
							value: money(product.price),
							mono: true
						},
						{
							label: "Cost",
							value: money(product.cost),
							mono: true
						},
						{
							label: "Margin",
							value: `${margin.toFixed(1)}%`,
							mono: true
						},
						{
							label: "Warranty",
							value: product.warrantyMonths > 0 ? `${product.warrantyMonths} months` : "None"
						},
						{
							label: "Location",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
								className: "text-xs",
								children: product.location
							})
						},
						{
							label: "Supplier",
							value: product.supplier
						},
						{
							label: "Serial tracked",
							value: product.serialTracked ? "Yes" : "No"
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Specifications",
				hint: "Attributes captured for this product",
				children: Object.keys(product.specs).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No specifications recorded" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3",
					children: Object.entries(product.specs).filter(([, v]) => v !== void 0).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
						label: titleCase(k),
						value: String(v)
					}, k))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Stock summary",
				hint: "Live inventory snapshot",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 4,
					items: [
						{
							label: "On hand",
							value: num(inv?.onHand ?? 0),
							mono: true
						},
						{
							label: "Reserved",
							value: num(inv?.reserved ?? 0),
							mono: true
						},
						{
							label: "Available",
							value: num(available),
							mono: true
						},
						{
							label: "Damaged",
							value: num(inv?.damaged ?? 0),
							mono: true
						},
						{
							label: "Sold",
							value: num(inv?.sold ?? 0),
							mono: true
						},
						{
							label: "Reorder point",
							value: num(inv?.reorderPoint ?? 0),
							mono: true
						}
					]
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
				title: "Recent movements",
				hint: "Last 20 inventory movements",
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
									children: "Reference"
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
export { ProductsProductidPage as component };
