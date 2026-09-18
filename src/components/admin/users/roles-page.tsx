import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck, Save } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SidePanel,
  SidePanelHeader,
  SidePanelTitle,
  SidePanelDescription,
  SidePanelBody,
  SidePanelFooter,
} from "./side-panel";
import {
  getLastApiError,
  setAdminUserRoles,
  type AdminRole,
  type AdminUser,
} from "@/lib/api-client";
import { useAdminUserData } from "./use-admin-user-data";
import { RoleBadges, StatusCell, isLocked } from "./user-bits";

interface Row {
  id: string;
  user: AdminUser;
}

export function RolesPage() {
  const { users, roles, loading, reload } = useAdminUserData();
  const { id } = useSearch({ from: "/_app/administration/users/roles" });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [target, setTarget] = useState<Row["user"] | null>(null);
  const [primary, setPrimary] = useState("");
  const [additional, setAdditional] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const openFor = (u: Row["user"]) => {
    setTarget(u);
    setPrimary(u.role);
    setAdditional((u.roles ?? []).map((r) => r.slug));
  };

  useEffect(() => {
    if (id == null || target) return;
    const match = users.find((u) => String(u.id) === id);
    if (match) openFor(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, users]);

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

  const toggleAdditional = (slug: string) =>
    setAdditional((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const save = async () => {
    if (!target || busy) return;
    if (!primary) {
      toast.error("Pick a primary role first.");
      return;
    }
    setBusy(true);
    const res = await setAdminUserRoles(target.id, [primary, ...additional]);
    setBusy(false);
    if (!res) {
      toast.error("Could not update roles", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`Roles updated for ${target.display_name}.`);
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
            <p className="mono truncate text-[10.5px] text-subtle">{r.user.username}</p>
          </div>
        </div>
      ),
      sortValue: (r) => r.user.display_name.toLowerCase(),
    },
    {
      key: "roles",
      header: "Roles",
      cell: (r) => <RoleBadges user={r.user} />,
      sortValue: (r) => r.user.role,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusCell status={r.user.status} locked={isLocked(r.user)} />,
      sortValue: (r) => r.user.status,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-24",
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={() => openFor(r.user)}
        >
          <ShieldCheck className="size-3.5" /> Edit
        </Button>
      ),
    },
  ];

  const rows: Row[] = filtered.map((u) => ({ id: String(u.id), user: u }));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Assign Roles"
        description="Everything a user can do is driven by their primary and additional roles."
      />

      <Panel>
        <PanelHeader title="Accounts" hint="Pick an account to adjust its roles." />
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name, username, email…"
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
          <ResultCount shown={rows.length} total={users.length} noun="users" />
        </Toolbar>
        <DataTable
          rows={rows}
          columns={columns}
          loading={loading}
          onRowClick={(r) => openFor(r.user)}
          pageSize={12}
          empty={
            <EmptyState
              title="No users found"
              description="Adjust your filters or add a new user."
            />
          }
        />
      </Panel>

      <SidePanel open={target !== null} onOpenChange={(v) => !v && setTarget(null)}>
        {target && (
          <>
            <SidePanelHeader>
              <SidePanelTitle>Assign roles — {target.display_name}</SidePanelTitle>
              <SidePanelDescription>
                {target.email} · the first role is primary.
              </SidePanelDescription>
            </SidePanelHeader>
            <SidePanelBody>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="mono flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-xs text-foreground">
                  {target.initials}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{target.display_name}</p>
                  <p className="mono text-[11px] text-subtle">
                    Currently: {target.roles?.length ? target.roles.join(", ") : target.role}
                  </p>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>Primary role</Label>
                <div className="grid gap-1.5">
                  {roles.map((r: AdminRole) => (
                    <label
                      key={r.slug}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2.5 py-2 transition-colors hover:bg-elevated/60"
                      style={{ outline: primary === r.slug ? "1px solid var(--info)" : undefined }}
                    >
                      <input
                        type="radio"
                        name="primary-role"
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
              </div>

              <Separator className="my-4" />

              <p className="mb-2 text-[13px] text-foreground">Additional roles</p>
              <div className="grid grid-cols-1 gap-1.5">
                {roles
                  .filter((r) => r.slug !== primary)
                  .map((r) => (
                    <label
                      key={r.slug}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2.5 py-2 transition-colors hover:bg-elevated/60"
                    >
                      <Checkbox
                        checked={additional.includes(r.slug)}
                        onCheckedChange={() => toggleAdditional(r.slug)}
                      />
                      <span className="label-tech">{r.slug}</span>
                      <span className="ml-auto truncate text-[12px] text-subtle">
                        {r.description}
                      </span>
                    </label>
                  ))}
              </div>
            </SidePanelBody>
            <SidePanelFooter>
              <Button size="sm" className="ml-auto gap-1" onClick={save} disabled={busy}>
                <Save className="size-3.5" /> {busy ? "Saving…" : "Save roles"}
              </Button>
            </SidePanelFooter>
          </>
        )}
      </SidePanel>
    </div>
  );
}
