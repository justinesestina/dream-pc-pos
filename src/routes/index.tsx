import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Boxes,
  ChevronRight,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
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
  admin: "Workshop, approvals & operations",
  cashier: "Point-of-sale & orders",
  inventory: "Stock, purchasing & receiving",
};

function LoginPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const user = selected ? demoUsers.find((u) => u.role === selected) : undefined;

  useEffect(() => {
    if (!store.hydrated || !store.user) return;
    void navigate({ to: homeFor(store.user.role), replace: true });
  }, [store.hydrated, store.user, navigate]);

  const selectRole = (role: Role) => {
    setSelected(role);
    setPassword("");
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* technical backdrop */}
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-25" />
      <div className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[380px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-[38%] rounded-full bg-info/[0.07] blur-[120px]" />

      <Reveal
        className="relative w-full max-w-[400px]"
        as="div"
        y={24}
        duration={0.6}
      >
        {/* brand */}
        <div className="relative flex flex-col items-center text-center">
          <DreamLogo className="size-16 rounded-xl ring-1 ring-border" />
          <h1 className="mt-5 text-[24px] leading-none font-semibold tracking-tight">
            Dream PC <span className="text-muted-foreground">Nexus</span>
          </h1>
          <div className="label-tech mt-2 flex items-center gap-1.5">
            <span className="status-dot" />
            <span>// Operations Console</span>
          </div>
        </div>

        {selected === null ? (
          /* ── step 1: select profile ──────────────────────────────── */
          <div
            key="select"
            className="chassis-corners mt-7 rounded-2xl border border-border bg-surface/80 p-4 shadow-panel animate-in fade-in-0 zoom-in-95 duration-300"
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <p className="text-[13px] font-medium text-foreground">Select operator profile</p>
              <span className="mono text-[10px] tracking-[0.12em] text-subtle uppercase">
                Step 1 / 2
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LOGIN_ROLES.map((role, i) => {
                const Icon = ROLE_ICONS[role];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => selectRole(role)}
                    style={{ animationDelay: `${120 + i * 60}ms` }}
                    className="group flex animate-enter flex-col items-start gap-2 rounded-lg border border-border bg-background p-3 text-left transition-all duration-150 hover:border-info/50 hover:shadow-[0_8px_24px_-12px_oklch(0.76_0.11_210/0.35)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-info/50 focus-visible:outline-none"
                  >
                    <span className="flex size-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors group-hover:border-info/30 group-hover:bg-info/10 group-hover:text-info">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="w-full">
                      <span className="block text-[12.5px] leading-tight font-medium text-foreground">
                        {roleLabels[role]}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                        {ROLE_DESCRIPTIONS[role]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── step 2: credentials ─────────────────────────────────── */
          <form
            key={selected}
            onSubmit={submit}
            noValidate
            className="chassis-corners mt-7 rounded-2xl border border-border bg-surface/80 p-4 shadow-panel animate-in fade-in-0 zoom-in-95 duration-300"
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Change account
              </button>
              <span className="mono text-[10px] tracking-[0.12em] text-subtle uppercase">
                Step 2 / 2
              </span>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-info/30 bg-info/10 text-sm font-semibold text-info">
                  {user?.initials ?? <RoleIcon role={selected} />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{roleLabels[selected]}</p>
                  {user && (
                    <p className="mono mt-0.5 truncate text-[11px] text-subtle">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="my-3.5 h-px bg-border" />

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mono bg-background pr-9 pl-8 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-subtle transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-3 rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="mt-4 w-full" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Sign In
              </Button>

              {user?.password && (
                <p className="mono mt-3 text-center text-[10.5px] text-subtle">
                  Demo password: <span className="text-muted-foreground">{user.password}</span>
                </p>
              )}
            </div>
          </form>
        )}

        <p className="mono mt-6 flex items-center justify-center gap-2 text-[10px] tracking-[0.14em] text-subtle uppercase">
          <span className="h-px w-6 bg-border-strong" />
          Dream PC Build &amp; IT Solutions
          <span className="h-px w-6 bg-border-strong" />
        </p>
      </Reveal>
    </div>
  );
}

function RoleIcon({ role }: { role: Role }) {
  const Icon = ROLE_ICONS[role];
  return <Icon className="size-5" />;
}
