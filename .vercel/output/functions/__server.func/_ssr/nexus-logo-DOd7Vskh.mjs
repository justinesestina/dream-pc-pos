import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { L as cn } from "./router-DXywCOrU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nexus-logo-DOd7Vskh.js
var import_jsx_runtime = require_jsx_runtime();
/** Company logo from /public — Dream PC Build & IT Solutions. */
function DreamLogo({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/dpc-logo.png",
		alt: "Dream PC Build & IT Solutions",
		draggable: false,
		className: cn("shrink-0 object-contain select-none", className)
	});
}
function NexusWordmark({ className, showSubtitle = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DreamLogo, { className: "size-8 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[15px] font-semibold tracking-tight",
				children: ["DPC ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "NEXUS"
				})]
			}), showSubtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mono mt-1 text-[10px] tracking-[0.14em] text-subtle uppercase",
				children: "PC Retail & Operations"
			})]
		})]
	});
}
//#endregion
export { NexusWordmark as n, DreamLogo as t };
