import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { O as Pencil, T as Plus, d as Trash2, vt as CalendarClock } from "./_libs/lucide-react.mjs";
import { K as relative, L as cn, O as useOps, R as dateShort, q as titleCase } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, l as TechLabel, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as Toolbar, i as Segmented, n as ResultCount, r as SearchInput, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.tasks-Ce4WgGCm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"todo",
	"in_progress",
	"blocked",
	"done"
];
var PRIORITIES = [
	"urgent",
	"high",
	"normal",
	"low"
];
var priorityTone = {
	urgent: "danger",
	high: "warning",
	normal: "info",
	low: "neutral"
};
var LINK_ROUTE = {
	build: {
		to: "/builds/$buildId",
		param: "buildId"
	},
	service: {
		to: "/services/$ticketId",
		param: "ticketId"
	},
	order: {
		to: "/orders/$orderId",
		param: "orderId"
	},
	receiving: {
		to: "/receiving/$receiptId",
		param: "receiptId"
	},
	qa: {
		to: "/builds/$buildId",
		param: "buildId"
	},
	customer: {
		to: "/customers/$customerId",
		param: "customerId"
	}
};
function isOverdue(t) {
	return t.status !== "done" && new Date(t.dueAt).getTime() < Date.now();
}
function TaskLink({ task }) {
	if (!task.link) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-subtle",
		children: "—"
	});
	const route = LINK_ROUTE[task.link.kind];
	if (!route) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mono text-[11.5px] text-subtle",
		children: task.link.id
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
		to: route.to,
		params: { [route.param]: task.link.id },
		children: task.link.id
	});
}
function TaskEditorDialog({ open, onOpenChange, staff, task }) {
	const { createTask, updateTask } = useOps();
	const isEdit = Boolean(task);
	const [title, setTitle] = (0, import_react.useState)("");
	const [detail, setDetail] = (0, import_react.useState)("");
	const [newAssignee, setNewAssignee] = (0, import_react.useState)("");
	const [newPriority, setNewPriority] = (0, import_react.useState)("normal");
	const [dueAt, setDueAt] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setTitle(task?.title ?? "");
		setDetail(task?.detail ?? "");
		setNewAssignee(task?.assignee ?? "");
		setNewPriority(task?.priority ?? "normal");
		setDueAt(task ? new Date(task.dueAt).toISOString().slice(0, 10) : "");
	}, [open, task]);
	const submit = () => {
		if (!title.trim()) {
			toast.error("Task title is required.");
			return;
		}
		if (!newAssignee) {
			toast.error("Pick an assignee.");
			return;
		}
		const due = dueAt ? new Date(dueAt).toISOString() : new Date(Date.now() + 864e5).toISOString();
		const payload = {
			title: title.trim(),
			detail: detail.trim() ? detail.trim() : void 0,
			assignee: newAssignee,
			priority: newPriority,
			dueAt: due
		};
		if (isEdit && task) {
			updateTask(task.id, payload);
			toast.success(`${task.id} updated.`);
		} else {
			const created = createTask(payload);
			toast.success(`${created.id} assigned to ${newAssignee}.`);
		}
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange,
		children: [!task && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New task"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit task" : "New task" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: isEdit ? "Update the title, detail, assignment or schedule." : "Assign operational work to a team member." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "task-title",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "task-title",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							placeholder: "e.g. Cable-manage BUILD-10488"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "task-detail",
							children: "Detail"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "task-detail",
							rows: 3,
							value: detail,
							onChange: (e) => setDetail(e.target.value),
							placeholder: "Optional notes or acceptance criteria"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "task-assignee",
									children: "Assignee"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: newAssignee,
									onValueChange: setNewAssignee,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "task-assignee",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select staff" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: staff.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s.name,
										children: s.name
									}, s.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "task-priority",
									children: "Priority"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: newPriority,
									onValueChange: (v) => setNewPriority(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "task-priority",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p,
										children: titleCase(p)
									}, p)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "task-due",
									children: "Due"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "task-due",
									type: "date",
									value: dueAt,
									onChange: (e) => setDueAt(e.target.value)
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => onOpenChange(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: submit,
				children: isEdit ? "Save changes" : "Create task"
			})] })
		] })]
	});
}
function DeleteTaskButton({ task }) {
	const { deleteTask } = useOps();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-7 text-muted-foreground hover:text-destructive",
			"aria-label": "Delete task",
			onClick: (e) => e.stopPropagation(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
		"Delete ",
		task.id,
		"?"
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
		"\"",
		task.title,
		"\" will be removed from the board. This cannot be undone."
	] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep task" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
		className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
		onClick: () => {
			deleteTask(task.id);
			toast.success(`${task.id} deleted.`);
		},
		children: "Delete task"
	})] })] })] });
}
function TasksPage() {
	const { tasks, staff, setTaskStatus, assignTask } = useOps();
	const [view, setView] = (0, import_react.useState)("board");
	const [q, setQ] = (0, import_react.useState)("");
	const [assignee, setAssignee] = (0, import_react.useState)("all");
	const [priority, setPriority] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const assignees = (0, import_react.useMemo)(() => Array.from(/* @__PURE__ */ new Set([...staff.map((s) => s.name), ...tasks.map((t) => t.assignee)])).sort(), [staff, tasks]);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		return tasks.filter((t) => {
			if (assignee !== "all" && t.assignee !== assignee) return false;
			if (priority !== "all" && t.priority !== priority) return false;
			if (!needle) return true;
			return t.title.toLowerCase().includes(needle) || (t.detail ?? "").toLowerCase().includes(needle) || (t.link?.id ?? "").toLowerCase().includes(needle) || t.id.toLowerCase().includes(needle);
		});
	}, [
		tasks,
		q,
		assignee,
		priority
	]);
	const stats = (0, import_react.useMemo)(() => ({
		openCount: tasks.filter((t) => t.status !== "done").length,
		inProgress: tasks.filter((t) => t.status === "in_progress").length,
		blocked: tasks.filter((t) => t.status === "blocked").length,
		overdue: tasks.filter(isOverdue).length
	}), [tasks]);
	const advance = (t) => {
		const next = t.status === "todo" ? "in_progress" : t.status === "in_progress" ? "done" : "in_progress";
		setTaskStatus(t.id, next);
		toast.success(`${t.id} → ${titleCase(next)}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Tasks",
				description: "Operational tasks across builds, services and receiving.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskEditorDialog, {
					open,
					onOpenChange: setOpen,
					staff
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open tasks",
						numericValue: stats.openCount,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In progress",
						numericValue: stats.inProgress,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Blocked",
						numericValue: stats.blocked,
						format: (n) => Math.round(n).toString(),
						accent: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Overdue",
						numericValue: stats.overdue,
						format: (n) => Math.round(n).toString(),
						accent: stats.overdue ? "danger" : "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: q,
					onChange: setQ,
					placeholder: "Search title, reference or ID…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: assignee,
					onChange: setAssignee,
					options: assignees,
					label: "Assignee"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: priority,
					onChange: setPriority,
					options: PRIORITIES,
					label: "Priority"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
					value: view,
					onChange: setView,
					options: [{
						value: "board",
						label: "Board"
					}, {
						value: "list",
						label: "List"
					}]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
					shown: filtered.length,
					total: tasks.length,
					noun: "tasks"
				})
			] }), view === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "task",
						header: "Task",
						cell: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[13px] text-foreground",
								children: t.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mono text-[10.5px] text-subtle",
								children: t.id
							})]
						}),
						sortValue: (t) => t.title
					},
					{
						key: "assignee",
						header: "Assignee",
						cell: (t) => t.assignee,
						sortValue: (t) => t.assignee
					},
					{
						key: "priority",
						header: "Priority",
						cell: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							status: t.priority,
							tone: priorityTone[t.priority]
						}),
						sortValue: (t) => PRIORITIES.indexOf(t.priority)
					},
					{
						key: "link",
						header: "Linked to",
						cell: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskLink, { task: t }),
						sortValue: (t) => t.link?.id ?? ""
					},
					{
						key: "due",
						header: "Due",
						cell: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("mono text-[11.5px]", isOverdue(t) ? "text-destructive" : "text-muted-foreground"),
							children: dateShort(t.dueAt)
						}),
						sortValue: (t) => t.dueAt
					},
					{
						key: "status",
						header: "Status",
						cell: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							status: t.status,
							tone: t.status === "blocked" ? "danger" : t.status === "done" ? "success" : t.status === "in_progress" ? "info" : "neutral"
						}),
						sortValue: (t) => STATUSES.indexOf(t.status)
					},
					{
						key: "actions",
						header: "",
						align: "right",
						cell: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "size-7 text-muted-foreground",
									"aria-label": "Edit task",
									onClick: (e) => {
										e.stopPropagation();
										setEditing(t);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
								}),
								t.status === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mono text-[11px] text-subtle",
									children: relative(t.dueAt)
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: (e) => {
										e.stopPropagation();
										advance(t);
									},
									children: t.status === "todo" ? "Start" : t.status === "in_progress" ? "Complete" : "Unblock"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteTaskButton, { task: t })
							]
						})
					}
				],
				pageSize: 12,
				initialSort: {
					key: "due",
					dir: "asc"
				},
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No tasks match your filters",
					description: "Adjust the assignee or priority filter."
				})
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No tasks match your filters",
				description: "Adjust the assignee or priority filter."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 p-3 lg:grid-cols-4",
				children: STATUSES.map((status) => {
					const rows = filtered.filter((t) => t.status === status);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-elevated/40 p-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-1 pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: titleCase(status) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-[11px] text-subtle",
								children: rows.length
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-1 py-4 text-center text-[11.5px] text-subtle",
								children: "Nothing here"
							}), rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-md border border-border bg-surface p-2.5 transition-colors hover:border-border-strong",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[12.5px] leading-snug text-foreground",
											children: t.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											status: t.priority,
											tone: priorityTone[t.priority]
										})]
									}),
									t.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 line-clamp-2 text-[11.5px] text-muted-foreground",
										children: t.detail
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-subtle",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mono",
												children: t.id
											}),
											t.link && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskLink, { task: t }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: cn("inline-flex items-center gap-1", isOverdue(t) && "text-destructive"),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3" }), dateShort(t.dueAt)]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2.5 flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: t.assignee,
												onValueChange: (v) => assignTask(t.id, v),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-7 flex-1 text-[11.5px]",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: assignees.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: a,
													children: a
												}, a)) })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "size-7 shrink-0 text-muted-foreground",
												"aria-label": "Edit task",
												onClick: () => setEditing(t),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
											}),
											t.status !== "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "h-7 shrink-0",
												onClick: () => advance(t),
												children: t.status === "todo" ? "Start" : t.status === "in_progress" ? "Done" : "Unblock"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteTaskButton, { task: t })
										]
									})
								]
							}, t.id))]
						})]
					}, status);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Task changes update local demo state only — no notifications, calendar sync or assignment emails are sent." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskEditorDialog, {
				open: Boolean(editing),
				onOpenChange: (v) => !v && setEditing(null),
				staff,
				task: editing ?? void 0
			})
		]
	});
}
//#endregion
export { TasksPage as component };
