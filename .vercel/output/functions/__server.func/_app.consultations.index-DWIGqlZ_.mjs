import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { T as Plus, i as Users } from "./_libs/lucide-react.mjs";
import { O as useOps, P as useStore, U as money, b as Route$28 } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.consultations.index-DWIGqlZ_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"new",
	"requirements",
	"recommended",
	"quoted",
	"won",
	"lost"
];
function NewConsultationDialog({ openNew = false }) {
	const ops = useOps();
	const store = useStore();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [customerId, setCustomerId] = (0, import_react.useState)(store.customers[0]?.id ?? "");
	const [primaryUse, setPrimaryUse] = (0, import_react.useState)("");
	const [budget, setBudget] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (openNew) setOpen(true);
	}, [openNew]);
	const submit = () => {
		const customer = store.customerById(customerId);
		if (!primaryUse.trim() || !customer) {
			toast.error("Primary use and customer are required.");
			return;
		}
		const c = ops.createConsultation({
			customerId: customer.id,
			customerName: customer.name,
			primaryUse: primaryUse.trim(),
			budget: Number(budget) || 0,
			targetResolution: "1080p",
			workloads: [],
			preferences: [],
			existingHardware: [],
			upgradeOnly: false,
			consultant: ops.actor
		});
		toast.success(`${c.id} created.`);
		setOpen(false);
		navigate({
			to: "/consultations/$consultationId",
			params: { consultationId: c.id }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New consultation"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New consultation" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "nc-customer",
							children: "Customer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "nc-customer",
							className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm",
							value: customerId,
							onChange: (e) => setCustomerId(e.target.value),
							children: store.customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c.id,
								children: c.name
							}, c.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "nc-use",
							children: "Primary use"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "nc-use",
							value: primaryUse,
							onChange: (e) => setPrimaryUse(e.target.value),
							placeholder: "e.g. Video editing"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "nc-budget",
							children: "Budget (PHP)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "nc-budget",
							type: "number",
							value: budget,
							onChange: (e) => setBudget(e.target.value),
							placeholder: "70000"
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
				children: "Create"
			})] })
		] })]
	});
}
function ConsultationsIndexPage() {
	const ops = useOps();
	const navigate = useNavigate();
	const { openNew } = Route$28.useSearch();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const list = ops.consultations;
	const filtered = (0, import_react.useMemo)(() => {
		return list.filter((c) => {
			if (status !== "all" && c.status !== status) return false;
			const query = q.trim().toLowerCase();
			if (!query) return true;
			return c.id.toLowerCase().includes(query) || c.customerName.toLowerCase().includes(query) || c.primaryUse.toLowerCase().includes(query);
		});
	}, [
		list,
		q,
		status
	]);
	const newCount = list.filter((c) => c.status === "new").length;
	const inRequirements = list.filter((c) => c.status === "requirements" || c.status === "recommended").length;
	const quotedCount = list.filter((c) => c.status === "quoted").length;
	const closed = list.filter((c) => c.status === "won" || c.status === "lost").length;
	const winRate = closed === 0 ? 0 : Math.round(list.filter((c) => c.status === "won").length / closed * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Consultations",
				description: "Customer build consultations and requirements capture.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewConsultationDialog, { openNew })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "New",
						numericValue: newCount,
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In requirements",
						numericValue: inRequirements,
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Quoted",
						numericValue: quotedCount,
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Win rate",
						value: `${winRate}%`,
						accent: "success",
						hint: `${closed} closed`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search ID, customer, use case…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					options: STATUSES,
					label: "Status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: list.length,
					noun: "consultations"
				})
			] }), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No consultations found",
				icon: Users
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "id",
						header: "ID",
						cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-foreground",
							children: c.id
						}),
						sortValue: (c) => c.id
					},
					{
						key: "customer",
						header: "Customer",
						cell: (c) => c.customerName,
						sortValue: (c) => c.customerName
					},
					{
						key: "use",
						header: "Primary use",
						cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: c.primaryUse
						})
					},
					{
						key: "budget",
						header: "Budget",
						align: "right",
						cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: money(c.budget) }),
						sortValue: (c) => c.budget
					},
					{
						key: "consultant",
						header: "Consultant",
						cell: (c) => c.consultant
					},
					{
						key: "status",
						header: "Status",
						cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: c.status })
					}
				],
				pageSize: 15,
				onRowClick: (c) => navigate({
					to: "/consultations/$consultationId",
					params: { consultationId: c.id }
				})
			})] })
		]
	});
}
//#endregion
export { ConsultationsIndexPage as component };
