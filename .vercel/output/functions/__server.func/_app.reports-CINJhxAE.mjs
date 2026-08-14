import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { $ as Download } from "./_libs/lucide-react.mjs";
import { G as num, P as useStore, U as money, q as titleCase } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { t as can } from "./_ssr/permissions-DN7TKSNU.mjs";
import { a as PageHeader, n as EmptyState, o as Panel, s as PanelHeader } from "./_ssr/primitives-BWrlZqU7.mjs";
import { o as TotalsRows, r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { i as Segmented } from "./_ssr/toolbar-hXXZ3_0K.mjs";
import { t as StatCard } from "./_ssr/stat-card-D08bC1B_.mjs";
import { t as DataTable } from "./_ssr/data-table-BNBvmO8p.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as PieChart, r as BarChart, s as CartesianGrid, u as Cell } from "./_libs/recharts+[...].mjs";
import { n as PrintButton } from "./_ssr/document-B0S1Nw0D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.reports-CINJhxAE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RANGES = [
	{
		value: "7",
		label: "7 days"
	},
	{
		value: "30",
		label: "30 days"
	},
	{
		value: "90",
		label: "90 days"
	}
];
var PIE_COLORS = [
	"var(--color-info)",
	"var(--color-success)",
	"var(--color-warning)",
	"var(--color-destructive)",
	"#8884d8",
	"#82ca9d"
];
function download(filename, content, type) {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function toCSV(headers, rows) {
	const esc = (v) => {
		const s = String(v ?? "");
		return /[",\n]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
	};
	return [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}
function ReportsPage() {
	const store = useStore();
	const [range, setRange] = (0, import_react.useState)("30");
	const showCosts = can(store.user?.role ?? "owner", "costs");
	const cutoff = (0, import_react.useMemo)(() => Date.now() - Number(range) * 864e5, [range]);
	const paidOrders = (0, import_react.useMemo)(() => store.orders.filter((o) => o.payment && new Date(o.createdAt).getTime() >= cutoff), [store.orders, cutoff]);
	const revenueByDay = (0, import_react.useMemo)(() => {
		const days = [];
		const n = Number(range);
		for (let i = n - 1; i >= 0; i--) {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() - i);
			d.setHours(0, 0, 0, 0);
			const next = new Date(d);
			next.setDate(next.getDate() + 1);
			const rev = paidOrders.filter((o) => {
				const t = new Date(o.createdAt).getTime();
				return t >= d.getTime() && t < next.getTime();
			}).reduce((s, o) => s + o.total, 0);
			days.push({
				label: d.toLocaleDateString("en-PH", {
					month: "short",
					day: "numeric"
				}),
				revenue: rev
			});
		}
		return days;
	}, [paidOrders, range]);
	const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
	const productCost = (id) => store.productById(id)?.cost ?? 0;
	const productCategory = (id) => store.categoryNameOf(store.productById(id)?.categoryId ?? "");
	const revenueByCategory = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const o of paidOrders) for (const item of o.items) {
			const cat = productCategory(item.productId);
			map.set(cat, (map.get(cat) ?? 0) + item.qty * item.unitPrice);
		}
		return Array.from(map.entries()).map(([category, revenue]) => ({
			category,
			revenue
		})).sort((a, b) => b.revenue - a.revenue);
	}, [paidOrders]);
	const productSales = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const o of paidOrders) for (const item of o.items) {
			const existing = map.get(item.productId) ?? {
				productId: item.productId,
				name: item.name,
				sku: item.sku,
				qty: 0,
				revenue: 0,
				cost: 0
			};
			existing.qty += item.qty;
			existing.revenue += item.qty * item.unitPrice;
			existing.cost += item.qty * productCost(item.productId);
			map.set(item.productId, existing);
		}
		return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
	}, [paidOrders]);
	const totalCost = productSales.reduce((s, p) => s + p.cost, 0);
	const grossMargin = totalRevenue - totalCost;
	const marginPct = totalRevenue > 0 ? grossMargin / totalRevenue * 100 : 0;
	const byPaymentMethod = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const o of paidOrders) {
			if (!o.payment) continue;
			const existing = map.get(o.payment.method) ?? {
				count: 0,
				amount: 0
			};
			existing.count += 1;
			existing.amount += o.payment.amount;
			map.set(o.payment.method, existing);
		}
		return Array.from(map.entries()).map(([method, v]) => ({
			method,
			...v
		}));
	}, [paidOrders]);
	const byCashier = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const o of paidOrders) {
			const existing = map.get(o.cashier) ?? {
				orders: 0,
				revenue: 0
			};
			existing.orders += 1;
			existing.revenue += o.total;
			map.set(o.cashier, existing);
		}
		return Array.from(map.entries()).map(([cashier, v]) => ({
			cashier,
			...v
		})).sort((a, b) => b.revenue - a.revenue);
	}, [paidOrders]);
	const inventoryValuation = (0, import_react.useMemo)(() => {
		return store.inventory.reduce((acc, i) => {
			const p = store.productById(i.productId);
			if (!p) return acc;
			acc.units += i.onHand;
			acc.costValue += i.onHand * p.cost;
			acc.retailValue += i.onHand * p.price;
			return acc;
		}, {
			units: 0,
			costValue: 0,
			retailValue: 0
		});
	}, [store.inventory]);
	const deadStock = (0, import_react.useMemo)(() => {
		const soldIds = new Set(productSales.map((p) => p.productId));
		return store.inventory.filter((i) => i.onHand > 0 && !soldIds.has(i.productId)).map((i) => ({
			inv: i,
			product: store.productById(i.productId)
		})).filter((x) => Boolean(x.product)).sort((a, b) => b.inv.onHand * b.product.cost - a.inv.onHand * a.product.cost).slice(0, 8);
	}, [store.inventory, productSales]);
	const serviceStats = (0, import_react.useMemo)(() => {
		const inRange = store.services.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
		const completed = inRange.filter((s) => s.status === "released");
		const revenue = completed.reduce((s, t) => s + (t.actualCost ?? t.estimatedCost), 0);
		return {
			total: inRange.length,
			completed: completed.length,
			revenue
		};
	}, [store.services, cutoff]);
	const warrantyStats = (0, import_react.useMemo)(() => {
		return {
			active: store.warranties.filter((w) => w.status === "active").length,
			expiring: store.warranties.filter((w) => w.status === "expiring").length,
			claims: store.claims.filter((c) => new Date(c.createdAt).getTime() >= cutoff).length,
			total: store.warranties.length
		};
	}, [
		store.warranties,
		store.claims,
		cutoff
	]);
	const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const exportCSV = () => {
		const products = toCSV(showCosts ? [
			"Product",
			"SKU",
			"Units sold",
			"Revenue",
			"Cost",
			"Margin",
			"Margin %"
		] : [
			"Product",
			"SKU",
			"Units sold",
			"Revenue"
		], productSales.map((p) => showCosts ? [
			p.name,
			p.sku,
			p.qty,
			p.revenue.toFixed(2),
			p.cost.toFixed(2),
			(p.revenue - p.cost).toFixed(2),
			(p.revenue ? (p.revenue - p.cost) / p.revenue * 100 : 0).toFixed(1)
		] : [
			p.name,
			p.sku,
			p.qty,
			p.revenue.toFixed(2)
		]));
		download(`dpc-nexus-products-${stamp}.csv`, products, "text/csv;charset=utf-8");
	};
	const exportJSON = () => {
		const payload = {
			range: `${range}d`,
			generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			summary: {
				revenue: totalRevenue,
				grossMargin,
				grossMarginPct: marginPct,
				costOfGoods: totalCost,
				avgOrderValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
				paidOrders: paidOrders.length
			},
			revenueByDay,
			revenueByCategory,
			productSales,
			byPaymentMethod: byPaymentMethod.map((m) => ({
				method: m.method,
				count: m.count,
				amount: m.amount
			})),
			byCashier,
			inventoryValuation,
			serviceStats,
			warrantyStats
		};
		download(`dpc-nexus-report-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
	};
	const productColumns = [
		{
			key: "name",
			header: "Product",
			cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[13px] text-foreground",
				children: r.name
			})
		},
		{
			key: "sku",
			header: "SKU",
			cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono text-xs text-subtle",
				children: r.sku
			})
		},
		{
			key: "qty",
			header: "Units sold",
			align: "right",
			cell: (r) => num(r.qty),
			sortValue: (r) => r.qty
		},
		{
			key: "revenue",
			header: "Revenue",
			align: "right",
			cell: (r) => money(r.revenue),
			sortValue: (r) => r.revenue
		},
		...showCosts ? [{
			key: "margin",
			header: "Margin",
			align: "right",
			cell: (r) => {
				const m = r.revenue - r.cost;
				const pct = r.revenue > 0 ? m / r.revenue * 100 : 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: pct >= 30 ? "text-success" : pct >= 10 ? "text-warning" : "text-destructive",
					children: [
						money(m),
						" (",
						pct.toFixed(0),
						"%)"
					]
				});
			},
			sortValue: (r) => r.revenue - r.cost
		}] : []
	];
	const cashierColumns = [
		{
			key: "cashier",
			header: "Staff",
			cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[13px] text-foreground",
				children: r.cashier
			})
		},
		{
			key: "orders",
			header: "Orders",
			align: "right",
			cell: (r) => num(r.orders),
			sortValue: (r) => r.orders
		},
		{
			key: "revenue",
			header: "Revenue",
			align: "right",
			cell: (r) => money(r.revenue),
			sortValue: (r) => r.revenue
		},
		{
			key: "avg",
			header: "Avg. ticket",
			align: "right",
			cell: (r) => money(r.orders ? r.revenue / r.orders : 0),
			sortValue: (r) => r.orders ? r.revenue / r.orders : 0
		}
	];
	const deadStockColumns = [
		{
			key: "name",
			header: "Product",
			cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[13px] text-foreground",
				children: r.name
			})
		},
		{
			key: "sku",
			header: "SKU",
			cell: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono text-xs text-subtle",
				children: r.sku
			})
		},
		{
			key: "onHand",
			header: "On hand",
			align: "right",
			cell: (r) => num(r.onHand)
		},
		{
			key: "value",
			header: "Cost value tied up",
			align: "right",
			cell: (r) => money(r.value),
			sortValue: (r) => r.value
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Reports",
				description: "Sales, margin, inventory turnover and service output — derived live from operational data.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => {
							exportCSV();
							toast.success("CSV report downloaded.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => {
							exportJSON();
							toast.success("JSON report downloaded.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export JSON"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintButton, { label: "Print" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
						value: range,
						onChange: setRange,
						options: RANGES.map((r) => ({
							value: r.value,
							label: r.label
						}))
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Revenue",
						numericValue: totalRevenue,
						format: money,
						hint: `${paidOrders.length} paid orders`,
						accent: "info"
					}),
					showCosts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Gross margin",
						numericValue: grossMargin,
						format: money,
						hint: `${marginPct.toFixed(1)}% of revenue`,
						accent: "success"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Cost of goods",
						numericValue: totalCost,
						format: money,
						hint: "Product cost basis"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Avg. order value",
						numericValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
						format: money,
						hint: "Per transaction"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-[1.6fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
						title: "Revenue over time",
						hint: `Last ${range} days`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[260px] px-2 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: revenueByDay,
								margin: {
									top: 8,
									right: 12,
									left: 4,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--color-border)",
										strokeDasharray: "2 4",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fontSize: 10,
											fill: "var(--color-subtle)"
										},
										stroke: "var(--color-border)",
										tickLine: false,
										interval: Math.floor(revenueByDay.length / 10)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fontSize: 10,
											fill: "var(--color-subtle)"
										},
										stroke: "var(--color-border)",
										tickLine: false,
										width: 54,
										tickFormatter: (v) => `${Math.round(v / 1e3)}k`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										contentStyle: {
											background: "var(--color-popover)",
											border: "1px solid var(--color-border)",
											borderRadius: 8,
											fontSize: 12
										},
										formatter: (v) => money(v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "revenue",
										fill: "var(--color-info)",
										radius: [
											3,
											3,
											0,
											0
										]
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
						title: "Revenue by category",
						hint: `Last ${range} days`
					}), revenueByCategory.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No sales in range",
						description: "Try a wider date range."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[260px] px-2 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: revenueByCategory,
								dataKey: "revenue",
								nameKey: "category",
								innerRadius: 48,
								outerRadius: 80,
								paddingAngle: 2,
								children: revenueByCategory.map((entry, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, entry.category))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: {
									background: "var(--color-popover)",
									border: "1px solid var(--color-border)",
									borderRadius: 8,
									fontSize: 12
								},
								formatter: (v, n) => [money(v), n]
							})] })
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
				title: "Top selling products",
				hint: `Last ${range} days`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows: productSales.slice(0, 20).map((p) => ({
					id: p.productId,
					...p
				})),
				columns: productColumns,
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No product sales",
					description: "No paid orders in this range."
				}),
				initialSort: {
					key: "revenue",
					dir: "desc"
				},
				pageSize: 10
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
						title: "Sales by payment method",
						hint: `Last ${range} days`
					}), byPaymentMethod.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No payments in range" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsRows, {
						className: "p-4",
						rows: byPaymentMethod.sort((a, b) => b.amount - a.amount).map((m) => ({
							label: `${titleCase(m.method)} (${m.count})`,
							value: money(m.amount)
						}))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
						title: "Staff / cashier performance",
						hint: `Last ${range} days`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						rows: byCashier.map((c) => ({
							id: c.cashier,
							...c
						})),
						columns: cashierColumns,
						empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No sales in range" }),
						initialSort: {
							key: "revenue",
							dir: "desc"
						},
						pageSize: 8
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
							title: "Inventory valuation",
							hint: "Current stock on hand"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
							cols: 3,
							items: [
								{
									label: "Units on hand",
									value: num(inventoryValuation.units)
								},
								{
									label: "Retail value",
									value: money(inventoryValuation.retailValue)
								},
								...showCosts ? [{
									label: "Cost value",
									value: money(inventoryValuation.costValue)
								}] : []
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 pb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label-tech mb-2",
								children: "Dead stock (no sales in range)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
								rows: deadStock.map(({ inv, product }) => ({
									id: inv.productId,
									name: product.name,
									sku: product.sku,
									onHand: inv.onHand,
									cost: product.cost,
									value: inv.onHand * product.cost
								})),
								columns: deadStockColumns,
								empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									title: "No dead stock",
									description: "Every SKU with stock has sold in this range."
								}),
								pageSize: 8,
								dense: true
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
							title: "Service & warranty stats",
							hint: `Last ${range} days`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
							cols: 2,
							items: [
								{
									label: "Service tickets",
									value: num(serviceStats.total)
								},
								{
									label: "Completed / released",
									value: num(serviceStats.completed)
								},
								{
									label: "Service revenue",
									value: money(serviceStats.revenue)
								},
								{
									label: "Active warranties",
									value: num(warrantyStats.active)
								},
								{
									label: "Expiring soon",
									value: num(warrantyStats.expiring)
								},
								{
									label: "Claims filed (range)",
									value: num(warrantyStats.claims)
								}
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 pb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Margin and valuation figures use the product cost field seeded in demo data — connect a real costing/accounting feed to make these authoritative. CSV/JSON exports are generated entirely in the browser from local demo data; nothing is sent to a server." })
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
