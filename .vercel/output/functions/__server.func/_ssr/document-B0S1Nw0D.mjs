import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { w as Printer } from "../_libs/lucide-react.mjs";
import { F as company, L as cn, W as moneyExact, z as dateTime } from "./router-DXywCOrU.mjs";
import { t as Button } from "./button-B-z3nwuQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/document-B0S1Nw0D.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Print-ready document preview (receipt, invoice, quotation, PO, release note).
* DEMO: rendering + browser print only — no thermal printer or e-invoicing.
*/
function DocumentPreview({ kind, reference, issuedAt, status, party, lines, totals, footer, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mx-auto w-full max-w-2xl rounded-lg border border-border bg-elevated/40 p-6 text-[12.5px] print:border-0 print:bg-white print:text-black", className),
		"data-document": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold tracking-tight text-foreground",
							children: company.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11.5px] text-muted-foreground",
							children: company.address
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11.5px] text-muted-foreground",
							children: [
								company.phone,
								" · ",
								company.email
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mono mt-1 text-[10.5px] text-subtle",
							children: ["TIN ", company.tin]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label-tech",
							children: kind
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mono mt-1 text-sm text-foreground",
							children: reference
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mono mt-1 text-[11px] text-subtle",
							children: dateTime(issuedAt)
						}),
						status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mono mt-1 text-[10.5px] tracking-wide text-info uppercase",
							children: status
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-tech",
						children: party.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13px] text-foreground",
						children: party.name
					}),
					party.lines?.filter(Boolean).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11.5px] text-muted-foreground",
						children: l
					}, l))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full border-collapse py-2 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "label-tech py-2 font-normal",
							children: "Description"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "label-tech py-2 text-right font-normal",
							children: "Qty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "label-tech py-2 text-right font-normal",
							children: "Unit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "label-tech py-2 text-right font-normal",
							children: "Amount"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-2 pr-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-foreground",
								children: l.description
							}), l.sku && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mono text-[10.5px] text-subtle",
								children: l.sku
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "mono py-2 text-right tabular-nums",
							children: l.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "mono py-2 text-right tabular-nums",
							children: moneyExact(l.unitPrice)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "mono py-2 text-right tabular-nums",
							children: moneyExact(l.qty * l.unitPrice)
						})
					]
				}, `${l.description}-${i}`)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "w-full max-w-xs space-y-1.5",
					children: totals.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex items-baseline justify-between gap-6", t.strong && "border-t border-border pt-2 text-[14px] font-semibold"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: t.strong ? "" : "text-muted-foreground",
							children: t.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mono tabular-nums",
							children: moneyExact(t.value)
						})]
					}, t.label))
				})
			}),
			footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 border-t border-border pt-3 text-[11.5px] text-muted-foreground",
				children: footer
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mono mt-5 text-center text-[10px] tracking-wide text-subtle",
				children: "DEMO DOCUMENT — NOT A VALID BIR RECEIPT"
			})
		]
	});
}
function PrintButton({ label = "Print" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		variant: "outline",
		onClick: () => {
			if (typeof window !== "undefined") window.print();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5" }),
			" ",
			label
		]
	});
}
//#endregion
export { PrintButton as n, DocumentPreview as t };
