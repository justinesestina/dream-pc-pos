import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { At as ArrowDownRight, Et as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { L as cn } from "./router-DXywCOrU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stat-card-D08bC1B_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Animated count-up for numeric KPIs. Respects reduced-motion. */
function useCountUp(target, duration = 520) {
	const [value, setValue] = (0, import_react.useState)(target);
	const from = (0, import_react.useRef)(target);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setValue(target);
			return;
		}
		const start = performance.now();
		const startVal = from.current;
		let raf = 0;
		const tick = (t) => {
			const p = Math.min(1, (t - start) / duration);
			const eased = 1 - Math.pow(1 - p, 3);
			setValue(startVal + (target - startVal) * eased);
			if (p < 1) raf = requestAnimationFrame(tick);
			else from.current = target;
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [target, duration]);
	return value;
}
function StatCard({ label, value, numericValue, format, delta, hint, accent = "neutral", icon: Icon, footer, className }) {
	const animated = useCountUp(numericValue ?? 0);
	const display = numericValue !== void 0 ? format ? format(animated) : Math.round(animated) : value;
	const accentLine = {
		neutral: "bg-border-strong",
		info: "bg-info",
		success: "bg-success",
		warning: "bg-warning",
		danger: "bg-destructive"
	}[accent];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative overflow-hidden rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute inset-x-0 top-0 h-px opacity-60", accentLine) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-tech",
					children: label
				}), Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-6 shrink-0 items-center justify-center rounded border border-border bg-elevated text-muted-foreground transition-colors group-hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
				}) : delta !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("mono inline-flex items-center gap-0.5 text-[11px]", delta >= 0 ? "text-success" : "text-destructive"),
					children: [
						delta >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, { className: "size-3" }),
						Math.abs(delta).toFixed(1),
						"%"
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2.5 text-2xl leading-none font-semibold tracking-tight tabular-nums",
				children: display
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: hint
			}),
			footer
		]
	});
}
//#endregion
export { StatCard as t };
