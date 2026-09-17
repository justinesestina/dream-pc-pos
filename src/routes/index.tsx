import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DreamLogo } from "@/components/brand/nexus-logo";
import { Reveal } from "@/components/nexus/motion";
import { useStore } from "@/lib/store";
import { homeFor } from "@/lib/permissions";
import { authenticateWordPress, wpSiteUrl } from "@/lib/wp-auth";

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
  const [wpUser, setWpUser] = useState("");
  const [wpPassword, setWpPassword] = useState("");
  const [showWpPassword, setShowWpPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const wpConfigured = Boolean(wpSiteUrl());

  useEffect(() => {
    if (!store.hydrated || !store.user) return;
    void navigate({ to: homeFor(store.user.role), replace: true });
  }, [store.hydrated, store.user, navigate]);

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
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden border-b border-border bg-surface/30 p-8 lg:grow-[7] lg:border-b-0 lg:border-r lg:p-12">
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
      <div className="relative flex flex-1 items-center justify-center p-6 lg:grow-[3] lg:p-12">
        <Reveal className="w-full max-w-[420px]" as="div" y={24} duration={0.6}>
          <form
            key="wordpress"
            onSubmit={submitWordPress}
            noValidate
            className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Welcome to Dream PC POS
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Authenticate with your operator account
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
                  Username
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
                    placeholder="your username"
                    className="mono h-11 bg-background/50 pl-10 text-[13px] shadow-sm transition-colors focus-visible:bg-background"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="wp-password" className="text-[12.5px] font-medium">
                  Password
                </Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="wp-password"
                    type={showWpPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={wpPassword}
                    onChange={(e) => setWpPassword(e.target.value)}
                    placeholder="your password"
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
                Sign in
              </Button>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
