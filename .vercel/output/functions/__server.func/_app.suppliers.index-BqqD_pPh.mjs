import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { G as num, N as useSimulatedLoad, O as useOps } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.suppliers.index-BqqD_pPh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KNOWN_CATEGORIES = [
	"CPU",
	"GPU",
	"Motherboard",
	"RAM",
	"Storage",
	"PSU",
	"Case",
	"Cooling",
	"Fans",
	"Monitor",
	"Keyboard",
	"Mouse",
	"Headset",
	"Networking",
	"Software"
];
function SupplierFormDialog({ open, onOpenChange, supplier }) {
	const { createSupplier, updateSupplier } = useOps();
	const isEdit = Boolean(supplier);
	const [name, setName] = (0, import_react.useState)("");
	const [contact, setContact] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [terms, setTerms] = (0, import_react.useState)("");
	const [leadTimeDays, setLeadTimeDays] = (0, import_react.useState)("");
	const [categories, setCategories] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setName(supplier?.name ?? "");
		setContact(supplier?.contact ?? "");
		setEmail(supplier?.email ?? "");
		setPhone(supplier?.phone ?? "");
		setAddress(supplier?.address ?? "");
		setTerms(supplier?.terms ?? "");
		setLeadTimeDays(supplier ? String(supplier.leadTimeDays) : "");
		setCategories(supplier?.categories.join(", ") ?? "");
		setNotes(supplier?.notes ?? "");
	}, [open, supplier]);
	const submit = () => {
		if (!name.trim() || !contact.trim()) {
			toast.error("Supplier name and contact are required.");
			return;
		}
		const cats = categories.split(",").map((c) => c.trim()).filter(Boolean);
		const lead = Math.max(1, Math.floor(Number(leadTimeDays) || 1));
		const payload = {
			name: name.trim(),
			contact: contact.trim(),
			email: email.trim(),
			phone: phone.trim(),
			address: address.trim() || "—",
			terms: terms.trim() || "Net 30",
			leadTimeDays: lead,
			categories: cats.length ? cats : ["General"],
			notes: notes.trim() || void 0
		};
		if (isEdit && supplier) {
			updateSupplier(supplier.id, payload);
			toast.success(`${payload.name} updated.`);
		} else {
			createSupplier(payload);
			toast.success(`${payload.name} added to the directory.`);
		}
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit supplier" : "New supplier" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-name",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sf-name",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Nexlogic Distribution"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-contact",
								children: "Contact person"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sf-contact",
								value: contact,
								onChange: (e) => setContact(e.target.value),
								placeholder: "e.g. Juan Dela Cruz"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-email",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sf-email",
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "sales@supplier.ph"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-phone",
								children: "Phone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sf-phone",
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								placeholder: "e.g. 0917 123 4567"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-address",
								children: "Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sf-address",
								value: address,
								onChange: (e) => setAddress(e.target.value),
								placeholder: "e.g. 123 Shaw Blvd, Mandaluyong"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-terms",
								children: "Payment terms"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sf-terms",
								value: terms,
								onChange: (e) => setTerms(e.target.value),
								placeholder: "e.g. Net 30"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-lead",
								children: "Lead time (days)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sf-lead",
								type: "number",
								min: 1,
								value: leadTimeDays,
								onChange: (e) => setLeadTimeDays(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-categories",
								children: "Categories (comma-separated)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sf-categories",
								value: categories,
								onChange: (e) => setCategories(e.target.value),
								placeholder: KNOWN_CATEGORIES.join(", ")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sf-notes",
								children: "Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "sf-notes",
								rows: 2,
								value: notes,
								onChange: (e) => setNotes(e.target.value),
								placeholder: "Optional internal notes…"
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
					children: isEdit ? "Save changes" : "Add supplier"
				})] })
			]
		})
	});
}
function SuppliersIndexPage() {
	const { suppliers, purchaseOrders, updateSupplier } = useOps();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [dialog, setDialog] = (0, import_react.useState)({ open: false });
	const categories = (0, import_react.useMemo)(() => Array.from(new Set(suppliers.flatMap((s) => s.categories))).sort(), [suppliers]);
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return suppliers.filter((s) => {
			if (query) {
				if (!`${s.name} ${s.contact} ${s.email}`.toLowerCase().includes(query)) return false;
			}
			if (status !== "all" && s.status !== status) return false;
			if (category !== "all" && !s.categories.includes(category)) return false;
			return true;
		});
	}, [
		suppliers,
		q,
		status,
		category
	]);
	const stats = (0, import_react.useMemo)(() => {
		const active = suppliers.filter((s) => s.status === "active");
		const avgLead = active.length ? Math.round(active.reduce((sum, s) => sum + s.leadTimeDays, 0) / active.length) : 0;
		const openPos = purchaseOrders.filter((p) => [
			"draft",
			"submitted",
			"confirmed",
			"partial"
		].includes(p.status)).length;
		return {
			active: active.length,
			avgLead,
			categories: categories.length,
			openPos
		};
	}, [
		suppliers,
		purchaseOrders,
		categories
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Suppliers",
				description: "Supplier directory, terms and lead times.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setDialog({ open: true }),
					children: "New supplier"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active suppliers",
						numericValue: stats.active,
						format: (n) => num(Math.round(n)),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Avg. lead time",
						numericValue: stats.avgLead,
						format: (n) => `${Math.round(n)}d`,
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Categories covered",
						numericValue: stats.categories,
						format: (n) => num(Math.round(n)),
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open POs",
						numericValue: stats.openPos,
						format: (n) => num(Math.round(n)),
						accent: "warning"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search name or contact…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					label: "Status",
					options: ["active", "inactive"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: category,
					onChange: setCategory,
					label: "Category",
					options: categories
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: suppliers.length,
					noun: "suppliers"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "name",
						header: "Name",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: r.name
						}),
						sortValue: (r) => r.name,
						className: "min-w-[10rem]"
					},
					{
						key: "contact",
						header: "Contact",
						cell: (r) => r.contact,
						sortValue: (r) => r.contact
					},
					{
						key: "reach",
						header: "Email / Phone",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[13px]",
								children: r.email
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mono mt-0.5 text-[11px] text-muted-foreground",
								children: r.phone
							})]
						}),
						className: "min-w-[12rem]"
					},
					{
						key: "categories",
						header: "Categories",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1",
							children: [r.categories.slice(0, 3).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded border border-border bg-elevated px-1.5 py-0.5 text-[10.5px] text-muted-foreground",
								children: c
							}, c)), r.categories.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10.5px] text-subtle",
								children: ["+", r.categories.length - 3]
							})]
						}),
						className: "min-w-[10rem]"
					},
					{
						key: "lead",
						header: "Lead time",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mono tabular-nums",
							children: [r.leadTimeDays, "d"]
						}),
						sortValue: (r) => r.leadTimeDays,
						align: "right"
					},
					{
						key: "terms",
						header: "Terms",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: r.terms })
					},
					{
						key: "rating",
						header: "Rating",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono tabular-nums",
							children: r.rating.toFixed(1)
						}),
						sortValue: (r) => r.rating,
						align: "right"
					},
					{
						key: "status",
						header: "Status",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status }),
						align: "right"
					},
					{
						key: "actions",
						header: "",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: (e) => {
									e.stopPropagation();
									setDialog({
										open: true,
										supplier: r
									});
								},
								children: "Edit"
							}), r.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: "text-destructive hover:text-destructive",
									onClick: (e) => e.stopPropagation(),
									children: "Deactivate"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
								onClick: (e) => e.stopPropagation(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
									"Deactivate ",
									r.name,
									"?"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [r.name, " will be hidden from new purchase orders but its history stays intact."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep active" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
									onClick: () => {
										updateSupplier(r.id, { status: "inactive" });
										toast.success(`${r.name} deactivated.`);
									},
									children: "Deactivate supplier"
								})] })]
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: (e) => {
									e.stopPropagation();
									updateSupplier(r.id, { status: "active" });
									toast.success(`${r.name} reactivated.`);
								},
								children: "Activate"
							})]
						})
					}
				],
				loading,
				onRowClick: (r) => navigate({
					to: "/suppliers/$supplierId",
					params: { supplierId: r.id }
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No suppliers match",
					description: "Try clearing the search or filters."
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierFormDialog, {
				open: dialog.open,
				onOpenChange: (v) => setDialog((d) => ({
					...d,
					open: v
				})),
				supplier: dialog.supplier
			})
		]
	});
}
//#endregion
export { SuppliersIndexPage as component };
