import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Boxes,
  ChevronRight,
  CreditCard,
  Crown,
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
  technician: ShieldCheck,
};

function LoginPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);
  const [password, setPassword] = useState("");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* technical backdrop */}
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-40" />
      <div className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" />

      <Reveal className="relative w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center">
          <DreamLogo className="size-24 rounded-2xl ring-1 ring-border" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Dream PC <span className="text-muted-foreground">Nexus</span>
          </h1>
          <p className="label-tech mt-2">// Operations Console</p>
        </div>

        {selected === null ? (
          /* ── step 1: pick who you are ─────────────────────────────── */
          <div key="select" className="mt-8 animate-in fade-in-0 zoom-in-95 duration-300">
            <p className="text-center text-xs text-muted-foreground">
              Pick your account to sign in
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {LOGIN_ROLES.map((role) => {
                const Icon = ROLE_ICONS[role];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => selectRole(role)}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-surface/70 p-3.5 text-left transition-all hover:border-info/50 hover:bg-surface active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-info/50 focus-visible:outline-none"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors group-hover:border-info/40 group-hover:bg-info/10 group-hover:text-info">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                      {roleLabels[role]}
                    </span>
                    <ChevronRight className="size-3.5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
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
            className="mt-8 animate-in fade-in-0 zoom-in-95 duration-300"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Change account
            </button>

            <div className="mt-4 rounded-xl border border-border bg-surface/70 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-info">
                  <RoleIcon role={selected} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{roleLabels[selected]}</p>
                  {user && (
                    <p className="mono mt-0.5 truncate text-[11px] text-subtle">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="my-4 h-px bg-border" />

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mono bg-background pl-8 text-xs"
                    required
                  />
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

        <p className="mono mt-8 text-center text-[10px] tracking-[0.14em] text-subtle uppercase">
          Dream PC Build &amp; IT Solutions · Internal use
        </p>
      </Reveal>
    </div>
  );
}

function RoleIcon({ role }: { role: Role }) {
  const Icon = ROLE_ICONS[role];
  return <Icon className="size-5" />;
}
