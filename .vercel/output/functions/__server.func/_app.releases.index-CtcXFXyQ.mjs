import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { O as useOps, P as useStore, R as dateShort, q as titleCase } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as Toolbar, n as ResultCount, t as FilterSelect } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as NewReleaseDialog } from "./_ssr/new-release-dialog-BAv98C71.mjs";
import { t as completeReleaseSource } from "./_ssr/release-complete-DXhhprxy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.releases.index-CtcXFXyQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"scheduled",
	"released",
	"completed"
];
var REF_ROUTE = {
	build: "/builds/$buildId",
	service: "/services/$ticketId",
	order: "/orders/$orderId"
};
var REF_PARAM = {
	build: "buildId",
	service: "ticketId",
	order: "orderId"
};
function ReleasesPage() {
	const { releases, actor, markReleaseReleased, completeRelease, setBuildStage } = useOps();
	const store = useStore();
	const navigate = useNavigate();
	const [status, setStatus] = (0, import_react.useState)("all");
	const advance = (r) => {
		if (r.status === "scheduled") {
			markReleaseReleased(r.id, actor);
			completeReleaseSource((id, s) => store.updateOrderStatus(id, s), (id, s) => store.setBuildStatus(id, s), (id, s) => store.setServiceStatus(id, s), r.kind, r.refId);
			if (r.kind === "build") setBuildStage(r.refId, "released");
			toast.success(`${r.id} marked released.`);
		} else if (r.status === "released") {
			completeRelease(r.id, r.customerName);
			toast.success(`${r.id} marked completed.`);
		}
	};
	const stats = (0, import_react.useMemo)(() => {
		const today = (/* @__PURE__ */ new Date()).toDateString();
		return {
			scheduledToday: releases.filter((r) => new Date(r.scheduledAt).toDateString() === today).length,
			pickups: releases.filter((r) => r.method === "pickup" && r.status !== "completed").length,
			deliveries: releases.filter((r) => r.method === "delivery" && r.status !== "completed").length,
			completed: releases.filter((r) => r.status === "completed").length
		};
	}, [releases]);
	const filtered = (0, import_react.useMemo)(() => status === "all" ? releases : releases.filter((r) => r.status === status), [releases, status]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Delivery & Release",
				description: "Pickup and delivery handover for builds and services.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewReleaseDialog, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Scheduled today",
						numericValue: stats.scheduledToday,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pickups pending",
						numericValue: stats.pickups,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Deliveries pending",
						numericValue: stats.deliveries,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Completed",
						numericValue: stats.completed,
						format: (n) => Math.round(n).toString(),
						accent: "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
				value: status,
				onChange: setStatus,
				options: STATUSES,
				label: "Status"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCount, {
				shown: filtered.length,
				total: releases.length,
				noun: "releases"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: filtered,
				columns: [
					{
						key: "ref",
						header: "Reference",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
							to: REF_ROUTE[r.kind],
							params: { [REF_PARAM[r.kind]]: r.refId },
							children: r.refId
						}),
						sortValue: (r) => r.refId
					},
					{
						key: "kind",
						header: "Kind",
						cell: (r) => titleCase(r.kind),
						sortValue: (r) => r.kind
					},
					{
						key: "customer",
						header: "Customer",
						cell: (r) => r.customerName,
						sortValue: (r) => r.customerName
					},
					{
						key: "method",
						header: "Method",
						cell: (r) => titleCase(r.method),
						sortValue: (r) => r.method
					},
					{
						key: "scheduled",
						header: "Scheduled",
						cell: (r) => dateShort(r.scheduledAt),
						sortValue: (r) => r.scheduledAt
					},
					{
						key: "status",
						header: "Status",
						cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status }),
						sortValue: (r) => r.status
					},
					{
						key: "actions",
						header: "",
						align: "right",
						cell: (r) => r.status === "scheduled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: (e) => {
								e.stopPropagation();
								advance(r);
							},
							children: "Mark released"
						}) : r.status === "released" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: (e) => {
								e.stopPropagation();
								advance(r);
							},
							children: "Mark completed"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono text-[11px] text-subtle",
							children: r.completedAt ? dateShort(r.completedAt) : r.releasedAt ? dateShort(r.releasedAt) : "—"
						})
					}
				],
				initialSort: {
					key: "scheduled",
					dir: "desc"
				},
				onRowClick: (r) => navigate({
					to: "/releases/$releaseId",
					params: { releaseId: r.id }
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No releases match your filters",
					description: "Try adjusting the status filter."
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Marking a release as completed updates local demo state only — no courier dispatch or SMS/email notifications occur." })
		]
	});
}
//#endregion
export { ReleasesPage as component };
