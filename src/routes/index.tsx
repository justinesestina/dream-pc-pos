import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NexusMark } from "@/components/brand/nexus-logo";
import { DEMO_CREDENTIALS, useStore } from "@/lib/store";
import { timeOnly } from "@/lib/format";

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

function LoginPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const t = setInterval(() => setClock(timeOnly(new Date().toISOString())), 1000);
    setClock(timeOnly(new Date().toISOString()));
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (store.hydrated && store.user) void navigate({ to: "/dashboard", replace: true });
  }, [store.hydrated, store.user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    // DEMO ONLY: credentials are validated client-side against demo users.
    setTimeout(() => {
      const res = store.signIn(email, password);
      setPending(false);
      if (!res.ok) setError(res.error ?? "Sign in failed.");
    }, 420);
  };

  const useDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setPending(true);
    setTimeout(() => {
      store.signInDemo();
      setPending(false);
    }, 320);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" />
      <div className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[880px] overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur-sm lg:grid lg:grid-cols-[1.05fr_1fr]">
          {/* brand panel */}
          <div className="hidden flex-col justify-between border-r border-border bg-background/40 p-8 lg:flex">
            <div>
              <div className="flex items-center gap-2.5">
                <NexusMark className="size-8" />
                <div>
                  <p className="text-base font-semibold tracking-tight">
                    DPC <span className="text-muted-foreground">NEXUS</span>
                  </p>
                  <p className="mono text-[10px] tracking-[0.16em] text-subtle uppercase">
                    PC Retail &amp; Operations Platform
                  </p>
                </div>
              </div>
              <h1 className="mt-10 text-[22px] leading-snug font-semibold tracking-tight">
                The operational command center for custom PC builds and IT services.
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                Point of sale, component inventory with serial traceability, build pipeline, QA,
                quotations, service tickets and warranty — in one console.
              </p>
              <ul className="mt-6 space-y-2">
                {[
                  "Consultation → Build → QA → Release",
                  "Serial-level traceability per unit",
                  "Reserved vs available stock accounting",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <span className="size-1 rounded-full bg-info" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-5">
              <div>
                <dt className="label-tech">System status</dt>
                <dd className="mono mt-1 text-xs text-success">OPERATIONAL</dd>
              </div>
              <div>
                <dt className="label-tech">Version</dt>
                <dd className="mono mt-1 text-xs text-muted-foreground">DEMO 0.1</dd>
              </div>
              <div>
                <dt className="label-tech">Local time</dt>
                <dd className="mono mt-1 text-xs text-muted-foreground">{clock}</dd>
              </div>
            </dl>
          </div>

          {/* form panel */}
          <div className="p-7 sm:p-9">
            <div className="flex items-center gap-2.5 lg:hidden">
              <NexusMark />
              <p className="text-[15px] font-semibold tracking-tight">
                DPC <span className="text-muted-foreground">NEXUS</span>
              </p>
            </div>

            <p className="label-tech mt-6 lg:mt-0">Secure area</p>
            <h2 className="mt-1.5 text-lg font-semibold tracking-tight">Sign in to continue</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Demo environment — no live customer data.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@dpcnexus.local"
                    className="mono bg-background pl-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setError("Password recovery requires a backend (not implemented).")}
                    className="text-[11px] text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mono bg-background pl-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                />
                <Label htmlFor="remember" className="text-xs font-normal text-muted-foreground">
                  Keep me signed in on this workstation
                </Label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Sign In
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={useDemo}>
                Use Demo Account <ArrowRight className="size-3.5" />
              </Button>

              <p className="mono text-center text-[10.5px] text-subtle">
                {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
              </p>
            </form>
          </div>
        </div>
      </div>

      <footer className="relative flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 pb-6">
        <p className="mono text-[10.5px] text-subtle">
          ENVIRONMENT <span className="text-warning">DEMO</span>
        </p>
        <p className="mono text-[10.5px] text-subtle">
          DREAM PC BUILD &amp; IT SOLUTIONS · INTERNAL USE
        </p>
      </footer>
    </div>
  );
}
