import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { L as cn, O as useOps, P as useStore, R as dateShort, q as titleCase } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { i as roleLabels, t as can } from "./_ssr/permissions-DN7TKSNU.mjs";
import { a as PageHeader, l as TechLabel, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { i as ProgressBar, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.staff-BNdU-wiy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	"Owner",
	"Admin",
	"Technician",
	"Cashier",
	"Inventory"
];
function StaffFormDialog({ open, onOpenChange, staff }) {
	const { createStaff, updateStaff } = useOps();
	const isEdit = Boolean(staff);
	const [name, setName] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("Technician");
	const [skills, setSkills] = (0, import_react.useState)("");
	const [shift, setShift] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setName(staff?.name ?? "");
		setRole(staff?.role ?? "Technician");
		setSkills(staff?.skills.join(", ") ?? "");
		setShift(staff?.shift ?? "");
	}, [open, staff]);
	const submit = () => {
		if (!name.trim()) {
			toast.error("Staff name is required.");
			return;
		}
		const trimmed = name.trim();
		const payload = {
			name: trimmed,
			initials: trimmed.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?",
			role,
			skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
			shift: shift.trim() || "As scheduled"
		};
		if (isEdit && staff) {
			updateStaff(staff.id, payload);
			toast.success(`${payload.name} updated.`);
		} else {
			createStaff(payload);
			toast.success(`${payload.name} added to the roster.`);
		}
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit staff member" : "Add staff member" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "staff-name",
								children: "Full name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "staff-name",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Maria Santos"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "staff-role",
								children: "Role"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: role,
								onValueChange: setRole,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "staff-role",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: r,
									children: r
								}, r)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "staff-skills",
								children: "Skills (comma-separated)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "staff-skills",
								value: skills,
								onChange: (e) => setSkills(e.target.value),
								placeholder: "Assembly, Diagnostics, POS"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "staff-shift",
								children: "Shift"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "staff-shift",
								value: shift,
								onChange: (e) => setShift(e.target.value),
								placeholder: "e.g. Mon–Sat 09:00–18:00"
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
					children: isEdit ? "Save changes" : "Add staff"
				})] })
			]
		})
	});
}
var KINDS = [
	"Task",
	"Build",
	"QA",
	"Service",
	"Shift"
];
function StaffPage() {
	const { staff, tasks, buildOps, shifts, updateStaff } = useOps();
	const { builds, services, user } = useStore();
	const [q, setQ] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("all");
	const [focus, setFocus] = (0, import_react.useState)(null);
	const [dialog, setDialog] = (0, import_react.useState)({ open: false });
	const assignments = (0, import_react.useMemo)(() => {
		const list = [];
		for (const t of tasks) {
			if (t.status === "done") continue;
			list.push({
				id: `a-task-${t.id}`,
				staffName: t.assignee,
				kind: "Task",
				refId: t.id,
				detail: t.title,
				due: t.dueAt,
				status: t.status,
				to: "/tasks",
				param: ""
			});
		}
		for (const b of buildOps) {
			const build = builds.find((x) => x.id === b.buildId);
			if (!build || build.status === "released") continue;
			if (b.technician && b.technician !== "Unassigned") list.push({
				id: `a-build-${b.buildId}`,
				staffName: b.technician,
				kind: "Build",
				refId: b.buildId,
				detail: `${build.purpose} — ${titleCase(b.stage)}`,
				due: build.createdAt,
				status: build.status,
				to: "/builds/$buildId",
				param: "buildId"
			});
			if (b.qaStaff && b.qaStaff !== "Unassigned" && !b.qaSignedAt) list.push({
				id: `a-qa-${b.buildId}`,
				staffName: b.qaStaff,
				kind: "QA",
				refId: b.buildId,
				detail: `QA sign-off pending — ${build.purpose}`,
				due: build.createdAt,
				status: build.status,
				to: "/builds/$buildId",
				param: "buildId"
			});
		}
		for (const s of services) {
			if (s.status === "released" || s.status === "cancelled") continue;
			list.push({
				id: `a-svc-${s.id}`,
				staffName: s.technician,
				kind: "Service",
				refId: s.id,
				detail: `${s.device} — ${s.issue}`,
				due: s.createdAt,
				status: s.status,
				to: "/services/$ticketId",
				param: "ticketId"
			});
		}
		for (const sh of shifts) {
			if (sh.status !== "open") continue;
			list.push({
				id: `a-shift-${sh.id}`,
				staffName: sh.cashier,
				kind: "Shift",
				refId: sh.id,
				detail: `Register open since ${dateShort(sh.openedAt)}`,
				due: sh.openedAt,
				status: sh.status,
				to: "/shifts/$shiftId",
				param: "shiftId"
			});
		}
		return list;
	}, [
		tasks,
		buildOps,
		builds,
		services,
		shifts
	]);
	const loadByStaff = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const a of assignments) map.set(a.staffName, (map.get(a.staffName) ?? 0) + 1);
		return map;
	}, [assignments]);
	const maxLoad = Math.max(1, ...Array.from(loadByStaff.values()));
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		return assignments.filter((a) => {
			if (kind !== "all" && a.kind !== kind) return false;
			if (focus && a.staffName !== focus) return false;
			if (!needle) return true;
			return a.staffName.toLowerCase().includes(needle) || a.refId.toLowerCase().includes(needle) || a.detail.toLowerCase().includes(needle);
		});
	}, [
		assignments,
		kind,
		focus,
		q
	]);
	const stats = (0, import_react.useMemo)(() => ({
		available: staff.filter((s) => s.status === "available").length,
		busy: staff.filter((s) => s.status === "busy").length,
		open: assignments.length,
		completed: staff.reduce((sum, s) => sum + s.completed, 0)
	}), [staff, assignments]);
	const columns = [
		{
			key: "staff",
			header: "Staff",
			cell: (a) => a.staffName,
			sortValue: (a) => a.staffName
		},
		{
			key: "kind",
			header: "Type",
			cell: (a) => a.kind,
			sortValue: (a) => a.kind
		},
		{
			key: "ref",
			header: "Reference",
			cell: (a) => a.param ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
				to: a.to,
				params: { [a.param]: a.refId },
				children: a.refId
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono text-[11.5px] text-muted-foreground",
				children: a.refId
			}),
			sortValue: (a) => a.refId
		},
		{
			key: "detail",
			header: "Detail",
			cell: (a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "line-clamp-1 text-[12.5px] text-muted-foreground",
				children: a.detail
			}),
			sortValue: (a) => a.detail
		},
		{
			key: "since",
			header: "Since / due",
			cell: (a) => dateShort(a.due),
			sortValue: (a) => a.due
		},
		{
			key: "status",
			header: "Status",
			cell: (a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: a.status }),
			sortValue: (a) => a.status
		}
	];
	const staffTone = {
		available: "success",
		busy: "warning",
		off: "neutral"
	};
	if (!can(user?.role ?? "owner", "staff")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Staff & Assignments",
			description: "Technician workload and operational assignments."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No access to staff",
			description: `The ${roleLabels[user?.role ?? "owner"]} role does not include the staff capability. Sign in as an Owner, Admin or Technician role to view workload and assignments.`
		}) })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Staff & Assignments",
				description: "Technician workload and operational assignments.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [focus ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => setFocus(null),
					children: ["Clear focus — ", focus]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setDialog({ open: true }),
					children: "Add staff"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Available now",
						numericValue: stats.available,
						format: (n) => Math.round(n).toString(),
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Currently busy",
						numericValue: stats.busy,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open assignments",
						numericValue: stats.open,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Jobs completed",
						numericValue: stats.completed,
						format: (n) => Math.round(n).toString(),
						accent: "neutral"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
				children: staff.map((s) => {
					const load = loadByStaff.get(s.name) ?? 0;
					const active = focus === s.name;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("rounded-lg border bg-surface transition-colors", active ? "border-border-strong ring-1 ring-info/40" : "border-border"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							role: "button",
							tabIndex: 0,
							onClick: () => {
								setFocus(active ? null : s.name);
								if (!active) toast.info(`Filtered assignments for ${s.name}.`);
							},
							onKeyDown: (e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setFocus(active ? null : s.name);
								}
							},
							"aria-pressed": active,
							className: "cursor-pointer p-3.5 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-[12px] text-foreground",
										children: s.initials
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-[13.5px] font-medium text-foreground",
												children: s.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
												status: s.status,
												tone: staffTone[s.status]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11.5px] text-muted-foreground",
											children: [
												s.role,
												" · ",
												s.shift
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: "Workload" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mono text-[11px] text-subtle",
											children: [load, " open"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
										className: "mt-1.5",
										value: load / maxLoad * 100,
										tone: load > maxLoad * .66 ? "warning" : "info"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex flex-wrap gap-1.5",
									children: s.skills.map((skill) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded border border-border bg-elevated px-1.5 py-0.5 text-[10.5px] text-muted-foreground",
										children: skill
									}, skill))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mono mt-3 text-[10.5px] text-subtle",
									children: [s.completed, " jobs completed all-time"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-between gap-2 border-t border-border px-2 py-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setDialog({
										open: true,
										staff: s
									}),
									children: "Edit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: s.status === "off" ? "" : "text-destructive hover:text-destructive",
									onClick: () => {
										if (s.status === "off") {
											updateStaff(s.id, { status: "available" });
											toast.success(`${s.name} marked available.`);
										} else {
											updateStaff(s.id, { status: "off" });
											toast.success(`${s.name} set off duty.`);
										}
									},
									children: s.status === "off" ? "Set available" : "Set off duty"
								})]
							})
						})]
					}, s.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search staff, reference or detail…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: kind,
					onChange: setKind,
					options: KINDS,
					label: "Type"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: assignments.length,
					noun: "assignments"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns,
				pageSize: 12,
				initialSort: {
					key: "since",
					dir: "desc"
				},
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No assignments match your filters",
					description: "Clear the staff focus or change the type filter."
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Workload is derived from local demo tasks, builds, services and shifts. Rosters, payroll and time tracking are not simulated." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffFormDialog, {
				open: dialog.open,
				onOpenChange: (v) => setDialog((d) => ({
					...d,
					open: v
				})),
				staff: dialog.staff
			})
		]
	});
}
//#endregion
export { StaffPage as component };
