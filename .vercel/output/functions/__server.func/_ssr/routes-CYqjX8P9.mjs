import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as LoaderCircle, Ot as ArrowLeft, Q as EyeOff, Z as Eye, bt as Boxes, nt as CreditCard, tt as Crown, y as ShieldCheck, z as Lock } from "../_libs/lucide-react.mjs";
import { P as useStore, V as demoUsers } from "./router-DXywCOrU.mjs";
import { t as Button } from "./button-B-z3nwuQ.mjs";
import { t as Reveal } from "./motion-B4sP9a_P.mjs";
import { i as roleLabels, r as homeFor } from "./permissions-DN7TKSNU.mjs";
import { t as DreamLogo } from "./nexus-logo-DOd7Vskh.mjs";
import { t as Input } from "./input-DjMJnh0q.mjs";
import { t as Label } from "./label-DIE5zrQN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CYqjX8P9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LOGIN_ROLES = [
	"owner",
	"admin",
	"cashier",
	"inventory"
];
var ROLE_ICONS = {
	owner: Crown,
	admin: ShieldCheck,
	cashier: CreditCard,
	inventory: Boxes,
	technician: ShieldCheck
};
var ROLE_DESCRIPTIONS = {
	owner: "Full access · store & system",
	admin: "Manage staff & operations",
	cashier: "Point-of-sale & orders",
	technician: "Assembly, QA & services",
	inventory: "Stock, purchasing & receiving"
};
function LoginPage() {
	const store = useStore();
	const navigate = useNavigate();
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const user = selected ? demoUsers.find((u) => u.role === selected) : void 0;
	(0, import_react.useEffect)(() => {
		if (!store.hydrated || !store.user) return;
		navigate({
			to: homeFor(store.user.role),
			replace: true
		});
	}, [
		store.hydrated,
		store.user,
		navigate
	]);
	const selectRole = (role) => {
		setSelected(role);
		setPassword("");
		setError(null);
	};
	const submit = (e) => {
		e.preventDefault();
		if (!selected) return;
		setError(null);
		setPending(true);
		setTimeout(() => {
			const res = store.signInAs(selected, password);
			setPending(false);
			if (!res.ok) setError(res.error ?? "Sign in failed.");
		}, 350);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-backdrop pointer-events-none absolute inset-0 opacity-25" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[380px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-[38%] rounded-full bg-info/[0.07] blur-[120px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, {
				className: "relative w-full max-w-[400px]",
				as: "div",
				y: 24,
				duration: .6,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DreamLogo, { className: "size-16 rounded-xl ring-1 ring-border" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-5 text-[24px] leading-none font-semibold tracking-tight",
								children: ["Dream PC ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Nexus"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "label-tech mt-2 flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "status-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "// Operations Console" })]
							})
						]
					}),
					selected === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "chassis-corners mt-7 rounded-2xl border border-border bg-surface/80 p-4 shadow-panel animate-in fade-in-0 zoom-in-95 duration-300",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-1 pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] font-medium text-foreground",
								children: "Select operator profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-[10px] tracking-[0.12em] text-subtle uppercase",
								children: "Step 1 / 2"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-2",
							children: LOGIN_ROLES.map((role, i) => {
								const Icon = ROLE_ICONS[role];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => selectRole(role),
									style: { animationDelay: `${120 + i * 60}ms` },
									className: "group flex animate-enter flex-col items-start gap-2 rounded-lg border border-border bg-background p-3 text-left transition-all duration-150 hover:border-info/50 hover:shadow-[0_8px_24px_-12px_oklch(0.76_0.11_210/0.35)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-info/50 focus-visible:outline-none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors group-hover:border-info/30 group-hover:bg-info/10 group-hover:text-info",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "w-full",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[12.5px] leading-tight font-medium text-foreground",
											children: roleLabels[role]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block text-[10px] leading-snug text-muted-foreground",
											children: ROLE_DESCRIPTIONS[role]
										})]
									})]
								}, role);
							})
						})]
					}, "select") : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						noValidate: true,
						className: "chassis-corners mt-7 rounded-2xl border border-border bg-surface/80 p-4 shadow-panel animate-in fade-in-0 zoom-in-95 duration-300",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-1 pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelected(null),
								className: "flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), " Change account"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono text-[10px] tracking-[0.12em] text-subtle uppercase",
								children: "Step 2 / 2"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-background p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-10 shrink-0 items-center justify-center rounded-lg border border-info/30 bg-info/10 text-sm font-semibold text-info",
										children: user?.initials ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleIcon, { role: selected })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: roleLabels[selected]
										}), user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mono mt-0.5 truncate text-[11px] text-subtle",
											children: user.email
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-3.5 h-px bg-border" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "login-password",
										className: "text-xs",
										children: "Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "login-password",
												type: showPassword ? "text" : "password",
												autoComplete: "current-password",
												autoFocus: true,
												value: password,
												onChange: (e) => setPassword(e.target.value),
												placeholder: "••••••••",
												className: "mono bg-background pr-9 pl-8 text-xs",
												required: true
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setShowPassword((v) => !v),
												className: "absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-subtle transition-colors hover:text-foreground",
												"aria-label": showPassword ? "Hide password" : "Show password",
												children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" })
											})
										]
									})]
								}),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mt-3 rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive",
									children: error
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									className: "mt-4 w-full",
									disabled: pending,
									children: [pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Sign In"]
								}),
								user?.password && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mono mt-3 text-center text-[10.5px] text-subtle",
									children: ["Demo password: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: user.password
									})]
								})
							]
						})]
					}, selected),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mono mt-6 flex items-center justify-center gap-2 text-[10px] tracking-[0.14em] text-subtle uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-6 bg-border-strong" }),
							"Dream PC Build & IT Solutions",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-6 bg-border-strong" })
						]
					})
				]
			})
		]
	});
}
function RoleIcon({ role }) {
	const Icon = ROLE_ICONS[role];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" });
}
//#endregion
export { LoginPage as component };
