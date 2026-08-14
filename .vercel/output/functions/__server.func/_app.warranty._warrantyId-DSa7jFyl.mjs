import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { B as daysUntil, P as useStore, R as dateShort, r as Route$1 } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, i as ProgressBar, r as KeyValueGrid } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.warranty._warrantyId-DSa7jFyl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WarrantyDetailPage() {
	const { warrantyId } = Route$1.useParams();
	const { warranties, claims, customerById, createClaim } = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("");
	const warranty = warranties.find((w) => w.id === warrantyId);
	const warrantyClaims = (0, import_react.useMemo)(() => claims.filter((c) => c.warrantyId === warrantyId), [claims, warrantyId]);
	if (!warranty) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Warranty",
			description: "Coverage, claims and history for one warranty record."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Warranty not found",
			description: `No warranty record with id "${warrantyId}".`,
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
	const customer = customerById(warranty.customerId);
	const totalDays = Math.max(1, Math.round((new Date(warranty.expiresAt).getTime() - new Date(warranty.purchasedAt).getTime()) / 864e5));
	const remaining = daysUntil(warranty.expiresAt);
	const usedPct = Math.max(0, Math.min(100, 100 - remaining / totalDays * 100));
	const claimColumns = [
		{
			key: "id",
			header: "Claim",
			cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
				to: "/warranty/claims/$claimId",
				params: { claimId: c.id },
				children: c.id
			})
		},
		{
			key: "created",
			header: "Filed",
			cell: (c) => dateShort(c.createdAt)
		},
		{
			key: "reason",
			header: "Reason",
			cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "max-w-[280px] truncate block",
				children: c.reason
			})
		},
		{
			key: "resolution",
			header: "Resolution",
			cell: (c) => c.resolution || "—"
		},
		{
			key: "status",
			header: "Status",
			cell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: c.status })
		}
	];
	const submit = () => {
		if (!reason.trim()) {
			toast.error("Describe the issue to file a claim.");
			return;
		}
		const claim = createClaim(warranty.id, reason.trim());
		toast.success(`Claim ${claim.id} filed.`);
		setOpen(false);
		setReason("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: warranty.id,
				description: "Coverage, claims and history for one warranty record.",
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: warranty.status }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					children: "File claim"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Coverage",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 3,
					items: [
						{
							label: "Serial",
							value: warranty.serial ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/serials",
								search: { serial: warranty.serial },
								className: "mono underline decoration-border underline-offset-2 hover:text-foreground",
								children: warranty.serial
							}) : "—"
						},
						{
							label: "Product",
							value: warranty.productName
						},
						{
							label: "Customer",
							value: customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/customers/$customerId",
								params: { customerId: customer.id },
								children: customer.name
							}) : warranty.customerName
						},
						{
							label: "Order",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/orders/$orderId",
								params: { orderId: warranty.orderId },
								children: warranty.orderId
							})
						},
						{
							label: "Purchased",
							value: dateShort(warranty.purchasedAt)
						},
						{
							label: "Expires",
							value: dateShort(warranty.expiresAt)
						}
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 px-4 pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label-tech",
							children: "Remaining coverage"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono",
							children: remaining >= 0 ? `${remaining} days left` : "expired"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
						value: usedPct,
						tone: remaining < 0 ? "warning" : remaining <= 30 ? "warning" : "success"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Claim history",
				hint: `${warrantyClaims.length} filed`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: warrantyClaims,
					columns: claimColumns,
					pageSize: 8,
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No claims filed",
						description: "This warranty has no claim history."
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "File a warranty claim" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "claim-reason",
							children: "Reason"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "claim-reason",
							value: reason,
							onChange: (e) => setReason(e.target.value),
							placeholder: "Describe the defect or issue…"
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						children: "Submit claim"
					})] })
				] })
			})
		]
	});
}
//#endregion
export { WarrantyDetailPage as component };
