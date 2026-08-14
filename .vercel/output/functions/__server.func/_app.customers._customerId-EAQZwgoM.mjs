import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { P as useStore, R as dateShort, U as money, _ as Route$25, q as titleCase } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { a as PageHeader, n as EmptyState, o as Panel, r as IdLink } from "./_ssr/primitives-BWrlZqU7.mjs";
import { a as Section, r as KeyValueGrid } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-CpMtN1Hf.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.customers._customerId-EAQZwgoM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomersCustomeridPage() {
	const { customerId } = Route$25.useParams();
	const { customers, orders, quotes, builds, services, warranties } = useStore();
	const customer = customers.find((c) => c.id === customerId);
	const cOrders = (0, import_react.useMemo)(() => orders.filter((o) => o.customerId === customerId), [orders, customerId]);
	const cQuotes = (0, import_react.useMemo)(() => quotes.filter((q) => q.customerId === customerId), [quotes, customerId]);
	const cBuilds = (0, import_react.useMemo)(() => builds.filter((b) => b.customerId === customerId), [builds, customerId]);
	const cServices = (0, import_react.useMemo)(() => services.filter((s) => s.customerId === customerId), [services, customerId]);
	const cWarranties = (0, import_react.useMemo)(() => warranties.filter((w) => w.customerId === customerId), [warranties, customerId]);
	const kpis = (0, import_react.useMemo)(() => {
		const totalSpend = cOrders.reduce((s, o) => s + o.total, 0);
		const avg = cOrders.length ? totalSpend / cOrders.length : 0;
		const openServices = cServices.filter((s) => !["released", "cancelled"].includes(s.status)).length;
		return {
			orders: cOrders.length,
			totalSpend,
			avg,
			openServices
		};
	}, [cOrders, cServices]);
	if (!customer) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Customer detail",
			description: "Profile, owned systems, orders and tickets."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Customer not found",
			description: `No customer with id "${customerId}".`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/customers",
					search: { openNew: false },
					children: "Back to customers"
				})
			})
		}) })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: customer.name,
				description: "Profile, owned systems, orders and tickets.",
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: customer.status })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Orders",
						numericValue: kpis.orders,
						format: (n) => Math.round(n).toString(),
						accent: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total spend",
						numericValue: kpis.totalSpend,
						format: money,
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Avg order value",
						numericValue: kpis.avg,
						format: money,
						accent: "neutral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open services",
						numericValue: kpis.openServices,
						format: (n) => Math.round(n).toString(),
						accent: "warning"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Profile",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
					cols: 4,
					items: [
						{
							label: "Type",
							value: titleCase(customer.type)
						},
						{
							label: "Email",
							value: customer.email,
							mono: true
						},
						{
							label: "Phone",
							value: customer.phone,
							mono: true
						},
						{
							label: "Customer since",
							value: dateShort(customer.since)
						},
						{
							label: "Address",
							value: customer.address || "—"
						},
						{
							label: "Notes",
							value: customer.notes || "—"
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Orders",
				hint: `${cOrders.length} total`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: cOrders,
					columns: [
						{
							key: "id",
							header: "Order",
							cell: (o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/orders/$orderId",
								params: { orderId: o.id },
								children: o.id
							})
						},
						{
							key: "date",
							header: "Date",
							cell: (o) => dateShort(o.createdAt)
						},
						{
							key: "total",
							header: "Total",
							align: "right",
							cell: (o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono",
								children: money(o.total)
							})
						},
						{
							key: "status",
							header: "Status",
							cell: (o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.status })
						}
					],
					pageSize: 5,
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No orders yet" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Quotes",
				hint: `${cQuotes.length} total`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: cQuotes,
					columns: [
						{
							key: "id",
							header: "Quote",
							cell: (q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/quotes/$quoteId",
								params: { quoteId: q.id },
								children: q.id
							})
						},
						{
							key: "date",
							header: "Date",
							cell: (q) => dateShort(q.createdAt)
						},
						{
							key: "total",
							header: "Total",
							align: "right",
							cell: (q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono",
								children: money(q.total)
							})
						},
						{
							key: "status",
							header: "Status",
							cell: (q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: q.status })
						}
					],
					pageSize: 5,
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No quotes yet" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Builds",
				hint: `${cBuilds.length} total`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: cBuilds,
					columns: [
						{
							key: "id",
							header: "Build",
							cell: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/builds/$buildId",
								params: { buildId: b.id },
								children: b.id
							})
						},
						{
							key: "purpose",
							header: "Purpose",
							cell: (b) => b.purpose
						},
						{
							key: "date",
							header: "Date",
							cell: (b) => dateShort(b.createdAt)
						},
						{
							key: "status",
							header: "Status",
							cell: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: b.status })
						}
					],
					pageSize: 5,
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No builds yet" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Service tickets",
				hint: `${cServices.length} total`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: cServices,
					columns: [
						{
							key: "id",
							header: "Ticket",
							cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/services/$ticketId",
								params: { ticketId: s.id },
								children: s.id
							})
						},
						{
							key: "device",
							header: "Device",
							cell: (s) => s.device
						},
						{
							key: "date",
							header: "Received",
							cell: (s) => dateShort(s.createdAt)
						},
						{
							key: "status",
							header: "Status",
							cell: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								status: s.status,
								...s.status === "received" ? { tone: "neutral" } : {}
							})
						}
					],
					pageSize: 5,
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No service tickets yet" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Warranties",
				hint: `${cWarranties.length} total`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					rows: cWarranties,
					columns: [
						{
							key: "id",
							header: "Warranty",
							cell: (w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdLink, {
								to: "/warranty/$warrantyId",
								params: { warrantyId: w.id },
								children: w.id
							})
						},
						{
							key: "product",
							header: "Product",
							cell: (w) => w.productName
						},
						{
							key: "expires",
							header: "Expires",
							cell: (w) => dateShort(w.expiresAt)
						},
						{
							key: "status",
							header: "Status",
							cell: (w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: w.status })
						}
					],
					pageSize: 5,
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No warranties yet" })
				})
			})
		]
	});
}
//#endregion
export { CustomersCustomeridPage as component };
