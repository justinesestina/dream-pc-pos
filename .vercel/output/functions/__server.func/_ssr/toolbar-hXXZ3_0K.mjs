import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as X, x as Search } from "../_libs/lucide-react.mjs";
import { L as cn, q as titleCase } from "./router-DXywCOrU.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CUklKTiM.mjs";
import { t as Input } from "./input-DjMJnh0q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/toolbar-hXXZ3_0K.js
var import_jsx_runtime = require_jsx_runtime();
/** Filter/search bar used above every list surface. */
function Toolbar({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5", className),
		children
	});
}
function SearchInput({ value, onChange, placeholder = "Search…", className, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative min-w-0 flex-1 sm:max-w-xs", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder,
				className: "h-8 pr-7 pl-8 text-[13px]",
				...rest
			}),
			value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Clear search",
				onClick: () => onChange(""),
				className: "absolute top-1/2 right-2 -translate-y-1/2 text-subtle transition-colors hover:text-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
			})
		]
	});
}
function FilterSelect({ value, onChange, options, label, allLabel = "All", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
			"aria-label": label,
			className: cn("h-8 w-auto min-w-[7.5rem] gap-2 text-[13px]", className),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "label-tech shrink-0",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: "all",
			children: allLabel
		}), options.map((o) => {
			const val = typeof o === "string" ? o : o.value;
			const labelText = typeof o === "string" ? titleCase(o) : o.label;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: val,
				children: labelText
			}, val);
		})] })]
	});
}
/** Small segmented control for view switching. */
function Segmented({ value, onChange, options, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("inline-flex rounded-md border border-border bg-elevated p-0.5", className),
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(o.value),
			"aria-pressed": value === o.value,
			className: cn("rounded px-2.5 py-1 text-xs transition-colors", value === o.value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
			children: o.label
		}, o.value))
	});
}
function ResultCount({ shown, total, noun }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mono ml-auto text-[11px] text-subtle",
		children: shown === total ? `${total} ${noun}` : `${shown} / ${total} ${noun}`
	});
}
//#endregion
export { Toolbar as a, Segmented as i, ResultCount as n, SearchInput as r, FilterSelect as t };
