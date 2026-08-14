import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { T as Plus } from "./_libs/lucide-react.mjs";
import { P as useStore, R as dateShort, U as money, o as Route$7 } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, i as Mono, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, o as TotalsRows, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Textarea } from "./_ssr/textarea-BWrukFNZ.mjs";
import { t as NewReleaseDialog } from "./_ssr/new-release-dialog-BAv98C71.mjs";
import { n as PrintButton } from "./_ssr/document-B0S1Nw0D.mjs";
import { t as Timeline } from "./_ssr/timeline-DiNIO4ot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.services._ticketId-Dx8Xc6UP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AddServicePartDialog({ ticket }) {
	const { products, invFor, addServicePart } = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [productId, setProductId] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("1");
	const partsAvailable = (0, import_react.useMemo)(() => products.filter((p) => !p.isService && (invFor(p.id)?.onHand ?? 0) > 0), [products, invFor]);
	const submit = () => {
		const p = partsAvailable.find((x) => x.id === productId);
		if (!p) {
			toast.error("Select a part with stock on hand.");
			return;
		}
		const n = Math.max(1, Math.floor(Number(qty) || 1));
		const onHand = invFor(p.id)?.onHand ?? 0;
		if (n > onHand) {
			toast.error(`Only ${onHand} unit(s) of ${p.name} on hand.`);
			return;
		}
		addServicePart(ticket.id, p.id, n);
		toast.success(`${n}× ${p.name} added to ${ticket.id}.`);
		setOpen(false);
		setProductId("");
		setQty("1");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				className: "h-7 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add part"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Use a part on ", ticket.id] }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "svc-part",
							children: "Part"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: productId,
							onValueChange: setProductId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "svc-part",
								className: "w-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select in-stock part" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: partsAvailable.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: p.id,
								children: [
									p.name,
									" — ",
									invFor(p.id)?.onHand ?? 0,
									" on hand"
								]
							}, p.id)) })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "svc-part-qty",
							children: "Quantity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "svc-part-qty",
							type: "number",
							min: 1,
							value: qty,
							onChange: (e) => setQty(e.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					disabled: !productId,
					children: "Use part"
				})] })
			]
		})]
	});
}
function ServiceDiagnosisEditor({ ticket }) {
	const { updateService } = useStore();
	const [diagnosis, setDiagnosis] = (0, import_react.useState)(ticket.diagnosis ?? "");
	const [labor, setLabor] = (0, import_react.useState)(String(ticket.labor));
	const [actual, setActual] = (0, import_react.useState)(ticket.actualCost != null ? String(ticket.actualCost) : "");
	const save = () => {
		updateService(ticket.id, {
			...diagnosis.trim() !== (ticket.diagnosis ?? "") ? { diagnosis: diagnosis.trim() } : {},
			labor: Math.max(0, Number(labor) || 0),
			...actual !== "" ? { actualCost: Math.max(0, Number(actual) || 0) } : { actualCost: null }
		});
		toast.success(`${ticket.id} saved.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "svc-diagnosis",
					children: "Diagnosis"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "svc-diagnosis",
					rows: 2,
					value: diagnosis,
					onChange: (e) => setDiagnosis(e.target.value),
					placeholder: "Root cause and recommended action…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "svc-labor",
						children: "Labor (₱)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "svc-labor",
						type: "number",
						min: 0,
						value: labor,
						onChange: (e) => setLabor(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "svc-actual",
						children: "Actual cost (₱)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "svc-actual",
						type: "number",
						min: 0,
						value: actual,
						onChange: (e) => setActual(e.target.value),
						placeholder: "Leave blank until billed"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Estimated ",
						money(ticket.estimatedCost),
						ticket.actualCost != null ? ` · Actual ${money(ticket.actualCost)}` : ""
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: save,
					children: "Save"
				})]
			})
		]
	});
}
var FLOW = [
	"received",
	"diagnosing",
	"waiting_customer",
	"waiting_parts",
	"in_repair",
	"ready",
	"released"
];
function ServicesTicketidPage() {
	const { ticketId } = Route$7.useParams();
	const { services, setServiceStatus, customerById, removeServicePart } = useStore();
	const ticket = services.find((t) => t.id === ticketId);
	const nextStatuses = (0, import_react.useMemo)(() => {
		if (!ticket) return [];
		const idx = FLOW.indexOf(ticket.status);
		if (idx === -1) return [];
		return FLOW.slice(idx + 1);
	}, [ticket]);
	if (!ticket) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Ticket detail",
			description: "Diagnosis, parts used, labor and status timeline."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Ticket not found",
			description: `No service ticket with id "${ticketId}".`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/services",
					search: { openNew: false },
					children: "Back to tickets"
				})
			})
		}) })]
	});
	const customer = customerById(ticket.customerId);
	const partsTotal = ticket.parts.reduce((s, p) => s + p.qty * p.price, 0);
	const advance = (status) => {
		setServiceStatus(ticket.id, status);
		toast.success(`${ticket.id} set to ${status.replace(/_/g, " ")}.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: ticket.id,
				description: "Diagnosis, parts used, labor and status timeline.",
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
					status: ticket.status,
					...ticket.status === "received" ? { tone: "neutral" } : {}
				}),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintButton, { label: "Print ticket" }),
						nextStatuses.slice(0, 3).map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => advance(st),
							children: ["Mark ", st.replace(/_/g, " ")]
						}, st)),
						ticket.status !== "cancelled" && ticket.status !== "released" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "text-destructive",
								children: "Cancel"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
							"Cancel ticket ",
							ticket.id,
							"?"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "The service ticket will be closed as cancelled and removed from the active queue." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep ticket" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
							onClick: () => advance("cancelled"),
							children: "Cancel ticket"
						})] })] })] }),
						ticket.status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewReleaseDialog, { triggerLabel: "Schedule release" })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Device & issue",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 3,
					items: [
						{
							label: "Customer",
							value: customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/customers/$customerId",
								params: { customerId: customer.id },
								children: customer.name
							}) : ticket.customerName
						},
						{
							label: "Device",
							value: ticket.device
						},
						{
							label: "Technician",
							value: ticket.technician
						},
						{
							label: "Received",
							value: dateShort(ticket.createdAt)
						},
						{
							label: "Issue",
							value: ticket.issue
						},
						{
							label: "Diagnosis",
							value: ticket.diagnosis || "Not yet diagnosed"
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Parts used",
						hint: `${ticket.parts.length} line(s)`,
						children: ticket.parts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								title: "No parts recorded",
								description: "No parts have been logged against this ticket yet."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddServicePartDialog, { ticket })
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border",
								children: ticket.parts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between px-4 py-2.5 text-[13px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-foreground",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Mono, { children: [
										p.qty,
										" × ",
										money(p.price)
									] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono tabular-nums",
											children: money(p.qty * p.price)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												className: "h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive",
												children: "Remove"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
											"Remove ",
											p.name,
											" from ticket?"
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "The part will be removed from this ticket and its quantity returned to stock." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep part" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
											onClick: () => {
												removeServicePart(ticket.id, p.productId);
												toast.success(`${p.name} returned to stock.`);
											},
											children: "Remove part"
										})] })] })] })]
									})]
								}, p.productId))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-t border-border p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddServicePartDialog, { ticket }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-subtle",
									children: "Parts deduct from on-hand stock."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-t border-border p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [
									{
										label: "Parts",
										value: money(partsTotal)
									},
									{
										label: "Labor",
										value: money(ticket.labor)
									},
									{
										label: "Estimated cost",
										value: money(ticket.estimatedCost),
										muted: true
									},
									{
										label: "Actual cost",
										value: ticket.actualCost != null ? money(ticket.actualCost) : "—",
										strong: true
									}
								] })
							})
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Diagnosis & costs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceDiagnosisEditor, { ticket })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Status timeline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { events: ticket.timeline })
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Status advancement and cost capture are simulated locally — no technician notifications or payment processing occur." })
		]
	});
}
//#endregion
export { ServicesTicketidPage as component };
