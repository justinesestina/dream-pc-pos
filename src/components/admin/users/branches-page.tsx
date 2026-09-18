import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save, Store } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  setAdminUserBranches,
  type AdminBranch,
  type AdminUser,
} from "@/lib/api-client";
import { useAdminUserData } from "./use-admin-user-data";
import { BranchCell, StatusCell, isLocked } from "./user-bits";

interface Row {
  id: string;
  user: AdminUser;
}

export function BranchesPage() {
  const { users, branches, loading, reload } = useAdminUserData();
  const { id } = useSearch({ from: "/_app/administration/users/branches" });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [chosen, setChosen] = useState<number[]>([]);
  const [primary, setPrimary] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const openFor = (u: AdminUser) => {
    setTarget(u);
    const ids = (u.branches ?? []).map((b) => b.id);
    setChosen(ids);
    setPrimary(
      u.primary_branch_id != null ? String(u.primary_branch_id) : ids[0] ? String(ids[0]) : "",
    );
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
        u.display_name.toLowerCase().includes(needle) ||
        (u.branches ?? []).some(
          (b) => b.name.toLowerCase().includes(needle) || b.code.toLowerCase().includes(needle),
        )
      );
    });
  }, [users, query, statusFilter]);

  const toggleBranch = (bid: number) => {
    const next = chosen.includes(bid) ? chosen.filter((b) => b !== bid) : [...chosen, bid];
    setChosen(next);
    if (!next.includes(Number(primary)) && next.length > 0) setPrimary(String(next[0]));
    if (next.length === 0) setPrimary("");
  };

  const save = async () => {
    if (!target || busy) return;
    if (chosen.length === 0) {
      toast.error("Choose at least one branch.");
      return;
    }
    setBusy(true);
    const res = await setAdminUserBranches(target.id, {
      branch_ids: chosen,
      primary_branch_id: primary ? Number(primary) : null,
    });
    setBusy(false);
    if (!res) {
      toast.error("Could not update branches", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`Branch access updated for ${target.display_name}.`);
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
      key: "branches",
      header: "Branches",
      cell: (r) => <BranchCell user={r.user} />,
      sortValue: (r) => r.user.branches?.length ?? 0,
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
          <Store className="size-3.5" /> Edit
        </Button>
      ),
    },
  ];

  const rows: Row[] = filtered.map((u) => ({ id: String(u.id), user: u }));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Assign Branches"
        description="Grant access to branches and pick which one the account works in by default."
      />

      <Panel>
        <PanelHeader title="Accounts" hint="Pick an account to adjust its branches." />
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name, username or branch…"
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
              <SidePanelTitle>Assign branches — {target.display_name}</SidePanelTitle>
              <SidePanelDescription>{target.email}</SidePanelDescription>
            </SidePanelHeader>
            <SidePanelBody>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="mono flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-xs text-foreground">
                  {target.initials}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{target.display_name}</p>
                  <p className="mono text-[11px] text-subtle">
                    {target.branches?.length ?? 0} branch assignments
                  </p>
                </div>
              </div>

              <p className="mb-2 text-[13px] text-foreground">Branch access</p>
              <div className="grid max-h-[36vh] gap-1.5 overflow-y-auto pr-1">
                {branches.map((b: AdminBranch) => (
                  <label
                    key={b.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2.5 py-2 transition-colors hover:bg-elevated/60"
                  >
                    <Checkbox
                      checked={chosen.includes(b.id)}
                      onCheckedChange={() => toggleBranch(b.id)}
                    />
                    <span className="label-tech">{b.code}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-subtle">
                      {b.name}
                    </span>
                  </label>
                ))}
              </div>

              <Separator className="my-4" />

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
            </SidePanelBody>
            <SidePanelFooter>
              <Button size="sm" className="ml-auto gap-1" onClick={save} disabled={busy}>
                <Save className="size-3.5" /> {busy ? "Saving…" : "Save branches"}
              </Button>
            </SidePanelFooter>
          </>
        )}
      </SidePanel>
    </div>
  );
}
