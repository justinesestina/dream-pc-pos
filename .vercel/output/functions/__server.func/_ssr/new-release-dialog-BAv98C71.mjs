import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { vt as CalendarClock } from "../_libs/lucide-react.mjs";
import { O as useOps, P as useStore, U as money } from "./router-DXywCOrU.mjs";
import { t as Button } from "./button-B-z3nwuQ.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-BfrlgkCy.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CUklKTiM.mjs";
import { t as Input } from "./input-DjMJnh0q.mjs";
import { t as Label } from "./label-DIE5zrQN.mjs";
import { t as Textarea } from "./textarea-BWrukFNZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-release-dialog-BAv98C71.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function localDateTimeValue(d) {
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
var KINDS = [
	"build",
	"service",
	"order"
];
function NewReleaseDialog({ triggerLabel = "Schedule release" }) {
	const ops = useOps();
	const store = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [kind, setKind] = (0, import_react.useState)("build");
	const [refId, setRefId] = (0, import_react.useState)("");
	const [method, setMethod] = (0, import_react.useState)("pickup");
	const [scheduled, setScheduled] = (0, import_react.useState)(() => {
		const d = new Date(Date.now() + 36e5);
		d.setMinutes(0, 0, 0);
		return localDateTimeValue(d);
	});
	const [notes, setNotes] = (0, import_react.useState)("");
	const taken = (k, id) => ops.releases.some((r) => r.kind === k && r.refId === id && r.status !== "completed");
	const options = (0, import_react.useMemo)(() => {
		const out = [];
		if (kind === "build") for (const b of store.builds) {
			if (b.status !== "ready" || taken("build", b.id)) continue;
			out.push({
				id: b.id,
				label: b.purpose,
				meta: `${money(b.budget)} budget`,
				customer: b.customerName
			});
		}
		else if (kind === "service") for (const t of store.services) {
			if (t.status !== "ready" || taken("service", t.id)) continue;
			out.push({
				id: t.id,
				label: `${t.device} — ${t.issue}`,
				meta: t.technician,
				customer: t.customerName
			});
		}
		else for (const o of store.orders) {
			if (o.status !== "ready" || taken("order", o.id)) continue;
			out.push({
				id: o.id,
				label: `${o.items.length} item(s)`,
				meta: money(o.total),
				customer: o.customerName
			});
		}
		return out;
	}, [
		kind,
		store.builds,
		store.services,
		store.orders,
		ops.releases
	]);
	const selected = options.find((o) => o.id === refId);
	const submit = () => {
		if (!refId) {
			toast.error("Pick the build, service or order to release.");
			return;
		}
		if (!scheduled) {
			toast.error("Set a scheduled date and time.");
			return;
		}
		const iso = new Date(scheduled).toISOString();
		if (Number.isNaN(Date.parse(iso))) {
			toast.error("Scheduled date is invalid.");
			return;
		}
		ops.createRelease({
			kind,
			refId,
			customerName: selected?.customer ?? "Walk-in Customer",
			method,
			scheduledAt: iso,
			notes: notes.trim() || void 0
		});
		toast.success(`${kind} ${refId} scheduled for release.`);
		setOpen(false);
		setRefId("");
		setNotes("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3.5" }),
					" ",
					triggerLabel
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Schedule a release" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rel-type",
								children: "Release type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: kind,
								onValueChange: (v) => {
									setKind(v);
									setRefId("");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "rel-type",
									className: "w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: k,
									children: k === "order" ? "Retail order" : k === "build" ? "Custom build" : "Service ticket"
								}, k)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rel-ref",
								children: "Reference"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: refId,
								onValueChange: setRefId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "rel-ref",
									className: "w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: options.length === 0 ? "Nothing ready to release" : "Select an item…" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: options.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "_none",
									disabled: true,
									children: "No items in “ready” state"
								}) : options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: o.id,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono",
											children: o.id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: o.label
										})]
									})
								}, o.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "rel-method",
									children: "Method"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: method,
									onValueChange: (v) => setMethod(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "rel-method",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "pickup",
										children: "Store pickup"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "delivery",
										children: "Delivery"
									})] })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "rel-scheduled",
									children: "Scheduled"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "rel-scheduled",
									type: "datetime-local",
									value: scheduled,
									onChange: (e) => setScheduled(e.target.value)
								})]
							})]
						}),
						selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mono text-[11.5px] text-subtle",
							children: [
								selected.customer,
								" · ",
								selected.meta
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rel-notes",
								children: "Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "rel-notes",
								rows: 2,
								value: notes,
								onChange: (e) => setNotes(e.target.value),
								placeholder: "Handover instructions, contact person, courier…"
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
					disabled: options.length === 0,
					children: "Schedule release"
				})] })
			]
		})]
	});
}
//#endregion
export { NewReleaseDialog as t };
