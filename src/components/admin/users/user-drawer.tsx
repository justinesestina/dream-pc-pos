import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2, RefreshCw, Save, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/nexus/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchAdminActivity,
  fetchAdminUserLoginHistory,
  getLastApiError,
  setAdminUserBranches,
  setAdminUserPassword,
  setAdminUserRoles,
  type AdminActivityRow,
  type AdminBranch,
  type AdminLoginEntry,
  type AdminRole,
  type AdminUser,
} from "@/lib/api-client";
import { serverDateTime } from "@/lib/format";
import { SidePanel } from "./side-panel";
import { ProfilePanel } from "./profile-panel";
import { statusLabel, statusTone, UserAvatar } from "./user-bits";

export type UserDrawerSection =
  "overview" | "roles" | "branches" | "password" | "history" | "activity";

const SECTION_LABELS: { id: UserDrawerSection; label: string }[] = [
  { id: "overview", label: "Profile" },
  { id: "roles", label: "Roles" },
  { id: "branches", label: "Branches" },
  { id: "password", label: "Security" },
  { id: "history", label: "Login history" },
  { id: "activity", label: "Activity" },
];

export function UserDrawer({
  user,
  open,
  section,
  roles,
  branches,
  onOpenChange,
  onSection,
  onReload,
  onToggleStatus,
  onRevokeSessions,
  onDelete,
}: {
  user: AdminUser | null;
  open: boolean;
  section: UserDrawerSection;
  roles: AdminRole[];
  branches: AdminBranch[];
  onOpenChange: (open: boolean) => void;
  onSection: (section: UserDrawerSection) => void;
  onReload: () => void;
  onToggleStatus: (user: AdminUser) => void;
  onRevokeSessions: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}) {
  return (
    <SidePanel
      open={open && user !== null}
      onOpenChange={onOpenChange}
      widthClass="sm:max-w-lg"
      title={user ? `Manage ${user.display_name}` : "Manage user"}
      description={user ? `${user.username} · ${user.email}` : undefined}
    >
      {user && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <UserAvatar user={user} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">
                {user.display_name}
              </p>
              <p className="mono truncate text-[11px] text-subtle">@{user.username}</p>
            </div>
            <StatusBadge
              status={user.status}
              tone={statusTone(user.status)}
              label={statusLabel(user.status)}
            />
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface/50 p-1">
            {SECTION_LABELS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSection(s.id)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  section === s.id
                    ? "bg-elevated text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <Separator />

          {section === "overview" && (
            <ProfilePanel
              user={user}
              busy={false}
              onSaved={() => onReload()}
              onResetPassword={() => onSection("password")}
              onEditRoles={() => onSection("roles")}
              onEditBranches={() => onSection("branches")}
              onToggleStatus={onToggleStatus}
              onRevokeSessions={onRevokeSessions}
              onDelete={onDelete}
            />
          )}

          {section === "roles" && <RolesSection user={user} roles={roles} onSaved={onReload} />}

          {section === "branches" && (
            <BranchesSection user={user} branches={branches} onSaved={onReload} />
          )}

          {section === "password" && <PasswordSection user={user} />}

          {section === "history" && <HistorySection user={user} />}

          {section === "activity" && <ActivitySection user={user} />}
        </div>
      )}
    </SidePanel>
  );
}

function RolesSection({
  user,
  roles,
  onSaved,
}: {
  user: AdminUser;
  roles: AdminRole[];
  onSaved: () => void;
}) {
  const [primary, setPrimary] = useState(user.role);
  const [additional, setAdditional] = useState<string[]>((user.roles ?? []).map((r) => r.slug));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPrimary(user.role);
    setAdditional((user.roles ?? []).map((r) => r.slug));
  }, [user.id, user.role, user.roles]);

  const toggle = (slug: string) =>
    setAdditional((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const save = async () => {
    if (busy) return;
    if (!primary) {
      toast.error("Pick a primary role first.");
      return;
    }
    setBusy(true);
    const res = await setAdminUserRoles(user.id, [
      primary,
      ...additional.filter((s) => s !== primary),
    ]);
    setBusy(false);
    if (!res) {
      toast.error("Could not update roles", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`Roles updated for ${user.display_name}.`);
    onSaved();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label>Primary role</Label>
        {roles.map((r) => (
          <label
            key={r.slug}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2.5 py-2 transition-colors hover:bg-elevated/60"
            style={{ outline: primary === r.slug ? "1px solid var(--info)" : undefined }}
          >
            <input
              type="radio"
              name="drawer-primary-role"
              value={r.slug}
              checked={primary === r.slug}
              onChange={() => setPrimary(r.slug)}
              className="size-3.5 accent-[var(--info)]"
            />
            <span className="min-w-0">
              <span className="label-tech">{r.slug}</span>
              <span className="block text-[12px] text-subtle">{r.name}</span>
            </span>
          </label>
        ))}
      </div>

      <Separator />

      <div className="grid gap-1.5">
        <p className="text-[13px] text-foreground">Additional roles</p>
        {roles
          .filter((r) => r.slug !== primary)
          .map((r) => (
            <label
              key={r.slug}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2.5 py-2 transition-colors hover:bg-elevated/60"
            >
              <Checkbox
                checked={additional.includes(r.slug)}
                onCheckedChange={() => toggle(r.slug)}
              />
              <span className="label-tech">{r.slug}</span>
              <span className="ml-auto truncate text-[12px] text-subtle">{r.description}</span>
            </label>
          ))}
      </div>

      <Button size="sm" className="ml-auto gap-1" onClick={() => void save()} disabled={busy}>
        <Save className="size-3.5" /> {busy ? "Saving…" : "Save roles"}
      </Button>
    </div>
  );
}

function BranchesSection({
  user,
  branches,
  onSaved,
}: {
  user: AdminUser;
  branches: AdminBranch[];
  onSaved: () => void;
}) {
  const [chosen, setChosen] = useState<number[]>((user.branches ?? []).map((b) => b.id));
  const [primary, setPrimary] = useState<string>(
    user.primary_branch_id != null ? String(user.primary_branch_id) : "",
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ids = (user.branches ?? []).map((b) => b.id);
    setChosen(ids);
    setPrimary(user.primary_branch_id != null ? String(user.primary_branch_id) : "");
  }, [user.id, user.branches, user.primary_branch_id]);

  const toggle = (id: number) => {
    const next = chosen.includes(id) ? chosen.filter((b) => b !== id) : [...chosen, id];
    setChosen(next);
    if (!next.includes(Number(primary)) && next.length > 0) setPrimary(String(next[0]));
    if (next.length === 0) setPrimary("");
  };

  const save = async () => {
    if (busy) return;
    if (chosen.length === 0) {
      toast.error("Choose at least one branch.");
      return;
    }
    setBusy(true);
    const res = await setAdminUserBranches(user.id, {
      branch_ids: chosen,
      primary_branch_id: primary ? Number(primary) : null,
    });
    setBusy(false);
    if (!res) {
      toast.error("Could not update branches", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`Branch access updated for ${user.display_name}.`);
    onSaved();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <p className="text-[13px] text-foreground">Branch access</p>
        {branches.length === 0 && (
          <p className="text-[12.5px] text-subtle">No branches available yet.</p>
        )}
        {branches.map((b) => (
          <label
            key={b.id}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2.5 py-2 transition-colors hover:bg-elevated/60"
          >
            <Checkbox checked={chosen.includes(b.id)} onCheckedChange={() => toggle(b.id)} />
            <span className="label-tech">{b.code}</span>
            <span className="min-w-0 flex-1 truncate text-[12px] text-subtle">{b.name}</span>
          </label>
        ))}
      </div>

      <Separator />

      <div className="grid gap-1.5">
        <Label>Primary branch</Label>
        <Select value={primary} onValueChange={setPrimary} disabled={chosen.length === 0}>
          <SelectTrigger className="h-8 w-full text-[13px]">
            <SelectValue
              placeholder={
                chosen.length === 0 ? "Select branch access first" : "Pick a primary branch"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {branches
              .filter((b) => chosen.includes(b.id))
              .map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.code} — {b.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Button size="sm" className="ml-auto gap-1" onClick={() => void save()} disabled={busy}>
        <Store className="size-3.5" /> {busy ? "Saving…" : "Save branches"}
      </Button>
    </div>
  );
}

function PasswordSection({ user }: { user: AdminUser }) {
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCustom("");
    setResult(null);
    setCopied(false);
  }, [user.id]);

  const submit = async (generate: boolean) => {
    if (busy) return;
    setBusy(true);
    const res = await setAdminUserPassword(
      user.id,
      generate ? { generate: true } : { password: custom },
    );
    setBusy(false);
    if (!res.ok) {
      toast.error("Could not reset password", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`Password updated for ${user.display_name}.`);
    setResult(res.password ?? "PASSWORD_SET");
  };

  const copy = async () => {
    if (!result || result === "PASSWORD_SET") return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <div className="space-y-4">
      {result === null ? (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="drawer-pw">Temporary password</Label>
            <Input
              id="drawer-pw"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Leave blank to generate"
              className="font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            All existing sessions are revoked after the change and the event is recorded in the
            audit log. Passwords are never stored readable on the server.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void submit(true)} disabled={busy}>
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Generate &amp; reset
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void submit(false)}
              disabled={busy || custom.trim().length < 10}
            >
              {busy ? "Saving…" : "Use custom password"}
            </Button>
          </div>
        </>
      ) : (
        <div className="rounded-md border border-success/30 bg-success/10 p-3">
          <p className="mb-2 text-[13px] font-medium text-foreground">
            Password updated for {user.display_name}
          </p>
          {result === "PASSWORD_SET" ? (
            <p className="text-xs text-muted-foreground">
              Your custom password is set. Passwords are never stored readable.
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs text-muted-foreground">
                This temporary password is shown only once. Copy it before closing.
              </p>
              <div className="flex items-center gap-2">
                <code className="mono flex-1 rounded border border-success/40 bg-background/60 px-2 py-1.5 text-[13px] break-all text-foreground">
                  {result}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1"
                  onClick={() => void copy()}
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="mt-3"
            onClick={() => {
              setResult(null);
              setCustom("");
            }}
          >
            Reset another password
          </Button>
        </div>
      )}
    </div>
  );
}

function HistorySection({ user }: { user: AdminUser }) {
  const [rows, setRows] = useState<AdminLoginEntry[] | null>(null);

  useEffect(() => {
    let active = true;
    setRows(null);
    void fetchAdminUserLoginHistory(user.id).then((items) => {
      if (active) setRows(items);
    });
    return () => {
      active = false;
    };
  }, [user.id]);

  if (rows === null) {
    return (
      <div className="flex items-center gap-2 py-6 text-[12.5px] text-subtle">
        <Loader2 className="size-4 animate-spin" /> Loading login history…
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-subtle">No sign-in attempts recorded.</p>
    );
  }
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between gap-3 rounded-md border border-border px-2.5 py-2"
        >
          <div className="min-w-0">
            <p className="text-[12.5px] text-foreground">{serverDateTime(r.created_at)}</p>
            <p className="mono truncate text-[10.5px] text-subtle">
              {r.ip || "—"}
              {r.reason ? ` · ${r.reason}` : ""}
            </p>
          </div>
          <StatusBadge
            status={r.result === "success" ? "active" : "deactivated"}
            tone={r.result === "success" ? "success" : "danger"}
            label={r.result === "success" ? "Success" : r.result || "Failed"}
          />
        </div>
      ))}
    </div>
  );
}

function ActivitySection({ user }: { user: AdminUser }) {
  const [rows, setRows] = useState<AdminActivityRow[] | null>(null);

  useEffect(() => {
    let active = true;
    setRows(null);
    void fetchAdminActivity({ user_id: user.id, per_page: 25 }).then((r) => {
      if (active) setRows(r.items);
    });
    return () => {
      active = false;
    };
  }, [user.id]);

  if (rows === null) {
    return (
      <div className="flex items-center gap-2 py-6 text-[12.5px] text-subtle">
        <Loader2 className="size-4 animate-spin" /> Loading activity…
      </div>
    );
  }
  if (rows.length === 0) {
    return <p className="py-6 text-center text-[12.5px] text-subtle">No activity recorded.</p>;
  }
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.id} className="rounded-md border border-border px-2.5 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12.5px] text-foreground">{r.description}</p>
            <span className="label-tech shrink-0">{r.module}</span>
          </div>
          <p className="mono mt-0.5 text-[10.5px] text-subtle">
            {serverDateTime(r.created_at)} · {r.action}
          </p>
        </div>
      ))}
    </div>
  );
}
