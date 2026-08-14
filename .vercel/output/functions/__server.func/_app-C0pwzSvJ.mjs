import { i as __toESM } from "./_runtime.mjs";
import { t as cva } from "./_libs/class-variance-authority+clsx.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "./_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime, _ as DialogTrigger, d as DialogClose, f as DialogContent, g as DialogTitle, h as DialogPortal, m as DialogOverlay, p as DialogDescription, u as Dialog } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "./_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { C as Receipt, Ct as Banknote, I as MessagesSquare, L as Menu, N as PackagePlus, Nt as Activity, R as LogOut, S as RotateCcw, St as Barcode, T as Plus, U as LayoutDashboard, X as FileStack, Y as FileText, _t as ChartColumn, b as Settings, bt as Boxes, dt as ChevronsLeft, g as ShoppingCart, gt as Check, i as Users, it as Command, j as Package, l as Truck, n as Wrench, o as UserPlus, ot as ClipboardList, pt as ChevronRight, q as Hammer, rt as Cpu, s as UserCog, st as Circle, t as X, ut as ChevronsRight, wt as BadgeCheck, x as Search, xt as Bell, yt as Building2 } from "./_libs/lucide-react.mjs";
import { C as Tooltip, K as relative, L as cn, P as useStore, T as TooltipTrigger, U as money, w as TooltipContent } from "./_ssr/router-DXywCOrU.mjs";
import { t as Button } from "./_ssr/button-B-z3nwuQ.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./_ssr/popover-Bef0gulg.mjs";
import { n as ScrollProgress } from "./_ssr/motion-B4sP9a_P.mjs";
import { a as CommandInput, c as CommandSeparator, i as CommandGroup, l as CommandShortcut, n as CommandDialog, o as CommandItem, r as CommandEmpty, s as CommandList } from "./_ssr/command-Dern75kD.mjs";
import { i as roleLabels, n as capForPath, r as homeFor, t as can } from "./_ssr/permissions-DN7TKSNU.mjs";
import { n as NexusWordmark } from "./_ssr/nexus-logo-DOd7Vskh.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "./_libs/radix-ui__react-scroll-area.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-C0pwzSvJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var navGroups = [
	{
		label: "Overview",
		items: [{
			label: "Dashboard",
			to: "/dashboard",
			icon: LayoutDashboard,
			cap: "orders"
		}]
	},
	{
		label: "Sales",
		items: [
			{
				label: "Point of Sale",
				to: "/pos",
				icon: ShoppingCart,
				cap: "pos"
			},
			{
				label: "Orders",
				to: "/orders",
				icon: Receipt,
				cap: "orders"
			},
			{
				label: "Quotes",
				to: "/quotes",
				icon: FileText,
				cap: "quotes"
			},
			{
				label: "Consultations",
				to: "/consultations",
				icon: MessagesSquare,
				cap: "consultations"
			},
			{
				label: "Returns",
				to: "/returns",
				icon: RotateCcw,
				cap: "returns"
			},
			{
				label: "Cash Drawer",
				to: "/shifts",
				icon: Banknote,
				cap: "shifts"
			}
		]
	},
	{
		label: "Inventory",
		items: [
			{
				label: "Products",
				to: "/products",
				icon: Package,
				cap: "products"
			},
			{
				label: "Inventory",
				to: "/inventory",
				icon: Boxes,
				cap: "inventory"
			},
			{
				label: "Serial Numbers",
				to: "/serials",
				icon: Barcode,
				cap: "inventory"
			},
			{
				label: "Custom Builds",
				to: "/builds",
				icon: Cpu,
				cap: "builds"
			},
			{
				label: "Assembly",
				to: "/assembly",
				icon: Hammer,
				cap: "assembly"
			},
			{
				label: "Purchasing",
				to: "/purchasing",
				icon: ClipboardList,
				cap: "purchasing"
			},
			{
				label: "Suppliers",
				to: "/suppliers",
				icon: Building2,
				cap: "purchasing"
			},
			{
				label: "Receiving",
				to: "/receiving",
				icon: PackagePlus,
				cap: "receiving"
			}
		]
	},
	{
		label: "Customers",
		items: [
			{
				label: "Customers",
				to: "/customers",
				icon: Users,
				cap: "customers"
			},
			{
				label: "Services",
				to: "/services",
				icon: Wrench,
				cap: "services"
			},
			{
				label: "Warranty",
				to: "/warranty",
				icon: BadgeCheck,
				cap: "warranty"
			},
			{
				label: "Releases",
				to: "/releases",
				icon: Truck,
				cap: "releases"
			}
		]
	},
	{
		label: "Operations",
		items: [
			{
				label: "Tasks",
				to: "/tasks",
				icon: ClipboardList,
				cap: "tasks"
			},
			{
				label: "Staff",
				to: "/staff",
				icon: UserCog,
				cap: "staff"
			},
			{
				label: "Documents",
				to: "/documents",
				icon: FileStack,
				cap: "documents"
			}
		]
	},
	{
		label: "Analytics",
		items: [{
			label: "Reports",
			to: "/reports",
			icon: ChartColumn,
			cap: "reports"
		}]
	},
	{
		label: "System",
		items: [{
			label: "Settings",
			to: "/settings",
			icon: Settings,
			cap: "settings"
		}, {
			label: "Audit Log",
			to: "/audit",
			icon: Activity,
			cap: "audit"
		}]
	}
];
function AppSidebar() {
	const store = useStore();
	const collapsed = store.sidebarCollapsed;
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const role = store.user?.role ?? "owner";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out print:hidden lg:flex", collapsed ? "w-[68px]" : "w-[236px]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("flex h-14 items-center border-b border-sidebar-border", collapsed ? "justify-between gap-1 px-2" : "justify-between px-4"),
				children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/dashboard",
					"aria-label": "DPC Nexus home",
					className: "shrink-0 text-muted-foreground hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/dpc-logo.png",
						alt: "Dream PC Build & IT Solutions",
						className: "size-6 rounded object-contain"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					className: "size-6 shrink-0 text-muted-foreground",
					"aria-label": "Expand sidebar",
					onClick: () => store.setSidebarCollapsed(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, { className: "size-4" })
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/dashboard",
					"aria-label": "DPC Nexus home",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NexusWordmark, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					className: "size-7 text-muted-foreground",
					"aria-label": "Collapse sidebar",
					onClick: () => store.setSidebarCollapsed(true),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsLeft, { className: "size-4" })
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 overflow-y-auto px-2 py-3",
				"aria-label": "Primary",
				children: navGroups.map((group) => {
					const items = group.items.filter((i) => can(role, i.cap));
					if (items.length === 0) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label-tech px-2 pb-1.5",
							children: group.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-0.5",
							children: items.map((item) => {
								const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
								const link = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("group relative flex items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] transition-colors", collapsed && "justify-center px-0", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"),
									"aria-current": active ? "page" : void 0,
									children: [
										active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 bottom-1.5 -left-2 w-[2px] rounded-full bg-info" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4 shrink-0" }),
										!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: item.label
										})
									]
								});
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
									asChild: true,
									children: link
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
									side: "right",
									children: item.label
								})] }) : link }, item.to);
							})
						})]
					}, group.label);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-sidebar-border p-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMenu, { collapsed })
			})
		]
	});
}
function UserMenu({ collapsed = false }) {
	const store = useStore();
	const user = store.user;
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			className: cn("flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent", collapsed && "justify-center px-0"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-[11px] text-foreground",
				children: user.initials
			}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-[13px] text-foreground",
					children: user.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono block truncate text-[10.5px] text-subtle uppercase",
					children: roleLabels[user.role]
				})]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "start",
		side: "top",
		className: "w-60",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
				className: "font-normal",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px]",
					children: user.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mono mt-0.5 text-[11px] text-subtle",
					children: user.email
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/settings",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), " Settings"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => store.signOut(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
			})
		]
	})] });
}
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
function useCrumbs() {
	const segments = useRouterState({ select: (s) => s.location.pathname }).split("/").filter(Boolean);
	const root = navGroups.flatMap((g) => g.items).find((i) => i.to === `/${segments[0] ?? ""}`);
	return {
		title: root?.label ?? "Dashboard",
		detail: segments.length > 1 ? decodeURIComponent(segments[1] ?? "") : null,
		rootTo: root?.to ?? "/dashboard"
	};
}
function AppTopbar({ onOpenPalette }) {
	const store = useStore();
	const { title, detail, rootTo } = useCrumbs();
	const [mobileNav, setMobileNav] = (0, import_react.useState)(false);
	const unread = store.notifications.filter((n) => !n.read).length;
	const role = store.user?.role ?? "owner";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-3 backdrop-blur-md print:hidden sm:px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				open: mobileNav,
				onOpenChange: setMobileNav,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						className: "lg:hidden",
						"aria-label": "Open navigation",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "w-[260px] border-sidebar-border bg-sidebar p-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
							className: "sr-only",
							children: "Navigation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-14 items-center border-b border-sidebar-border px-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NexusWordmark, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							className: "h-[calc(100vh-8rem)] px-2 py-3",
							children: navGroups.map((g) => {
								const items = g.items.filter((i) => can(role, i.cap));
								if (!items.length) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "label-tech px-2 pb-1.5",
										children: g.label
									}), items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: i.to,
										onClick: () => setMobileNav(false),
										className: "flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(i.icon, { className: "size-4" }), i.label]
									}, i.to))]
								}, g.label);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-sidebar-border p-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMenu, {})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Breadcrumb",
					className: "flex items-center gap-1.5 text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: rootTo,
						className: "truncate font-medium text-foreground hover:underline",
						children: title
					}), detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "/"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono truncate text-xs text-muted-foreground",
						children: detail
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: onOpenPalette,
				className: "hidden h-8 w-64 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-border-strong md:flex xl:w-80",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 truncate",
						children: "Search products, orders, serials…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "mono rounded border border-border bg-elevated px-1 py-0.5 text-[10px]",
						children: "⌘K"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "icon",
				variant: "ghost",
				className: "md:hidden",
				"aria-label": "Open command palette",
				onClick: onOpenPalette,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono hidden items-center gap-1.5 rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] tracking-wide text-warning uppercase sm:inline-flex",
				children: "Demo mode"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "icon",
					variant: "ghost",
					className: "relative",
					"aria-label": "Notifications",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 right-1.5 size-1.5 rounded-full bg-info" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
				align: "end",
				className: "w-[340px] p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Notifications"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "h-7 text-xs",
						onClick: () => store.markAllNotificationsRead(),
						children: "Mark all read"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "max-h-[320px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: store.notifications.slice(0, 8).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2.5 px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1 size-1.5 shrink-0 rounded-full", n.priority === "critical" ? "bg-destructive" : n.priority === "high" ? "bg-warning" : "bg-info", n.read && "opacity-30") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("text-[13px]", n.read && "text-muted-foreground"),
										children: n.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: n.body
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mono mt-1 text-[10.5px] text-subtle",
										children: relative(n.at)
									})
								]
							})]
						}, n.id))
					})
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-9",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMenu, { collapsed: true })
				})
			})
		]
	});
}
function CommandPalette({ open, onOpenChange }) {
	const navigate = useNavigate();
	const store = useStore();
	const [query, setQuery] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) setQuery("");
	}, [open]);
	const go = (to) => {
		onOpenChange(false);
		navigate({ to });
	};
	const q = query.trim().toLowerCase();
	const matchedProducts = q ? store.products.filter((p) => !p.archived && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || store.categoryNameOf(p.categoryId).toLowerCase().includes(q))).slice(0, 5) : [];
	const matchedOrders = q ? store.orders.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)).slice(0, 4) : [];
	const matchedCustomers = q ? store.customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4) : [];
	const matchedSerials = q ? store.serials.filter((s) => s.serial.toLowerCase().includes(q)).slice(0, 3) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandDialog, {
		open,
		onOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
			placeholder: "Search or run a command — products, SKU, serial, orders, customers…",
			value: query,
			onValueChange: setQuery
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, {
			className: "max-h-[420px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No results found." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, {
					heading: "Actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/pos"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
								" New Sale ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandShortcut, { children: "F1" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/quotes"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), " New Quote"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/consultations?new=1"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, {}), " New Custom Build Consultation"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/customers?new=1"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {}), " New Customer"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/services?new=1"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, {}), " New Service Ticket"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/products?new=1"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, {}), " New Product"]
						})
					]
				}),
				matchedProducts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "Products",
					children: matchedProducts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `product-${p.sku}-${p.name}`,
						onSelect: () => go(`/products/${p.id}`),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 truncate",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-[11px] text-subtle",
								children: p.sku
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-[11px] text-muted-foreground",
								children: money(p.price)
							})
						]
					}, p.id))
				})] }),
				matchedOrders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "Orders",
					children: matchedOrders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `order-${o.id}-${o.customerName}`,
						onSelect: () => go(`/orders/${o.id}`),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono",
								children: o.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 truncate text-muted-foreground",
								children: o.customerName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-[11px]",
								children: money(o.total)
							})
						]
					}, o.id))
				})] }),
				matchedCustomers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "Customers",
					children: matchedCustomers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `customer-${c.name}`,
						onSelect: () => go(`/customers/${c.id}`),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 truncate",
								children: c.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-[11px] text-subtle",
								children: c.phone
							})
						]
					}, c.id))
				})] }),
				matchedSerials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "Serial numbers",
					children: matchedSerials.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `serial-${s.serial}`,
						onSelect: () => go(`/products/${s.productId}`),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono flex-1",
								children: s.serial
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-[11px] text-subtle uppercase",
								children: s.status
							})
						]
					}, s.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, {
					heading: "Navigate",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/dashboard"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, {}), " Dashboard"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/pos"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {}), " Point of Sale"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/orders"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {}), " Orders"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/quotes"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), " Quotes"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/inventory"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, {}), " Inventory"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/builds"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, {}), " Custom Builds"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/services"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, {}), " Services"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/warranty"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {}), " Warranty Center"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/reports"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {}), " Reports"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							onSelect: () => go("/settings"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {}), " Settings"]
						})
					]
				})
			]
		})]
	});
}
function AppLayout() {
	const store = useStore();
	const navigate = useNavigate();
	const [paletteOpen, setPaletteOpen] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		if (store.hydrated && !store.user) navigate({
			to: "/",
			replace: true
		});
	}, [
		store.hydrated,
		store.user,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (!store.hydrated || !store.user) return;
		const cap = capForPath(pathname);
		if (cap && !can(store.user.role, cap)) {
			toast.error(`${store.user.name}, that page is outside the ${homeFor(store.user.role)} scope.`);
			navigate({
				to: homeFor(store.user.role),
				replace: true
			});
		}
	}, [
		store.hydrated,
		store.user,
		pathname,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		window.scrollTo({
			top: 0,
			behavior: reduce ? "auto" : "smooth"
		});
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen((v) => !v);
				return;
			}
			if (e.key === "F1") {
				e.preventDefault();
				navigate({ to: "/pos" });
			}
			if (e.key === "F2") {
				e.preventDefault();
				const el = document.querySelector("[data-pos-search]");
				if (el) el.focus();
				else setPaletteOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [navigate]);
	if (!store.hydrated || !store.user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mono animate-pulse text-xs text-subtle",
			children: "INITIALIZING DPC NEXUS…"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollProgress, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppTopbar, { onOpenPalette: () => setPaletteOpen(true) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "animate-enter min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}, pathname)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {
				open: paletteOpen,
				onOpenChange: setPaletteOpen
			})
		]
	});
}
//#endregion
export { AppLayout as component };
