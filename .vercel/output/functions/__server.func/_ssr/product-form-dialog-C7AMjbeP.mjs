import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as useStore } from "./router-DXywCOrU.mjs";
import { t as Button } from "./button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-BfrlgkCy.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CUklKTiM.mjs";
import { t as Input } from "./input-DjMJnh0q.mjs";
import { t as Checkbox } from "./checkbox-D8wvWY2q.mjs";
import { t as Label } from "./label-DIE5zrQN.mjs";
import { t as Textarea } from "./textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/product-form-dialog-C7AMjbeP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parseSpecs(raw) {
	const out = {};
	for (const line of raw.split("\n")) {
		const idx = line.indexOf(":");
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim();
		const rawVal = line.slice(idx + 1).trim();
		if (!key) continue;
		const numVal = Number(rawVal);
		out[key] = rawVal !== "" && !Number.isNaN(numVal) ? numVal : rawVal;
	}
	return out;
}
function specsToText(specs) {
	return Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join("\n");
}
function ProductFormDialog({ open, onOpenChange, product }) {
	const store = useStore();
	const isEdit = Boolean(product);
	const [name, setName] = (0, import_react.useState)("");
	const [sku, setSku] = (0, import_react.useState)("");
	const [brand, setBrand] = (0, import_react.useState)("");
	const [categoryId, setCategoryId] = (0, import_react.useState)("");
	const [productType, setProductType] = (0, import_react.useState)("product");
	const [description, setDescription] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("");
	const [cost, setCost] = (0, import_react.useState)("");
	const [onHand, setOnHand] = (0, import_react.useState)("0");
	const [reorderPoint, setReorderPoint] = (0, import_react.useState)("4");
	const [warranty, setWarranty] = (0, import_react.useState)("0");
	const [location, setLocation] = (0, import_react.useState)("");
	const [supplier, setSupplier] = (0, import_react.useState)("");
	const [serialTracked, setSerialTracked] = (0, import_react.useState)(false);
	const [specs, setSpecs] = (0, import_react.useState)("");
	const categories = (0, import_react.useMemo)(() => store.categories.filter((c) => !c.archived || c.id === product?.categoryId).sort((a, b) => a.name.localeCompare(b.name)), [store.categories, product?.categoryId]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const inv = product ? store.invFor(product.id) : void 0;
		setName(product?.name ?? "");
		setSku(product?.sku ?? "");
		setBrand(product?.brand ?? "");
		setCategoryId(product?.categoryId ?? store.categories.find((c) => !c.archived)?.id ?? "");
		setProductType(product?.productType ?? (product?.isService ? "service" : "product"));
		setDescription(product?.description ?? "");
		setPrice(product ? String(product.price) : "");
		setCost(product ? String(product.cost) : "");
		setOnHand(product ? String(inv?.onHand ?? 0) : "0");
		setReorderPoint(product ? String(inv?.reorderPoint ?? 4) : "4");
		setWarranty(product ? String(product.warrantyMonths) : "0");
		setLocation(product?.location ?? "");
		setSupplier(product?.supplier ?? "");
		setSerialTracked(product?.serialTracked ?? false);
		setSpecs(product ? specsToText(product.specs) : "");
	}, [
		open,
		product,
		store
	]);
	const submit = () => {
		if (!name.trim() || !sku.trim()) {
			toast.error("Name and SKU are required.");
			return;
		}
		if (!categoryId) {
			toast.error("Select a category.");
			return;
		}
		const priceNum = Number(price) || 0;
		const costNum = Number(cost) || 0;
		const onHandNum = Math.max(0, Math.floor(Number(onHand) || 0));
		const reorderNum = Math.max(0, Math.floor(Number(reorderPoint) || 0));
		const payload = {
			name: name.trim(),
			sku: sku.trim().toUpperCase(),
			brand: brand.trim() || "Generic",
			categoryId,
			productType,
			isService: productType === "service",
			description: description.trim() || void 0,
			price: priceNum,
			cost: costNum,
			warrantyMonths: Math.max(0, Math.floor(Number(warranty) || 0)),
			location: location.trim() || "—",
			supplier: supplier.trim() || "—",
			serialTracked,
			specs: parseSpecs(specs)
		};
		if (isEdit && product) {
			const res = store.updateProduct(product.id, payload, {
				onHand: onHandNum,
				reorderPoint: reorderNum
			});
			if (!res.ok) {
				toast.error(res.error ?? "Could not update product.");
				return;
			}
			toast.success(`${product.name} updated.`);
		} else {
			const res = store.createProduct(payload, {
				onHand: onHandNum,
				reorderPoint: reorderNum
			});
			if (!res.ok) {
				toast.error(res.error ?? "Could not add product.");
				return;
			}
			toast.success(`${res.product?.name} added to the catalog.`);
		}
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit product" : "New product" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-name",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-name",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. RTX 5070 Gaming OC"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-sku",
								children: "SKU"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-sku",
								value: sku,
								onChange: (e) => setSku(e.target.value),
								placeholder: "GPU-RTX5070"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-brand",
								children: "Brand"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-brand",
								value: brand,
								onChange: (e) => setBrand(e.target.value),
								placeholder: "e.g. Gigabyte"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-category",
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: categoryId,
								onValueChange: setCategoryId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "pf-category",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a category…" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id,
									children: c.name
								}, c.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-type",
								children: "Product type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: productType,
								onValueChange: (v) => setProductType(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "pf-type",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "product",
										children: "Product"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "service",
										children: "Service"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "bundle",
										children: "Bundle / Package"
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-price",
								children: "Selling price (₱)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-price",
								type: "number",
								min: 0,
								value: price,
								onChange: (e) => setPrice(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-cost",
								children: "Cost (₱)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-cost",
								type: "number",
								min: 0,
								value: cost,
								onChange: (e) => setCost(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-onhand",
								children: "Stock on hand"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-onhand",
								type: "number",
								min: 0,
								value: onHand,
								onChange: (e) => setOnHand(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-reorder",
								children: "Reorder point"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-reorder",
								type: "number",
								min: 0,
								value: reorderPoint,
								onChange: (e) => setReorderPoint(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-warranty",
								children: "Warranty (months)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-warranty",
								type: "number",
								min: 0,
								value: warranty,
								onChange: (e) => setWarranty(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-supplier",
								children: "Supplier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-supplier",
								value: supplier,
								onChange: (e) => setSupplier(e.target.value),
								placeholder: "e.g. Nexlogic Distribution"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-location",
								children: "Bin location"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pf-location",
								value: location,
								onChange: (e) => setLocation(e.target.value),
								placeholder: "e.g. A1-01"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end gap-4 pb-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-[13px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: serialTracked,
									onCheckedChange: (v) => setSerialTracked(v === true)
								}), "Serial tracked"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-desc",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "pf-desc",
								rows: 2,
								value: description,
								onChange: (e) => setDescription(e.target.value),
								placeholder: "Short description shown on the product page."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pf-specs",
								children: "Specifications (key: value, one per line)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "pf-specs",
								rows: 3,
								value: specs,
								onChange: (e) => setSpecs(e.target.value),
								placeholder: "socket: AM5\nmemoryType: DDR5\ntdp: 120"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					children: isEdit ? "Save changes" : "Add product"
				})] })
			]
		})
	});
}
//#endregion
export { ProductFormDialog as t };
