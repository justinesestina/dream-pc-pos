import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Activity, KeyRound, ShieldCheck, Store, Trash2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyValueGrid } from "@/components/nexus/detail";
import { getLastApiError, updateAdminUser, type AdminUser } from "@/lib/api-client";
import { serverDateTime } from "@/lib/format";
import { BranchCell, RoleBadges, StatusCell, isLocked, statusLabel } from "./user-bits";
import { SectionCard } from "./panels";

export function ProfilePanel({
  user,
  busy,
  onSaved,
  onResetPassword,
  onEditRoles,
  onEditBranches,
  onToggleStatus,
  onRevokeSessions,
  onDelete,
}: {
  user: AdminUser;
  busy: boolean;
  onSaved: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
  onEditRoles: (user: AdminUser) => void;
  onEditBranches: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onRevokeSessions: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}) {
  const isLockedNow = isLocked(user);
  const [name, setName] = useState(user.display_name);
  const [email, setEmail] = useState(user.email);

  useEffect(() => {
    setName(user.display_name);
    setEmail(user.email);
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (busy) return;
    const updated = await updateAdminUser(user.id, {
      email: email.trim(),
      display_name: name.trim(),
    });
    if (!updated) {
      toast.error("Could not save profile", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success("Profile updated.");
    onSaved(updated);
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Profile"
        description="Basic identity fields for this account."
        action={
          <span className="mono flex size-8 items-center justify-center rounded-md border border-border bg-elevated text-xs text-foreground">
            {user.initials}
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor={`p-name-${user.id}`}>Display name</Label>
            <Input
              id={`p-name-${user.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`p-email-${user.id}`}>Email</Label>
            <Input
              id={`p-email-${user.id}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <p className="label-tech">Username</p>
            <p className="mono mt-1 text-[13px] text-foreground">{user.username}</p>
          </div>
          <div>
            <p className="label-tech">Status</p>
            <div className="mt-1">
              <StatusCell status={user.status} locked={isLockedNow} />
            </div>
          </div>
        </div>
        <div className="pt-1">
          <Button size="sm" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Account" description="Timeline and sign-in state.">
        <KeyValueGrid
          cols={3}
          items={[
            { label: "Created", value: serverDateTime(user.created_at) },
            {
              label: "Last login",
              value: user.last_login_at ? serverDateTime(user.last_login_at) : "Never",
            },
            {
              label: "Failed attempts",
              value: isLockedNow
                ? `${user.failed_attempts} (locked)`
                : String(user.failed_attempts),
            },
            {
              label: "WordPress",
              value: user.wordpress_connected
                ? `Linked (${user.wordpress_username ?? "—"})`
                : "Not linked",
            },
            { label: "Account status", value: statusLabel(user.status) },
            { label: "Primary branch", value: user.primary_branch_id ? "Set" : "—" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Access" description="Roles and branches define reach.">
        <KeyValueGrid
          cols={2}
          items={[{ label: "Roles", value: <RoleBadges user={user} />, mono: true }]}
        />
        <div className="px-4 pb-4">
          <p className="label-tech">Branches</p>
          <div className="mt-1">
            <BranchCell user={user} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          <Button size="sm" variant="outline" onClick={() => onEditRoles(user)}>
            <ShieldCheck className="size-3.5" /> Edit roles
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEditBranches(user)}>
            <Store className="size-3.5" /> Edit branches
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Security" description="Password, sessions and account state.">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onResetPassword(user)}>
            <KeyRound className="size-3.5" /> Reset password
          </Button>
          <Button size="sm" variant="outline" onClick={() => onRevokeSessions(user)}>
            <Unlock className="size-3.5" /> Revoke sessions
          </Button>
          <Button size="sm" variant="outline" onClick={() => onToggleStatus(user)}>
            <Activity className="size-3.5" /> {user.status !== "active" ? "Re-activate" : "Suspend"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="ml-auto"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
