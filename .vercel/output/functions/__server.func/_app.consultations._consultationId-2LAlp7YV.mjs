import "./_runtime.mjs";
import { t as cva } from "./_libs/class-variance-authority+clsx.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { L as cn, O as useOps, P as useStore, U as money, q as titleCase, y as Route$27, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, l as TechLabel, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var FLOW = [
	"new",
	"requirements",
	"recommended",
	"quoted",
	"won"
];
function TagList({ items, empty }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-subtle",
		children: empty
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1.5",
		children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "secondary",
			className: "font-normal",
			children: i
		}, i))
	});
}
function ConsultationDetailPage() {
	const { consultationId } = Route$27.useParams();
	const ops = useOps();
	const store = useStore();
	const c = ops.consultationById(consultationId);
	if (!c) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Consultation",
			description: "Requirements, recommendation and conversion path."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Consultation not found",
			description: `No consultation matches "${consultationId}".`
		}) })]
	});
	const convert = () => {
		const build = store.createBuild({
			customerId: c.customerId,
			purpose: c.primaryUse,
			budget: c.budget,
			...c.notes ? { notes: c.notes } : {},
			consultationId: c.id
		});
		const quote = store.quoteFromBuild(build.id);
		ops.updateConsultation(c.id, {
			recommendedBuildId: build.id,
			quoteId: quote?.id,
			status: "quoted"
		});
		toast.success(`Converted ${c.id} to ${build.id}${quote ? ` and ${quote.id}` : ""}.`);
	};
	const canConvert = !c.recommendedBuildId && c.status !== "lost" && c.status !== "won";
	const advance = () => {
		const idx = FLOW.indexOf(c.status);
		if (idx === -1 || idx === FLOW.length - 1) return;
		const next = FLOW[idx + 1];
		ops.updateConsultation(c.id, { status: next });
		toast.success(`Moved to ${titleCase(next)}.`);
	};
	const markLost = () => {
		ops.updateConsultation(c.id, { status: "lost" });
		toast("Marked as lost.");
	};
	const idx = FLOW.indexOf(c.status);
	const canAdvance = c.status !== "won" && c.status !== "lost" && idx < FLOW.length - 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [c.id, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: c.status })]
			}),
			description: c.primaryUse,
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [
						"Customer:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
							to: "/customers/$customerId",
							params: { customerId: c.customerId },
							children: c.customerName
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: ["Consultant: ", c.consultant]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: ["Created ", dateTime(c.createdAt)]
				})
			] }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [c.status !== "won" && c.status !== "lost" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: markLost,
				children: "Mark lost"
			}), canAdvance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: advance,
				children: ["Advance to ", titleCase(FLOW[idx + 1])]
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 lg:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Requirements",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, { items: [
							{
								label: "Primary use",
								value: c.primaryUse
							},
							{
								label: "Budget",
								value: money(c.budget),
								mono: true
							},
							{
								label: "Target resolution",
								value: c.targetResolution
							},
							{
								label: "Upgrade only",
								value: c.upgradeOnly ? "Yes" : "No"
							},
							{
								label: "Consultant",
								value: c.consultant
							},
							{
								label: "Status",
								value: titleCase(c.status)
							}
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Workloads",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagList, {
								items: c.workloads,
								empty: "No workloads recorded."
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Preferences",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagList, {
								items: c.preferences,
								empty: "No preferences recorded."
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Existing hardware",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagList, {
								items: c.existingHardware,
								empty: "No existing hardware recorded."
							})
						})
					}),
					c.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "p-4 text-[13px] text-muted-foreground",
							children: c.notes
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Conversion",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: "Recommended build" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1",
								children: c.recommendedBuildId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
									to: "/builds/$buildId",
									params: { buildId: c.recommendedBuildId },
									children: c.recommendedBuildId
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: "Not yet recommended."
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: "Quote" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1",
								children: c.quoteId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
									to: "/quotes/$quoteId",
									params: { quoteId: c.quoteId },
									children: c.quoteId
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: "No quote generated yet."
								})
							})] }),
							canConvert ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "w-full",
								onClick: convert,
								children: "Convert to build + quote"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-subtle",
								children: [
									"The generated draft quote starts with ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "setup services only" }),
									" — a default assembly & configuration bundle. It has no parts yet."
								]
							})] }) : c.status === "lost" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: "This consultation was marked lost and was not converted."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-subtle",
								children: [
									"Linked to ",
									c.recommendedBuildId ?? "a build",
									" and ",
									c.quoteId ?? "a quote",
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DemoNote, { children: [
								"Conversion creates a build from this consultation and generates a draft quote from its components. The initial quote is services-only (default assembly & configuration bundle) — add parts on the build page, then ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "regenerate the quote" }),
								" so the parts and their totals are included."
							] })
						]
					})
				})
			})]
		})]
	});
}
//#endregion
export { ConsultationDetailPage as component };
