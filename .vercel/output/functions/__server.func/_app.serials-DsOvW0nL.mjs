import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { G as num, N as useSimulatedLoad, P as useStore, R as dateShort, S as Route$34, q as titleCase, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
import { t as Timeline } from "./_ssr/timeline-DiNIO4ot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.serials-DsOvW0nL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"in_stock",
	"reserved",
	"installed",
	"sold",
	"rma"
];
function SerialsPage() {
	const { serials, products, productById, customerById, orders, builds, warranties, movements, registerSerials, updateSerial, categoryNameOf } = useStore();
	const loading = useSimulatedLoad();
	const { serial: serialParam } = Route$34.useSearch();
	const [q, setQ] = (0, import_react.useState)(serialParam ?? "");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [registerOpen, setRegisterOpen] = (0, import_react.useState)(false);
	const [regProduct, setRegProduct] = (0, import_react.useState)("");
	const [regSerials, setRegSerials] = (0, import_react.useState)("");
	const serialTracked = products.filter((p) => p.serialTracked);
	const submitRegister = () => {
		if (!regProduct) {
			toast.error("Pick a product to register serials for.");
			return;
		}
		const list = regSerials.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
		if (list.length === 0) {
			toast.error("Enter at least one serial number.");
			return;
		}
		const added = registerSerials(regProduct, list);
		if (added === 0) toast.info("All of those serials are already registered.");
		else toast.success(`${added} serial(s) registered to ${productById(regProduct)?.name}.`);
		setRegSerials("");
		setRegProduct("");
		setRegisterOpen(false);
	};
	const categories = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const s of serials) {
			const p = productById(s.productId);
			if (p) set.add(categoryNameOf(p.categoryId));
		}
		return [...set].sort();
	}, [
		serials,
		productById,
		categoryNameOf
	]);
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return serials.filter((s) => {
			const p = productById(s.productId);
			if (status !== "all" && s.status !== status) return false;
			if (category !== "all" && p && categoryNameOf(p.categoryId) !== category) return false;
			if (query) {
				if (!`${s.serial} ${p?.name ?? ""} ${p?.sku ?? ""} ${s.orderId ?? ""} ${s.buildId ?? ""}`.toLowerCase().includes(query)) return false;
			}
			return true;
		});
	}, [
		serials,
		productById,
		categoryNameOf,
		q,
		status,
		category
	]);
	const stats = (0, import_react.useMemo)(() => {
		const by = (st) => serials.filter((s) => s.status === st).length;
		return {
			inStock: by("in_stock"),
			reserved: by("reserved"),
			sold: by("sold") + by("installed"),
			rma: by("rma")
		};
	}, [serials]);
	const selected = (0, import_react.useMemo)(() => filtered.find((s) => s.id === selectedId) ?? filtered[0], [filtered, selectedId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Serial Numbers",
				description: "Unit-level traceability from receiving through sale, build and warranty.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setRegisterOpen(true),
					children: "Register serials"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In stock",
						numericValue: stats.inStock,
						format: (n) => num(Math.round(n)),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Reserved",
						numericValue: stats.reserved,
						format: (n) => num(Math.round(n)),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Sold / installed",
						numericValue: stats.sold,
						format: (n) => num(Math.round(n)),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In RMA",
						numericValue: stats.rma,
						format: (n) => num(Math.round(n)),
						accent: "danger"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
							value: q,
							onChange: setQ,
							placeholder: "Search serial, product, order…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							value: status,
							onChange: setStatus,
							label: "Status",
							options: STATUSES
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							value: category,
							onChange: setCategory,
							label: "Category",
							options: categories
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
							shown: filtered.length,
							total: serials.length,
							noun: "units"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						rows: filtered,
						columns: [
							{
								key: "serial",
								header: "Serial",
								cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
									className: "text-foreground",
									children: s.serial
								}),
								sortValue: (s) => s.serial
							},
							{
								key: "product",
								header: "Product",
								cell: (s) => productById(s.productId)?.name ?? s.productId,
								sortValue: (s) => productById(s.productId)?.name ?? "",
								className: "min-w-[12rem]"
							},
							{
								key: "ref",
								header: "Reference",
								cell: (s) => s.buildId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
									to: "/builds/$buildId",
									params: { buildId: s.buildId },
									children: s.buildId
								}) : s.orderId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
									to: "/orders/$orderId",
									params: { orderId: s.orderId },
									children: s.orderId
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: "—"
								})
							},
							{
								key: "status",
								header: "Status",
								cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: s.status }),
								sortValue: (s) => s.status,
								align: "right"
							}
						],
						loading,
						pageSize: 12,
						onRowClick: (s) => setSelectedId(s.id),
						initialSort: {
							key: "serial",
							dir: "asc"
						},
						empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							title: "No serialised units match",
							description: "Try clearing the search or filters."
						})
					})]
				}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SerialDetail, {
					unit: selected,
					product: productById(selected.productId),
					order: orders.find((o) => o.id === selected.orderId),
					build: builds.find((b) => b.id === selected.buildId),
					warranty: warranties.find((w) => w.serial === selected.serial),
					customerName: customerById(selected.customerId ?? null)?.name ?? orders.find((o) => o.id === selected.orderId)?.customerName ?? null,
					movements: movements.filter((m) => m.productId === selected.productId).slice(0, 6),
					onUpdate: updateSerial,
					categoryNameOf
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					className: "grid place-items-center p-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No unit selected",
						description: "Select a serial from the register to trace its history."
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: registerOpen,
				onOpenChange: setRegisterOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Register serial numbers" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "reg-product",
									children: "Product"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: regProduct,
									onValueChange: setRegProduct,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "reg-product",
										className: "w-full",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a serial-tracked product" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: serialTracked.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: p.id,
										children: [
											p.sku,
											" — ",
											p.name
										]
									}, p.id)) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "reg-serials",
										children: "Serial numbers"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "reg-serials",
										rows: 4,
										value: regSerials,
										onChange: (e) => setRegSerials(e.target.value),
										placeholder: "One per line, or comma-separated\nSN-CPU-0001\nSN-CPU-0002"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Serials already on the register are skipped automatically."
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setRegisterOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: submitRegister,
							children: "Register units"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Serial history is reconstructed from local demo data. Real deployments should log every scan event (receive, reserve, install, sell, RMA) as an immutable movement record." })
		]
	});
}
function SerialDetail({ unit, product, order, build, warranty, customerName, movements, onUpdate, categoryNameOf }) {
	const lifecycle = [
		{
			label: "Received into stock",
			at: movements.at(-1)?.at ?? "",
			state: "done"
		},
		{
			label: "Reserved",
			at: unit.status === "reserved" ? movements[0]?.at ?? "" : "",
			state: unit.status === "reserved" ? "active" : unit.status === "in_stock" ? "pending" : "done"
		},
		{
			label: build ? `Installed in ${build.id}` : "Installed / sold",
			at: order?.createdAt ?? "",
			state: unit.status === "installed" || unit.status === "sold" || unit.status === "rma" ? "done" : "pending"
		},
		{
			label: warranty ? `Warranty until ${dateShort(warranty.expiresAt)}` : "Warranty coverage",
			at: warranty?.purchasedAt ?? "",
			state: warranty ? warranty.status === "active" ? "active" : "done" : "pending"
		},
		{
			label: "RMA / replacement",
			at: "",
			state: unit.status === "rma" ? "active" : "pending"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: unit.serial,
				hint: product?.name ?? unit.productId,
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: unit.status }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 2,
					items: [
						{
							label: "Product",
							value: product ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/products/$productId",
								params: { productId: product.id },
								children: product.sku
							}) : unit.productId
						},
						{
							label: "Category",
							value: product ? categoryNameOf(product.categoryId) : "—"
						},
						{
							label: "Customer",
							value: customerName ?? "Unassigned"
						},
						{
							label: "Order",
							value: order ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/orders/$orderId",
								params: { orderId: order.id },
								children: order.id
							}) : "—"
						},
						{
							label: "Build",
							value: build ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/builds/$buildId",
								params: { buildId: build.id },
								children: build.id
							}) : "—"
						},
						{
							label: "Warranty",
							value: warranty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/warranty/$warrantyId",
								params: { warrantyId: warranty.id },
								children: titleCase(warranty.status)
							}) : "Not registered"
						},
						{
							label: "Sold on",
							value: order ? dateShort(order.createdAt) : "—"
						},
						{
							label: "Warranty ends",
							value: warranty ? dateShort(warranty.expiresAt) : "—"
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: unit.status === "rma" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						onUpdate(unit.id, {
							status: "in_stock",
							orderId: void 0,
							buildId: void 0,
							customerId: void 0,
							warrantyUntil: void 0
						});
						toast.success(`${unit.serial} returned to in-stock.`);
					},
					children: "Return to stock"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						onUpdate(unit.id, { status: "rma" });
						toast.success(`${unit.serial} marked as RMA.`);
					},
					children: "Mark RMA"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Lifecycle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { events: lifecycle })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Related stock movements",
				hint: "Product-level",
				children: movements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No movements",
						description: "This product has no recorded stock movements yet."
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: movements.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 px-4 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[13px] text-foreground",
								children: [
									titleCase(m.type),
									" · ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono text-xs",
										children: m.qty > 0 ? `+${m.qty}` : m.qty
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mono text-[11px] text-subtle",
								children: [
									dateTime(m.at),
									" · ",
									m.actor,
									m.reference ? ` · ${m.reference}` : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: m.type })]
					}, m.id))
				})
			})
		]
	});
}
//#endregion
export { SerialsPage as component };
