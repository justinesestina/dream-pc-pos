import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { Ct as Banknote, E as Play, F as Minus, H as LayoutGrid, M as PackageX, T as Plus, V as List, W as Landmark, d as Trash2, g as ShoppingCart, gt as Check, ht as ChevronDown, k as Pause, m as Smartphone, nt as CreditCard, o as UserPlus, t as X } from "./_libs/lucide-react.mjs";
import { I as VAT_RATE, K as relative, L as cn, M as computeTotals, N as useSimulatedLoad, P as useStore, U as money, W as moneyExact } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./_ssr/popover-Bef0gulg.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as CommandInput, i as CommandGroup, o as CommandItem, r as CommandEmpty, s as CommandList, t as Command$2 } from "./_ssr/command-Dern75kD.mjs";
import { a as PageHeader, c as RowsSkeleton, n as EmptyState, o as Panel, s as PanelHeader } from "./_ssr/primitives-BWrlZqU7.mjs";
import { o as TotalsRows, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, i as Segmented, r as SearchInput } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as Checkbox } from "./_ssr/checkbox-D8wvWY2q.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.pos-DVn_KGWN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductBrowser({ loading }) {
	const store = useStore();
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [view, setView] = (0, import_react.useState)("grid");
	const categories = (0, import_react.useMemo)(() => store.categories.filter((c) => !c.archived).sort((a, b) => a.name.localeCompare(b.name)), [store.categories]);
	const results = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return store.products.filter((p) => {
			if (p.archived) return false;
			if (category !== "all" && p.categoryId !== category) return false;
			if (!q) return true;
			return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
		});
	}, [
		store.products,
		query,
		category
	]);
	const add = (p) => {
		const res = store.addToCart(p.id, 1);
		if (!res.ok) toast.error(res.error ?? "Could not add item");
		else toast.success(`${p.name} added`, { duration: 1400 });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
				value: query,
				onChange: setQuery,
				placeholder: "Search name, SKU or brand…  (F2)",
				"data-pos-search": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
				value: view,
				onChange: setView,
				options: [{
					value: "grid",
					label: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-3.5" })
				}, {
					value: "list",
					label: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-3.5" })
				}],
				className: "ml-auto"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1.5 border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChip, {
					active: category === "all",
					onClick: () => setCategory("all"),
					children: "All"
				}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChip, {
					active: category === c.id,
					onClick: () => setCategory(c.id),
					children: c.name
				}, c.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowsSkeleton, { rows: 8 }) : results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: PackageX,
					title: "No products match",
					description: "Try a different search term or clear the category filter.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => {
							setQuery("");
							setCategory("all");
						},
						children: "Reset filters"
					})
				}) : view === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3",
					children: results.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
						product: p,
						onAdd: add
					}, p.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: results.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductRow, {
						product: p,
						onAdd: add
					}, p.id))
				})
			})
		]
	});
}
function CategoryChip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-pressed": active,
		className: cn("mono rounded border px-2 py-1 text-[10.5px] tracking-wide uppercase transition-colors", active ? "border-border-strong bg-foreground/10 text-foreground" : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"),
		children
	});
}
function useStock(productId) {
	const store = useStore();
	const avail = store.availableOf(productId);
	const isService = store.productById(productId)?.isService;
	return {
		avail,
		isService,
		out: !isService && avail <= 0
	};
}
function ProductCard({ product, onAdd }) {
	const { avail, isService, out } = useStock(product.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled: out,
		onClick: () => onAdd(product),
		className: cn("group flex flex-col rounded-md border border-border bg-elevated/40 p-3 text-left transition-colors", out ? "cursor-not-allowed opacity-50" : "hover:border-border-strong hover:bg-elevated focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono text-[10px] tracking-wide text-subtle",
				children: product.sku
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 line-clamp-2 text-[13px] leading-snug font-medium text-foreground",
				children: product.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-auto flex items-end justify-between gap-2 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono text-sm text-foreground",
					children: money(product.price)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mono text-[10.5px]", isService ? "text-info" : out ? "text-destructive" : avail <= 3 ? "text-warning" : "text-subtle"),
					children: isService ? "SERVICE" : out ? "OUT OF STOCK" : `${avail} IN STOCK`
				})]
			})
		]
	});
}
function ProductRow({ product, onAdd }) {
	const { avail, isService, out } = useStock(product.id);
	const store = useStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center gap-3 px-3 py-2 transition-colors hover:bg-elevated/60",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-[13px] text-foreground",
					children: product.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mono text-[10.5px] text-subtle",
					children: [
						product.sku,
						" · ",
						product.brand,
						" · ",
						store.categoryNameOf(product.categoryId)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("mono w-24 text-right text-[11px]", isService ? "text-info" : out ? "text-destructive" : "text-muted-foreground"),
				children: isService ? "service" : `${avail} avail`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono w-24 text-right text-[13px] text-foreground",
				children: money(product.price)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				className: "h-7",
				disabled: out,
				onClick: () => onAdd(product),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add"]
			})
		]
	});
}
/** Attach a customer to the current transaction (walk-in by default). */
function CustomerSelect({ compact }) {
	const store = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const selected = store.customerById(store.cartCustomerId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					role: "combobox",
					"aria-expanded": open,
					className: cn("h-8 min-w-0 flex-1 justify-between text-[13px]", compact && "h-7"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3.5 shrink-0 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: selected?.name ?? "Walk-in customer"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5 shrink-0 text-subtle" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
				align: "start",
				className: "w-72 p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$2, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
					placeholder: "Search customers…",
					className: "text-[13px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No customer found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, { children: store.customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: `${c.name} ${c.email} ${c.phone}`,
					onSelect: () => {
						store.setCartCustomer(c.id);
						setOpen(false);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("size-3.5", store.cartCustomerId === c.id ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-[13px]",
							children: c.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono block truncate text-[10.5px] text-subtle",
							children: c.phone
						})]
					})]
				}, c.id)) })] })] })
			})]
		}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "icon",
			variant: "ghost",
			className: "size-8 shrink-0",
			"aria-label": "Clear customer",
			onClick: () => store.setCartCustomer(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
		})]
	});
}
var METHODS = [
	{
		id: "cash",
		label: "Cash",
		icon: Banknote
	},
	{
		id: "card",
		label: "Card",
		icon: CreditCard
	},
	{
		id: "gcash",
		label: "GCash",
		icon: Smartphone
	},
	{
		id: "bank",
		label: "Bank transfer",
		icon: Landmark
	}
];
function PaymentDialog({ open, onOpenChange, total, onConfirm }) {
	const [method, setMethod] = (0, import_react.useState)("cash");
	const [tendered, setTendered] = (0, import_react.useState)("");
	const [reference, setReference] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) {
			setMethod("cash");
			setTendered("");
			setReference("");
		}
	}, [open]);
	const tenderedNum = (0, import_react.useMemo)(() => {
		const n = Number(tendered);
		return Number.isFinite(n) ? Math.max(0, n) : 0;
	}, [tendered]);
	const isCash = method === "cash";
	const change = isCash ? Math.max(0, tenderedNum - total) : 0;
	const sufficient = !isCash || tenderedNum >= total;
	const refLabel = method === "bank" ? "Transfer reference" : method === "gcash" ? "GCash reference" : "Card reference";
	const refValid = reference.trim().length > 0;
	const canCharge = isCash ? sufficient && tenderedNum > 0 : sufficient && refValid;
	const quickTenders = (0, import_react.useMemo)(() => {
		const roundUp = (to) => Math.ceil(total / to) * to;
		const base = /* @__PURE__ */ new Set();
		if (total > 0) {
			base.add(total);
			base.add(roundUp(500));
			base.add(roundUp(1e3));
			base.add(roundUp(5e3));
		}
		return Array.from(base).filter((n) => n >= total).sort((a, b) => a - b).slice(0, 4);
	}, [total]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Take payment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Select a payment method to complete the sale of",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono text-foreground",
						children: money(total)
					}),
					"."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-1.5",
					children: METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setMethod(m.id),
						className: cn("flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-[11px] transition-colors", method === m.id ? "border-foreground/40 bg-foreground/10 text-foreground" : "border-border bg-elevated text-muted-foreground hover:border-border-strong hover:text-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.icon, { className: "size-4" }), m.label]
					}, m.id))
				}),
				isCash ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "pos-tendered",
								className: "label-tech",
								children: "Cash received"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pos-tendered",
								type: "number",
								inputMode: "decimal",
								min: 0,
								autoFocus: true,
								value: tendered,
								onChange: (e) => setTendered(e.target.value),
								placeholder: "0.00",
								className: "h-10 text-right text-lg tabular-nums"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: quickTenders.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								className: "h-7 text-[11.5px]",
								onClick: () => setTendered(n.toFixed(2)),
								children: n === total ? "Exact" : money(n)
							}, n))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-md border border-border bg-elevated px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "label-tech",
								children: "Change"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("mono text-lg tabular-nums", sufficient ? "text-success" : "text-destructive"),
								children: moneyExact(change)
							})]
						}),
						tenderedNum > 0 && !sufficient && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11.5px] text-destructive",
							children: [
								"Received ",
								money(tenderedNum),
								" — short by ",
								money(total - tenderedNum),
								"."
							]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-md border border-border bg-elevated px-3 py-2.5 text-[12.5px] text-muted-foreground",
						children: [
							method === "card" && "Card payment is approved instantly in this demo.",
							method === "gcash" && "A GCash QR prompt would appear here.",
							method === "bank" && "Bank transfer is marked paid on confirmation."
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "pos-reference",
								className: "label-tech",
								children: refLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pos-reference",
								autoFocus: true,
								value: reference,
								onChange: (e) => setReference(e.target.value),
								placeholder: method === "card" ? "Last 4 digits" : "e.g. GCASH-123456 / BPI-0001",
								className: "h-10 tabular-nums"
							}),
							!refValid && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11.5px] text-destructive",
								children: [
									"A reference is required for ",
									method,
									" payments."
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: !canCharge,
					onClick: () => {
						onConfirm(method, isCash ? tenderedNum : total, change, isCash ? "" : reference.trim());
						onOpenChange(false);
					},
					children: [
						"Charge ",
						money(total),
						change > 0 ? ` · change ${moneyExact(change)}` : ""
					]
				})] })
			]
		})
	});
}
function SerialPicker({ product, qty, current, onApply }) {
	const store = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)([]);
	const [manual, setManual] = (0, import_react.useState)("");
	const available = store.availableSerialsOf(product.id);
	const missing = Math.max(0, qty - current.length);
	const toggle = (ser) => {
		setDraft((d) => {
			if (d.includes(ser)) return d.filter((x) => x !== ser);
			if (d.length >= qty) {
				toast.error(`Up to ${qty} serial(s) for ${product.name}.`);
				return d;
			}
			return [...d, ser];
		});
	};
	const addManual = () => {
		const parts = manual.split(",").map((s) => s.trim()).filter(Boolean);
		if (parts.length === 0) return;
		setDraft((d) => {
			const next = [...d];
			for (const p of parts) {
				if (next.length >= qty) break;
				if (!next.includes(p)) next.push(p);
			}
			return next;
		});
		setManual("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `mono inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10.5px] transition-colors ${missing > 0 ? "border-warning/40 bg-warning/10 text-warning hover:bg-warning/20" : "border-border bg-elevated text-subtle hover:border-foreground/30 hover:text-foreground"}`,
				children: [
					"S/N ",
					current.length,
					"/",
					qty,
					missing > 0 ? " · assign" : ""
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Assign serial numbers" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[13px] text-muted-foreground",
							children: [
								product.name,
								" — select ",
								qty,
								" unit",
								qty === 1 ? "" : "s",
								" from the in-stock register or type them in manually."
							]
						}),
						available.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							title: "No serials in register",
							description: "Type the serial numbers manually to register them on checkout."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "max-h-48 divide-y divide-border overflow-y-auto rounded border border-border",
							children: available.map((sn) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: draft.includes(sn.serial),
									onCheckedChange: () => toggle(sn.serial)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mono text-[12.5px] text-foreground",
									children: sn.serial
								})]
							}) }, sn.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: manual,
								onChange: (e) => setManual(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addManual();
									}
								},
								placeholder: "Or type serials, comma-separated",
								className: "h-8 text-xs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: addManual,
								children: "Add"
							})]
						}),
						draft.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mono text-[11px] text-subtle",
							children: ["Selected: ", draft.join(", ")]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						onApply(draft.slice(0, qty));
						setOpen(false);
					},
					disabled: draft.length === 0,
					children: "Assign serials"
				})] })
			]
		})]
	});
}
function CartPanel({ notes, onNotesChange, onCheckout }) {
	const store = useStore();
	const [payOpen, setPayOpen] = (0, import_react.useState)(false);
	const lines = store.cart.map((l) => {
		const p = store.productById(l.productId);
		return {
			...l,
			product: p,
			lineTotal: p.price * l.qty
		};
	});
	const productLines = lines.filter((l) => !l.product.isService);
	const serviceTotal = lines.filter((l) => l.product.isService).reduce((s, l) => s + l.lineTotal, 0);
	const totals = computeTotals(productLines.map((l) => ({
		qty: l.qty,
		unitPrice: l.product.price
	})), store.cartDiscount, serviceTotal);
	const serialIncomplete = lines.some((l) => l.product.serialTracked && (l.serials?.length ?? 0) < l.qty);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
				title: "Current sale",
				hint: `${lines.length} line${lines.length === 1 ? "" : "s"}`,
				action: lines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						className: "h-7 text-xs",
						onClick: () => {
							store.holdCart();
							toast.success("Transaction held");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }), " Hold"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							className: "h-7 text-xs text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Clear"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Clear this sale?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
						"All ",
						lines.length,
						" lines, the discount and the attached customer will be removed. Hold the transaction instead if you need it later."
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep sale" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						onClick: () => {
							store.clearCart();
							onNotesChange("");
							toast.success("Sale cleared");
						},
						children: "Clear sale"
					})] })] })] })]
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border px-3 py-2.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerSelect, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: [lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: ShoppingCart,
					title: "No items yet",
					description: "Search the catalog and add products to start a sale. Press F2 to focus search."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "px-3 py-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-[13px] text-foreground",
										children: l.product.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mono text-[10.5px] text-subtle",
										children: [
											l.product.sku,
											" · ",
											money(l.product.price),
											" ea"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": `Remove ${l.product.name}`,
									onClick: () => store.removeCartLine(l.productId),
									className: "text-subtle transition-colors hover:text-destructive",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "outline",
											className: "size-6",
											"aria-label": "Decrease quantity",
											onClick: () => store.setCartQty(l.productId, l.qty - 1),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono w-9 text-center text-[13px] tabular-nums",
											children: l.qty
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "outline",
											className: "size-6",
											"aria-label": "Increase quantity",
											disabled: !l.product.isService && store.availableOf(l.productId) <= 0,
											onClick: () => {
												const res = store.addToCart(l.productId, 1);
												if (!res.ok) toast.error(res.error ?? "Stock limit reached");
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" })
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mono text-[13px] tabular-nums text-foreground",
									children: money(l.lineTotal)
								})]
							}),
							l.product.serialTracked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SerialPicker, {
									product: l.product,
									qty: l.qty,
									current: l.serials ?? [],
									onApply: (serials) => store.setCartLineSerials(l.productId, serials)
								})
							})
						]
					}, l.productId))
				}), store.heldCarts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-tech",
						children: "Held transactions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1.5",
						children: store.heldCarts.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mono truncate text-[11px] text-muted-foreground",
								children: [
									h.id,
									" · ",
									h.lines.length,
									" lines · ",
									relative(h.at)
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "ghost",
								className: "h-6 text-[11px]",
								onClick: () => {
									store.resumeHeldCart(h.id);
									toast.success("Transaction resumed");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), " Resume"]
							})]
						}, h.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 border-t border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "pos-discount",
							className: "label-tech shrink-0",
							children: "Discount"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pos-discount",
							type: "number",
							min: 0,
							value: store.cartDiscount || "",
							placeholder: "0",
							onChange: (e) => store.setCartDiscount(Math.max(0, Number(e.target.value) || 0)),
							className: "h-7 flex-1 text-right text-[13px]"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: notes,
						onChange: (e) => onNotesChange(e.target.value),
						placeholder: "Sale notes (optional)…",
						className: "min-h-[52px] resize-none text-[13px]"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [
						{
							label: "Products",
							value: moneyExact(totals.gross)
						},
						...serviceTotal > 0 ? [{
							label: "Service total",
							value: moneyExact(serviceTotal)
						}] : [],
						{
							label: "Discount",
							value: `− ${moneyExact(totals.discount)}`
						},
						{
							label: `VAT-exclusive subtotal`,
							value: moneyExact(totals.subtotal)
						},
						{
							label: `VAT (${Math.round(VAT_RATE * 100)}%)`,
							value: moneyExact(totals.tax)
						},
						{
							label: "Total due",
							value: moneyExact(totals.total),
							strong: true
						}
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "h-10 w-full",
						disabled: lines.length === 0 || serialIncomplete,
						onClick: () => setPayOpen(true),
						children: ["Checkout · ", money(totals.total)]
					}),
					serialIncomplete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-[11px] text-warning",
						children: "Assign serial numbers to every serial-tracked line to complete checkout."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentDialog, {
						open: payOpen,
						onOpenChange: setPayOpen,
						total: totals.total,
						onConfirm: onCheckout
					})
				]
			})
		]
	});
}
function PosPage() {
	const store = useStore();
	const navigate = useNavigate();
	const loading = useSimulatedLoad();
	const [notes, setNotes] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "F2") {
				e.preventDefault();
				document.querySelector("[data-pos-search]")?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const checkout = (method, tendered, change, reference) => {
		const trimmed = notes.trim();
		const order = store.completeSale(method, {
			...trimmed ? { notes: trimmed } : {},
			tendered,
			...change > 0 ? { change } : {},
			...reference ? { reference } : {}
		});
		setNotes("");
		toast.success(`Sale ${order.id} completed${change > 0 ? ` · change ${moneyExact(change)}` : ""}`);
		navigate({
			to: "/orders/$orderId",
			params: { orderId: order.id }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-col gap-4 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Point of Sale",
				description: "Ring up walk-in sales, apply discounts and take payment."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Payments, receipt printing and cash-drawer hardware are simulated in this demo build." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_360px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductBrowser, { loading }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartPanel, {
					notes,
					onNotesChange: setNotes,
					onCheckout: checkout
				})]
			})
		]
	});
}
//#endregion
export { PosPage as component };
