import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as LoaderCircle, gt as Check, st as Circle } from "../_libs/lucide-react.mjs";
import { L as cn, z as dateTime } from "./router-DXywCOrU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/timeline-DiNIO4ot.js
var import_jsx_runtime = require_jsx_runtime();
function Timeline({ events }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "relative space-y-0",
		children: events.map((e, i) => {
			const last = i === events.length - 1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("flex size-5 shrink-0 items-center justify-center rounded-full border", e.state === "done" && "border-success/40 bg-success/15 text-success", e.state === "active" && "border-info/50 bg-info/15 text-info", e.state === "pending" && "border-border bg-elevated text-subtle"),
						children: e.state === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : e.state === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-2" })
					}), !last && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("w-px flex-1", e.state === "done" ? "bg-success/25" : "bg-border") })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("min-w-0 pb-4", last && "pb-0"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("text-[13px]", e.state === "pending" ? "text-muted-foreground" : "text-foreground"),
							children: e.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mono mt-0.5 text-[11px] text-subtle",
							children: [e.at ? dateTime(e.at) : "—", e.actor ? ` · ${e.actor}` : ""]
						}),
						e.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: e.note
						})
					]
				})]
			}, `${e.label}-${i}`);
		})
	});
}
//#endregion
export { Timeline as t };
