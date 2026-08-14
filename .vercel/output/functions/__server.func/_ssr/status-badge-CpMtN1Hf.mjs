import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { L as cn, q as titleCase } from "./router-DXywCOrU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-badge-CpMtN1Hf.js
var import_jsx_runtime = require_jsx_runtime();
var toneClass = {
	neutral: "border-border bg-elevated text-muted-foreground",
	info: "border-info/30 bg-info/10 text-info",
	success: "border-success/30 bg-success/10 text-success",
	warning: "border-warning/30 bg-warning/10 text-warning",
	danger: "border-destructive/35 bg-destructive/10 text-destructive",
	active: "border-border-strong bg-foreground/10 text-foreground"
};
var map = {
	pending: "warning",
	paid: "info",
	processing: "info",
	assembly: "info",
	testing: "info",
	ready: "success",
	completed: "success",
	cancelled: "neutral",
	refunded: "danger",
	draft: "neutral",
	sent: "info",
	approved: "success",
	rejected: "danger",
	expired: "neutral",
	converted: "active",
	consultation: "neutral",
	quoted: "info",
	parts_reserved: "info",
	released: "active",
	diagnosing: "info",
	waiting_customer: "warning",
	waiting_parts: "warning",
	in_repair: "info",
	active: "success",
	expiring: "warning",
	void: "danger",
	in_stock: "success",
	reserved: "warning",
	installed: "info",
	sold: "neutral",
	rma: "danger",
	low_stock: "warning",
	out_of_stock: "danger",
	open: "warning",
	in_review: "info",
	closed: "neutral",
	pass: "success",
	fail: "danger",
	requested: "warning",
	inspection: "info",
	replaced: "info",
	new: "neutral",
	requirements: "info",
	recommended: "warning",
	won: "success",
	lost: "neutral",
	submitted: "info",
	confirmed: "info",
	partial: "warning",
	received: "success",
	in_progress: "info",
	discrepancy: "danger",
	scheduled: "info",
	available: "success",
	busy: "warning",
	off: "neutral",
	inactive: "neutral",
	todo: "neutral",
	blocked: "danger",
	done: "success"
};
function StatusBadge({ status, label, tone, className }) {
	const t = tone ?? map[status] ?? "neutral";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("mono inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10.5px] tracking-wide whitespace-nowrap uppercase", toneClass[t], className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current opacity-80" }), label ?? titleCase(status)]
	});
}
//#endregion
export { StatusBadge as t };
