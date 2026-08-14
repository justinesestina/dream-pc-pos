import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as Receipt, Dt as ArrowRight, S as RotateCcw, T as Plus, bt as Boxes, g as ShoppingCart, j as Package, n as Wrench, ot as ClipboardList, rt as Cpu, u as TriangleAlert } from "./_libs/lucide-react.mjs";
import { G as num, H as greeting, K as relative, L as cn, N as useSimulatedLoad, O as useOps, P as useStore, R as dateShort, U as money, j as ASSEMBLY_STAGES } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { t as Reveal } from "./_ssr/motion-B4sP9a_P.mjs";
import { a as PageHeader, c as RowsSkeleton, n as EmptyState, o as Panel, r as IdLink, s as PanelHeader, t as CardsSkeleton } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { a as XAxis, d as ResponsiveContainer, f as Tooltip, i as YAxis, o as Area, s as CartesianGrid, t as AreaChart } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.dashboard-qwSJRHD8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ranges = [
	"Today",
	"7 days",
	"30 days"
];
function SalesChart({ daily, hourly }) {
	const [range, setRange] = (0, import_react.useState)("7 days");
	const data = range === "Today" ? hourly : range === "7 days" ? daily.slice(-7) : daily;
	const revenue = data.reduce((s, d) => s + d.revenue, 0);
	const orders = data.reduce((s, d) => s + d.orders, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
		title: "Sales performance",
		hint: `${money(revenue)} revenue · ${orders} orders`,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "tablist",
			"aria-label": "Range",
			className: "flex rounded-md border border-border bg-background p-0.5",
			children: ranges.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				role: "tab",
				"aria-selected": range === r,
				onClick: () => setRange(r),
				className: cn("mono rounded px-2 py-1 text-[10.5px] tracking-wide uppercase transition-colors", range === r ? "bg-elevated text-foreground" : "text-subtle hover:text-muted-foreground"),
				children: r
			}, r))
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-[248px] px-2 py-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data,
				margin: {
					top: 8,
					right: 12,
					left: 4,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "revFill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-info)",
							stopOpacity: .28
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-info)",
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-border)",
						strokeDasharray: "2 4",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						tick: {
							fontSize: 10,
							fill: "var(--color-subtle)"
						},
						stroke: "var(--color-border)",
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tick: {
							fontSize: 10,
							fill: "var(--color-subtle)"
						},
						stroke: "var(--color-border)",
						tickLine: false,
						width: 54,
						tickFormatter: (v) => `${Math.round(v / 1e3)}k`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "var(--color-popover)",
							border: "1px solid var(--color-border)",
							borderRadius: 8,
							fontSize: 12
						},
						formatter: (v, name) => name === "revenue" ? money(v) : v
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "revenue",
						stroke: "var(--color-info)",
						strokeWidth: 1.8,
						fill: "url(#revFill)"
					})
				]
			})
		})
	})] });
}
function last14Days(orders) {
	const days = [];
	for (let i = 13; i >= 0; i--) {
		const d = /* @__PURE__ */ new Date();
		d.setDate(d.getDate() - i);
		d.setHours(0, 0, 0, 0);
		const next = new Date(d);
		next.setDate(next.getDate() + 1);
		const dayOrders = orders.filter((o) => {
			const t = new Date(o.createdAt).getTime();
			return t >= d.getTime() && t < next.getTime() && o.payment;
		});
		days.push({
			label: d.toLocaleDateString("en-PH", {
				month: "short",
				day: "numeric"
			}),
			revenue: dayOrders.reduce((s, o) => s + o.total, 0),
			orders: dayOrders.length
		});
	}
	return days;
}
/** Small mono telemetry chip used in the command-center status strip. */
function Telemetry({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "mono inline-flex items-baseline gap-1.5 text-[11px] tracking-wide uppercase",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-foreground",
			children
		})]
	});
}
var PIPELINE_PHASES = [
	{
		id: "sales",
		label: "Consult"
	},
	{
		id: "assembly",
		label: "Bench"
	},
	{
		id: "validation",
		label: "Test"
	},
	{
		id: "handover",
		label: "Release"
	}
];
function DashboardPage() {
	const store = useStore();
	const ops = useOps();
	const loading = useSimulatedLoad();
	const today = (/* @__PURE__ */ new Date()).toDateString();
	const todays = store.orders.filter((o) => new Date(o.createdAt).toDateString() === today);
	const todaySales = todays.reduce((s, o) => s + (o.payment ? o.total : 0), 0);
	const lowStock = store.inventory.filter((i) => i.onHand - i.reserved <= i.reorderPoint);
	const pendingReturns = ops.returns.filter((r) => [
		"requested",
		"inspection",
		"approved"
	].includes(r.status)).length;
	const openBuilds = store.builds.filter((b) => !["released", "cancelled"].includes(b.status));
	const openServices = store.services.filter((s) => !["released", "cancelled"].includes(s.status));
	const daily = last14Days(store.orders);
	const hourly = Array.from({ length: 12 }).map((_, i) => {
		const start = /* @__PURE__ */ new Date();
		start.setHours(i + 8, 0, 0, 0);
		const end = new Date(start);
		end.setHours(i + 9, 0, 0, 0);
		const bucketOrders = store.orders.filter((o) => {
			if (!o.payment) return false;
			const t = new Date(o.createdAt).getTime();
			return t >= start.getTime() && t < end.getTime();
		});
		return {
			label: `${(i + 8).toString().padStart(2, "0")}:00`,
			revenue: bucketOrders.reduce((s, o) => s + o.total, 0),
			orders: bucketOrders.length
		};
	});
	const tasksToday = ops.tasks.filter((t) => {
		return new Date(t.dueAt).toDateString() === today && t.status !== "done";
	});
	const stageOf = (buildId) => ops.opsForBuild(buildId).stage;
	const phaseCounts = PIPELINE_PHASES.map((ph) => ({
		phase: ph,
		count: openBuilds.filter((b) => {
			return ASSEMBLY_STAGES.find((s) => s.id === stageOf(b.id))?.group === ph.id;
		}).length
	}));
	const activePhases = phaseCounts.filter((p) => p.count > 0);
	const benchBuilds = openBuilds.map((b) => ({
		b,
		stage: ASSEMBLY_STAGES.find((s) => s.id === stageOf(b.id))
	})).filter((x) => x.stage && ["assembly", "validation"].includes(x.stage.group)).slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "chassis-corners relative overflow-hidden rounded-xl border border-border bg-surface/60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 grid-backdrop opacity-50" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 ambient-glow" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative p-4 sm:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
							title: `${greeting()}, ${store.user?.name.split(" ")[0] ?? "there"}`,
							description: (/* @__PURE__ */ new Date()).toLocaleDateString("en-PH", {
								weekday: "long",
								month: "long",
								day: "numeric",
								year: "numeric"
							}),
							meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "label-tech",
								children: ["SYNC ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Local demo"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "label-tech",
								children: ["DATA ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-warning",
									children: "DEMO"
								})]
							})] }),
							actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/pos",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New Sale"]
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mono inline-flex items-center gap-2 text-[11px] tracking-wide uppercase",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "status-dot" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-subtle",
											children: "System"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-success",
											children: "Operational"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Telemetry, {
									label: "Env",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-warning",
										children: "Demo"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Telemetry, {
									label: "Skus",
									children: num(store.products.length)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Telemetry, {
									label: "Today",
									children: [
										todays.length,
										" txns · ",
										money(todaySales)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Telemetry, {
									label: "Builds",
									children: [openBuilds.length, " active"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Telemetry, {
									label: "Tickets",
									children: [openServices.length, " open"]
								})
							]
						})]
					})
				]
			}) }),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardsSkeleton, { count: 6 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, {
				stagger: .06,
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Today's revenue",
						numericValue: todaySales,
						format: money,
						hint: `${todays.length} transactions today`,
						accent: "info",
						icon: ShoppingCart
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Orders today",
						numericValue: todays.length,
						hint: "Completed & pending",
						icon: Receipt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open service tickets",
						numericValue: openServices.length,
						accent: "warning",
						hint: "In diagnosis / repair",
						icon: Wrench
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Builds in progress",
						numericValue: openBuilds.length,
						accent: "success",
						hint: "Active pipeline",
						icon: Cpu
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending returns",
						numericValue: pendingReturns,
						accent: "danger",
						hint: "Requested / inspection / approved",
						icon: RotateCcw
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Low-stock alerts",
						numericValue: lowStock.length,
						accent: "danger",
						hint: "At or below reorder point",
						icon: TriangleAlert
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-[1.55fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesChart, {
						daily,
						hourly
					}) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: .08,
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
							title: "Quick actions",
							hint: "Jump to the most-used workflows"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "h-16 flex-col gap-1.5 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/pos",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "size-4" }), " Point of Sale"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "h-16 flex-col gap-1.5 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/products",
										search: { openNew: false },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-4" }), " Products"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "h-16 flex-col gap-1.5 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/purchasing",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "size-4" }), " Purchasing"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "h-16 flex-col gap-1.5 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/services",
										search: { openNew: false },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-4" }), " Services"]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label-tech mb-2",
								children: "Open tasks due today"
							}), tasksToday.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No tasks due today."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2",
								children: tasksToday.slice(0, 5).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2 text-[12.5px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 shrink-0 rounded-full bg-warning" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "min-w-0 flex-1 truncate",
											children: t.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono shrink-0 text-[10.5px] text-subtle",
											children: t.assignee
										})
									]
								}, t.id))
							})]
						})
					] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-[1fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
						title: "Inventory alerts",
						hint: "Components at or below reorder point",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "ghost",
							className: "h-7 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/products",
								search: { openNew: false },
								children: ["View products ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
							})
						})
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowsSkeleton, { rows: 4 }) : lowStock.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: Boxes,
						title: "Stock levels healthy",
						description: "No components are below their reorder point."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: lowStock.slice(0, 6).map((i) => {
							const p = store.productById(i.productId);
							if (!p) return null;
							const avail = i.onHand - i.reserved;
							const pct = i.onHand > 0 ? Math.max(0, Math.min(100, avail / i.onHand * 100)) : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 px-4 py-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: avail === 0 ? "size-3.5 shrink-0 text-destructive" : "size-3.5 shrink-0 text-warning" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
											to: "/products/$productId",
											params: { productId: p.id },
											className: "block truncate text-[13px] text-foreground",
											children: p.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1.5 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-1 w-24 overflow-hidden rounded-full bg-elevated",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: cn("h-full rounded-full", avail === 0 ? "bg-destructive" : "bg-warning"),
													style: { width: `${pct}%` }
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mono text-[10.5px] text-subtle",
												children: [
													avail,
													"/",
													i.onHand
												]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										status: avail === 0 ? "out_of_stock" : "low_stock",
										label: `${avail} avail`
									})
								]
							}, i.productId);
						})
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: .08,
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
						title: "Build pipeline",
						hint: "Active custom builds by bench phase",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "ghost",
							className: "h-7 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/builds",
								children: "All builds"
							})
						})
					}), openBuilds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: Cpu,
						title: "No active builds",
						description: "New custom builds will appear here."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-1.5",
								children: phaseCounts.map(({ phase, count }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mono text-[11px] text-subtle",
									children: "→"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: cn("flex min-w-0 flex-1 flex-col gap-1 rounded-md border px-2.5 py-2 transition-colors", count > 0 ? "border-border-strong bg-elevated" : "border-border opacity-45"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "label-tech truncate",
										children: phase.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono text-lg leading-none tabular-nums",
										children: count
									})]
								})] }, phase.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "label-tech mt-3 mb-2",
								children: ["On the bench · ", activePhases.length ? activePhases.map((p) => `${p.phase.label}:${p.count}`).join(" · ") : "none"]
							}),
							benchBuilds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No builds currently in assembly or testing."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1.5",
								children: benchBuilds.map(({ b, stage }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2.5 rounded-md border border-border bg-surface px-2.5 py-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
											to: "/builds/$buildId",
											params: { buildId: b.id },
											children: b.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "min-w-0 flex-1 truncate text-[12.5px] text-muted-foreground",
											children: b.customerName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											status: stage?.id ?? b.status,
											className: "shrink-0",
											...stage ? { label: stage.label } : {}
										})
									]
								}, b.id))
							})
						]
					})] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-[1fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
						title: "Recent transactions",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "ghost",
							className: "h-7 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/orders",
								children: "All orders"
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: store.orders.slice(0, 6).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 px-4 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
										to: "/orders/$orderId",
										params: { orderId: o.id },
										children: o.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-[13px]",
										children: [o.items?.[0]?.name ?? "—", o.items && o.items.length > 1 ? ` +${o.items.length - 1}` : ""]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mono mt-0.5 text-[11px] text-subtle",
										children: [
											o.customerName,
											" · ",
											relative(o.createdAt)
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mono text-[13px] tabular-nums",
									children: money(o.total)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									status: o.status,
									className: "mt-1"
								})]
							})]
						}, o.id))
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: .08,
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
						title: "Recent notifications",
						hint: "System activity feed",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "h-7 text-xs",
							onClick: () => store.markAllNotificationsRead(),
							children: "Mark all read"
						})
					}), store.notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No notifications",
						description: "You're all caught up."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: store.notifications.slice(0, 6).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 px-4 py-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `mt-1.5 size-1.5 shrink-0 rounded-full ${n.read ? "bg-subtle" : "bg-info"}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-[13px] text-foreground",
										children: n.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-[12px] text-muted-foreground",
										children: n.body
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mono shrink-0 text-[11px] text-subtle",
									children: relative(n.at)
								})
							]
						}, n.id))
					})] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
				title: "Activity log",
				hint: "Demo audit trail"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: store.auditLogs.slice(0, 7).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 px-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate text-[13px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: a.actor
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: a.action
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono shrink-0 text-[11px] text-subtle",
						children: relative(a.at)
					})]
				}, a.id))
			})] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mono text-[10.5px] text-subtle",
				children: [
					"ALL FIGURES ARE DEMO DATA · ",
					num(store.products.length),
					" SKUS LOADED · ",
					dateShort((/* @__PURE__ */ new Date()).toISOString())
				]
			})
		]
	});
}
//#endregion
export { DashboardPage as component };
