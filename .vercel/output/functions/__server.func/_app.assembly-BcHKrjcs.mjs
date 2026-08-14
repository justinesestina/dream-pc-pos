import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as User, q as Hammer } from "./_libs/lucide-react.mjs";
import { D as stageProgress, L as cn, O as useOps, P as useStore, U as money } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, l as TechLabel, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { i as ProgressBar, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as Checkbox } from "./_ssr/checkbox-D8wvWY2q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.assembly-BcHKrjcs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TECHS = [
	"Unassigned",
	"Marco Reyes",
	"Angelo Cruz",
	"Bea Santos",
	"Jun Dela Cruz",
	"Ken Villareal"
];
var COLUMNS = [
	{
		id: "parts_reserved",
		label: "Parts Reserved",
		filterFn: (b) => b.status === "parts_reserved" || b.status === "approved",
		accent: "border-t-info/60"
	},
	{
		id: "assembly",
		label: "Assembly",
		filterFn: (b) => b.status === "assembly",
		accent: "border-t-warning/60"
	},
	{
		id: "testing",
		label: "Testing / QA",
		filterFn: (b) => b.status === "testing",
		accent: "border-t-[#c084fc]/60"
	},
	{
		id: "ready",
		label: "Ready for Release",
		filterFn: (b) => b.status === "ready",
		accent: "border-t-success/60"
	},
	{
		id: "cancelled",
		label: "Cancelled",
		filterFn: (b) => b.status === "cancelled",
		accent: "border-t-destructive/50"
	}
];
function BuildCard({ build, expanded, onToggle }) {
	const store = useStore();
	const ops = useOps();
	const o = ops.opsForBuild(build.id);
	const pct = stageProgress(o.stage);
	const assemblyDone = o.assembly.filter((a) => a.done).length;
	const testsPassed = o.tests.filter((t) => t.result === "pass").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-elevated/60 transition-colors hover:border-border-strong",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "w-full p-3 text-left",
			onClick: onToggle,
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
					className: "mt-2 flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1 text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3" }), build.technician]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono text-foreground",
						children: money(build.budget)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
					value: pct,
					className: "mt-2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex gap-3 text-[10.5px] text-subtle",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Assembly ",
						assemblyDone,
						"/",
						o.assembly.length
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Tests ",
						testsPassed,
						"/",
						o.tests.length
					] })]
				})
			]
		}), expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border/60 p-3 pt-2.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: "Technician" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: build.technician,
						onValueChange: (v) => {
							store.updateBuild(build.id, { technician: v });
							ops.assignBuildStaff(build.id, { technician: v });
							toast.success(`Assigned ${v} to ${build.id}.`);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-7 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TECHS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: t,
							children: t
						}, t)) })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: "Assembly" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 mt-1 max-h-36 space-y-0.5 overflow-y-auto",
					children: o.assembly.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: a.done,
							onCheckedChange: (v) => ops.toggleAssemblyStep(build.id, a.label, v === true),
							className: "size-3.5"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("text-[11.5px]", a.done ? "text-foreground line-through opacity-60" : "text-muted-foreground"),
							children: a.label
						})]
					}, a.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: "Tests" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 mt-1 max-h-28 space-y-0.5 overflow-y-auto",
					children: o.tests.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 rounded px-1.5 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11.5px] text-muted-foreground",
							children: t.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: cn("rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors", t.result === "pass" ? "bg-success/20 text-success" : "bg-elevated text-subtle hover:text-foreground"),
								onClick: () => ops.setTestResult(build.id, t.label, "pass"),
								children: "✓"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: cn("rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors", t.result === "fail" ? "bg-destructive/20 text-destructive" : "bg-elevated text-subtle hover:text-foreground"),
								onClick: () => ops.setTestResult(build.id, t.label, "fail"),
								children: "✗"
							})]
						})]
					}, t.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 pt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/builds/$buildId",
							params: { buildId: build.id },
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								className: "w-full text-xs",
								children: "Full details"
							})
						}),
						build.status === "assembly" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "flex-1 text-xs",
							disabled: assemblyDone < o.assembly.length,
							onClick: () => {
								store.setBuildStatus(build.id, "testing");
								ops.setBuildStage(build.id, "testing");
								toast.success(`${build.id} moved to Testing.`);
							},
							children: "→ Testing"
						}),
						build.status === "testing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "flex-1 text-xs",
							disabled: testsPassed < o.tests.length,
							onClick: () => {
								store.setBuildStatus(build.id, "ready");
								ops.setBuildStage(build.id, "ready");
								store.finalizeQa(build.id, "pass");
								ops.signQa(build.id, store.user?.name ?? "QA Staff");
								toast.success(`${build.id} QA passed — ready for release.`);
							},
							children: "→ Ready"
						}),
						(build.status === "parts_reserved" || build.status === "approved") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "flex-1 text-xs",
							onClick: () => {
								store.setBuildStatus(build.id, "assembly");
								ops.setBuildStage(build.id, "assembly");
								toast.success(`${build.id} moved to Assembly.`);
							},
							children: "Start assembly"
						})
					]
				})
			]
		})]
	});
}
function AssemblyWorkspacePage() {
	const store = useStore();
	const ops = useOps();
	const [q, setQ] = (0, import_react.useState)("");
	const [techFilter, setTechFilter] = (0, import_react.useState)("all");
	const [expandedId, setExpandedId] = (0, import_react.useState)(null);
	const activeBuilds = (0, import_react.useMemo)(() => {
		return store.builds.filter((b) => b.status !== "draft" && b.status !== "consultation" && b.status !== "quoted" && b.status !== "released");
	}, [store.builds]);
	const filtered = (0, import_react.useMemo)(() => {
		let list = activeBuilds;
		if (q.trim()) {
			const query = q.trim().toLowerCase();
			list = list.filter((b) => b.id.toLowerCase().includes(query) || b.customerName.toLowerCase().includes(query) || b.purpose.toLowerCase().includes(query) || b.technician.toLowerCase().includes(query));
		}
		if (techFilter !== "all") list = list.filter((b) => b.technician === techFilter);
		return list;
	}, [
		activeBuilds,
		q,
		techFilter
	]);
	const inAssembly = activeBuilds.filter((b) => b.status === "assembly").length;
	const inTesting = activeBuilds.filter((b) => b.status === "testing").length;
	const ready = activeBuilds.filter((b) => b.status === "ready").length;
	const avgProgress = (0, import_react.useMemo)(() => {
		const pipeline = activeBuilds.filter((b) => b.status !== "cancelled");
		if (pipeline.length === 0) return 0;
		return Math.round(pipeline.reduce((s, b) => s + stageProgress(ops.opsForBuild(b.id).stage), 0) / pipeline.length);
	}, [activeBuilds, ops]);
	const assignedTechs = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const b of store.builds) set.add(b.technician);
		return [...set].sort();
	}, [store.builds]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Assembly Workspace",
				description: "Kanban board for build assembly, testing and QA — designed for technicians."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In assembly",
						numericValue: inAssembly,
						format: (n) => Math.round(n).toString(),
						accent: "warning",
						hint: "Currently on the bench"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In testing / QA",
						numericValue: inTesting,
						format: (n) => Math.round(n).toString(),
						accent: "info",
						hint: "Tests & QA sign-off"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Ready for release",
						numericValue: ready,
						format: (n) => Math.round(n).toString(),
						accent: "success",
						hint: "Awaiting customer pickup"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Avg. progress",
						numericValue: avgProgress,
						format: (n) => `${Math.round(n)}%`,
						accent: "info",
						hint: "Across active pipeline"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search build ID, customer, technician…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: techFilter,
					onValueChange: setTechFilter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-8 w-40 text-[13px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All technicians" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All technicians"
					}), assignedTechs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: t,
						children: t
					}, t))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: activeBuilds.length,
					noun: "builds"
				})
			] }) }),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No active builds",
				description: "No builds are currently in the assembly pipeline. Create a new build and advance it past the 'Approved' stage.",
				icon: Hammer
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-4 overflow-x-auto pb-2",
				children: COLUMNS.map((col) => {
					const items = filtered.filter(col.filterFn);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-72 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("mb-3 rounded-t-md border-t-2 px-1 pt-0.5", col.accent),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: col.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
									className: "text-subtle",
									children: items.length
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-md border border-dashed border-border p-4 text-center text-xs text-subtle",
								children: "No builds"
							}) : items.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildCard, {
								build: b,
								expanded: expandedId === b.id,
								onToggle: () => setExpandedId(expandedId === b.id ? null : b.id)
							}, b.id))
						})]
					}, col.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "The assembly workspace reads from local demo state. Drag-and-drop between columns is not implemented — use the quick-action buttons or the full build detail page to advance stages." })
		]
	});
}
//#endregion
export { AssemblyWorkspacePage as component };
