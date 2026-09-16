import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  ChevronRight,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DreamLogo } from "@/components/brand/nexus-logo";
import { Reveal } from "@/components/nexus/motion";
import { useStore } from "@/lib/store";
import { homeFor, roleLabels } from "@/lib/permissions";
import { demoUsers } from "@/lib/demo-data";
import { authenticateWordPress, wpSiteUrl } from "@/lib/wp-auth";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — DPC Nexus" },
      {
        name: "description",
        content:
          "Sign in to DPC Nexus, the PC retail and operations platform for Dream PC Build & IT Solutions.",
      },
      { property: "og:title", content: "Sign in — DPC Nexus" },
      {
        property: "og:description",
        content: "Internal operations platform for a PC custom-build and IT solutions business.",
      },
    ],
  }),
  component: LoginPage,
});

const LOGIN_ROLES: Role[] = ["owner", "admin", "cashier", "inventory"];

const ROLE_ICONS: Record<Role, LucideIcon> = {
  owner: Crown,
  admin: ShieldCheck,
  cashier: CreditCard,
  inventory: Boxes,
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Full access · store & system",
  admin: "Approvals & operations",
  cashier: "Orders, quotes & customers",
  inventory: "Catalog, products & stock levels",
};

function LoginPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<"demo" | "wordpress">("demo");
  const [wpUser, setWpUser] = useState("");
  const [wpPassword, setWpPassword] = useState("");
  const [showWpPassword, setShowWpPassword] = useState(false);

  const wpConfigured = Boolean(wpSiteUrl());

  const user = selected ? demoUsers.find((u) => u.role === selected) : undefined;

  useEffect(() => {
    if (!store.hydrated) return;
    
    // Check if user is already logged in
    if (store.user) {
      void navigate({ to: homeFor(store.user.role), replace: true });
      return;
    }
    
    // Try to restore user session from localStorage
    try {
      const savedUser = localStorage.getItem("dpc-nexus-user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        store.signInWithUser(user);
        return;
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [store.hydrated, store.user, navigate]);

  const selectRole = (role: Role) => {
    setSelected(role);
    const u = demoUsers.find((x) => x.role === role);
    setPassword(u?.password || "");
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setPending(true);
    // DEMO ONLY: password is validated client-side against the demo accounts.
    setTimeout(() => {
      const res = store.signInAs(selected, password);
      setPending(false);
      if (!res.ok) setError(res.error ?? "Sign in failed.");
    }, 350);
  };

  const submitWordPress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const { loginToBackend } = await import("@/lib/api-client");
    const res = await loginToBackend(wpUser, wpPassword);
    if (!res.ok && res.error?.startsWith("Could not reach backend.")) {
      const direct = await authenticateWordPress(wpUser, wpPassword);
      setPending(false);
      if (!direct.ok || !direct.user) {
        setError(direct.error ?? res.error ?? "Sign in failed.");
        return;
      }
      try {
        localStorage.setItem(
          "dpc-nexus-wp-credentials",
          JSON.stringify({ username: wpUser, appPassword: wpPassword }),
        );
      } catch {
        /* storage may be unavailable; session login can still proceed */
      }
      store.signInWithUser(direct.user);
      return;
    }
    setPending(false);
    if (!res.ok || !res.user) {
      setError(res.error ?? "Sign in failed.");
      return;
    }
    // Token and WP credentials are now automatically saved in api-client.ts loginToBackend
    store.signInWithUser(res.user);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* ── Left Panel (Branding / Showcase) ───────────────────────── */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden border-b border-border bg-surface/30 p-8 lg:border-b-0 lg:border-r lg:p-12">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-40" />
        <div className="ambient-glow pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-[10%] top-[20%] size-[500px] rounded-full bg-info/10 blur-[120px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <DreamLogo className="size-10 rounded-lg ring-1 ring-border shadow-sm" />
            <span className="text-xl font-semibold tracking-tight">DPC Nexus</span>
          </div>
        </div>

        <div className="relative z-10 hidden max-w-md lg:block">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Operations Console</h1>
          <p className="leading-relaxed text-muted-foreground">
            The intelligent internal platform for Dream PC Build & IT Solutions. Seamlessly manage
            your online orders, quotations, product catalog, and live inventory from a single,
            unified command center.
          </p>
        </div>

        <div className="relative z-10 hidden items-center gap-2 text-xs font-medium tracking-widest text-subtle uppercase lg:flex">
          <span className="status-dot-ok" /> System Online · Demo Environment
        </div>
      </div>

      {/* ── Right Panel (Auth) ─────────────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center p-6 lg:p-12">
        <Reveal className="w-full max-w-[420px]" as="div" y={24} duration={0.6}>
          {selected === null && mode === "wordpress" ? (
            /* ── WordPress Login ─────────────────────────────────────── */
            <form
              key="wordpress"
              onSubmit={submitWordPress}
              noValidate
              className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMode("demo");
                    setError(null);
                  }}
                  className="mb-6 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" /> Back to profiles
                </button>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  WordPress sign in
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Authenticate with your WordPress user account
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface/50 p-5 shadow-sm backdrop-blur-xl">
                {!wpConfigured && (
                  <p
                    role="alert"
                    className="mb-5 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-[12.5px] font-medium text-warning animate-in slide-in-from-top-1"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    WordPress is not configured yet. Set the store URL in Settings → WooCommerce (or
                    VITE_WOOCOMMERCE_URL / VITE_WORDPRESS_URL), then reload this page.
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="wp-username" className="text-[12.5px] font-medium">
                    WordPress username
                  </Label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="wp-username"
                      type="text"
                      autoComplete="username"
                      autoFocus
                      value={wpUser}
                      onChange={(e) => setWpUser(e.target.value)}
                      placeholder="your wordpress login"
                      className="mono h-11 bg-background/50 pl-10 text-[13px] shadow-sm transition-colors focus-visible:bg-background"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="wp-password" className="text-[12.5px] font-medium">
                    Application password
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="wp-password"
                      type={showWpPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={wpPassword}
                      onChange={(e) => setWpPassword(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                      className="mono h-11 bg-background/50 pl-10 pr-10 text-[13px] shadow-sm transition-colors focus-visible:bg-background"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowWpPassword((v) => !v)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showWpPassword ? "Hide password" : "Show password"}
                    >
                      {showWpPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                    Generate one in wp-admin → Users → Profile → Application Passwords.
                  </p>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-4 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[13px] font-medium text-destructive animate-in slide-in-from-top-1"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-6 h-11 w-full text-[13.5px] font-semibold shadow-sm"
                  disabled={pending || !wpConfigured}
                >
                  {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Sign in with WordPress
                </Button>

                <div className="mt-5 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                    <Globe className="size-3.5" />
                    <span className="truncate">
                      {wpConfigured ? wpSiteUrl() : "WordPress not configured"}
                    </span>
                  </p>
                </div>
              </div>
            </form>
          ) : selected === null ? (
            /* ── Step 1: Select Profile ──────────────────────────────── */
            <div
              key="select"
              className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select your operator profile to continue
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {LOGIN_ROLES.map((role, i) => {
                  const Icon = ROLE_ICONS[role];
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => selectRole(role)}
                      style={{ animationDelay: `${120 + i * 60}ms` }}
                      className="group relative flex animate-enter flex-col gap-4 rounded-xl border border-border/60 bg-surface/40 p-4 text-left transition-all duration-300 hover:border-info/40 hover:bg-surface/80 hover:shadow-[0_8px_30px_-12px_oklch(0.76_0.11_210/0.2)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/50"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-info/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-info/30 group-hover:bg-info/10 group-hover:text-info">
                          <Icon className="size-[18px]" />
                        </span>
                        <ChevronRight className="size-4 -translate-x-2 text-subtle opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-info group-hover:opacity-100" />
                      </div>
                      <div className="relative z-10">
                        <span className="block text-[13.5px] font-semibold text-foreground">
                          {roleLabels[role]}
                        </span>
                        <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
                          {ROLE_DESCRIPTIONS[role]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-[10.5px] tracking-widest text-subtle uppercase">
                <span className="h-px flex-1 bg-border/80" />
                or sign in with
                <span className="h-px flex-1 bg-border/80" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setMode("wordpress");
                  setError(null);
                }}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border/60 bg-surface/40 px-4 py-3.5 text-[13px] font-medium text-muted-foreground transition-all duration-300 hover:border-info/40 hover:bg-surface/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/50"
              >
                <Globe className="size-4 text-info" />
                Use your WordPress account
              </button>
            </div>
          ) : (
            /* ── Step 2: Credentials ─────────────────────────────────── */
            <form
              key={selected}
              onSubmit={submit}
              noValidate
              className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mb-6 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" /> Back to profiles
                </button>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">Sign in</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Authenticating as {roleLabels[selected]}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface/50 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-info/30 bg-info/10 text-lg font-bold text-info shadow-inner">
                    {user?.initials ?? <RoleIcon role={selected} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold">{roleLabels[selected]}</p>
                    {user && (
                      <p className="mono mt-0.5 truncate text-[11.5px] text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="my-5 h-px bg-border/80" />

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-[12.5px] font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mono h-11 bg-background/50 pl-10 pr-10 text-[13px] shadow-sm transition-colors focus-visible:bg-background"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-4 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[13px] font-medium text-destructive animate-in slide-in-from-top-1"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-6 h-11 w-full text-[13.5px] font-semibold shadow-sm"
                  disabled={pending}
                >
                  {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Access Workspace
                </Button>

                {user?.password && (
                  <div className="mt-5 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2.5 text-center">
                    <p className="mono flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                      Demo password:{" "}
                      <span className="font-semibold text-foreground">{user.password}</span>
                    </p>
                  </div>
                )}
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}

function RoleIcon({ role }: { role: Role }) {
  const Icon = ROLE_ICONS[role];
  return <Icon className="size-5" />;
}
