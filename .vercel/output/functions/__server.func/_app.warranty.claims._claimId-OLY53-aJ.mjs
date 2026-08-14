import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { at as Clock, f as ThumbsUp, gt as Check, p as ThumbsDown, t as X } from "./_libs/lucide-react.mjs";
import { L as cn, P as useStore, n as Route, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.warranty.claims._claimId-OLY53-aJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RESOLUTIONS = [
	"replacement",
	"repair",
	"refund",
	"store_credit"
];
function ClaimDetailPage() {
	const { claimId } = Route.useParams();
	const { claims, warranties, customerById, updateClaim } = useStore();
	const [decision, setDecision] = (0, import_react.useState)(null);
	const [resolution, setResolution] = (0, import_react.useState)("replacement");
	const [note, setNote] = (0, import_react.useState)("");
	const claim = claims.find((c) => c.id === claimId);
	const warranty = warranties.find((w) => w.id === claim?.warrantyId);
	const customer = warranty ? customerById(warranty.customerId) : void 0;
	if (!claim) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Claim",
			description: "Warranty claim workflow and history."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Claim not found",
			description: `No warranty claim with id "${claimId}".`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/warranty",
					children: "Back to warranty registry"
				})
			})
		}) })]
	});
	const canReview = claim.status === "open";
	const canDecide = claim.status === "in_review";
	const canClose = claim.status === "approved" || claim.status === "rejected";
	claim.status;
	const submitDecision = () => {
		if (!note.trim()) {
			toast.error("Add a resolution note before deciding this claim.");
			return;
		}
		if (decision === "approve") {
			updateClaim(claim.id, {
				status: "approved",
				resolution,
				resolutionNote: note.trim()
			}, `Claim approved — ${resolution.replace(/_/g, " ")}`);
			toast.success("Claim approved.");
		} else {
			updateClaim(claim.id, {
				status: "rejected",
				resolutionNote: note.trim()
			}, "Claim rejected");
			toast.warning("Claim rejected.");
		}
		setDecision(null);
		setNote("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: claim.id,
				description: "Warranty claim workflow and history.",
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: claim.status }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					canReview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => {
							updateClaim(claim.id, { status: "in_review" }, "Review started");
							toast.success("Claim moved to review.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }), " Start review"]
					}),
					canDecide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setDecision("reject"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, { className: "size-3.5" }), " Reject"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setDecision("approve"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "size-3.5" }), " Approve"]
					})] }),
					canClose && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => {
							updateClaim(claim.id, { status: "closed" }, "Claim closed");
							toast.success("Claim closed.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Close claim"]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Details",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 3,
					items: [
						{
							label: "Warranty",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/warranty/$warrantyId",
								params: { warrantyId: claim.warrantyId },
								children: claim.warrantyId
							})
						},
						{
							label: "Serial",
							value: warranty?.serial ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/serials",
								search: { serial: warranty.serial },
								className: "mono underline decoration-border underline-offset-2 hover:text-foreground",
								children: warranty.serial
							}) : "—"
						},
						{
							label: "Product",
							value: warranty?.productName ?? "—"
						},
						{
							label: "Customer",
							value: customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/customers/$customerId",
								params: { customerId: customer.id },
								children: customer.name
							}) : warranty?.customerName ?? "—"
						},
						{
							label: "Order",
							value: warranty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/orders/$orderId",
								params: { orderId: warranty.orderId },
								children: warranty.orderId
							}) : "—"
						},
						{
							label: "Filed",
							value: dateTime(claim.createdAt)
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Issue",
				hint: "Reported by the customer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-3 text-[13px] text-foreground",
					children: claim.reason
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Resolution",
				hint: claim.status === "open" || claim.status === "in_review" ? "Pending decision" : void 0,
				children: claim.status === "open" || claim.status === "in_review" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Start review, then approve or reject the claim. Approval records a resolution (replacement, repair, refund or store credit) and a note from the technician." })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label-tech",
							children: "Outcome"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							status: claim.status,
							label: claim.resolution ? claim.resolution.replace(/_/g, " ") : claim.status === "approved" ? "Approved" : "Not covered"
						})]
					}), claim.resolutionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-md border border-border bg-elevated px-3 py-2 text-[13px] text-foreground",
						children: claim.resolutionNote
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Timeline",
				hint: `${claim.timeline.length} events`,
				children: claim.timeline.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No timeline events",
					description: "Activity for this claim will appear here."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-0 px-4 py-3",
					children: claim.timeline.map((ev, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "relative flex gap-3 pb-4 last:pb-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border", i === claim.timeline.length - 1 ? "border-info/40 bg-info/10 text-info" : "border-border bg-elevated text-muted-foreground"),
							children: i === claim.timeline.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] text-foreground",
								children: ev.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mono mt-0.5 text-[10.5px] text-muted-foreground",
								children: [dateTime(ev.at), ev.actor ? ` · ${ev.actor}` : ""]
							})]
						})]
					}, i))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: decision !== null,
				onOpenChange: (o) => !o && setDecision(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: decision === "approve" ? "Approve claim" : "Reject claim" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [decision === "approve" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "claim-resolution",
								children: "Resolution"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: resolution,
								onValueChange: setResolution,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "claim-resolution",
									className: "h-9",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: RESOLUTIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: r,
									children: r.replace(/_/g, " ")
								}, r)) })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "claim-note",
								children: "Resolution note"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "claim-note",
								value: note,
								onChange: (e) => setNote(e.target.value),
								placeholder: decision === "approve" ? "What will be done (RMA, repair plan, refund path…)?" : "Why is this claim not covered?"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setDecision(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: decision === "reject" ? "destructive" : "default",
						onClick: submitDecision,
						children: [decision === "approve" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), decision === "approve" ? "Approve claim" : "Reject claim"]
					})] })
				] })
			})
		]
	});
}
//#endregion
export { ClaimDetailPage as component };
