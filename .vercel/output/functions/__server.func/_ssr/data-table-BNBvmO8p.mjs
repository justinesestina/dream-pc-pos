import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Tt as ArrowUp, kt as ArrowDown, mt as ChevronLeft, pt as ChevronRight } from "../_libs/lucide-react.mjs";
import { L as cn } from "./router-DXywCOrU.mjs";
import { t as Button } from "./button-B-z3nwuQ.mjs";
import { c as RowsSkeleton } from "./primitives-BWrlZqU7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/data-table-BNBvmO8p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DataTable({ rows, columns, onRowClick, loading, empty, pageSize = 12, initialSort, dense }) {
	const [sort, setSort] = (0, import_react.useState)(initialSort ?? null);
	const [page, setPage] = (0, import_react.useState)(0);
	const sorted = (0, import_react.useMemo)(() => {
		if (!sort) return rows;
		const col = columns.find((c) => c.key === sort.key);
		if (!col?.sortValue) return rows;
		const get = col.sortValue;
		return [...rows].sort((a, b) => {
			const av = get(a);
			const bv = get(b);
			const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
			return sort.dir === "asc" ? cmp : -cmp;
		});
	}, [
		rows,
		sort,
		columns
	]);
	const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
	const current = Math.min(page, pageCount - 1);
	const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowsSkeleton, { rows: 6 });
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: empty });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full border-collapse text-left text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-border",
				children: columns.map((c) => {
					const sortable = Boolean(c.sortValue);
					const isActive = sort?.key === c.key;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						className: cn("label-tech px-4 py-2.5 font-normal whitespace-nowrap", c.align === "right" && "text-right", c.className),
						children: sortable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSort(isActive ? {
								key: c.key,
								dir: sort.dir === "asc" ? "desc" : "asc"
							} : {
								key: c.key,
								dir: "asc"
							}),
							className: cn("inline-flex items-center gap-1 transition-colors hover:text-foreground", isActive && "text-foreground", c.align === "right" && "flex-row-reverse"),
							children: [c.header, isActive && (sort.dir === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3" }))]
						}) : c.header
					}, c.key);
				})
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visible.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				tabIndex: onRowClick ? 0 : void 0,
				onClick: onRowClick ? () => onRowClick(row) : void 0,
				onKeyDown: onRowClick ? (e) => {
					if (e.key === "Enter") onRowClick(row);
				} : void 0,
				className: cn("border-b border-border/60 transition-colors last:border-0", onRowClick && "cursor-pointer hover:bg-elevated/70"),
				children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: cn("px-4 align-middle", dense ? "py-2" : "py-2.5", c.align === "right" && "text-right", c.className),
					children: c.cell(row)
				}, c.key))
			}, row.id)) })]
		})
	}), pageCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between border-t border-border px-4 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mono text-[11px] text-subtle",
			children: [
				current * pageSize + 1,
				"–",
				Math.min(sorted.length, (current + 1) * pageSize),
				" of",
				" ",
				sorted.length
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					className: "size-7",
					"aria-label": "Previous page",
					disabled: current === 0,
					onClick: () => setPage(current - 1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mono px-1 text-[11px] text-muted-foreground",
					children: [
						current + 1,
						" / ",
						pageCount
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					className: "size-7",
					"aria-label": "Next page",
					disabled: current >= pageCount - 1,
					onClick: () => setPage(current + 1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
				})
			]
		})]
	})] });
}
//#endregion
export { DataTable as t };
