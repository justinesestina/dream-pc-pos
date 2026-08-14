import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { F as Minus, G as Info, J as FlaskConical, T as Plus, ct as CircleX, d as Trash2, gt as Check, lt as CircleDashed, u as TriangleAlert } from "./_libs/lucide-react.mjs";
import { A as statusForStage, D as stageProgress, L as cn, O as useOps, P as useStore, U as money, j as ASSEMBLY_STAGES, k as stageForStatus, q as titleCase, x as Route$29, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-BfrlgkCy.mjs";
import { a as PageHeader, l as TechLabel, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, i as ProgressBar, o as TotalsRows, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CUklKTiM.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { t as Checkbox } from "./_ssr/checkbox-D8wvWY2q.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as NewReleaseDialog } from "./_ssr/new-release-dialog-BAv98C71.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.builds._buildId-9TlF5Hlp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function spec(products, components, keyOf, key) {
	const comp = components.find((c) => keyOf(c.productId) === key);
	if (!comp) return void 0;
	return products.find((p) => p.id === comp.productId)?.specs;
}
function allOfCategory(products, components, keyOf, key) {
	return components.map((c) => products.find((p) => p.id === c.productId)).filter((p) => !!p && keyOf(p.id) === key).map((p) => p.specs);
}
/**
* Run all compatibility rules against a build's component list.
*/
function checkCompatibility(components, products, keyOf) {
	const issues = [];
	const cpuSpec = spec(products, components, keyOf, "cpu");
	const mbSpec = spec(products, components, keyOf, "motherboard");
	const ramSpecs = allOfCategory(products, components, keyOf, "ram");
	const gpuSpec = spec(products, components, keyOf, "gpu");
	const psuSpec = spec(products, components, keyOf, "psu");
	const caseSpec = spec(products, components, keyOf, "case");
	if (cpuSpec?.socket && mbSpec?.socket && cpuSpec.socket !== mbSpec.socket) issues.push({
		severity: "error",
		title: "Socket mismatch",
		detail: `CPU requires ${cpuSpec.socket} but motherboard provides ${mbSpec.socket}.`,
		slots: ["CPU", "Motherboard"]
	});
	if (mbSpec?.memoryType && ramSpecs.length > 0) {
		for (const ram of ramSpecs) if (ram.memoryType && ram.memoryType !== mbSpec.memoryType) {
			issues.push({
				severity: "error",
				title: "Memory type mismatch",
				detail: `Motherboard supports ${mbSpec.memoryType} but RAM is ${ram.memoryType}.`,
				slots: ["RAM", "Motherboard"]
			});
			break;
		}
	}
	if (psuSpec?.wattage) {
		const wattage = Number(psuSpec.wattage);
		let totalTdp = 0;
		if (cpuSpec?.tdp) totalTdp += Number(cpuSpec.tdp);
		if (gpuSpec?.tdp) totalTdp += Number(gpuSpec.tdp);
		if (totalTdp > 0) {
			const headroom = wattage - totalTdp;
			const pct = headroom / wattage * 100;
			if (headroom < 0) issues.push({
				severity: "error",
				title: "PSU insufficient",
				detail: `Combined CPU+GPU TDP (${totalTdp}W) exceeds PSU capacity (${wattage}W).`,
				slots: [
					"PSU",
					"CPU",
					"GPU"
				]
			});
			else if (pct < 20) issues.push({
				severity: "warning",
				title: "PSU headroom tight",
				detail: `Only ${headroom}W headroom (${pct.toFixed(0)}%). Recommend at least 20% buffer.`,
				slots: ["PSU"]
			});
		}
	}
	if (caseSpec?.formFactor && mbSpec?.formFactor) {
		const caseFF = String(caseSpec.formFactor).toLowerCase();
		const mbFF = String(mbSpec.formFactor).toLowerCase();
		if (caseFF === "mitx" && (mbFF === "atx" || mbFF === "matx")) issues.push({
			severity: "error",
			title: "Form factor mismatch",
			detail: `${mbSpec.formFactor} motherboard won't fit in a mini-ITX case.`,
			slots: ["Motherboard", "Case"]
		});
		if (caseFF === "matx" && mbFF === "atx") issues.push({
			severity: "warning",
			title: "Tight form factor fit",
			detail: `ATX motherboard in an mATX case — verify clearance.`,
			slots: ["Motherboard", "Case"]
		});
	}
	for (const e of [
		{
			key: "cpu",
			slot: "CPU",
			label: "CPU"
		},
		{
			key: "motherboard",
			slot: "Motherboard",
			label: "Motherboard"
		},
		{
			key: "ram",
			slot: "RAM",
			label: "RAM"
		},
		{
			key: "psu",
			slot: "PSU",
			label: "PSU"
		},
		{
			key: "case",
			slot: "Case",
			label: "Case"
		},
		{
			key: "storage",
			slot: "Storage",
			label: "Storage"
		}
	]) if (!components.some((c) => keyOf(c.productId) === e.key)) issues.push({
		severity: "info",
		title: `Missing ${e.label}`,
		detail: `No ${e.label.toLowerCase()} has been added to this build yet.`,
		slots: [e.slot]
	});
	return issues;
}
var BUILD_STATUSES = [
	"draft",
	"consultation",
	"quoted",
	"approved",
	"parts_reserved",
	"assembly",
	"testing",
	"ready",
	"released",
	"cancelled"
];
var TECHS = [
	"Unassigned",
	"Marco Reyes",
	"Angelo Cruz",
	"Bea Santos",
	"Jun Dela Cruz"
];
var SLOT_CATEGORY_MAP = {
	CPU: "cpu",
	Motherboard: "motherboard",
	RAM: "ram",
	GPU: "gpu",
	Storage: "storage",
	PSU: "psu",
	Case: "case",
	Cooling: "cooling",
	Fans: "fans",
	Software: "software",
	Accessories: "accessories"
};
var ALL_SLOTS = [
	"CPU",
	"Motherboard",
	"RAM",
	"GPU",
	"Storage",
	"PSU",
	"Case",
	"Cooling",
	"Fans",
	"Software",
	"Accessories"
];
var SEVERITY_CONFIG = {
	error: {
		icon: CircleX,
		className: "text-destructive bg-destructive/10 border-destructive/30"
	},
	warning: {
		icon: TriangleAlert,
		className: "text-warning bg-warning/10 border-warning/30"
	},
	info: {
		icon: Info,
		className: "text-info bg-info/10 border-info/30"
	}
};
function AddComponentDialog({ buildId }) {
	const store = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [slot, setSlot] = (0, import_react.useState)("CPU");
	const [selectedProduct, setSelectedProduct] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("1");
	const categoryKey = SLOT_CATEGORY_MAP[slot];
	const availableProducts = (0, import_react.useMemo)(() => store.products.filter((p) => {
		if (store.categoryById(p.categoryId)?.key !== categoryKey) return false;
		if (p.isService) return false;
		if (p.archived) return false;
		return true;
	}), [
		store.products,
		store.categoryById,
		categoryKey
	]);
	const submit = () => {
		if (!selectedProduct) {
			toast.error("Select a product.");
			return;
		}
		const n = Number(qty) || 1;
		store.addBuildComponent(buildId, slot, selectedProduct, n);
		toast.success("Component added to build.");
		setOpen(false);
		setSelectedProduct("");
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add part"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add component" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "bc-slot",
							children: "Slot"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: slot,
							onValueChange: (v) => {
								setSlot(v);
								setSelectedProduct("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "bc-slot",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ALL_SLOTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s,
								children: s
							}, s)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "bc-product",
							children: "Product"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedProduct,
							onValueChange: setSelectedProduct,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "bc-product",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a product…" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableProducts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "_none",
								disabled: true,
								children: "No products in this category"
							}) : availableProducts.map((p) => {
								const avail = store.availableOf(p.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p.id,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: p.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mono text-[10px] text-subtle",
												children: money(p.price)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mono text-[10px] text-subtle",
												children: [
													"(",
													avail,
													" avail)"
												]
											})
										]
									})
								}, p.id);
							}) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "bc-qty",
							children: "Qty"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "bc-qty",
							type: "number",
							min: 1,
							value: qty,
							onChange: (e) => setQty(e.target.value),
							className: "w-24"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => setOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: submit,
				children: "Add"
			})] })
		] })]
	});
}
function BuildsBuildidPage() {
	const { buildId } = Route$29.useParams();
	const store = useStore();
	const ops = useOps();
	const navigate = useNavigate();
	const build = store.builds.find((b) => b.id === buildId);
	const [confirmCancel, setConfirmCancel] = (0, import_react.useState)(false);
	const [removing, setRemoving] = (0, import_react.useState)(null);
	const issues = (0, import_react.useMemo)(() => build ? checkCompatibility(build.components, store.products, (pid) => store.categoryById(store.productById(pid)?.categoryId ?? "")?.key) : [], [
		build,
		store.products,
		store.categoryById,
		store.productById
	]);
	if (!build) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Build detail",
			description: "Parts list, compatibility checks, QA results and timeline."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Build not found",
			description: `No build matches "${buildId}".`
		}) })]
	});
	const o = ops.opsForBuild(build.id);
	const pct = stageProgress(o.stage);
	const partsTotal = build.components.reduce((s, c) => {
		const p = store.productById(c.productId);
		return s + (p ? p.price * c.qty : 0);
	}, 0);
	const servicesTotal = build.services.reduce((s, x) => s + x.amount, 0);
	const errorCount = issues.filter((i) => i.severity === "error").length;
	const warningCount = issues.filter((i) => i.severity === "warning").length;
	const handleGenerateQuote = () => {
		const quote = store.quoteFromBuild(build.id);
		if (!quote) {
			toast.error("Could not generate a quote for this build.");
			return;
		}
		toast.success(`Quote ${quote.id} generated.`);
		navigate({
			to: "/quotes/$quoteId",
			params: { quoteId: quote.id }
		});
	};
	const canFinalizeQa = build.qa.length > 0 && build.qa.every((c) => c.passed !== null);
	const allQaPassed = build.qa.every((c) => c.passed === true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [build.id, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: build.status })]
				}),
				description: build.purpose,
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: ["Customer: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: build.customerName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: ["Budget: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono text-foreground",
							children: money(build.budget)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: ["Created ", dateTime(build.createdAt)]
					})
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: build.status,
						onValueChange: (v) => {
							const status = v;
							if (status === "cancelled") {
								setConfirmCancel(true);
								return;
							}
							store.setBuildStatus(build.id, status);
							ops.setBuildStage(build.id, stageForStatus(status, o.stage));
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 w-40 text-[13px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: BUILD_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: s,
							children: titleCase(s)
						}, s)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: handleGenerateQuote,
						disabled: build.components.length === 0 && build.services.length === 0,
						children: "Generate quote"
					}),
					build.status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewReleaseDialog, { triggerLabel: "Schedule release" })
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Assembly stage",
				hint: `${pct}% through pipeline`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
						value: pct,
						tone: pct === 100 ? "success" : "info"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: ASSEMBLY_STAGES.map((s) => {
							const idx = ASSEMBLY_STAGES.findIndex((x) => x.id === o.stage);
							const sIdx = ASSEMBLY_STAGES.findIndex((x) => x.id === s.id);
							const state = sIdx < idx ? "done" : sIdx === idx ? "active" : "pending";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									ops.setBuildStage(build.id, s.id);
									const st = statusForStage(s.id);
									if (st && build.status !== "cancelled") store.setBuildStatus(build.id, st);
								},
								className: cn("rounded border px-2 py-1 text-[11px] transition-colors", state === "done" && "border-success/30 bg-success/10 text-success", state === "active" && "border-info/40 bg-info/10 text-info", state === "pending" && "border-border bg-elevated text-muted-foreground hover:text-foreground"),
								children: s.label
							}, s.id);
						})
					})]
				})
			}),
			issues.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Compatibility check",
				hint: errorCount > 0 ? `${errorCount} error${errorCount > 1 ? "s" : ""}` : warningCount > 0 ? `${warningCount} warning${warningCount > 1 ? "s" : ""}` : "All checks passed",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5 p-3",
					children: issues.map((issue, i) => {
						const cfg = SEVERITY_CONFIG[issue.severity];
						const Icon = cfg.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("flex items-start gap-2.5 rounded-md border px-3 py-2", cfg.className),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-medium",
									children: issue.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11.5px] opacity-80",
									children: issue.detail
								})]
							})]
						}, `${issue.title}-${i}`);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Parts list",
							hint: `${build.components.length} components`,
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddComponentDialog, { buildId: build.id }),
							children: [build.components.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								title: "No parts assigned yet",
								description: "Add components before generating a quote."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border/60",
								children: build.components.map((c) => {
									const p = store.productById(c.productId);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3 px-4 py-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: c.slot }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-[13px] text-foreground",
												children: p?.name ?? c.productId
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex shrink-0 items-center gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 w-7 p-0",
															disabled: c.qty <= 1,
															onClick: () => store.setBuildComponentQty(build.id, c.productId, c.qty - 1),
															"aria-label": "Decrease quantity",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "mono w-6 text-center text-[12px]",
															title: "Quantity",
															children: c.qty
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 w-7 p-0",
															onClick: () => store.setBuildComponentQty(build.id, c.productId, c.qty + 1),
															"aria-label": "Increase quantity",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" })
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "w-20 text-right text-[13px]",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mono text-foreground",
														children: money((p?.price ?? 0) * c.qty)
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													className: "h-7 w-7 p-0 text-subtle hover:text-destructive",
													onClick: () => setRemoving(c.productId),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
												})
											]
										})]
									}, c.productId);
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-t border-border p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, { rows: [
									{
										label: "Parts subtotal",
										value: money(partsTotal)
									},
									{
										label: "Services",
										value: money(servicesTotal)
									},
									{
										label: "Total",
										value: money(partsTotal + servicesTotal),
										strong: true
									}
								] })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Assembly checklist",
							hint: `${o.assembly.filter((a) => a.done).length}/${o.assembly.length} complete`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border/60",
								children: o.assembly.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex cursor-pointer items-center gap-3 px-4 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										checked: a.done,
										onCheckedChange: (v) => ops.toggleAssemblyStep(build.id, a.label, v === true)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("text-[13px]", a.done ? "text-foreground" : "text-muted-foreground"),
										children: a.label
									})]
								}, a.label))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Test results",
							hint: `${o.tests.filter((t) => t.result === "pass").length}/${o.tests.length} passing`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border/60",
								children: o.tests.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 px-4 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-3.5 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[13px] text-foreground",
											children: t.label
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: t.reading ?? "",
											placeholder: "reading",
											onChange: (e) => ops.setTestResult(build.id, t.label, t.result, e.target.value),
											className: "h-7 w-32 text-xs"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: t.result === "pass" ? "default" : "outline",
												className: "h-7 px-2 text-xs",
												onClick: () => ops.setTestResult(build.id, t.label, "pass"),
												children: "Pass"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: t.result === "fail" ? "destructive" : "outline",
												className: "h-7 px-2 text-xs",
												onClick: () => ops.setTestResult(build.id, t.label, "fail"),
												children: "Fail"
											})]
										})]
									})]
								}, t.label))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "QA sign-off",
							hint: build.qaResult ? `Result: ${titleCase(build.qaResult)}` : "Pending",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border/60",
								children: build.qa.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 px-4 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[13px] text-foreground",
										children: c.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: c.passed === true ? "default" : "outline",
												className: "h-7 px-2 text-xs",
												onClick: () => store.toggleQaCheck(build.id, c.label, true),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: c.passed === false ? "destructive" : "outline",
												className: "h-7 px-2 text-xs",
												onClick: () => store.toggleQaCheck(build.id, c.label, false),
												children: "Fail"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												className: "h-7 px-2 text-xs",
												onClick: () => store.toggleQaCheck(build.id, c.label, null),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDashed, { className: "size-3" })
											})
										]
									})]
								}, c.label))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 border-t border-border p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, {
									className: "flex-1",
									children: "Finalizing QA records a pass/fail result and moves the build to \"Ready\" on pass."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex shrink-0 gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										disabled: !canFinalizeQa,
										onClick: () => {
											store.finalizeQa(build.id, allQaPassed ? "pass" : "fail");
											ops.signQa(build.id, o.qaStaff !== "Unassigned" ? o.qaStaff : store.user?.name ?? "QA Staff");
											toast.success(`QA finalized: ${allQaPassed ? "pass" : "fail"}`);
										},
										children: "Finalize QA"
									})
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Assignment",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: "Technician" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: build.technician,
											onValueChange: (v) => {
												store.updateBuild(build.id, { technician: v });
												ops.assignBuildStaff(build.id, { technician: v });
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-[13px]",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TECHS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: t,
												children: t
											}, t)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechLabel, { children: "QA staff" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: o.qaStaff,
											onValueChange: (v) => ops.assignBuildStaff(build.id, { qaStaff: v }),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-[13px]",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TECHS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: t,
												children: t
											}, t)) })]
										})]
									}),
									o.qaSignedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mono text-[11px] text-subtle",
										children: ["Signed ", dateTime(o.qaSignedAt)]
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Links",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
								cols: 2,
								items: [
									{
										label: "Quote",
										value: build.quoteId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
											to: "/quotes/$quoteId",
											params: { quoteId: build.quoteId },
											children: build.quoteId
										}) : "—"
									},
									{
										label: "Order",
										value: build.orderId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
											to: "/orders/$orderId",
											params: { orderId: build.orderId },
											children: build.orderId
										}) : "—"
									},
									{
										label: "Consultation",
										value: build.consultationId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
											to: "/consultations/$consultationId",
											params: { consultationId: build.consultationId },
											children: build.consultationId
										}) : "—"
									},
									{
										label: "Customer",
										value: build.customerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
											to: "/customers/$customerId",
											params: { customerId: build.customerId },
											children: build.customerName
										}) : build.customerName
									}
								]
							})
						}),
						build.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Notes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "p-4 text-[13px] text-muted-foreground",
								children: build.notes
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: confirmCancel,
				onOpenChange: setConfirmCancel,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
					"Cancel ",
					build.id,
					"?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "The build will be marked cancelled and dropped from the active pipeline. Parts stay reserved until released elsewhere." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep build" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => {
						store.setBuildStatus(build.id, "cancelled");
						toast.success(`${build.id} cancelled.`);
					},
					children: "Cancel build"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: removing !== null,
				onOpenChange: (o) => !o && setRemoving(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Remove component?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: removing ? `${store.productById(removing)?.name ?? removing} will be removed from ${build.id}.` : "" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep part" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => {
						if (removing) {
							store.removeBuildComponent(build.id, removing);
							toast.success(`Removed from ${build.id}.`);
						}
						setRemoving(null);
					},
					children: "Remove"
				})] })] })
			})
		]
	});
}
//#endregion
export { BuildsBuildidPage as component };
