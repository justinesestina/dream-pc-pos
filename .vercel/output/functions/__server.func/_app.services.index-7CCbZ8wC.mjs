import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { T as Plus } from "./_libs/lucide-react.mjs";
import { N as useSimulatedLoad, P as useStore, R as dateShort, U as money, s as Route$8 } from "./_ssr/router-DXywCOrU.mjs";
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
//#region node_modules/.nitro/vite/services/ssr/assets/_app.services.index-7CCbZ8wC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SERVICE_STATUSES = [
	"received",
	"diagnosing",
	"waiting_customer",
	"waiting_parts",
	"in_repair",
	"ready",
	"released",
	"cancelled"
];
function ServicesIndexPage() {
	const { services, customers, createService } = useStore();
	const loading = useSimulatedLoad();
	const navigate = useNavigate();
	const { openNew } = Route$8.useSearch();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [tech, setTech] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (openNew) setOpen(true);
	}, [openNew]);
	const technicians = (0, import_react.useMemo)(() => Array.from(new Set(services.map((s) => s.technician))).sort(), [services]);
	const stats = (0, import_react.useMemo)(() => {
		const openTickets = services.filter((s) => !["released", "cancelled"].includes(s.status)).length;
		const waiting = services.filter((s) => s.status === "waiting_customer" || s.status === "waiting_parts").length;
		const weekAgo = Date.now() - 6048e5;
		return {
			openTickets,
			waiting,
			completedThisWeek: services.filter((s) => s.status === "released" && new Date(s.createdAt).getTime() >= weekAgo).length,
			revenue: services.reduce((sum, s) => sum + (s.actualCost ?? 0), 0)
		};
	}, [services]);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		return services.filter((s) => {
			if (status !== "all" && s.status !== status) return false;
			if (tech !== "all" && s.technician !== tech) return false;
			if (term && !(s.id.toLowerCase().includes(term) || s.customerName.toLowerCase().includes(term) || s.device.toLowerCase().includes(term) || s.issue.toLowerCase().includes(term))) return false;
			return true;
		});
	}, [
		services,
		q,
		status,
		tech
	]);
	const [form, setForm] = (0, import_react.useState)({
		customerId: "",
		device: "",
		issue: "",
		estimatedCost: "",
		labor: ""
	});
	const columns = [
		{
			key: "id",
			header: "Ticket ID",
			cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
				className: "text-[13px] text-foreground",
				children: s.id
			}),
			sortValue: (s) => s.id
		},
		{
			key: "customer",
			header: "Customer",
			cell: (s) => s.customerName,
			sortValue: (s) => s.customerName
		},
		{
			key: "device",
			header: "Device",
			cell: (s) => s.device,
			sortValue: (s) => s.device
		},
		{
			key: "issue",
			header: "Issue",
			cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block max-w-[220px] truncate text-muted-foreground",
				children: s.issue
			}),
			sortValue: (s) => s.issue
		},
		{
			key: "tech",
			header: "Technician",
			cell: (s) => s.technician,
			sortValue: (s) => s.technician
		},
		{
			key: "received",
			header: "Received",
			cell: (s) => dateShort(s.createdAt),
			sortValue: (s) => s.createdAt
		},
		{
			key: "cost",
			header: "Est. cost",
			align: "right",
			cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono tabular-nums",
				children: money(s.estimatedCost)
			}),
			sortValue: (s) => s.estimatedCost
		},
		{
			key: "status",
			header: "Status",
			cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				status: s.status,
				...s.status === "received" ? { tone: "neutral" } : {}
			}),
			sortValue: (s) => s.status
		}
	];
	const submit = () => {
		if (!form.customerId || !form.device.trim() || !form.issue.trim()) {
			toast.error("Customer, device and issue are required.");
			return;
		}
		const ticket = createService({
			customerId: form.customerId,
			device: form.device.trim(),
			issue: form.issue.trim(),
			estimatedCost: Number(form.estimatedCost) || 0,
			labor: Number(form.labor) || 0
		});
		toast.success(`Ticket ${ticket.id} created.`);
		setOpen(false);
		setForm({
			customerId: "",
			device: "",
			issue: "",
			estimatedCost: "",
			labor: ""
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Service Tickets",
				description: "Repairs, diagnostics and upgrade jobs.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New ticket"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open tickets",
						numericValue: stats.openTickets,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Waiting on customer/parts",
						numericValue: stats.waiting,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Completed this week",
						numericValue: stats.completedThisWeek,
						format: (n) => Math.round(n).toString(),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Service revenue",
						numericValue: stats.revenue,
						format: money,
						accent: "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search ticket, customer, device…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: status,
					onChange: setStatus,
					options: SERVICE_STATUSES,
					label: "Status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: tech,
					onChange: setTech,
					options: technicians,
					label: "Technician"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: services.length,
					noun: "tickets"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns,
				loading,
				onRowClick: (s) => navigate({
					to: "/services/$ticketId",
					params: { ticketId: s.id }
				}),
				initialSort: {
					key: "received",
					dir: "desc"
				},
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No tickets match your filters",
					description: "Try adjusting search terms or clearing filters."
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New service ticket" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "s-customer",
								children: "Customer"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.customerId,
								onValueChange: (v) => setForm((f) => ({
									...f,
									customerId: v
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "s-customer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select customer" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id,
									children: c.name
								}, c.id)) })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "s-device",
								children: "Device"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "s-device",
								value: form.device,
								onChange: (e) => setForm((f) => ({
									...f,
									device: e.target.value
								}))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "s-issue",
								children: "Issue"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "s-issue",
								value: form.issue,
								onChange: (e) => setForm((f) => ({
									...f,
									issue: e.target.value
								}))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s-est",
									children: "Estimated cost (₱)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "s-est",
									type: "number",
									value: form.estimatedCost,
									onChange: (e) => setForm((f) => ({
										...f,
										estimatedCost: e.target.value
									}))
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s-labor",
									children: "Labor (₱)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "s-labor",
									type: "number",
									value: form.labor,
									onChange: (e) => setForm((f) => ({
										...f,
										labor: e.target.value
									}))
								})] })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						children: "Create ticket"
					})] })
				] })
			})
		]
	});
}
//#endregion
export { ServicesIndexPage as component };
