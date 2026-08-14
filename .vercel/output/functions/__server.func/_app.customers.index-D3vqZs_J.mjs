import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { T as Plus } from "./_libs/lucide-react.mjs";
import { N as useSimulatedLoad, P as useStore, R as dateShort, U as money, q as titleCase, v as Route$26 } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.customers.index-D3vqZs_J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPES = ["individual", "business"];
var STATUSES = ["active", "inactive"];
function CustomersIndexPage() {
	const { customers, orders, createCustomer } = useStore();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const { openNew } = Route$26.useSearch();
	const [q, setQ] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (openNew) setOpen(true);
	}, [openNew]);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		email: "",
		phone: "",
		type: "individual",
		address: "",
		notes: ""
	});
	const orderStatsByCustomer = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const o of orders) {
			if (!o.customerId) continue;
			const cur = map.get(o.customerId) ?? {
				count: 0,
				spend: 0
			};
			cur.count += 1;
			cur.spend += o.total;
			map.set(o.customerId, cur);
		}
		return map;
	}, [orders]);
	const stats = (0, import_react.useMemo)(() => {
		const business = customers.filter((c) => c.type === "business").length;
		const individual = customers.length - business;
		const now = /* @__PURE__ */ new Date();
		const newThisMonth = customers.filter((c) => {
			const d = new Date(c.since);
			return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
		}).length;
		const active = customers.filter((c) => c.status === "active").length;
		return {
			total: customers.length,
			business,
			individual,
			newThisMonth,
			active
		};
	}, [customers]);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		return customers.filter((c) => {
			if (type !== "all" && c.type !== type) return false;
			if (status !== "all" && c.status !== status) return false;
			if (term && !(c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.phone.toLowerCase().includes(term))) return false;
			return true;
		});
	}, [
		customers,
		q,
		type,
		status
	]);
	const columns = [
		{
			key: "name",
			header: "Name",
			cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-foreground",
				children: c.name
			}),
			sortValue: (c) => c.name
		},
		{
			key: "type",
			header: "Type",
			cell: (c) => titleCase(c.type),
			sortValue: (c) => c.type
		},
		{
			key: "email",
			header: "Email",
			cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: c.email }),
			sortValue: (c) => c.email
		},
		{
			key: "phone",
			header: "Phone",
			cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: c.phone }),
			sortValue: (c) => c.phone
		},
		{
			key: "since",
			header: "Customer since",
			cell: (c) => dateShort(c.since),
			sortValue: (c) => c.since
		},
		{
			key: "orders",
			header: "Orders / lifetime spend",
			align: "right",
			cell: (c) => {
				const s = orderStatsByCustomer.get(c.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mono tabular-nums",
					children: [
						s?.count ?? 0,
						" · ",
						money(s?.spend ?? 0)
					]
				});
			},
			sortValue: (c) => orderStatsByCustomer.get(c.id)?.spend ?? 0
		},
		{
			key: "status",
			header: "Status",
			cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: c.status }),
			sortValue: (c) => c.status
		}
	];
	const submit = () => {
		if (!form.name.trim() || !form.email.trim()) {
			toast.error("Name and email are required.");
			return;
		}
		const c = createCustomer({
			name: form.name.trim(),
			email: form.email.trim(),
			phone: form.phone.trim(),
			type: form.type,
			address: form.address.trim(),
			notes: form.notes.trim() || void 0
		});
		toast.success(`Customer ${c.name} created.`);
		setOpen(false);
		setForm({
			name: "",
			email: "",
			phone: "",
			type: "individual",
			address: "",
			notes: ""
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Customers",
				description: "Customer directory with purchase and service history.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New customer"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total customers",
						numericValue: stats.total,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Business / individual",
						value: `${stats.business} / ${stats.individual}`,
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "New this month",
						numericValue: stats.newThisMonth,
						format: (n) => Math.round(n).toString(),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active",
						numericValue: stats.active,
						format: (n) => Math.round(n).toString(),
						accent: "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search name, email, phone…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: type,
					onChange: setType,
					options: TYPES,
					label: "Type"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					options: STATUSES,
					label: "Status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: customers.length,
					noun: "customers"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns,
				loading,
				onRowClick: (c) => navigate({
					to: "/customers/$customerId",
					params: { customerId: c.id }
				}),
				initialSort: {
					key: "since",
					dir: "desc"
				},
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No customers match your filters",
					description: "Try adjusting search terms or clearing filters."
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New customer" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "c-name",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "c-name",
								value: form.name,
								onChange: (e) => setForm((f) => ({
									...f,
									name: e.target.value
								}))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "c-email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "c-email",
									value: form.email,
									onChange: (e) => setForm((f) => ({
										...f,
										email: e.target.value
									}))
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "c-phone",
									children: "Phone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "c-phone",
									value: form.phone,
									onChange: (e) => setForm((f) => ({
										...f,
										phone: e.target.value
									}))
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "c-type",
								children: "Type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.type,
								onValueChange: (v) => setForm((f) => ({
									...f,
									type: v
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "c-type",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "individual",
									children: "Individual"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "business",
									children: "Business"
								})] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "c-address",
								children: "Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "c-address",
								value: form.address,
								onChange: (e) => setForm((f) => ({
									...f,
									address: e.target.value
								}))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "c-notes",
								children: "Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "c-notes",
								value: form.notes,
								onChange: (e) => setForm((f) => ({
									...f,
									notes: e.target.value
								}))
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						children: "Create customer"
					})] })
				] })
			})
		]
	});
}
//#endregion
export { CustomersIndexPage as component };
