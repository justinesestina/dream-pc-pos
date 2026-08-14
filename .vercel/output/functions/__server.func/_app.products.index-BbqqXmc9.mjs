import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { G as num, N as useSimulatedLoad, P as useStore, U as money, m as Route$20 } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, i as Segmented, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as ProductFormDialog } from "./_ssr/product-form-dialog-C7AMjbeP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.products.index-BbqqXmc9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CategoryFormDialog({ open, onOpenChange, category }) {
	const store = useStore();
	const isEdit = Boolean(category);
	const [name, setName] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setName(category?.name ?? "");
	}, [open, category]);
	const submit = () => {
		if (!name.trim()) {
			toast.error("Category name is required.");
			return;
		}
		if (isEdit && category) {
			const res = store.updateCategory(category.id, { name });
			if (!res.ok) {
				toast.error(res.error ?? "Could not update category.");
				return;
			}
			toast.success(`Category renamed to "${name.trim()}".`);
		} else {
			const res = store.createCategory(name);
			if (!res.ok) {
				toast.error(res.error ?? "Could not create category.");
				return;
			}
			toast.success(`Category "${res.category?.name}" created.`);
		}
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Rename category" : "New category" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cf-name",
						children: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "cf-name",
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "e.g. Smart TVs, Printers, Laptops…",
						onKeyDown: (e) => {
							if (e.key === "Enter") submit();
						}
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					children: isEdit ? "Save changes" : "Create category"
				})] })
			]
		})
	});
}
function stockStatus(onHand, reorderPoint) {
	if (onHand <= 0) return "out_of_stock";
	if (onHand <= reorderPoint) return "low_stock";
	return "in_stock";
}
function ProductsIndexPage() {
	const { products, categories, invFor, categoryNameOf, archiveCategory, reactivateCategory, reactivateProduct } = useStore();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const { openNew } = Route$20.useSearch();
	const [tab, setTab] = (0, import_react.useState)("products");
	const [archivedView, setArchivedView] = (0, import_react.useState)("products");
	const [q, setQ] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [brand, setBrand] = (0, import_react.useState)("all");
	const [stock, setStock] = (0, import_react.useState)("all");
	const [dialog, setDialog] = (0, import_react.useState)({ open: false });
	const [catDialog, setCatDialog] = (0, import_react.useState)({ open: false });
	(0, import_react.useEffect)(() => {
		if (openNew) setDialog((d) => ({
			...d,
			open: true
		}));
	}, [openNew]);
	const activeCategories = (0, import_react.useMemo)(() => categories.filter((c) => !c.archived).sort((a, b) => a.name.localeCompare(b.name)), [categories]);
	const activeProducts = (0, import_react.useMemo)(() => products.filter((p) => !p.archived), [products]);
	const archivedProducts = (0, import_react.useMemo)(() => products.filter((p) => p.archived), [products]);
	const archivedCategories = (0, import_react.useMemo)(() => categories.filter((c) => c.archived), [categories]);
	const brands = (0, import_react.useMemo)(() => Array.from(new Set(activeProducts.map((p) => p.brand))).sort(), [activeProducts]);
	const rows = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return activeProducts.filter((p) => {
			if (query) {
				if (!`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(query)) return false;
			}
			if (category !== "all" && p.categoryId !== category) return false;
			if (brand !== "all" && p.brand !== brand) return false;
			if (stock !== "all") {
				const inv = invFor(p.id);
				if (stockStatus(inv?.onHand ?? 0, inv?.reorderPoint ?? 0) !== stock) return false;
			}
			return true;
		});
	}, [
		activeProducts,
		q,
		category,
		brand,
		stock,
		invFor
	]);
	const stats = (0, import_react.useMemo)(() => {
		let value = 0;
		let low = 0;
		let out = 0;
		for (const p of activeProducts) {
			const inv = invFor(p.id);
			if (!inv) continue;
			value += inv.onHand * p.cost;
			const status = stockStatus(inv.onHand, inv.reorderPoint);
			if (status === "low_stock") low++;
			if (status === "out_of_stock") out++;
		}
		return {
			total: activeProducts.length,
			value,
			low,
			out
		};
	}, [activeProducts, invFor]);
	const columns = [
		{
			key: "sku",
			header: "SKU",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: p.sku }),
			sortValue: (p) => p.sku
		},
		{
			key: "name",
			header: "Name",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-[13px] text-foreground",
					children: p.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 truncate text-[11px] text-muted-foreground",
					children: p.brand
				})]
			}),
			sortValue: (p) => p.name,
			className: "min-w-[14rem]"
		},
		{
			key: "category",
			header: "Category",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: categoryNameOf(p.categoryId)
			}),
			sortValue: (p) => categoryNameOf(p.categoryId)
		},
		{
			key: "price",
			header: "Price",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono tabular-nums",
				children: money(p.price)
			}),
			sortValue: (p) => p.price,
			align: "right"
		},
		{
			key: "margin",
			header: "Cost / Margin",
			cell: (p) => {
				const margin = p.price > 0 ? (p.price - p.cost) / p.price * 100 : 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mono text-xs tabular-nums text-muted-foreground",
						children: money(p.cost)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mono text-[11px] tabular-nums text-subtle",
						children: [margin.toFixed(1), "%"]
					})]
				});
			},
			sortValue: (p) => p.price > 0 ? (p.price - p.cost) / p.price : 0,
			align: "right"
		},
		{
			key: "onhand",
			header: "On hand",
			cell: (p) => {
				const inv = invFor(p.id);
				const onHand = inv?.onHand ?? 0;
				const status = stockStatus(onHand, inv?.reorderPoint ?? 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono tabular-nums",
						children: num(onHand)
					}), status !== "in_stock" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status })]
				});
			},
			sortValue: (p) => invFor(p.id)?.onHand ?? 0,
			align: "right"
		},
		{
			key: "location",
			header: "Location",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: p.location })
		},
		{
			key: "actions",
			header: "",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: (e) => {
					e.stopPropagation();
					setDialog({
						open: true,
						product: p
					});
				},
				children: "Edit"
			})
		}
	];
	const archivedColumns = [
		{
			key: "sku",
			header: "SKU",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: p.sku }),
			sortValue: (p) => p.sku
		},
		{
			key: "name",
			header: "Name",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-[13px] text-foreground",
					children: p.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 truncate text-[11px] text-muted-foreground",
					children: p.brand
				})]
			}),
			sortValue: (p) => p.name,
			className: "min-w-[14rem]"
		},
		{
			key: "category",
			header: "Category",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: categoryNameOf(p.categoryId)
			}),
			sortValue: (p) => categoryNameOf(p.categoryId)
		},
		{
			key: "price",
			header: "Price",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono tabular-nums",
				children: money(p.price)
			}),
			sortValue: (p) => p.price,
			align: "right"
		},
		{
			key: "actions",
			header: "",
			cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: (e) => {
					e.stopPropagation();
					setDialog({
						open: true,
						product: p
					});
				},
				children: "Edit"
			})
		}
	];
	const categoryCount = (id) => products.filter((p) => p.categoryId === id).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Products",
				description: "Catalog of components, peripherals and prebuilt systems.",
				actions: tab === "categories" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setCatDialog({ open: true }),
					children: "New category"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setDialog({ open: true }),
					children: "New product"
				})
			}),
			tab !== "categories" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total SKUs",
						numericValue: stats.total,
						format: (n) => num(Math.round(n)),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Catalog value (cost)",
						numericValue: stats.value,
						format: (n) => money(Math.round(n)),
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Low stock",
						numericValue: stats.low,
						format: (n) => num(Math.round(n)),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Out of stock",
						numericValue: stats.out,
						format: (n) => num(Math.round(n)),
						accent: "danger"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
				value: tab,
				onChange: setTab,
				options: [
					{
						value: "products",
						label: "Products"
					},
					{
						value: "categories",
						label: "Categories"
					},
					{
						value: "archived",
						label: "Archived"
					}
				]
			}),
			tab === "products" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search name, SKU or brand…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: category,
					onChange: setCategory,
					options: activeCategories.map((c) => ({
						value: c.id,
						label: c.name
					})),
					label: "Category"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: brand,
					onChange: setBrand,
					options: brands,
					label: "Brand"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: stock,
					onChange: (v) => setStock(v),
					options: [
						"in_stock",
						"low_stock",
						"out_of_stock"
					],
					label: "Stock"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: rows.length,
					total: activeProducts.length,
					noun: "products"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: rows.map((p) => ({ ...p })),
				columns,
				loading,
				onRowClick: (p) => navigate({
					to: "/products/$productId",
					params: { productId: p.id }
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No products match your filters",
					description: "Try clearing the search or filters, or add a new product.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => setDialog({ open: true }),
						children: "Add product"
					})
				})
			})] }),
			tab === "categories" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
				shown: categories.length,
				total: categories.length,
				noun: "categories"
			}) }), categories.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No categories yet",
				description: "Create a category to start organizing your catalog.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setCatDialog({ open: true }),
					children: "New category"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: categories.map((c) => ({ ...c })),
				loading,
				columns: [
					{
						key: "name",
						header: "Name",
						cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[13px] text-foreground",
							children: c.name
						}),
						sortValue: (c) => c.name
					},
					{
						key: "products",
						header: "Products",
						cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: num(categoryCount(c.id))
						}),
						sortValue: (c) => categoryCount(c.id)
					},
					{
						key: "status",
						header: "Status",
						cell: (c) => c.archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							status: "inactive",
							label: "Archived"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							status: "active",
							label: "Active"
						})
					},
					{
						key: "actions",
						header: "",
						cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-end gap-1",
							children: c.archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: (e) => {
									e.stopPropagation();
									reactivateCategory(c.id);
								},
								children: "Reactivate"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: (e) => {
									e.stopPropagation();
									setCatDialog({
										open: true,
										category: c
									});
								},
								children: "Rename"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "text-muted-foreground",
								onClick: (e) => {
									e.stopPropagation();
									archiveCategory(c.id);
								},
								children: "Archive"
							})] })
						})
					}
				]
			})] }),
			tab === "archived" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
					value: archivedView,
					onChange: setArchivedView,
					options: [{
						value: "products",
						label: "Archived products"
					}, {
						value: "categories",
						label: "Archived categories"
					}]
				}), archivedView === "products" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: archivedProducts.length,
					total: archivedProducts.length,
					noun: "archived products"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: archivedProducts.map((p) => ({ ...p })),
					columns: [...archivedColumns, {
						key: "reactivate",
						header: "",
						cell: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: (e) => {
								e.stopPropagation();
								reactivateProduct(p.id);
							},
							children: "Reactivate"
						})
					}],
					loading,
					onRowClick: (p) => navigate({
						to: "/products/$productId",
						params: { productId: p.id }
					}),
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "Nothing archived",
						description: "Archived products will appear here."
					})
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: archivedCategories.length,
					total: archivedCategories.length,
					noun: "archived categories"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: archivedCategories.map((c) => ({ ...c })),
					loading,
					columns: [
						{
							key: "name",
							header: "Name",
							cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[13px] text-foreground",
								children: c.name
							}),
							sortValue: (c) => c.name
						},
						{
							key: "products",
							header: "Products",
							cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono tabular-nums",
								children: num(categoryCount(c.id))
							}),
							sortValue: (c) => categoryCount(c.id)
						},
						{
							key: "archivedAt",
							header: "Status",
							cell: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								status: "inactive",
								label: "Archived"
							})
						},
						{
							key: "actions",
							header: "",
							cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-end gap-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: (e) => {
										e.stopPropagation();
										reactivateCategory(c.id);
									},
									children: "Reactivate"
								})
							})
						}
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductFormDialog, {
				open: dialog.open,
				onOpenChange: (v) => setDialog((d) => ({
					...d,
					open: v
				})),
				product: dialog.product
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryFormDialog, {
				open: catDialog.open,
				onOpenChange: (v) => setCatDialog((d) => ({
					...d,
					open: v
				})),
				category: catDialog.category
			})
		]
	});
}
//#endregion
export { ProductsIndexPage as component };
