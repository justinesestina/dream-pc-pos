import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { H as LayoutGrid, T as Plus, V as List, q as Hammer } from "./_libs/lucide-react.mjs";
import { D as stageProgress, N as useSimulatedLoad, O as useOps, P as useStore, R as dateShort, U as money } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, l as TechLabel, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { i as ProgressBar } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, i as Segmented, n as ResultCount, r as SearchInput } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.builds.index-Bn0j1Y63.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGE_GROUPS = [
	{
		status: "draft",
		label: "Draft"
	},
	{
		status: "consultation",
		label: "Consultation"
	},
	{
		status: "quoted",
		label: "Quoted"
	},
	{
		status: "approved",
		label: "Approved"
	},
	{
		status: "parts_reserved",
		label: "Parts Reserved"
	},
	{
		status: "assembly",
		label: "Assembly"
	},
	{
		status: "testing",
		label: "Testing / QA"
	},
	{
		status: "ready",
		label: "Ready"
	},
	{
		status: "released",
		label: "Released"
	}
];
function NewBuildDialog() {
	const store = useStore();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [customerId, setCustomerId] = (0, import_react.useState)("none");
	const [purpose, setPurpose] = (0, import_react.useState)("");
	const [budget, setBudget] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const submit = () => {
		if (!purpose.trim()) {
			toast.error("Purpose is required.");
			return;
		}
		const trimmedNotes = notes.trim();
		const build = store.createBuild({
			customerId: customerId === "none" ? null : customerId,
			purpose: purpose.trim(),
			budget: Number(budget) || 0,
			...trimmedNotes ? { notes: trimmedNotes } : {}
		});
		toast.success(`${build.id} created.`);
		setOpen(false);
		setPurpose("");
		setBudget("");
		setNotes("");
		setCustomerId("none");
		navigate({
			to: "/builds/$buildId",
			params: { buildId: build.id }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New build"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New custom build" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "nb-customer",
							children: "Customer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: customerId,
							onValueChange: setCustomerId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "nb-customer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "none",
								children: "Walk-in customer"
							}), store.customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.id,
								children: c.name
							}, c.id))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "nb-purpose",
							children: "Purpose"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "nb-purpose",
							value: purpose,
							onChange: (e) => setPurpose(e.target.value),
							placeholder: "e.g. 1440p gaming rig"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "nb-budget",
							children: "Budget (PHP)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "nb-budget",
							type: "number",
							value: budget,
							onChange: (e) => setBudget(e.target.value),
							placeholder: "80000"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "nb-notes",
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "nb-notes",
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							rows: 3
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
				children: "Create build"
			})] })
		] })]
	});
}
function BuildCard({ build }) {
	const o = useOps().opsForBuild(build.id);
	const pct = stageProgress(o.stage);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/builds/$buildId",
		params: { buildId: build.id },
		className: "block rounded-md border border-border bg-elevated/60 p-3 transition-colors hover:border-border-strong hover:bg-elevated",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
					className: "text-foreground",
					children: build.id
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: build.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 truncate text-[13px] text-foreground",
				children: build.customerName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs text-muted-foreground",
				children: build.purpose
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2.5 flex items-center justify-between text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle",
					children: build.technician
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono text-foreground",
					children: money(build.budget)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
				value: pct,
				className: "mt-2"
			})
		]
	});
}
function BuildsIndexPage() {
	const store = useStore();
	const ops = useOps();
	const loading = useSimulatedLoad();
	const [view, setView] = (0, import_react.useState)("board");
	const [q, setQ] = (0, import_react.useState)("");
	const builds = store.builds;
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		if (!query) return builds;
		return builds.filter((b) => b.id.toLowerCase().includes(query) || b.customerName.toLowerCase().includes(query) || b.purpose.toLowerCase().includes(query));
	}, [builds, q]);
	const active = builds.filter((b) => b.status !== "released" && b.status !== "cancelled").length;
	const inAssembly = builds.filter((b) => b.status === "assembly").length;
	const awaitingQa = builds.filter((b) => b.status === "testing").length;
	const readyForRelease = builds.filter((b) => b.status === "ready").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Custom Builds",
				description: "Build pipeline from consultation through QA to release.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewBuildDialog, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active builds",
						numericValue: active,
						accent: "info",
						hint: "Not released or cancelled"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In assembly",
						numericValue: inAssembly,
						accent: "warning",
						hint: "Currently on the bench"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Awaiting QA",
						numericValue: awaitingQa,
						accent: "warning",
						hint: "In testing stage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Ready for release",
						numericValue: readyForRelease,
						accent: "success",
						hint: "Awaiting pickup"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search build ID, customer, purpose…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: builds.length,
					noun: "builds"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
					value: view,
					onChange: setView,
					options: [{
						value: "board",
						label: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-3.5" })
					}, {
						value: "table",
						label: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-3.5" })
					}]
				})
			] }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Loading builds…",
					icon: Hammer
				})
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No builds found",
				description: "Try a different search or create a new build.",
				icon: Hammer
			}) : view === "table" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "id",
						header: "Build ID",
						cell: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
							className: "text-foreground",
							children: b.id
						}),
						sortValue: (b) => b.id
					},
					{
						key: "customer",
						header: "Customer",
						cell: (b) => b.customerName,
						sortValue: (b) => b.customerName
					},
					{
						key: "purpose",
						header: "Purpose",
						cell: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: b.purpose
						})
					},
					{
						key: "budget",
						header: "Budget",
						align: "right",
						cell: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: money(b.budget) }),
						sortValue: (b) => b.budget
					},
					{
						key: "status",
						header: "Stage",
						cell: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: b.status })
					},
					{
						key: "technician",
						header: "Technician",
						cell: (b) => b.technician
					},
					{
						key: "progress",
						header: "Progress",
						cell: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
							value: stageProgress(ops.opsForBuild(b.id).stage),
							className: "w-24"
						})
					},
					{
						key: "created",
						header: "Created",
						cell: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: dateShort(b.createdAt) }),
						sortValue: (b) => b.createdAt
					}
				],
				pageSize: 15
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-3 overflow-x-auto p-3",
				children: STAGE_GROUPS.map((g) => {
					const items = filtered.filter((b) => b.status === g.status);
					if (items.length === 0) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-64 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: g.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
								className: "text-subtle",
								children: items.length
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: items.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildCard, { build: b }, b.id))
						})]
					}, g.status);
				})
			})] })
		]
	});
}
//#endregion
export { BuildsIndexPage as component };
