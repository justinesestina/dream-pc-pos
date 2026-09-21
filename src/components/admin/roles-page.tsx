import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Boxes,
  ListChecks,
  Plus,
  Shield,
  ShieldCheck,
  Table2,
  Trash2,
  UserCog,
} from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, RowsSkeleton } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { Toolbar, SearchInput, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatusBadge } from "@/components/nexus/status-badge";
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
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/admin/users/user-bits";
import {
  createAdminRole,
  deleteAdminRole,
  fetchAdminPermissions,
  fetchAdminRoles,
  fetchAdminUsers,
  getLastApiError,
  setAdminRolePermissions,
  updateAdminRole,
  type AdminPermission,
  type AdminRolesBundle,
  type AdminRole,
  type AdminUser,
} from "@/lib/api-client";

export type RolesTab = "all" | "add" | "matrix" | "modules" | "crud" | "assignments";

const TABS: { id: RolesTab; label: string; icon: typeof Shield }[] = [
  { id: "all", label: "All Roles", icon: Shield },
  { id: "add", label: "Add Role", icon: Plus },
  { id: "matrix", label: "Permission Matrix", icon: Table2 },
  { id: "modules", label: "Module Permissions", icon: Boxes },
  { id: "crud", label: "CRUD Permissions", icon: ListChecks },
  { id: "assignments", label: "Role Assignments", icon: UserCog },
];

interface Row {
  id: string;
  role: AdminRole;
}

function pretty(slug: string): string {
  return slug
    .split("_")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

export function RolesPage({
  tab: requestedTab,
  roleId: requestedRoleId,
  onNavigate,
}: {
  tab: RolesTab | undefined;
  roleId: string | undefined;
  onNavigate: (tab: RolesTab, roleId?: string) => void;
}) {
  const [tab, setTab] = useState<RolesTab>(requestedTab ?? "all");
  const [query, setQuery] = useState("");
  const [bundle, setBundle] = useState<AdminRolesBundle>({ items: [], modules: {}, actions: [] });
  const [registry, setRegistry] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(requestedRoleId);

  useEffect(() => {
    if (requestedTab) setTab(requestedTab);
  }, [requestedTab]);
  useEffect(() => {
    setSelectedId(requestedRoleId);
  }, [requestedRoleId]);

  const load = () => {
    setLoading(true);
    Promise.allSettled([fetchAdminRoles(), fetchAdminPermissions()])
      .then(([rolesRes, permsRes]) => {
        if (rolesRes.status === "fulfilled") setBundle(rolesRes.value);
        if (permsRes.status === "fulfilled") setRegistry(permsRes.value.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const roleModules = bundle.modules;
  const allActions = bundle.actions.length
    ? bundle.actions
    : ["create", "read", "update", "delete"];
  const allSlugs = useMemo(() => registry.map((p) => p.slug), [registry]);

  const selected =
    bundle.items.find((r) => String(r.id) === selectedId) ??
    (selectedId ? undefined : (bundle.items[0] ?? null));

  const pick = (r: string) => {
    setSelectedId(r);
    onNavigate(tab, r);
  };
  const setTabAndId = (t: RolesTab, id?: string) => {
    setTab(t);
    setSelectedId(id ?? selectedId);
    onNavigate(t, id ?? selectedId);
  };

  const isSystem = (r: AdminRole) =>
    r.is_system || r.slug === "owner" || r.slug === "administrator";

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bundle.items.filter(
      (r) =>
        !needle || r.name.toLowerCase().includes(needle) || r.slug.toLowerCase().includes(needle),
    );
  }, [bundle.items, query]);

  const removeRole = async (r: AdminRole) => {
    if (busy) return;
    if (isSystem(r)) return;
    if (r.user_count > 0) {
      toast.error("Cannot delete", { description: "This role is still assigned to users." });
      return;
    }
    if (!window.confirm(`Delete role "${r.name}"? This cannot be undone.`)) return;
    setBusy(true);
    const ok = await deleteAdminRole(r.id);
    setBusy(false);
    if (!ok) {
      toast.error("Could not delete role", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`Role "${r.name}" deleted.`);
    load();
  };

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Role",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-elevated">
            {isSystem(r.role) ? (
              <ShieldCheck className="size-3.5 text-info" />
            ) : (
              <Shield className="size-3.5 text-muted-foreground" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{r.role.name}</p>
            {r.role.description && (
              <p className="truncate text-[11px] text-muted-foreground">{r.role.description}</p>
            )}
          </div>
        </div>
      ),
      sortValue: (r) => r.role.name.toLowerCase(),
    },
    {
      key: "slug",
      header: "Slug",
      cell: (r) => <span className="mono text-xs text-muted-foreground">{r.role.slug}</span>,
      sortValue: (r) => r.role.slug,
    },
    {
      key: "type",
      header: "Type",
      cell: (r) =>
        isSystem(r.role) ? (
          <StatusBadge status="system" label="System" tone="info" />
        ) : (
          <StatusBadge status="custom" label="Custom" tone="neutral" />
        ),
      sortValue: (r) => (isSystem(r.role) ? "1" : "0"),
    },
    {
      key: "permissions",
      header: "Permissions",
      cell: (r) => (
        <span className="text-[13px] text-foreground">
          {r.role.permissions.includes("*")
            ? "All (full access)"
            : `${r.role.permissions.length} granted`}
        </span>
      ),
      sortValue: (r) => (r.role.permissions.includes("*") ? 9999 : r.role.permissions.length),
    },
    {
      key: "users",
      header: "Users",
      cell: (r) => <span className="text-[13px] text-foreground">{r.role.user_count}</span>,
      sortValue: (r) => r.role.user_count,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setTabAndId("matrix", String(r.role.id))}
          >
            <Table2 className="size-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-destructive hover:text-destructive"
            disabled={isSystem(r.role) || r.role.user_count > 0}
            onClick={() => removeRole(r.role)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const rows: Row[] = filtered.map((r) => ({ id: String(r.id), role: r }));
  const customCount = bundle.items.filter((r) => !isSystem(r)).length;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Roles & Permissions"
        description="Role definitions, permission grants and role assignments."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Roles" numericValue={bundle.items.length} accent="info" hint="All roles" />
        <StatCard
          label="Custom roles"
          numericValue={customCount}
          accent="success"
          hint="Editable roles"
        />
        <StatCard
          label="Permission types"
          numericValue={allSlugs.length}
          accent="neutral"
          hint={`across ${Object.keys(roleModules).length} modules`}
        />
        <StatCard
          label="Actions per module"
          numericValue={allActions.length}
          accent="neutral"
          hint={allActions.join(", ")}
        />
      </div>

      <Panel>
        <PanelHeader
          title={`Roles & Permissions — ${TABS.find((t) => t.id === tab)?.label ?? "All Roles"}`}
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
              <SearchInput value={query} onChange={setQuery} placeholder="Search roles…" />
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setTabAndId("add")}
              >
                <Plus className="size-3.5" /> New role
              </Button>
              <ResultCount shown={rows.length} total={bundle.items.length} noun="roles" />
            </Toolbar>
            <DataTable
              rows={rows}
              columns={columns}
              loading={loading}
              pageSize={12}
              empty={
                <EmptyState title="No roles found" description="Create a role to get started." />
              }
            />
          </div>
        )}

        {tab === "add" && (
          <AddRoleForm
            bundle={bundle}
            registry={registry}
            busy={busy}
            onDone={(created) => {
              toast.success(`Role "${created.name}" created.`);
              load();
              setTabAndId("matrix", String(created.id));
            }}
          />
        )}

        {tab === "matrix" && selected && (
          <MatrixTab
            bundle={bundle}
            registry={registry}
            role={selected}
            busy={busy}
            onPick={pick}
            onSaved={() => {
              toast.success(`Permissions saved for "${selected.name}".`);
              load();
            }}
          />
        )}

        {tab === "modules" && selected && (
          <ModulesTab
            bundle={bundle}
            registry={registry}
            allSlugs={allSlugs}
            role={selected}
            busy={busy}
            onPick={pick}
            onSaved={() => {
              toast.success(`Module permissions saved for "${selected.name}".`);
              load();
            }}
          />
        )}

        {tab === "crud" && selected && <CrudTab bundle={bundle} role={selected} onPick={pick} />}

        {tab === "assignments" && <AssignmentsTab roles={bundle.items} />}

        {tab !== "all" && !selected && !loading && (
          <div className="p-4">
            <EmptyState
              title="No custom roles yet"
              description="Create a role first, then edit its permissions here."
            />
          </div>
        )}
      </Panel>
    </div>
  );
}

// --- Shared helpers -------------------------------------------------------

function grantedFor(role: AdminRole, registry: AdminPermission[]): Set<string> {
  if (role.permissions.includes("*")) return new Set(registry.map((p) => p.slug));
  return new Set(role.permissions);
}

function RolePicker({
  roles,
  value,
  onChange,
}: {
  roles: AdminRole[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <Select value={value ? String(value) : undefined} onValueChange={(v) => onChange(v)}>
      <SelectTrigger className="w-full max-w-xs">
        <SelectValue placeholder="Select a role…" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r.id} value={String(r.id)}>
            {r.name} — {r.slug}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PermissionsGrid({
  moduleLabels,
  actions,
  registry,
  granted,
  onChange,
  readOnly,
}: {
  moduleLabels: Record<string, string>;
  actions: string[];
  registry: AdminPermission[];
  granted: Set<string>;
  onChange: (next: Set<string>) => void;
  readOnly?: boolean;
}) {
  const modules = Object.keys(moduleLabels);
  const hasAllActions = (module: string) =>
    actions
      .filter((a) => registry.some((p) => p.module === module && p.action === a))
      .every((a) => granted.has(`${module}.${a}`));

  if (registry.length === 0) {
    return (
      <EmptyState
        title="Permission registry empty"
        description="The connector did not return any permission slugs."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-[12.5px]">
        <thead>
          <tr className="border-b border-border bg-elevated">
            <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase">
              Module
            </th>
            {actions.map((a) => (
              <th
                key={a}
                className="px-3 py-2 text-center text-[11px] font-medium text-muted-foreground uppercase"
              >
                {a}
              </th>
            ))}
            <th className="px-3 py-2 text-center text-[11px] font-medium text-muted-foreground uppercase">
              All
            </th>
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => (
            <tr key={module} className="border-b border-border/60 last:border-0">
              <td className="px-3 py-2">
                <span className="font-medium text-foreground">
                  {moduleLabels[module] ?? pretty(module)}
                </span>
                <span className="mono ml-2 text-[10px] text-subtle">{module}</span>
              </td>
              {actions.map((action) => {
                const exists = registry.some((p) => p.module === module && p.action === action);
                const slug = `${module}.${action}`;
                return (
                  <td key={action} className="px-3 py-2 text-center">
                    {exists ? (
                      <Checkbox
                        aria-label={slug}
                        checked={granted.has(slug)}
                        disabled={readOnly}
                        onCheckedChange={(v) => {
                          const next = new Set(granted);
                          if (v) next.add(slug);
                          else next.delete(slug);
                          onChange(next);
                        }}
                      />
                    ) : (
                      <span className="text-border">—</span>
                    )}
                  </td>
                );
              })}
              <td className="px-3 py-2 text-center">
                <Checkbox
                  aria-label={`${module}.*`}
                  checked={hasAllActions(module)}
                  disabled={readOnly}
                  onCheckedChange={(v) => {
                    const next = new Set(granted);
                    for (const a of actions) {
                      const slug = `${module}.${a}`;
                      if (registry.some((p) => p.module === module && p.action === a)) {
                        if (v) next.add(slug);
                        else next.delete(slug);
                      }
                    }
                    onChange(next);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PermissionSummary({ granted, allSlugs }: { granted: Set<string>; allSlugs: string[] }) {
  const pct = allSlugs.length ? Math.round((granted.size / allSlugs.length) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
      {granted.size} of {allSlugs.length} permissions granted
      <span className="mono rounded border border-border bg-elevated px-1.5 py-px text-[10.5px] text-foreground">
        {pct}%
      </span>
    </div>
  );
}

// --- Add role -------------------------------------------------------------

function AddRoleForm({
  bundle,
  registry,
  busy,
  onDone,
}: {
  bundle: AdminRolesBundle;
  registry: AdminPermission[];
  busy: boolean;
  onDone: (role: AdminRole) => void;
}) {
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const allSlugs = useMemo(() => registry.map((p) => p.slug), [registry]);

  const submit = async () => {
    if (busy) return;
    if (!form.name.trim()) {
      toast.error("A role name is required.");
      return;
    }
    const created = await createAdminRole({
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      permissions: Array.from(granted),
    });
    if (!created) {
      toast.error("Could not create role", { description: getLastApiError() ?? undefined });
      return;
    }
    onDone(created);
  };

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-[13px] font-medium text-foreground">Role details</h3>
          <div className="mt-3 space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="r-name">Name</Label>
              <Input
                id="r-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Purchasing Clerk"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="r-slug">Slug (leave blank to auto-generate)</Label>
              <Input
                id="r-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="purchasing_clerk"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="r-desc">Description</Label>
              <Input
                id="r-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What this role is for"
              />
            </div>
            <Button size="sm" onClick={submit} disabled={busy}>
              {busy ? "Creating…" : "Create role"}
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <PermissionSummary granted={granted} allSlugs={allSlugs} />
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-[13px] font-medium text-foreground">Initial permissions</h3>
        <PermissionsGrid
          moduleLabels={bundle.modules}
          actions={bundle.actions}
          registry={registry}
          granted={granted}
          onChange={setGranted}
        />
      </div>
    </div>
  );
}

// --- Matrix ---------------------------------------------------------------

function MatrixTab({
  bundle,
  registry,
  role,
  busy,
  onPick,
  onSaved,
}: {
  bundle: AdminRolesBundle;
  registry: AdminPermission[];
  role: AdminRole;
  busy: boolean;
  onPick: (id: string) => void;
  onSaved: () => void;
}) {
  const [granted, setGranted] = useState<Set<string>>(() => grantedFor(role, registry));
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);

  useEffect(() => {
    setGranted(grantedFor(role, registry));
    setName(role.name);
    setDescription(role.description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role.id]);

  const immutable = role.slug === "owner" || role.slug === "administrator";

  const save = async () => {
    if (busy) return;
    const updated = await updateAdminRole(role.id, {
      name: name.trim() || role.name,
      description: description.trim(),
      permissions: Array.from(granted),
    });
    if (!updated) {
      toast.error("Could not save role", { description: getLastApiError() ?? undefined });
      return;
    }
    onSaved();
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <RolePicker roles={bundle.items} value={String(role.id)} onChange={onPick} />
        {immutable && (
          <StatusBadge
            status="system"
            label="System role — editable, cannot be deleted"
            tone="info"
          />
        )}
        <PermissionSummary granted={granted} allSlugs={registry.map((p) => p.slug)} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid gap-1.5">
            <Label htmlFor="m-name">Display name</Label>
            <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="m-desc">Description</Label>
            <Input
              id="m-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <PermissionsGrid
          moduleLabels={bundle.modules}
          actions={bundle.actions}
          registry={registry}
          granted={granted}
          onChange={setGranted}
        />
        <div className="mt-3">
          <Button size="sm" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save role"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Modules --------------------------------------------------------------

function ModulesTab({
  bundle,
  registry,
  allSlugs,
  role,
  busy,
  onPick,
  onSaved,
}: {
  bundle: AdminRolesBundle;
  registry: AdminPermission[];
  allSlugs: string[];
  role: AdminRole;
  busy: boolean;
  onPick: (id: string) => void;
  onSaved: () => void;
}) {
  const [granted, setGranted] = useState<Set<string>>(() => grantedFor(role, registry));
  const [open, setOpen] = useState<Record<string, boolean>>({ custom: true });

  useEffect(() => {
    setGranted(grantedFor(role, registry));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role.id]);

  const immutable = role.slug === "owner" || role.slug === "administrator";

  const moduleActionCount = (module: string) => registry.filter((p) => p.module === module).length;
  const moduleGrantedCount = (module: string) =>
    registry.filter((p) => p.module === module && granted.has(p.slug)).length;
  const moduleFull = (module: string) => {
    const total = moduleActionCount(module);
    const grantedCount = moduleGrantedCount(module);
    return total > 0 && grantedCount === total;
  };

  const toggleModule = (module: string, turnOn: boolean) => {
    const next = new Set(granted);
    for (const p of registry.filter((x) => x.module === module)) {
      if (turnOn) next.add(p.slug);
      else next.delete(p.slug);
    }
    setGranted(next);
  };

  const save = async () => {
    if (busy) return;
    const updated = await setAdminRolePermissions(role.id, Array.from(granted));
    if (!updated) {
      toast.error("Could not save permissions", { description: getLastApiError() ?? undefined });
      return;
    }
    onSaved();
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <RolePicker roles={bundle.items} value={String(role.id)} onChange={onPick} />
        {immutable && (
          <StatusBadge
            status="system"
            label="System role — editable, cannot be deleted"
            tone="info"
          />
        )}
        <PermissionSummary granted={granted} allSlugs={allSlugs} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(bundle.modules).map(([module, label]) => {
          const total = moduleActionCount(module);
          if (total === 0) return null;
          return (
            <div
              key={module}
              className={cn(
                "rounded-lg border p-3",
                moduleFull(module) && "border-success/40 bg-success/5",
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  aria-label={`${module}.*`}
                  checked={moduleFull(module)}
                  onCheckedChange={(v) => toggleModule(module, Boolean(v))}
                />
                <span className="flex-1 text-[13px] font-medium text-foreground">{label}</span>
                <span className="mono text-[10.5px] text-subtle">{module}</span>
              </div>
              <p className="mt-2 px-6 text-[11.5px] text-muted-foreground">
                {moduleGrantedCount(module)} of {total} actions granted
                <button
                  type="button"
                  className="ml-2 text-info underline-offset-2 hover:underline"
                  onClick={() => setOpen((o) => ({ ...o, [module]: !o[module] }))}
                >
                  {open[module] ? "hide" : "details"}
                </button>
              </p>
              {open[module] && (
                <div className="mt-2 flex flex-wrap gap-1 px-6">
                  {registry
                    .filter((p) => p.module === module)
                    .map((p) => (
                      <span
                        key={p.slug}
                        className={cn(
                          "mono rounded border px-1.5 py-px text-[10px]",
                          granted.has(p.slug)
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-border bg-elevated text-muted-foreground",
                        )}
                      >
                        {p.action}
                      </span>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button size="sm" onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save module permissions"}
      </Button>
    </div>
  );
}

// --- CRUD view ------------------------------------------------------------

function CrudTab({
  bundle,
  role,
  onPick,
}: {
  bundle: AdminRolesBundle;
  role: AdminRole;
  onPick: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const module of Object.keys(bundle.modules)) {
      const actions = bundle.actions;
      map.set(module, actions);
    }
    return map;
  }, [bundle.modules, bundle.actions]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <RolePicker roles={bundle.items} value={String(role.id)} onChange={onPick} />
        <span className="text-[13px] text-muted-foreground">
          Read-only view of every CRUD action across modules for{" "}
          <span className="font-medium text-foreground">{role.name}</span>. Use the Permission
          Matrix tab to edit.
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-border bg-elevated">
              <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase">
                Module
              </th>
              <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase">
                Slug
              </th>
              <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase">
                Granted
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from(grouped.entries()).map(([module, actions]) => (
              <Fragment key={module}>
                {actions.map((action, idx) => {
                  const slug = `${module}.${action}`;
                  const granted = role.permissions.includes("*") || role.permissions.includes(slug);
                  return (
                    <tr key={slug} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-2">
                        {idx === 0 && (
                          <span className="font-medium text-foreground">
                            {bundle.modules[module] ?? pretty(module)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 mono text-xs text-subtle">
                        {slug}
                        <span className="ml-2 text-[10px] text-muted-foreground normal-case">
                          {action}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {granted ? (
                          <StatusBadge status="granted" label="Granted" tone="success" />
                        ) : (
                          <StatusBadge status="denied" label="Denied" tone="neutral" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Assignments ----------------------------------------------------------

function AssignmentsTab({ roles }: { roles: AdminRole[] }) {
  const [roleId, setRoleId] = useState<string | undefined>(
    roles[0] ? String(roles[0].id) : undefined,
  );
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminUsers({ per_page: 200 })
      .then((res) => setUsers(res.items))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (roles.length && !roleId) setRoleId(String(roles[0].id));
  }, [roles, roleId]);

  const role = roles.find((r) => String(r.id) === roleId);
  const holders = role ? users.filter((u) => u.roles.some((rr) => rr.slug === role.slug)) : [];

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <RolePicker roles={roles} value={roleId} onChange={setRoleId} />
        <span className="text-[13px] text-muted-foreground">
          {role ? `${holders.length} of ${users.length} users hold this role.` : "Select a role."}
        </span>
      </div>
      {loading ? (
        <RowsSkeleton rows={4} />
      ) : holders.length === 0 ? (
        <EmptyState title="No assignments" description="No users currently hold this role." />
      ) : (
        <ul className="space-y-2">
          {holders.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-[13px]"
            >
              <UserAvatar user={u} size="sm" />
              <span className="flex-1 min-w-0">
                <span className="block truncate text-foreground">{u.display_name}</span>
                <span className="mono text-[10.5px] text-subtle">{u.email}</span>
              </span>
              <StatusBadge
                status={u.status === "active" ? "active" : "inactive"}
                tone={u.status === "active" ? "success" : "warning"}
                label={u.status}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
