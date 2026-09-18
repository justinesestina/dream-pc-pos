import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatCard } from "@/components/nexus/stat-card";
import { Button } from "@/components/ui/button";
import {
  getLastApiError,
  setAdminUserStatus,
  deleteAdminUser,
  type AdminUser,
  type AdminUserStatus,
} from "@/lib/api-client";
import { dateTimeShort } from "@/lib/format";
import { useAdminUserData } from "./use-admin-user-data";
import { StatusCell, isLocked } from "./user-bits";
import { ConfirmDialog } from "./confirm-dialog";

interface Row {
  id: string;
  user: AdminUser;
}

export function AccountStatusPage() {
  const { users, loading, reload } = useAdminUserData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{
    user: AdminUser;
    kind: "suspend" | "reactivate" | "delete";
  } | null>(null);

  const counts = useMemo(() => {
    const locked = users.filter(isLocked).length;
    const by = (s: AdminUser["status"]) => users.filter((u) => u.status === s).length;
    return {
      total: users.length,
      active: by("active") - locked,
      suspended: by("suspended"),
      deactivated: by("deactivated"),
      locked,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== "all") {
        if (statusFilter === "locked") {
          if (!isLocked(u)) return false;
        } else if (u.status !== statusFilter) return false;
      }
      if (!needle) return true;
      return (
        u.username.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.display_name.toLowerCase().includes(needle)
      );
    });
  }, [users, query, statusFilter]);

  const runStatus = async (u: AdminUser, status: AdminUserStatus) => {
    if (busy) return;
    setBusy(true);
    const res = await setAdminUserStatus(u.id, status);
    setBusy(false);
    if (!res) {
      toast.error("Could not update status", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`${u.display_name} ${status === "active" ? "re-activated" : "suspended"}.`);
    reload();
  };

  const runDelete = async (u: AdminUser) => {
    if (busy) return;
    setBusy(true);
    const ok = await deleteAdminUser(u.id);
    setBusy(false);
    if (!ok) {
      toast.error("Could not delete user", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`User ${u.display_name} deleted.`);
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
      key: "status",
      header: "Status",
      cell: (r) => <StatusCell status={r.user.status} locked={isLocked(r.user)} />,
      sortValue: (r) => r.user.status,
    },
    {
      key: "failed",
      header: "Failed attempts",
      cell: (r) => (
        <span className="mono text-xs text-muted-foreground">{r.user.failed_attempts}</span>
      ),
      sortValue: (r) => r.user.failed_attempts,
    },
    {
      key: "locked_until",
      header: "Locked until",
      cell: (r) =>
        r.user.locked_until ? (
          <span className="mono text-xs text-muted-foreground">
            {dateTimeShort(r.user.locked_until)}
          </span>
        ) : (
          <span className="text-xs text-subtle">—</span>
        ),
      sortValue: (r) => r.user.locked_until ?? "",
    },
    {
      key: "last_login",
      header: "Last sign-in",
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
        <div className="flex justify-end gap-1">
          {r.user.status !== "active" ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => setConfirm({ user: r.user, kind: "reactivate" })}
            >
              <Activity className="size-3.5" /> Re-activate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => setConfirm({ user: r.user, kind: "suspend" })}
            >
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ];

  const rows: Row[] = filtered.map((u) => ({ id: String(u.id), user: u }));

  const target = confirm?.user;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Account Status"
        description="Monitor sign-in state, lockouts and lifecycle across all accounts."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <StatCard label="Total accounts" value={counts.total} />
        <StatCard label="Active" value={counts.active} accent="success" />
        <StatCard label="Locked" value={counts.locked} accent="danger" hint="Sign-in lockouts" />
        <StatCard label="Suspended" value={counts.suspended} accent="warning" />
        <StatCard label="Deactivated" value={counts.deactivated} accent="neutral" />
      </div>

      <Panel>
        <PanelHeader title="Accounts" hint="Suspend, re-activate or delete an account." />
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
              { value: "locked", label: "Locked" },
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
          pageSize={12}
          empty={<EmptyState title="No accounts" description="No users match these filters." />}
        />
      </Panel>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={
          confirm?.kind === "reactivate"
            ? `Re-activate ${target?.display_name}?`
            : confirm?.kind === "delete"
              ? `Delete ${target?.display_name}?`
              : `Suspend ${target?.display_name}?`
        }
        description={
          confirm?.kind === "reactivate"
            ? "The account can sign in again immediately. All sessions remain revoked."
            : confirm?.kind === "delete"
              ? "The account and its assignments are permanently removed. Login and activity history is retained."
              : "The account is blocked from signing in immediately and all sessions are revoked."
        }
        confirmLabel={
          confirm?.kind === "reactivate"
            ? "Re-activate"
            : confirm?.kind === "delete"
              ? "Delete user"
              : "Suspend"
        }
        destructive={confirm?.kind === "delete"}
        busy={busy}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "delete") void runDelete(confirm.user);
          else void runStatus(confirm.user, confirm.kind === "reactivate" ? "active" : "suspended");
          setConfirm(null);
        }}
      />
    </div>
  );
}
