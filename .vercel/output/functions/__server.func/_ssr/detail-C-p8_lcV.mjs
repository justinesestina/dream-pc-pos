import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { L as cn } from "./router-DXywCOrU.mjs";
import { o as Panel, s as PanelHeader } from "./primitives-BWrlZqU7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/detail-C-p8_lcV.js
var import_jsx_runtime = require_jsx_runtime();
/** Label/value pair used across every detail page. */
function KeyValue({ label, value, className, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-w-0", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "label-tech",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-1 truncate text-[13px] text-foreground", mono && "mono text-xs"),
			children: value ?? "—"
		})]
	});
}
function KeyValueGrid({ items, cols = 3, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid gap-4 p-4", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-2 lg:grid-cols-3", cols === 4 && "sm:grid-cols-2 lg:grid-cols-4", className),
		children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
			label: i.label,
			value: i.value,
			mono: i.mono
		}, i.label))
	});
}
/** Panel + header wrapper for detail sections. */
function Section({ title, hint, action, children, className, bodyClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title,
			hint,
			action
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: bodyClassName,
			children
		})]
	});
}
/** Right-aligned money summary rows (subtotal / VAT / total). */
function TotalsRows({ rows, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: cn("space-y-1.5 text-[13px]", className),
		children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex items-baseline justify-between gap-6", r.strong && "border-t border-border pt-2 text-[15px] font-semibold text-foreground"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: cn(r.strong ? "" : "text-muted-foreground", r.muted && "text-subtle"),
				children: r.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: cn("mono tabular-nums", r.strong ? "" : "text-foreground"),
				children: r.value
			})]
		}, r.label))
	});
}
/** Demo-scope disclaimer, used wherever a workflow is simulated. */
function DemoNote({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: cn("flex items-start gap-2 rounded-md border border-warning/25 bg-warning/5 px-3 py-2 text-[11.5px] text-muted-foreground", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mono shrink-0 text-[10px] tracking-wide text-warning",
			children: "DEMO"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children })]
	});
}
/** Thin progress bar with an optional label. */
function ProgressBar({ value, className, tone = "info" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-1.5 w-full overflow-hidden rounded-full bg-elevated", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full rounded-full transition-[width] duration-500 ease-out", tone === "info" && "bg-info", tone === "success" && "bg-success", tone === "warning" && "bg-warning"),
			style: { width: `${Math.max(0, Math.min(100, value))}%` }
		})
	});
}
//#endregion
export { Section as a, ProgressBar as i, KeyValue as n, TotalsRows as o, KeyValueGrid as r, DemoNote as t };
