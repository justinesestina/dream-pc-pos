import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Activity,
  Flag,
  History,
  KeyRound,
  ShieldCheck,
  Store,
  Trash2,
  Unlock,
  User,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, RowsSkeleton } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  deleteAdminUser,
  getLastApiError,
  revokeAdminUserSessions,
  setAdminUserStatus,
  type AdminUser,
} from "@/lib/api-client";
import { dateTimeShort } from "@/lib/format";
import { useAdminUserData, filterUsers } from "./use-admin-user-data";
import { BranchCell, RoleBadges, StatusCell, isLocked, statusLabel } from "./user-bits";
import { ConfirmDialog } from "./confirm-dialog";

interface Row {
  id: string;
  user: AdminUser;
}

export function AllUsersPage() {
  const navigate = useNavigate();
  const { users, roles, branches, loading, reload } = useAdminUserData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{
    type: "delete" | "revoke";
    user: AdminUser;
  } | null>(null);

  const filtered = useMemo(
    () => filterUsers(users, query, statusFilter, roleFilter, branchFilter),
    [users, query, statusFilter, roleFilter, branchFilter],
  );

  const activeCount = users.filter((u) => u.status === "active").length;
  const blockedCount = users.filter((u) => u.status !== "active" || isLocked(u)).length;
  const lastLogin = users.reduce<string | null>((acc, u) => {
    if (!u.last_login_at) return acc;
    return !acc || u.last_login_at > acc ? u.last_login_at : acc;
  }, null);

  const runAction = async (fn: () => Promise<boolean | null>, okMsg: string) => {
    if (busy) return;
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res) {
      toast.error("Action failed", { description: getLastApiError() ?? "Something went wrong." });
      return;
    }
    toast.success(okMsg);
    reload();
  };

  const columns: Column<Row>[] = [
    {
      key: "user",
      header: "User",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="mono flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-[11px] text-foreground">
            {r.user.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] text-foreground">{r.user.display_name}</p>
            <p className="mono truncate text-[10.5px] text-subtle">{r.user.email}</p>
          </div>
        </div>
      ),
      sortValue: (r) => r.user.display_name.toLowerCase(),
    },
    {
      key: "username",
      header: "Username",
      cell: (r) => <span className="mono text-xs text-muted-foreground">{r.user.username}</span>,
      sortValue: (r) => r.user.username.toLowerCase(),
    },
    {
      key: "roles",
      header: "Roles",
      cell: (r) => <RoleBadges user={r.user} />,
      sortValue: (r) => r.user.role,
    },
    {
      key: "branch",
      header: "Branch",
      cell: (r) => <BranchCell user={r.user} />,
      sortValue: (r) =>
        r.user.branches
          .map((b) => b.name)
          .join(", ")
          .toLowerCase(),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusCell status={r.user.status} locked={isLocked(r.user)} />,
      sortValue: (r) => r.user.status,
    },
    {
      key: "last_login",
      header: "Last login",
      cell: (r) =>
        r.user.last_login_at ? (
          <span className="mono text-xs text-muted-foreground">
            {dateTimeShort(r.user.last_login_at)}
          </span>
        ) : (
          <span className="text-xs text-subtle">Never</span>
        ),
      sortValue: (r) => r.user.last_login_at ?? "",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-28",
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-[11px]">{r.user.display_name}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate({ to: `/administration/users/${r.user.id}/profile` })}
            >
              <User className="size-4" /> View profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: "/administration/users/password-reset",
                  search: { id: String(r.user.id) },
                })
              }
            >
              <KeyRound className="size-4" /> Reset password
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate({ to: "/administration/users/roles", search: { id: String(r.user.id) } })
              }
            >
              <ShieldCheck className="size-4" /> Assign roles
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: "/administration/users/branches",
                  search: { id: String(r.user.id) },
                })
              }
            >
              <Store className="size-4" /> Assign branches
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: "/administration/users/login-history",
                  search: { user: String(r.user.id) },
                })
              }
            >
              <History className="size-4" /> Login history
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: "/administration/users/activity",
                  search: { user: String(r.user.id) },
                })
              }
            >
              <Activity className="size-4" /> Activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                runAction(
                  () =>
                    setAdminUserStatus(
                      r.user.id,
                      r.user.status !== "active" ? "active" : "suspended",
                    ).then((u) => Boolean(u)),
                  r.user.status !== "active"
                    ? `${r.user.display_name} re-activated.`
                    : `${r.user.display_name} suspended.`,
                )
              }
            >
              <Flag className="size-4" /> {r.user.status !== "active" ? "Re-activate" : "Suspend"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirm({ type: "revoke", user: r.user })}>
              <Unlock className="size-4" /> Revoke sessions
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirm({ type: "delete", user: r.user })}
            >
              <Trash2 className="size-4" /> Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const rows: Row[] = filtered.map((u) => ({ id: String(u.id), user: u }));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="User Management"
        description="Accounts, roles, passwords, sessions and branch access across the workplace."
        actions={
          <Link to="/administration/users/new">
            <Button size="sm">
              <UserPlus className="size-4" /> Add User
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total accounts"
          numericValue={users.length}
          accent="info"
          hint="All accounts"
        />
        <StatCard
          label="Active"
          numericValue={activeCount}
          accent="success"
          hint="Can sign in now"
        />
        <StatCard
          label="Blocked"
          numericValue={blockedCount}
          accent="warning"
          hint="Suspended, deactivated or locked"
        />
        <StatCard
          label="Last sign-in"
          value={lastLogin ? dateTimeShort(lastLogin) : "—"}
          accent="neutral"
          hint="Most recent login anywhere"
        />
      </div>

      <Panel>
        <PanelHeader title="All users" hint="Search, filter and manage every account." />
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name, email, username…"
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "deactivated", label: "Deactivated" },
            ]}
            label="STATUS"
          />
          <FilterSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={roles.map((r) => ({ value: r.slug, label: r.name }))}
            label="ROLE"
          />
          <FilterSelect
            value={branchFilter}
            onChange={setBranchFilter}
            options={branches.map((b) => ({ value: String(b.id), label: b.name }))}
            label="BRANCH"
          />
          <ResultCount shown={rows.length} total={users.length} noun="users" />
        </Toolbar>
        <DataTable
          rows={rows}
          columns={columns}
          loading={loading}
          onRowClick={(r) => navigate({ to: `/administration/users/${r.user.id}/profile` })}
          pageSize={12}
          empty={
            <EmptyState
              title="No users found"
              description="Adjust your filters or add a new user."
              action={
                <Link to="/administration/users/new">
                  <Button size="sm" variant="outline">
                    <UserPlus className="size-3.5" /> Add user
                  </Button>
                </Link>
              }
            />
          }
        />
      </Panel>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={
          confirm?.type === "delete"
            ? `Delete ${confirm.user.display_name}?`
            : `Revoke sessions for ${confirm?.user.display_name}?`
        }
        description={
          confirm?.type === "delete"
            ? "The account and its assignments will be permanently removed. Login and activity history is retained."
            : "Every active session is signed out immediately. The user will need to sign in again."
        }
        confirmLabel={confirm?.type === "delete" ? "Delete user" : "Revoke sessions"}
        destructive={confirm?.type === "delete"}
        busy={busy}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.type === "delete") {
            void runAction(
              () => deleteAdminUser(confirm.user.id),
              `User ${confirm.user.display_name} deleted.`,
            );
          } else {
            void runAction(
              () => revokeAdminUserSessions(confirm.user.id),
              `${confirm.user.display_name}: all sessions revoked.`,
            );
          }
          setConfirm(null);
        }}
      />
    </div>
  );
}
