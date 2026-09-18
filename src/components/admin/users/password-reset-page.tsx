import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, KeyRound, RefreshCw, Check } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLastApiError, setAdminUserPassword, type AdminUser } from "@/lib/api-client";
import { serverDateTimeShort } from "@/lib/format";
import { useAdminUserData } from "./use-admin-user-data";
import { RoleBadges, StatusCell, isLocked } from "./user-bits";

interface Row {
  id: string;
  user: AdminUser;
}

export function PasswordResetPage() {
  const { users, loading, reload } = useAdminUserData();
  const { id } = useSearch({ from: "/_app/administration/users/password-reset" });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id == null || target) return;
    const match = users.find((u) => String(u.id) === id);
    if (match) {
      setTarget(match);
      setCustom("");
      setResult(null);
    }
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

  const openFor = (u: AdminUser) => {
    setTarget(u);
    setCustom("");
    setResult(null);
    setCopied(false);
  };

  const submit = async (generate: boolean) => {
    if (busy || !target) return;
    setBusy(true);
    const res = await setAdminUserPassword(
      target.id,
      generate ? { generate: true } : { password: custom },
    );
    setBusy(false);
    if (!res.ok) {
      toast.error("Could not reset password", { description: getLastApiError() ?? undefined });
      return;
    }
    if (res.password) setResult(res.password);
    else setResult("PASSWORD_SET");
    toast.success(`Temporary password set for ${target.display_name}.`);
    reload();
  };

  const copy = async () => {
    if (!result || result === "PASSWORD_SET") return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
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
      key: "email",
      header: "Email",
      cell: (r) => <span className="mono text-xs text-muted-foreground">{r.user.email}</span>,
      sortValue: (r) => r.user.email.toLowerCase(),
    },
    {
      key: "roles",
      header: "Role",
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
      key: "last_login",
      header: "Last sign-in",
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
      className: "w-24",
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={() => openFor(r.user)}
        >
          <KeyRound className="size-3.5" /> Reset
        </Button>
      ),
    },
  ];

  const rows: Row[] = filtered.map((u) => ({ id: String(u.id), user: u }));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Password Reset"
        description="Set a temporary password for any account. Existing sessions are revoked and the change is audited."
      />

      <Panel>
        <PanelHeader title="Accounts" hint="Choose an account to issue a temporary password." />
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

      <Dialog open={target !== null} onOpenChange={(v) => !v && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password — {target?.display_name}</DialogTitle>
            <DialogDescription>
              All existing sessions are revoked after the change, and the event is recorded in the
              audit log.
            </DialogDescription>
          </DialogHeader>

          {result === null && target && (
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="pw-custom">Temporary password</Label>
                <Input
                  id="pw-custom"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Leave blank to generate"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use the generated password for maximum security, or set one you can share. The
                password is never stored readable on the server.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => submit(true)} disabled={busy}>
                  <RefreshCw className="size-3.5" /> {busy ? "Generating…" : "Generate & reset"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => submit(false)}
                  disabled={busy || custom.trim().length < 10}
                >
                  {busy ? "Saving…" : "Use custom password"}
                </Button>
              </div>
            </div>
          )}

          {result !== null && (
            <div className="rounded-md border border-success/30 bg-success/10 p-3">
              <p className="mb-2 text-[13px] font-medium text-foreground">
                Password updated for {target?.display_name}
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
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={copy}>
                      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
