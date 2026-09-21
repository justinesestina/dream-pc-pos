import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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
import { serverDateTimeShort } from "@/lib/format";
import { useAdminUserData, filterUsers } from "./use-admin-user-data";
import { BranchCell, RoleBadges, StatusCell, UserAvatar, isLocked } from "./user-bits";
import { ConfirmDialog } from "./confirm-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { UserDrawer, type UserDrawerSection } from "./user-drawer";

interface Row {
  id: string;
  user: AdminUser;
}

export function AllUsersPage() {
  const { users, roles, branches, loading, reload } = useAdminUserData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [drawerUser, setDrawerUser] = useState<AdminUser | null>(null);
  const [drawerSection, setDrawerSection] = useState<UserDrawerSection>("overview");
  const [confirm, setConfirm] = useState<{
    type: "delete" | "revoke";
    user: AdminUser;
  } | null>(null);

  const openDrawer = (user: AdminUser, section: UserDrawerSection = "overview") => {
    setDrawerUser(user);
    setDrawerSection(section);
  };

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

  const toggleStatus = (user: AdminUser) =>
    runAction(
      () =>
        setAdminUserStatus(user.id, user.status !== "active" ? "active" : "suspended").then((u) =>
          Boolean(u),
        ),
      user.status !== "active"
        ? `${user.display_name} re-activated.`
        : `${user.display_name} suspended.`,
    );

  const columns: Column<Row>[] = [
    {
      key: "user",
      header: "User",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar user={r.user} size="sm" />
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
            {serverDateTimeShort(r.user.last_login_at)}
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
            <DropdownMenuItem onClick={() => openDrawer(r.user, "overview")}>
              <User className="size-4" /> View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDrawer(r.user, "password")}>
              <KeyRound className="size-4" /> Reset password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDrawer(r.user, "roles")}>
              <ShieldCheck className="size-4" /> Assign roles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDrawer(r.user, "branches")}>
              <Store className="size-4" /> Assign branches
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDrawer(r.user, "history")}>
              <History className="size-4" /> Login history
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDrawer(r.user, "activity")}>
              <Activity className="size-4" /> Activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void toggleStatus(r.user)}>
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
          value={lastLogin ? serverDateTimeShort(lastLogin) : "—"}
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
          onRowClick={(r) => openDrawer(r.user)}
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

      <UserDrawer
        user={drawerUser}
        open={drawerUser !== null}
        section={drawerSection}
        roles={roles}
        branches={branches}
        onOpenChange={(v) => !v && setDrawerUser(null)}
        onSection={setDrawerSection}
        onReload={reload}
        onToggleStatus={(u) => void toggleStatus(u)}
        onRevokeSessions={(u) => setConfirm({ type: "revoke", user: u })}
        onDelete={(u) => setConfirm({ type: "delete", user: u })}
      />

      {confirm?.type === "delete" ? (
        <DeleteConfirmDialog
          open={confirm !== null}
          onOpenChange={(v) => !v && setConfirm(null)}
          displayName={confirm.user.display_name}
          username={confirm.user.username}
          busy={busy}
          onConfirm={() => {
            void runAction(
              () => deleteAdminUser(confirm.user.id),
              `User ${confirm.user.display_name} deleted.`,
            );
            setConfirm(null);
          }}
        />
      ) : (
        <ConfirmDialog
          open={confirm !== null}
          onOpenChange={(v) => !v && setConfirm(null)}
          title={confirm ? `Revoke sessions for ${confirm.user.display_name}?` : ""}
          description="Every active session is signed out immediately. The user will need to sign in again."
          confirmLabel="Revoke sessions"
          destructive={false}
          busy={busy}
          onConfirm={() => {
            if (!confirm) return;
            void runAction(
              () => revokeAdminUserSessions(confirm.user.id),
              `${confirm.user.display_name}: all sessions revoked.`,
            );
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
