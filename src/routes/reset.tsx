import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DreamLogo } from "@/components/brand/nexus-logo";
import { Reveal } from "@/components/nexus/motion";

export const Route = createFileRoute("/reset")({
  validateSearch: (search: Record<string, unknown>) => ({
    uid: Number(search["uid"]) || 0,
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Reset password — DPC POS" },
      { name: "description", content: "Set a new password for your DPC POS account." },
    ],
  }),
  component: ResetPage,
});

function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include both letters and numbers.";
  }
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

function ResetPage() {
  const { uid, token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const linkValid = uid > 0 && token.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const problem = passwordProblem(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }
    setPending(true);
    void (async () => {
      try {
        const { dpcResetPassword } = await import("@/lib/dpc-connector");
        const res = await dpcResetPassword(uid, token, password);
        setPending(false);
        if (!res.ok) {
          setError(res.error ?? "Could not reset the password. The link may have expired.");
          return;
        }
        setDone(true);
      } catch {
        setPending(false);
        setError("Something went wrong. Try again later.");
      }
    })();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-anim-aurora ambient-glow absolute inset-0 opacity-60" />
        <div className="bg-anim-grid grid-backdrop absolute inset-0 opacity-[0.12]" />
      </div>

      <Reveal className="relative z-10 w-full max-w-[420px]" as="div" y={24} duration={0.6}>
        <div className="mb-6 flex items-center gap-3">
          <DreamLogo className="size-10 rounded-lg ring-1 border-border shadow-sm" />
          <span className="text-xl font-semibold tracking-tight">DPC POS</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface/50 p-6 shadow-sm backdrop-blur-xl">
          {!linkValid ? (
            <>
              <h1 className="font-display text-xl font-bold tracking-tight">
                Reset link unavailable
              </h1>
              <p className="mt-3 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-[12.5px] font-medium text-warning">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                This password reset link is missing or invalid. Request a new one from the sign-in
                page.
              </p>
              <Button className="mt-5 w-full" onClick={() => void navigate({ to: "/" })}>
                Back to sign in
              </Button>
            </>
          ) : done ? (
            <>
              <h1 className="font-display text-xl font-bold tracking-tight">Password updated</h1>
              <p className="mt-3 flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-[13px] text-success">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                Your password has been changed and all other sessions were signed out.
              </p>
              <Button className="mt-5 w-full" onClick={() => void navigate({ to: "/" })}>
                Go to sign in
              </Button>
            </>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight">
                  Set a new password
                </h1>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Choose a strong password for your operator account.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-[12.5px] font-medium">
                  New password
                </Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="at least 8 characters"
                    className="mono h-11 bg-background/50 pr-10 pl-10 text-[13px] shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[12.5px] font-medium">
                  Confirm password
                </Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="repeat your password"
                    className="mono h-11 bg-background/50 pr-10 pl-10 text-[13px] shadow-sm"
                    required
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[12.5px] font-medium text-destructive animate-in slide-in-from-top-1"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full text-[13.5px] font-semibold"
                disabled={pending}
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Update password
              </Button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
}
