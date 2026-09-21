import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState, RowsSkeleton } from "@/components/nexus/primitives";
import { SearchInput } from "@/components/nexus/toolbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deleteAdminUser,
  getLastApiError,
  revokeAdminUserSessions,
  setAdminUserStatus,
  type AdminUser,
} from "@/lib/api-client";
import { useAdminUserData } from "./use-admin-user-data";
import { ProfilePanel } from "./profile-panel";
import { ConfirmDialog } from "./confirm-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { isLocked, UserAvatar } from "./user-bits";

/** Confirm-dialog + action wiring shared by the profiles and per-user pages. */
export function ProfileWorkspace({
  user,
  onChanged,
}: {
  user: AdminUser;
  onChanged: (u: AdminUser) => void;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "delete" | "revoke" | "suspend" } | null>(null);

  const run = async (
    fn: () => Promise<boolean | null>,
    okMsg: string,
    onDone?: (u: AdminUser) => void,
  ) => {
    if (busy) return;
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res) {
      toast.error("Action failed", { description: getLastApiError() ?? "Something went wrong." });
      return;
    }
    toast.success(okMsg);
    if (onDone) onDone(res as unknown as AdminUser);
  };

  return (
    <>
      <ProfilePanel
        user={user}
        busy={busy}
        onSaved={onChanged}
        onResetPassword={(u) =>
          navigate({ to: "/administration/users/password-reset", search: { id: String(u.id) } })
        }
        onEditRoles={(u) =>
          navigate({ to: "/administration/users/roles", search: { id: String(u.id) } })
        }
        onEditBranches={(u) =>
          navigate({ to: "/administration/users/branches", search: { id: String(u.id) } })
        }
        onToggleStatus={(u) =>
          u.status !== "active"
            ? void run(
                () => setAdminUserStatus(u.id, "active").then((x) => Boolean(x)),
                `${u.display_name} re-activated.`,
                onChanged,
              )
            : setConfirm({ type: "suspend" })
        }
        onRevokeSessions={() => setConfirm({ type: "revoke" })}
        onDelete={() => setConfirm({ type: "delete" })}
      />

      {confirm?.type === "delete" ? (
        <DeleteConfirmDialog
          open={confirm !== null}
          onOpenChange={(v) => !v && setConfirm(null)}
          displayName={user.display_name}
          username={user.username}
          busy={busy}
          onConfirm={() => {
            void run(() => deleteAdminUser(user.id), `User ${user.display_name} deleted.`);
            setConfirm(null);
          }}
        />
      ) : (
        <ConfirmDialog
          open={confirm !== null}
          onOpenChange={(v) => !v && setConfirm(null)}
          title={
            confirm?.type === "suspend"
              ? `Suspend ${user.display_name}?`
              : `Revoke sessions for ${user.display_name}?`
          }
          description={
            confirm?.type === "suspend"
              ? "The account is blocked from signing in immediately and all sessions are revoked. History is preserved."
              : "Every active session is signed out immediately. The user will need to sign in again."
          }
          confirmLabel={confirm?.type === "suspend" ? "Suspend" : "Revoke sessions"}
          destructive={false}
          busy={busy}
          onConfirm={() => {
            const kind = confirm?.type;
            if (!kind) return;
            if (kind === "revoke") {
              void run(
                () => revokeAdminUserSessions(user.id),
                `${user.display_name}: all sessions revoked.`,
              );
            } else {
              void run(
                () => setAdminUserStatus(user.id, "suspended").then((r) => Boolean(r)),
                `${user.display_name} suspended.`,
                (u) => onChanged(u),
              );
            }
            setConfirm(null);
          }}
        />
      )}
    </>
  );
}

/**
 * Master-detail user profiles: searchable account list on the left, the profile
 * editor on the right. The selected account lives in the URL (?id=).
 */
export function ProfilesPage() {
  const { users, loading, reload } = useAdminUserData();
  const navigate = useNavigate();
  const { id } = useSearch({ from: "/_app/administration/users/profiles" });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (u) =>
        u.display_name.toLowerCase().includes(needle) ||
        u.username.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle),
    );
  }, [users, query]);

  const selected = users.find((u) => id != null && String(u.id) === id) ?? null;

  const select = (uid: number) => {
    navigate({ to: "/administration/users/profiles", search: { id: String(uid) } });
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="User Profiles"
        description="Search for an account on the left and edit its profile, access and security on the right."
        actions={
          <Link to="/administration/users/new">
            <Button size="sm">
              <UserPlus className="size-4" /> Add User
            </Button>
          </Link>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Panel className="overflow-hidden">
          <div className="border-b border-border p-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search name, username…" />
          </div>
          <div className="max-h-[68vh] overflow-y-auto">
            {loading ? (
              <RowsSkeleton rows={6} />
            ) : filtered.length === 0 ? (
              <EmptyState title="No users" description="No accounts match this search." />
            ) : (
              <ul>
                {filtered.map((u) => {
                  const active = selected?.id === u.id;
                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => select(u.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 border-b border-border/60 px-3 py-2.5 text-left transition-colors hover:bg-elevated/70",
                          active && "bg-elevated",
                        )}
                      >
                        <UserAvatar
                          user={u}
                          size="sm"
                          className={cn(
                            active
                              ? "border-info/40 bg-info/10 text-info"
                              : "border-border bg-elevated text-foreground",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-foreground">
                            {u.display_name}
                          </span>
                          <span className="mono block truncate text-[10.5px] text-subtle">
                            {u.username} · {isLocked(u) ? "locked" : u.status}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>

        <div className="min-w-0">
          {!selected ? (
            <Panel>
              <EmptyState
                title="Select an account"
                description="Pick a user from the list to view and edit their profile."
              />
            </Panel>
          ) : (
            <ProfileWorkspace user={selected} onChanged={() => reload()} />
          )}
        </div>
      </div>
    </div>
  );
}
