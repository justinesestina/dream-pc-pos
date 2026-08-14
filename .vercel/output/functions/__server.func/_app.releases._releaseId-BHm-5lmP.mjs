import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { O as useOps, P as useStore, l as Route$11, q as titleCase, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { n as PrintButton } from "./_ssr/document-B0S1Nw0D.mjs";
import { t as Timeline } from "./_ssr/timeline-DiNIO4ot.mjs";
import { t as completeReleaseSource } from "./_ssr/release-complete-DXhhprxy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.releases._releaseId-BHm-5lmP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function ReleasesReleaseidPage() {
	const { releaseId } = Route$11.useParams();
	const ops = useOps();
	const store = useStore();
	const release = ops.releases.find((r) => r.id === releaseId);
	const [receivedBy, setReceivedBy] = (0, import_react.useState)("");
	if (!release) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Release detail",
			description: "Pickup and delivery handover record."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Release not found",
			description: `No release record matches "${releaseId}".`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/releases",
					children: "Back to releases"
				})
			})
		}) })]
	});
	const timeline = [
		{
			label: "Scheduled",
			at: release.scheduledAt,
			state: "done"
		},
		{
			label: "Handed to courier / customer",
			at: release.releasedAt ?? "",
			state: release.status === "scheduled" ? "active" : "done"
		},
		{
			label: "Handover completed",
			at: release.completedAt ?? "",
			state: release.status === "completed" ? "done" : "pending"
		}
	];
	const markReleased = () => {
		ops.markReleaseReleased(release.id, ops.actor);
		completeReleaseSource((id, status) => store.updateOrderStatus(id, status), (id, status) => store.setBuildStatus(id, status), (id, status) => store.setServiceStatus(id, status), release.kind, release.refId);
		if (release.kind === "build") ops.setBuildStage(release.refId, "released");
		toast.success(`${release.refId} marked as released.`);
	};
	const complete = () => {
		if (!receivedBy.trim()) {
			toast.error("Enter who received the item.");
			return;
		}
		ops.completeRelease(release.id, receivedBy.trim());
		toast.success(`${release.refId} handover completed.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, {
				className: "text-[19px] text-foreground",
				children: release.id
			}),
			status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: release.status }),
			description: `${titleCase(release.kind)} handover for ${release.customerName}`,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintButton, { label: "Print handover" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Handover",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
						cols: 2,
						items: [
							{
								label: "Reference",
								value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
									to: REF_ROUTE[release.kind],
									params: { [REF_PARAM[release.kind]]: release.refId },
									children: release.refId
								})
							},
							{
								label: "Type",
								value: titleCase(release.kind)
							},
							{
								label: "Customer",
								value: release.customerName
							},
							{
								label: "Method",
								value: titleCase(release.method)
							},
							{
								label: "Scheduled",
								value: dateTime(release.scheduledAt)
							},
							{
								label: "Released at",
								value: release.releasedAt ? dateTime(release.releasedAt) : "—"
							},
							{
								label: "Completed at",
								value: release.completedAt ? dateTime(release.completedAt) : "—"
							},
							{
								label: "Released by",
								value: release.releasedBy ?? "—"
							},
							{
								label: "Received by",
								value: release.receivedBy ?? "—"
							}
						]
					}), release.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "border-t border-border px-4 py-3 text-[13px] text-muted-foreground",
						children: release.notes
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Timeline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { events: timeline })
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Complete handover",
					children: release.status === "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "p-4 text-[13px] text-muted-foreground",
						children: [
							"This release is closed. The source ",
							release.kind,
							" was marked",
							" ",
							titleCase(release.kind === "build" ? "released" : release.kind === "order" ? "completed" : "released"),
							"."
						]
					}) : release.status === "scheduled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[12.5px] text-muted-foreground",
							children: [
								"Confirm the item has left the store. The source ",
								release.kind,
								" is marked released; a separate handover step records who received it."
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: markReleased,
							children: "Mark as released"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "received-by",
								children: "Received by"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "received-by",
								value: receivedBy,
								onChange: (e) => setReceivedBy(e.target.value),
								placeholder: "Customer or courier name"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: complete,
							children: "Complete handover"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Marking a release as released also advances the linked build, service or order status so the two demo stores stay consistent; completing the handover closes the release record." })]
			})]
		})]
	});
}
//#endregion
export { ReleasesReleaseidPage as component };
