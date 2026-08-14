import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { K as Inbox } from "../_libs/lucide-react.mjs";
import { L as cn } from "./router-DXywCOrU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/primitives-BWrlZqU7.js
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ title, description, status, actions, meta, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: cn("flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[19px] leading-tight font-semibold tracking-tight text-foreground",
						children: title
					}), status]
				}),
				description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-[13px] text-muted-foreground",
					children: description
				}),
				meta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap items-center gap-x-5 gap-y-1",
					children: meta
				})
			]
		}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2",
			children: actions
		})]
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
function Panel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-lg border border-border bg-surface/80 backdrop-blur-[1px]", className),
		...props
	});
}
function PanelHeader({ title, hint, action, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: cn("flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "truncate text-sm font-medium text-foreground",
				children: title
			}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 truncate text-xs text-muted-foreground",
				children: hint
			})]
		}), action]
	});
}
function Mono({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("mono text-xs text-muted-foreground", className),
		...props
	});
}
function TechLabel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("label-tech", className),
		...props
	});
}
/** Cross-linked technical identifier (order, build, serial, ticket...). */
function IdLink({ children, className, to, params }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		params,
		className: cn("mono text-xs text-info underline-offset-4 transition-colors hover:underline", className),
		children
	});
}
function EmptyState({ title, description, action, icon: Icon = Inbox, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-10 items-center justify-center rounded-md border border-border bg-elevated text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-foreground",
				children: title
			}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-1 max-w-sm text-xs text-muted-foreground",
				children: description
			})] }),
			action
		]
	});
}
function RowsSkeleton({ rows = 6, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("divide-y divide-border", className),
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4 px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-28 bg-elevated" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 flex-1 bg-elevated" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-16 bg-elevated" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-20 bg-elevated" })
			]
		}, i))
	});
}
function CardsSkeleton({ count = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-surface p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-20 bg-elevated" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-6 w-28 bg-elevated" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-3 w-16 bg-elevated" })
			]
		}, i))
	});
}
//#endregion
export { PageHeader as a, RowsSkeleton as c, Mono as i, TechLabel as l, EmptyState as n, Panel as o, IdLink as r, PanelHeader as s, CardsSkeleton as t };
