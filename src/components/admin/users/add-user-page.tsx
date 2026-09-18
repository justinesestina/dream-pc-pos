import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Info, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel } from "@/components/nexus/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminUser, getLastApiError, type AdminUserStatus } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAdminUserData } from "./use-admin-user-data";
import { SectionCard } from "./panels";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const rand = (max: number) => {
    const buf = new Uint32Array(1);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(buf);
      return buf[0] % max;
    }
    return Math.floor(Math.random() * max);
  };
  const out: string[] = [];
  for (let i = 0; i < 16; i++) out.push(chars[rand(chars.length)]);
  return out.join("");
}

function strength(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: "No password" };
  let score = 0;
  if (pw.length >= 10) score++;
  if (pw.length >= 14) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 20) score++;
  return {
    score: Math.min(5, score),
    label: score <= 2 ? "Weak" : score <= 4 ? "Fair" : score <= 5 ? "Strong" : "Very strong",
  };
}

export function AddUserPage() {
  const navigate = useNavigate();
  const { roles, branches, reload } = useAdminUserData();

  const [form, setForm] = useState({
    username: "",
    display_name: "",
    email: "",
    password: "",
    generate: true,
    show: false,
  });
  const [chosenRoles, setChosenRoles] = useState<string[]>(["sales"]);
  const [chosenBranches, setChosenBranches] = useState<number[]>([]);
  const [primaryBranch, setPrimaryBranch] = useState<string>("");
  const [status, setStatus] = useState<AdminUserStatus>("active");
  const [busy, setBusy] = useState(false);

  const strengthInfo = form.generate ? { score: 5, label: "Generated" } : strength(form.password);

  const submit = async () => {
    if (busy) return;
    const username = form.username.trim();
    const email = form.email.trim();
    const displayName = form.display_name.trim() || username;
    if (!username || !email) {
      toast.error("Username and email are required.");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      toast.error("Invalid username", {
        description: "Only letters, numbers, dots, dashes and underscores are allowed.",
      });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Invalid email address.");
      return;
    }
    const password = form.generate ? undefined : form.password;
    if (password && password.length < 10) {
      toast.error("Password too short", {
        description: "Passwords must be at least 10 characters.",
      });
      return;
    }

    const primary = primaryBranch ? Number(primaryBranch) : chosenBranches[0];
    const created = await createAdminUser({
      username,
      display_name: displayName,
      email,
      password,
      roles: chosenRoles,
      status,
      branch_ids: chosenBranches,
      ...(primary ? { primary_branch_id: primary } : {}),
    });
    if (!created) {
      toast.error("Could not create user", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`User ${created.display_name} created.`);
    reload();
    navigate({ to: `/administration/users/${created.id}/profile` });
  };

  const toggleBranch = (id: number, on: boolean) => {
    const next = on ? [...chosenBranches, id] : chosenBranches.filter((x) => x !== id);
    setChosenBranches(next);
    if (!on && Number(primaryBranch) === id) setPrimaryBranch("");
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Add User"
        description="Create a new account with roles, branch access and status."
        actions={
          <Link to="/administration/users">
            <Button size="sm" variant="outline">
              <ArrowLeft className="size-4" /> Back to All Users
            </Button>
          </Link>
        }
      />

      <Panel className="p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Account information"
            description="Credentials and profile for the new account."
          >
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="au-username">Username</Label>
                <Input
                  id="au-username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. jramos"
                  className="mono"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="au-display">Display name</Label>
                <Input
                  id="au-display"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  placeholder="e.g. Justine Ramos"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="au-email">Email</Label>
                <Input
                  id="au-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@dreampc.ph"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="au-password">Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="au-password"
                      type={form.show ? "text" : "password"}
                      value={form.password}
                      readOnly={form.generate}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={
                        form.generate ? "A secure password will be generated" : "Temporary password"
                      }
                      className="pr-9 font-mono"
                    />
                    <button
                      type="button"
                      aria-label={form.show ? "Hide password" : "Show password"}
                      onClick={() => setForm({ ...form, show: !form.show })}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-subtle hover:text-foreground"
                    >
                      {form.show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    aria-label="Generate password"
                    onClick={() => {
                      setForm({
                        ...form,
                        generate: false,
                        password: generatePassword(),
                        show: true,
                      });
                    }}
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        strengthInfo.score <= 2
                          ? "bg-destructive"
                          : strengthInfo.score <= 4
                            ? "bg-warning"
                            : "bg-success",
                      )}
                      style={{ width: `${(strengthInfo.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="mono text-[10.5px] text-subtle">{strengthInfo.label}</span>
                </div>
                <label className="flex items-center gap-2 text-[13px] text-foreground">
                  <Checkbox
                    checked={form.generate}
                    onCheckedChange={(v) => setForm({ ...form, generate: v === true })}
                  />
                  Generate a random password
                </label>
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  The temporary password can be shared once. All existing sessions are revoked
                  whenever a password changes.
                </p>
              </div>
            </div>
          </SectionCard>

          <div>
            <SectionCard title="Access" description="Where this account can work.">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="label-tech">Roles</p>
                  <div className="space-y-2">
                    {roles.map((r) => (
                      <label
                        key={r.slug}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] text-foreground"
                      >
                        <Checkbox
                          checked={chosenRoles.includes(r.slug)}
                          disabled={r.slug === "owner"}
                          onCheckedChange={(v) =>
                            setChosenRoles(
                              v
                                ? [...chosenRoles, r.slug]
                                : chosenRoles.filter((s) => s !== r.slug),
                            )
                          }
                        />
                        <span className="flex-1">{r.name}</span>
                        <span className="mono text-[10px] text-subtle">{r.slug}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    A new account always receives at least one role. Owner is granted by an existing
                    Owner only.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="label-tech">Branch access</p>
                  <div className="space-y-2">
                    {branches.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] text-foreground"
                      >
                        <Checkbox
                          checked={chosenBranches.includes(b.id)}
                          onCheckedChange={(v) => toggleBranch(b.id, v === true)}
                        />
                        <span className="flex-1">
                          {b.name}
                          {Number(primaryBranch) === b.id && (
                            <span className="ml-2 text-[10px] text-info uppercase">Primary</span>
                          )}
                        </span>
                        <span className="mono text-[10px] text-subtle">{b.code}</span>
                      </label>
                    ))}
                  </div>
                  {chosenBranches.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Label htmlFor="au-primary-branch" className="text-xs text-muted-foreground">
                        Primary branch
                      </Label>
                      <Select value={primaryBranch} onValueChange={(v) => setPrimaryBranch(v)}>
                        <SelectTrigger
                          id="au-primary-branch"
                          className="h-8 w-auto min-w-[9rem] text-[13px]"
                        >
                          <SelectValue placeholder="First selected" />
                        </SelectTrigger>
                        <SelectContent>
                          {chosenBranches.map((id) => {
                            const b = branches.find((x) => x.id === id);
                            return b ? (
                              <SelectItem key={b.id} value={String(b.id)}>
                                {b.name}
                              </SelectItem>
                            ) : null;
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {branches.length === 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      No branches configured yet — assignments can be made later.
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    The primary branch is highlighted and used as the default scope.
                  </p>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="au-status">Account status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as AdminUserStatus)}>
                    <SelectTrigger id="au-status" className="h-8 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active — can sign in</SelectItem>
                      <SelectItem value="suspended">
                        Suspended — blocked, history preserved
                      </SelectItem>
                      <SelectItem value="deactivated">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Button size="sm" onClick={submit} disabled={busy}>
            {busy ? "Creating…" : "Create user"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: "/administration/users" })}
          >
            Cancel
          </Button>
        </div>
      </Panel>
    </div>
  );
}
