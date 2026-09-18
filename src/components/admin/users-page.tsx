import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  Flag,
  History,
  KeyRound,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, RowsSkeleton } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
import { KeyValueGrid } from "@/components/nexus/detail";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminRoles,
  fetchAdminUserLoginHistory,
  fetchAdminUsers,
  setAdminUserPassword,
  setAdminUserRoles,
  setAdminUserStatus,
  updateAdminUser,
  fetchAdminActivity,
  getLastApiError,
  type AdminUser,
  type AdminRole,
  type AdminUserStatus,
} from "@/lib/api-client";
import { dateTime, dateTimeShort } from "@/lib/format";

export type UsersTab =
  "all" | "add" | "profile" | "password" | "roles" | "login-history" | "activity" | "status";

const TABS: { id: UsersTab; label: string; icon: typeof Users }[] = [
  { id: "all", label: "All Users", icon: Users },
  { id: "add", label: "Add User", icon: UserPlus },
  { id: "profile", label: "Profiles", icon: User },
  { id: "password", label: "Password Reset", icon: KeyRound },
  { id: "roles", label: "Assign Roles", icon: ShieldCheck },
  { id: "login-history", label: "Login History", icon: History },
  { id: "activity", label: "User Activity", icon: Activity },
  { id: "status", label: "Account Status", icon: Flag },
];

const STATUS_TONES: Record<AdminUserStatus, "success" | "warning" | "danger"> = {
  active: "success",
  suspended: "warning",
  deactivated: "danger",
};

interface Row {
  id: string;
  user: AdminUser;
}

function statusLabel(status: string): string {
  return status === "active" ? "Active" : status === "suspended" ? "Suspended" : "Deactivated";
}

export function UsersPage({
  tab: requestedTab,
  selectedId,
  onNavigate,
}: {
  tab: UsersTab | undefined;
  selectedId: string | undefined;
  onNavigate: (tab: UsersTab, id?: string) => void;
}) {
  const [tab, setTab] = useState<UsersTab>(requestedTab ?? "all");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedIdState, setSelectedIdState] = useState<string | undefined>(selectedId);

  useEffect(() => {
    if (requestedTab) setTab(requestedTab);
  }, [requestedTab]);
  useEffect(() => {
    setSelectedIdState(selectedId);
  }, [selectedId]);

  const load = () => {
    setLoading(true);
    fetchAdminUsers({ per_page: 200 })
      .then((res) => setUsers(res.items))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetchAdminRoles()
      .then((res) => setRoles(res.items))
      .catch(() => setRoles([]));
  }, []);

  const selected =
    users.find((u) => String(u.id) === selectedIdState) ??
    (selectedIdState ? undefined : (users[0] ?? null));

  const select = (id: string) => {
    setSelectedIdState(id);
    onNavigate(tab, id);
  };
  const setTabAndId = (t: UsersTab, id?: string) => {
    setTab(t);
    setSelectedIdState(id);
    onNavigate(t, id);
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        u.username.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.display_name.toLowerCase().includes(needle)
      );
    });
  }, [users, query, statusFilter]);

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const ownerCount = users.filter((u) => u.role === "owner").length;
  const lastLogin = users.reduce<string | null>((acc, u) => {
    if (!u.last_login_at) return acc;
    return !acc || u.last_login_at > acc ? u.last_login_at : acc;
  }, null);

  const action = async (fn: () => Promise<boolean | null>, okMsg: string) => {
    if (busy) return;
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res) {
      toast.error("Action failed", { description: getLastApiError() ?? "Something went wrong." });
      return;
    }
    toast.success(okMsg);
    load();
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
      cell: (r) => (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {r.user.roles.length === 0 ? (
            <span className="text-xs text-subtle">—</span>
          ) : (
            r.user.roles.map((role) => (
              <StatusBadge
                key={role.slug}
                status={role.slug}
                label={role.name}
                tone={
                  role.slug === "owner"
                    ? "danger"
                    : role.slug === "administrator"
                      ? "info"
                      : "neutral"
                }
              />
            ))
          )}
        </div>
      ),
      sortValue: (r) => r.user.role,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <StatusBadge
          status={r.user.status}
          tone={STATUS_TONES[r.user.status as AdminUserStatus] ?? "neutral"}
          label={statusLabel(r.user.status)}
        />
      ),
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
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => setTabAndId("profile", String(r.user.id))}>
              <User className="size-4" /> View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTabAndId("password", String(r.user.id))}>
              <KeyRound className="size-4" /> Reset password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTabAndId("roles", String(r.user.id))}>
              <ShieldCheck className="size-4" /> Assign roles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTabAndId("login-history", String(r.user.id))}>
              <History className="size-4" /> Login history
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTabAndId("activity", String(r.user.id))}>
              <Activity className="size-4" /> Recent activity
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                r.user.status !== "active"
                  ? action(
                      () => setAdminUserStatus(r.user.id, "active").then((u) => Boolean(u)),
                      `${r.user.display_name} re-activated.`,
                    )
                  : action(
                      () => setAdminUserStatus(r.user.id, "suspended").then((u) => Boolean(u)),
                      `${r.user.display_name} suspended.`,
                    )
              }
            >
              <Flag className="size-4" /> {r.user.status !== "active" ? "Re-activate" : "Suspend"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (!window.confirm(`Delete ${r.user.display_name}? This cannot be undone.`))
                  return;
                action(() => deleteAdminUser(r.user.id), `User ${r.user.display_name} deleted.`);
              }}
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
        description="Accounts, roles, passwords, sessions and activity."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          numericValue={users.length}
          accent="info"
          hint="All accounts"
        />
        <StatCard
          label="Active accounts"
          numericValue={activeCount}
          accent="success"
          hint="Can sign in"
        />
        <StatCard
          label="Suspended / deactivated"
          numericValue={suspendedCount}
          accent="warning"
          hint="Blocked accounts"
        />
        <StatCard
          label="Last sign-in"
          value={lastLogin ? dateTimeShort(lastLogin) : "—"}
          accent="neutral"
          hint="Most recent login"
        />
      </div>

      <Panel>
        <PanelHeader
          title={`User Management — ${TABS.find((t) => t.id === tab)?.label ?? "All Users"}`}
        />
        <div className="flex flex-wrap gap-1 px-4 pb-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <Button
                key={t.id}
                size="sm"
                variant={tab === t.id ? "default" : "outline"}
                className="h-8 gap-1.5 text-xs"
                onClick={() => setTabAndId(t.id)}
              >
                <Icon className="size-3.5" />
                {t.label}
              </Button>
            );
          })}
        </div>

        {tab === "all" && (
          <div>
            <Toolbar>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search name, email, username…"
              />
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={["active", "suspended", "deactivated"]}
                label="STATUS"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setTabAndId("add")}
              >
                <UserPlus className="size-3.5" /> Add user
              </Button>
              <ResultCount shown={rows.length} total={users.length} noun="users" />
            </Toolbar>
            <DataTable
              rows={rows}
              columns={columns}
              loading={loading}
              onRowClick={(r) => setTabAndId("profile", r.id)}
              pageSize={12}
              empty={
                <EmptyState
                  title="No users found"
                  description="Adjust your filters or add a new user."
                />
              }
            />
          </div>
        )}

        {tab === "add" && (
          <AddUserForm
            roles={roles}
            busy={busy}
            onDone={(created) => {
              toast.success(`User ${created.display_name} created.`);
              load();
              setTabAndId("profile", String(created.id));
            }}
            onCancel={() => setTabAndId("all")}
          />
        )}

        {tab === "profile" && (
          <ProfileTab
            users={users}
            selected={selected ?? null}
            busy={busy}
            onSelect={select}
            onSaved={(u) => {
              toast.success("Profile updated.");
              load();
              setSelectedIdState(String(u.id));
            }}
          />
        )}

        {tab === "password" && (
          <PasswordTab users={users} selected={selected ?? null} busy={busy} onSelect={select} />
        )}

        {tab === "roles" && (
          <RolesTab
            users={users}
            roles={roles}
            selected={selected ?? null}
            busy={busy}
            onSelect={select}
            onSaved={(u) => {
              toast.success("Roles updated.");
              load();
              setSelectedIdState(String(u.id));
            }}
          />
        )}

        {tab === "login-history" && (
          <LoginHistoryTab users={users} selected={selected ?? null} onSelect={select} />
        )}

        {tab === "activity" && (
          <UserActivityTab users={users} selected={selected ?? null} onSelect={select} />
        )}

        {tab === "status" && (
          <StatusTab
            users={users}
            selected={selected ?? null}
            busy={busy}
            onSelect={select}
            onChanged={(u) => {
              toast.success(`Account is now ${statusLabel(u.status)}.`);
              load();
              setSelectedIdState(String(u.id));
            }}
          />
        )}
      </Panel>
    </div>
  );
}

function UserPicker({
  users,
  value,
  onChange,
}: {
  users: AdminUser[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <Select value={value ? String(value) : undefined} onValueChange={(v) => onChange(v)}>
      <SelectTrigger className="w-full max-w-xs">
        <SelectValue placeholder="Select a user…" />
      </SelectTrigger>
      <SelectContent>
        {users.map((u) => (
          <SelectItem key={u.id} value={String(u.id)}>
            {u.display_name} — {u.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// --- Add user -------------------------------------------------------------

function AddUserForm({
  roles,
  busy,
  onDone,
  onCancel,
}: {
  roles: AdminRole[];
  busy: boolean;
  onDone: (user: AdminUser) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<{
    username: string;
    display_name: string;
    email: string;
    password: string;
    generate: boolean;
  }>({
    username: "",
    display_name: "",
    email: "",
    password: "",
    generate: true,
  });
  const [chosen, setChosen] = useState<string[]>(["sales"]);

  const submit = async () => {
    if (busy) return;
    if (!form.username.trim() || !form.email.trim()) {
      toast.error("Username and email are required.");
      return;
    }
    const created = await createAdminUser({
      username: form.username.trim(),
      display_name: form.display_name.trim() || form.username.trim(),
      email: form.email.trim(),
      password: form.generate || !form.password ? undefined : form.password,
      roles: chosen,
    });
    if (!created) {
      toast.error("Could not create user", { description: getLastApiError() ?? undefined });
      return;
    }
    onDone(created);
  };

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <SectionCard
        title="Account details"
        description="Credentials and profile for the new account."
      >
        <div className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="u-username">Username</Label>
            <Input
              id="u-username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. jramos"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="u-name">Display name</Label>
            <Input
              id="u-name"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="e.g. Justine Ramos"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="u-email">Email</Label>
            <Input
              id="u-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@dreampc.ph"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="u-password">Password</Label>
            <Input
              id="u-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={form.generate ? "Will be generated" : "Temporary password"}
              disabled={form.generate}
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-foreground">
            <Checkbox
              checked={form.generate}
              onCheckedChange={(v) => setForm({ ...form, generate: v === true })}
            />
            Generate a random password
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Roles" description="Initial permissions for this account.">
        <div className="space-y-2">
          {roles.map((r) => (
            <label
              key={r.slug}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] text-foreground"
            >
              <Checkbox
                checked={chosen.includes(r.slug)}
                disabled={r.slug === "owner"}
                onCheckedChange={(v) =>
                  setChosen(v ? [...chosen, r.slug] : chosen.filter((s) => s !== r.slug))
                }
              />
              <span className="flex-1">{r.name}</span>
              <span className="mono text-[10px] text-subtle">{r.slug}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={submit} disabled={busy}>
            {busy ? "Creating…" : "Create user"}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

// --- Profile --------------------------------------------------------------

function ProfileTab({
  users,
  selected,
  busy,
  onSelect,
  onSaved,
}: {
  users: AdminUser[];
  selected: AdminUser | null;
  busy: boolean;
  onSelect: (id: string) => void;
  onSaved: (user: AdminUser) => void;
}) {
  const [name, setName] = useState(selected?.display_name ?? "");
  const [email, setEmail] = useState(selected?.email ?? "");

  useEffect(() => {
    setName(selected?.display_name ?? "");
    setEmail(selected?.email ?? "");
  }, [selected]);

  if (!selected) {
    return (
      <div className="p-4">
        <EmptyState
          title="No user selected"
          description="Add a user first, then view and edit profiles here."
        />
      </div>
    );
  }

  const save = async () => {
    if (busy) return;
    const updated = await updateAdminUser(selected.id, {
      email: email.trim(),
      display_name: name.trim(),
    });
    if (!updated) {
      toast.error("Could not save profile", { description: getLastApiError() ?? undefined });
      return;
    }
    onSaved(updated);
  };

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <SectionCard title="Select account">
        <UserPicker users={users} value={String(selected.id)} onChange={onSelect} />
      </SectionCard>
      <SectionCard title="Profile">
        <KeyValueGrid
          items={[
            { label: "Display name", value: selected.display_name },
            { label: "Username", value: selected.username, mono: true },
            { label: "Email", value: selected.email, mono: true },
            { label: "Primary role", value: selected.role || "—" },
            { label: "Status", value: statusLabel(selected.status) },
            { label: "Created", value: dateTime(selected.created_at) },
            {
              label: "Last login",
              value: selected.last_login_at ? dateTime(selected.last_login_at) : "Never",
            },
            {
              label: "WordPress",
              value: selected.wordpress_connected
                ? `Linked (${selected.wordpress_username ?? "—"})`
                : "Not linked",
            },
          ]}
        />
        <div className="space-y-3 pt-3">
          <div className="grid gap-1.5">
            <Label htmlFor="p-name">Display name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="p-email">Email</Label>
            <Input
              id="p-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

// --- Password -------------------------------------------------------------

function PasswordTab({
  users,
  selected,
  busy,
  onSelect,
}: {
  users: AdminUser[];
  selected: AdminUser | null;
  busy: boolean;
  onSelect: (id: string) => void;
}) {
  const [custom, setCustom] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const submit = async (generate: boolean) => {
    if (busy || !selected) return;
    const res = await setAdminUserPassword(
      selected.id,
      generate ? { generate: true } : { password: custom },
    );
    if (!res.ok) {
      toast.error("Could not reset password", { description: getLastApiError() ?? undefined });
      return;
    }
    setResult(generate ? (res.password ?? "generated") : "Password set.");
    toast.success(`Password updated for ${selected.display_name}.`);
  };

  return (
    <div className="space-y-4 p-4">
      <SectionCard title="Select account">
        <UserPicker
          users={users}
          value={selected ? String(selected.id) : undefined}
          onChange={onSelect}
        />
      </SectionCard>
      {selected && (
        <SectionCard
          title={`Reset password — ${selected.display_name}`}
          description="Choose a temporary password or let the system generate one. All existing sessions will be revoked."
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="pw-custom">Temporary password</Label>
              <Input
                id="pw-custom"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Leave blank to generate"
                className="w-64"
              />
            </div>
            <Button size="sm" onClick={() => submit(false)} disabled={busy || !custom.trim()}>
              {busy ? "Saving…" : "Set password"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => submit(true)} disabled={busy}>
              {busy ? "Generating…" : "Generate & set"}
            </Button>
          </div>
          {result && (
            <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-[13px] text-foreground">
              <p className="mb-1 font-medium">Password updated</p>
              {result.startsWith("generated") ? (
                <p>
                  Generated password: <span className="mono text-foreground">{result}</span>
                </p>
              ) : (
                <p>{result}</p>
              )}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

// --- Roles ----------------------------------------------------------------

function RolesTab({
  users,
  roles,
  selected,
  busy,
  onSelect,
  onSaved,
}: {
  users: AdminUser[];
  roles: AdminRole[];
  selected: AdminUser | null;
  busy: boolean;
  onSelect: (id: string) => void;
  onSaved: (user: AdminUser) => void;
}) {
  const [chosen, setChosen] = useState<string[]>([]);

  useEffect(() => {
    setChosen(selected ? selected.roles.map((r) => r.slug) : []);
  }, [selected]);

  const save = async () => {
    if (busy || !selected) return;
    const updated = await setAdminUserRoles(selected.id, chosen);
    if (!updated) {
      toast.error("Could not update roles", { description: getLastApiError() ?? undefined });
      return;
    }
    onSaved(updated);
  };

  return (
    <div className="space-y-4 p-4">
      <SectionCard title="Select account">
        <UserPicker
          users={users}
          value={selected ? String(selected.id) : undefined}
          onChange={onSelect}
        />
      </SectionCard>
      {selected && (
        <SectionCard
          title={`Roles — ${selected.display_name}`}
          description="A user can hold several roles. Owners can only be granted by another Owner."
        >
          <div className="space-y-2">
            {roles.map((r) => (
              <label
                key={r.slug}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] text-foreground"
              >
                <Checkbox
                  checked={chosen.includes(r.slug)}
                  disabled={r.slug === "owner" && selected.role !== "owner"}
                  onCheckedChange={(v) =>
                    setChosen(v ? [...chosen, r.slug] : chosen.filter((s) => s !== r.slug))
                  }
                />
                <span className="flex-1">
                  {r.name}
                  <span className="ml-2 text-xs text-muted-foreground">{r.description}</span>
                </span>
                <span className="mono text-[10px] text-subtle">{r.slug}</span>
              </label>
            ))}
          </div>
          <div className="pt-2">
            <Button size="sm" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save roles"}
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// --- Login history --------------------------------------------------------

function LoginHistoryTab({
  users,
  selected,
  onSelect,
}: {
  users: AdminUser[];
  selected: AdminUser | null;
  onSelect: (id: string) => void;
}) {
  const [entries, setEntries] = useState<Awaited<ReturnType<typeof fetchAdminUserLoginHistory>>>(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetchAdminUserLoginHistory(selected.id)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="space-y-4 p-4">
      <SectionCard title="Select account">
        <UserPicker
          users={users}
          value={selected ? String(selected.id) : undefined}
          onChange={onSelect}
        />
      </SectionCard>
      {selected && (
        <SectionCard
          title={`Login history — ${selected.display_name}`}
          description="Recent sign-in attempts and sessions."
        >
          {loading ? (
            <RowsSkeleton rows={4} />
          ) : entries.length === 0 ? (
            <EmptyState
              title="No login attempts"
              description="This account has not signed in yet."
            />
          ) : (
            <ul className="space-y-2">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-[13px]"
                >
                  <StatusBadge
                    status={e.result === "success" ? "success" : "failure"}
                    tone={e.result === "success" ? "success" : "danger"}
                    label={e.result === "success" ? "Success" : "Failed"}
                  />
                  <span className="flex-1 truncate text-muted-foreground">
                    {e.reason || "—"} · <span className="mono">{e.ip || "no ip"}</span>
                  </span>
                  <span className="mono text-xs text-subtle">{dateTime(e.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  );
}

// --- User activity --------------------------------------------------------

function UserActivityTab({
  users,
  selected,
  onSelect,
}: {
  users: AdminUser[];
  selected: AdminUser | null;
  onSelect: (id: string) => void;
}) {
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof fetchAdminActivity>>["items"]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetchAdminActivity({ user_id: selected.id, per_page: 100 })
      .then((res) => setLogs(res.items))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="space-y-4 p-4">
      <SectionCard title="Select account">
        <UserPicker
          users={users}
          value={selected ? String(selected.id) : undefined}
          onChange={onSelect}
        />
      </SectionCard>
      {selected && (
        <SectionCard
          title={`Activity — ${selected.display_name}`}
          description="Timeline of actions taken by this account."
        >
          {loading ? (
            <RowsSkeleton rows={4} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Actions taken by this account will appear here."
            />
          ) : (
            <ul className="space-y-2">
              {logs.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-[13px]"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-foreground">
                      {l.description || l.action}
                    </span>
                    <span className="mono text-[10.5px] text-subtle">
                      {l.module}.{l.action}
                    </span>
                  </span>
                  <span className="mono text-xs text-subtle">{dateTime(l.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  );
}

// --- Account status -------------------------------------------------------

function StatusTab({
  users,
  selected,
  busy,
  onSelect,
  onChanged,
}: {
  users: AdminUser[];
  selected: AdminUser | null;
  busy: boolean;
  onSelect: (id: string) => void;
  onChanged: (user: AdminUser) => void;
}) {
  const change = async (status: AdminUserStatus) => {
    if (busy || !selected) return;
    const updated = await setAdminUserStatus(selected.id, status);
    if (!updated) {
      toast.error("Could not change status", { description: getLastApiError() ?? undefined });
      return;
    }
    onChanged(updated);
  };

  return (
    <div className="space-y-4 p-4">
      <SectionCard title="Select account">
        <UserPicker
          users={users}
          value={selected ? String(selected.id) : undefined}
          onChange={onSelect}
        />
      </SectionCard>
      {selected && (
        <SectionCard
          title={`Account status — ${selected.display_name}`}
          description="Suspending or deactivating blocks sign-in and revokes all sessions instantly."
        >
          <div className="flex items-center gap-3">
            <StatusBadge
              status={selected.status}
              tone={STATUS_TONES[selected.status as AdminUserStatus] ?? "neutral"}
              label={statusLabel(selected.status)}
            />
            <span className="text-sm text-muted-foreground">
              {selected.status === "active"
                ? "This account can sign in."
                : "This account is blocked from signing in."}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={selected.status === "active" || busy}
              onClick={() => change("active")}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={selected.status === "suspended" || busy}
              onClick={() => change("suspended")}
            >
              Suspend
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={selected.status === "deactivated" || busy}
              onClick={() => change("deactivated")}
            >
              Deactivate
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
