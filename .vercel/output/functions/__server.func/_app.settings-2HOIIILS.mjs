import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { A as Palette, D as Percent, Y as FileText, _ as Shield, et as Database, gt as Check, t as X, xt as Bell, yt as Building2 } from "./_libs/lucide-react.mjs";
import { I as VAT_RATE, K as relative, L as cn, O as useOps, P as useStore, z as dateTime } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { i as roleLabels, t as can } from "./_ssr/permissions-DN7TKSNU.mjs";
import { a as PageHeader, n as EmptyState, o as Panel, s as PanelHeader } from "./_ssr/primitives-BWrlZqU7.mjs";
import { r as KeyValueGrid, t as DemoNote } from "./_ssr/detail-C-p8_lcV.mjs";
import { t as Input } from "./_ssr/input-DjMJnh0q.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-DwFGAvLy.mjs";
import { t as Label } from "./_ssr/label-DIE5zrQN.mjs";
import { t as Switch } from "./_ssr/switch-D0Hxoaz3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.settings-2HOIIILS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ALL_ROLES = [
	"owner",
	"admin",
	"cashier",
	"technician",
	"inventory"
];
var ALL_CAPS = [
	"pos",
	"orders",
	"quotes",
	"customers",
	"products",
	"inventory",
	"inventory.adjust",
	"builds",
	"builds.qa",
	"services",
	"warranty",
	"reports",
	"settings",
	"costs",
	"purchasing",
	"receiving",
	"returns",
	"shifts",
	"consultations",
	"tasks",
	"staff",
	"audit",
	"releases",
	"documents"
];
var SECTIONS = [
	{
		id: "general",
		label: "General",
		icon: Building2,
		cap: "settings"
	},
	{
		id: "appearance",
		label: "Appearance",
		icon: Palette,
		cap: "settings"
	},
	{
		id: "tax",
		label: "VAT & tax",
		icon: Percent,
		cap: "settings"
	},
	{
		id: "roles",
		label: "Roles & permissions",
		icon: Shield,
		cap: "settings"
	},
	{
		id: "notifications",
		label: "Notifications",
		icon: Bell,
		cap: "settings"
	},
	{
		id: "documents",
		label: "Documents",
		icon: FileText,
		cap: "documents"
	},
	{
		id: "system",
		label: "System & demo",
		icon: Database,
		cap: "settings"
	}
];
function SettingsPage() {
	const store = useStore();
	const ops = useOps();
	const role = store.user?.role ?? "owner";
	const [section, setSection] = (0, import_react.useState)("general");
	const [profile, setProfile] = (0, import_react.useState)({
		name: "Dream PC Build & IT Solutions",
		address: "88 Marcos Highway, Cainta, Rizal, Philippines",
		phone: "+63 917 000 1234",
		email: "hello@dpcnexus.local"
	});
	if (!can(role, "settings")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Settings",
			description: "Store profile, roles, tax rules and preferences."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No access to settings",
			description: `The ${roleLabels[role]} role does not include the settings capability. Sign in as an Owner or Admin to manage store settings.`
		}) })]
	});
	const unread = store.notifications.filter((n) => !n.read).length;
	const visibleSections = SECTIONS.filter((s) => can(role, s.cap));
	const activeSection = visibleSections.find((s) => s.id === section) ?? visibleSections[0] ?? SECTIONS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Settings",
			description: "Store profile, roles, tax rules and preferences."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Settings sections",
				className: "flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible",
				children: visibleSections.map((s) => {
					const active = activeSection.id === s.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSection(s.id),
						"aria-current": active ? "page" : void 0,
						className: cn("flex shrink-0 items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-[13px] transition-colors", active ? "border-info/30 bg-info/10 text-foreground" : "border-transparent text-muted-foreground hover:bg-elevated hover:text-foreground"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "size-4 shrink-0 text-subtle" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: s.label
							}),
							s.id === "notifications" && unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono ml-auto size-5 shrink-0 rounded-full bg-info/15 text-center text-[10px] leading-5 text-info",
								children: unread
							})
						]
					}, s.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-5",
				children: [
					activeSection.id === "general" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeneralSection, {
						store,
						ops
					}),
					activeSection.id === "appearance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearanceSection, { store }),
					activeSection.id === "tax" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxSection, {}),
					activeSection.id === "roles" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RolesSection, {}),
					activeSection.id === "notifications" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsSection, { store }),
					activeSection.id === "documents" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentsSection, {}),
					activeSection.id === "system" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemSection, {
						store,
						ops
					})
				]
			}, activeSection.id)]
		})]
	});
}
function GeneralSection({ store, ops }) {
	const [profile, setProfile] = (0, import_react.useState)({
		name: "Dream PC Build & IT Solutions",
		address: "88 Marcos Highway, Cainta, Rizal, Philippines",
		phone: "+63 917 000 1234",
		email: "hello@dpcnexus.local"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Store profile",
			hint: "Business details shown on receipts and documents"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 p-4 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "store-name",
						className: "label-tech",
						children: "Store name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "store-name",
						value: profile.name,
						onChange: (e) => setProfile((p) => ({
							...p,
							name: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "store-email",
						className: "label-tech",
						children: "Contact email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "store-email",
						value: profile.email,
						onChange: (e) => setProfile((p) => ({
							...p,
							email: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "store-phone",
						className: "label-tech",
						children: "Contact phone"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "store-phone",
						value: profile.phone,
						onChange: (e) => setProfile((p) => ({
							...p,
							phone: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "store-address",
						className: "label-tech",
						children: "Address"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "store-address",
						value: profile.address,
						onChange: (e) => setProfile((p) => ({
							...p,
							address: e.target.value
						}))
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Store profile edits are held in local component state only — nothing is persisted. Wire this form to a settings API to make changes durable." })
		})
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Active session",
			hint: "Currently signed-in user"
		}),
		store.user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
			cols: 2,
			items: [
				{
					label: "Name",
					value: store.user.name
				},
				{
					label: "Email",
					value: store.user.email,
					mono: true
				},
				{
					label: "Role",
					value: roleLabels[store.user.role]
				},
				{
					label: "Initials",
					value: store.user.initials
				}
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-4 text-sm text-muted-foreground",
			children: "No user signed in."
		}),
		ops.actor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DemoNote, { children: [
				"Operations store acting user: ",
				ops.actor,
				"."
			] })
		})
	] })] });
}
function AppearanceSection({ store }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Appearance & preferences",
			hint: "Workspace layout"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-foreground",
					children: "Collapse sidebar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: "Show icon-only navigation to maximize workspace. Persisted across sessions."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: store.sidebarCollapsed,
					onCheckedChange: (v) => store.setSidebarCollapsed(v)
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "The visual theme is a fixed dark, minimalist, engineering-inspired design. A light-mode theme toggle is not part of the current demo." })
		})
	] });
}
function TaxSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "VAT & tax",
			hint: `Value-added tax is ${(VAT_RATE * 100).toFixed(0)}%`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
				cols: 3,
				items: [
					{
						label: "VAT rate",
						value: `${(VAT_RATE * 100).toFixed(0)}%`,
						mono: true
					},
					{
						label: "Base (ex-VAT)",
						value: `${(1 / (1 + VAT_RATE) * 100).toFixed(1)}% of gross`
					},
					{
						label: "Rounding",
						value: "2 decimal places"
					}
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "The VAT rate is a compile-time constant shared by the POS, quotes, builds, orders and receipts. Editing it requires a code change in this demo build." })
		})
	] });
}
function RolesSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Role & permissions matrix",
			hint: "UI-level capability map — not real authorization"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full border-collapse text-left text-[12.5px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						className: "label-tech px-4 py-2.5 font-normal",
						children: "Capability"
					}), ALL_ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						className: "label-tech px-3 py-2.5 text-center font-normal",
						children: roleLabels[r]
					}, r))]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ALL_CAPS.map((cap) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "mono px-4 py-2 text-xs text-foreground",
						children: cap
					}), ALL_ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 text-center",
						children: can(r, cap) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mx-auto size-3.5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mx-auto size-3.5 text-subtle" })
					}, r))]
				}, cap)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Capabilities gate navigation, page access and actions. They are enforced only in the UI — a real backend would need to enforce them server-side." })
		})
	] });
}
function NotificationsSection({ store }) {
	const unread = store.notifications.filter((n) => !n.read).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Notifications",
			hint: `${store.notifications.length} on file · ${unread} unread`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				className: "h-7 text-xs",
				disabled: unread === 0,
				onClick: () => {
					store.markAllNotificationsRead();
					toast.success("All notifications marked as read.");
				},
				children: "Mark all read"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border/60",
			children: store.notifications.slice(0, 8).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3 px-4 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mono mt-1.5 size-1.5 shrink-0 rounded-full", n.read ? "bg-border" : "bg-info"),
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-[13px] text-foreground",
							children: n.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "line-clamp-2 text-[11.5px] text-muted-foreground",
							children: n.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mono mt-0.5 text-[10px] text-subtle",
							children: [
								n.kind,
								" · ",
								relative(n.at)
							]
						})
					]
				})]
			}, n.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Notifications are generated by demo workflows (stock, builds, quotes, warranty, services, payments). No push or e-mail delivery is performed." })
		})
	] });
}
function DocumentsSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Documents & printing",
			hint: "Receipts, quotations, POs and handover notes"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
				cols: 2,
				items: [
					{
						label: "Print engine",
						value: "Browser print (window.print)"
					},
					{
						label: "Paper",
						value: "A4 · 80mm receipt-friendly layout"
					},
					{
						label: "Demo marker",
						value: "Every document is stamped DEMO"
					},
					{
						label: "Thermal printer",
						value: "Not connected"
					}
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "list-inside list-disc space-y-1 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Receipts & invoices print from order detail or the Documents register." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Quotations print from quote detail." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Purchase orders print from PO detail." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Service tickets print from ticket detail." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Release / handover notes print from release detail." })
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoNote, { children: "Documents are rendered from local demo data and printed through the browser — no BIR-accredited receipt, e-invoicing or thermal printer integration is performed." })
		})
	] });
}
function SystemSection({ store, ops }) {
	const totalProducts = store.products.length;
	const serials = store.serials.length;
	const orders = store.orders.length;
	const builds = store.builds.length;
	const tickets = store.services.length;
	const staff = ops.staff.length;
	const suppliers = ops.suppliers.length;
	const releases = ops.releases.length;
	const consultations = ops.consultations.length;
	const shifts = ops.shifts.length;
	const tasks = ops.tasks.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Demo data volumes",
			hint: "Seeded in localStorage"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
				cols: 4,
				items: [
					{
						label: "Products",
						value: totalProducts,
						mono: true
					},
					{
						label: "Serials",
						value: serials,
						mono: true
					},
					{
						label: "Orders",
						value: orders,
						mono: true
					},
					{
						label: "Builds",
						value: builds,
						mono: true
					},
					{
						label: "Service tickets",
						value: tickets,
						mono: true
					},
					{
						label: "Staff",
						value: staff,
						mono: true
					},
					{
						label: "Suppliers",
						value: suppliers,
						mono: true
					},
					{
						label: "Consultations",
						value: consultations,
						mono: true
					},
					{
						label: "Shifts",
						value: shifts,
						mono: true
					},
					{
						label: "Tasks",
						value: tasks,
						mono: true
					},
					{
						label: "Releases",
						value: releases,
						mono: true
					},
					{
						label: "Notifications",
						value: store.notifications.length,
						mono: true
					}
				]
			})
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Storage & runtime",
			hint: "Where demo state lives"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValueGrid, {
			cols: 2,
			items: [
				{
					label: "Retail store key",
					value: "dpc-nexus-demo-v1",
					mono: true
				},
				{
					label: "Operations store key",
					value: "dpc-nexus-ops-v1",
					mono: true
				},
				{
					label: "Persistence",
					value: "localStorage (per browser)"
				},
				{
					label: "Auth",
					value: "Demo roles only — no real auth"
				},
				{
					label: "Backend",
					value: "None — everything is local"
				},
				{
					label: "Last activity",
					value: store.auditLogs[0] ? dateTime(store.auditLogs[0].at) : "—"
				}
			]
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelHeader, {
			title: "Demo data controls",
			hint: "Reset all local demo state"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-xs text-muted-foreground",
				children: "Restores every module — orders, inventory, builds, services, purchasing, shifts, returns, consultations and tasks — to the original seeded demo dataset. Your signed-in session is preserved."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					size: "sm",
					children: "Reset demo data"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Reset all demo data?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This clears every change made in this demo session — orders, inventory adjustments, builds, service tickets, purchasing, shifts, returns, consultations and tasks — and reseeds the original dataset. This cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: () => {
					store.resetDemoData();
					ops.resetOpsData();
					toast.success("Demo data has been reset.");
				},
				children: "Reset data"
			})] })] })] })]
		})] })
	] });
}
//#endregion
export { SettingsPage as component };
