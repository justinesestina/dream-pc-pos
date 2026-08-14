import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { K as relative, P as useStore, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./_ssr/popover-Bef0gulg.mjs";
import { a as PageHeader, n as EmptyState, o as Panel } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.audit-Dy0-Dg2T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuditPage() {
	const store = useStore();
	const [search, setSearch] = (0, import_react.useState)("");
	const [actor, setActor] = (0, import_react.useState)("all");
	const [entity, setEntity] = (0, import_react.useState)("all");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const logs = store.auditLogs;
	const actors = (0, import_react.useMemo)(() => Array.from(new Set(logs.map((l) => l.actor))), [logs]);
	const entities = (0, import_react.useMemo)(() => Array.from(new Set(logs.map((l) => l.entity.split("-")[0] ?? l.entity))), [logs]);
	const now = /* @__PURE__ */ new Date();
	const todayCount = logs.filter((l) => new Date(l.at).toDateString() === now.toDateString()).length;
	const weekCount = logs.filter((l) => Date.now() - new Date(l.at).getTime() < 6048e5).length;
	const distinctActors = new Set(logs.map((l) => l.actor)).size;
	const actionCounts = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const l of logs) {
			const key = l.action.split(" ")[0] ?? l.action;
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
	}, [logs]);
	const mostCommonAction = actionCounts[0]?.[0] ?? "—";
	const filtered = (0, import_react.useMemo)(() => {
		return logs.filter((l) => {
			if (actor !== "all" && l.actor !== actor) return false;
			if (entity !== "all" && !l.entity.startsWith(entity)) return false;
			if (search) {
				const q = search.toLowerCase();
				if (!l.actor.toLowerCase().includes(q) && !l.action.toLowerCase().includes(q) && !l.entity.toLowerCase().includes(q)) return false;
			}
			return true;
		});
	}, [
		logs,
		actor,
		entity,
		search
	]);
	const sorted = (0, import_react.useMemo)(() => [...filtered].sort((a, b) => sortDir === "desc" ? new Date(b.at).getTime() - new Date(a.at).getTime() : new Date(a.at).getTime() - new Date(b.at).getTime()), [filtered, sortDir]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Audit Log",
				description: "Read-only record of system activity."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Events today",
						numericValue: todayCount,
						accent: "info",
						hint: "Since midnight"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Events this week",
						numericValue: weekCount,
						accent: "success",
						hint: "Trailing 7 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Distinct actors",
						numericValue: distinctActors,
						hint: "Users generating events"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Most common action",
						value: mostCommonAction,
						hint: `${actionCounts[0]?.[1] ?? 0} occurrences`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: search,
					onChange: setSearch,
					placeholder: "Search actor, action, entity…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: actor,
					onChange: setActor,
					options: actors,
					label: "ACTOR"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: entity,
					onChange: setEntity,
					options: entities,
					label: "ENTITY"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					className: "h-8 text-xs",
					onClick: () => setSortDir((d) => d === "desc" ? "asc" : "desc"),
					children: sortDir === "desc" ? "Newest first" : "Oldest first"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: sorted.length,
					total: logs.length,
					noun: "events"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: sorted,
				columns: [
					{
						key: "at",
						header: "Timestamp",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono text-xs text-muted-foreground",
							children: dateTime(r.at)
						}),
						sortValue: (r) => new Date(r.at).getTime()
					},
					{
						key: "actor",
						header: "Actor",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[13px] text-foreground",
								children: r.actor
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								status: r.role,
								tone: "neutral",
								label: r.role
							})]
						}),
						sortValue: (r) => r.actor
					},
					{
						key: "action",
						header: "Action",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[13px] text-foreground",
							children: r.action
						}),
						sortValue: (r) => r.action
					},
					{
						key: "entity",
						header: "Entity",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono text-xs text-info",
							children: r.entity
						}),
						sortValue: (r) => r.entity
					},
					{
						key: "detail",
						header: "Details",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "h-7 text-xs",
								children: "View"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
							className: "w-80 text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label-tech mb-2",
								children: "Full record"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "ID"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mono text-xs",
											children: r.id
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Actor"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: r.actor })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Role"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: r.role })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Action"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "text-right",
											children: r.action
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Entity"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mono text-xs text-info",
											children: r.entity
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "At"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: "mono text-xs",
											children: [
												dateTime(r.at),
												" (",
												relative(r.at),
												")"
											]
										})]
									})
								]
							})]
						})] })
					}
				],
				pageSize: 15,
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No matching events",
					description: "Adjust your search or filters."
				})
			})] })
		]
	});
}
//#endregion
export { AuditPage as component };
