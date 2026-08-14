import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { B as daysUntil, L as cn, P as useStore, R as dateShort, d as Route$15 } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { n as PrintButton, t as DocumentPreview } from "./_ssr/document-B0S1Nw0D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.quotes._quoteId-CBqMsm07.js
var import_jsx_runtime = require_jsx_runtime();
function QuotesQuoteidPage() {
	const { quoteId } = Route$15.useParams();
	const { quotes, customerById, setQuoteStatus, convertQuoteToOrder } = useStore();
	const navigate = useNavigate();
	const quote = quotes.find((q) => q.id === quoteId);
	if (!quote) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Quote detail",
			description: "Quoted configuration, totals and approval state."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Quote not found",
			description: `No quote matches "${quoteId}". It may have been removed from the demo dataset.`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => navigate({ to: "/quotes" }),
				children: "Back to quotes"
			})
		}) })]
	});
	const customer = customerById(quote.customerId);
	const days = daysUntil(quote.expiresAt);
	const expired = quote.status !== "converted" && days < 0;
	const canSend = quote.status === "draft";
	const canApprove = quote.status === "sent" || quote.status === "pending";
	const canReject = quote.status === "sent" || quote.status === "pending";
	const canConvert = quote.status === "approved";
	const handleSetStatus = (status) => {
		setQuoteStatus(quote.id, status);
		toast.success(`Quote ${quote.id} marked ${status}`);
	};
	const handleConvert = () => {
		const order = convertQuoteToOrder(quote.id);
		if (order) {
			toast.success(`Converted to order ${order.id}`);
			navigate({
				to: "/orders/$orderId",
				params: { orderId: order.id }
			});
		} else toast.error("Could not convert quote to order.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono",
					children: quote.id
				}),
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: expired ? "expired" : quote.status }),
				description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Prepared by ",
					quote.preparedBy,
					" for",
					" ",
					quote.customerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
						to: "/customers/$customerId",
						params: { customerId: quote.customerId },
						children: quote.customerName
					}) : quote.customerName,
					" ",
					"· issued ",
					dateShort(quote.createdAt)
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintButton, { label: "Print quotation" }),
					canSend && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => handleSetStatus("sent"),
						children: "Send to customer"
					}),
					canApprove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => handleSetStatus("approved"),
						children: "Approve"
					}),
					canReject && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							children: "Reject"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
						"Reject ",
						quote.id,
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "The quote will be marked rejected and can no longer be converted to an order." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep quote" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						onClick: () => handleSetStatus("rejected"),
						children: "Reject quote"
					})] })] })] }),
					canConvert && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: handleConvert,
						children: "Convert to order"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex flex-wrap gap-4 text-xs", expired ? "text-destructive" : "text-muted-foreground"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Valid until ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono",
							children: dateShort(quote.expiresAt)
						}),
						!["converted"].includes(quote.status) && (expired ? " — expired" : days <= 7 ? ` — ${days}d remaining` : "")
					] }),
					quote.buildId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Linked build",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
							to: "/builds/$buildId",
							params: { buildId: quote.buildId },
							children: quote.buildId
						})
					] }),
					quote.orderId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Converted to order",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
							to: "/orders/$orderId",
							params: { orderId: quote.orderId },
							children: quote.orderId
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentPreview, {
				kind: "Quotation",
				reference: quote.id,
				issuedAt: quote.createdAt,
				status: quote.status,
				party: {
					title: "Quoted to",
					name: quote.customerName,
					lines: [
						customer?.address,
						customer?.phone,
						customer?.email
					]
				},
				lines: quote.items.map((i) => ({
					description: i.name,
					sku: i.sku,
					qty: i.qty,
					unitPrice: i.unitPrice
				})),
				totals: [
					{
						label: "Subtotal",
						value: quote.subtotal
					},
					{
						label: "Discount",
						value: -quote.discount
					},
					{
						label: "Service total",
						value: quote.serviceTotal
					},
					{
						label: "VAT (12%)",
						value: quote.tax
					},
					{
						label: "Total",
						value: quote.total,
						strong: true
					}
				],
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [quote.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Notes: ", quote.notes] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Prepared by ",
						quote.preparedBy,
						" · Valid until ",
						dateShort(quote.expiresAt)
					] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: quote.items.length === 0 && quote.serviceTotal > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"This quote currently contains ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "setup services only" }),
				" — it has no parts yet. Add components to the linked build, then ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Generate quote" }),
				" there to rebuild this quotation with the parts and their totals included."
			] }) : "Sending, approval and rejection are simulated status changes — no e-mail or e-signature integration is triggered." })
		]
	});
}
//#endregion
export { QuotesQuoteidPage as component };
