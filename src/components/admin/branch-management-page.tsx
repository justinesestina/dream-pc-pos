import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, RowsSkeleton } from "@/components/nexus/primitives";
import { DataTable, type Column } from "@/components/nexus/data-table";
import { StatCard } from "@/components/nexus/stat-card";
import { StatusBadge } from "@/components/nexus/status-badge";
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
import {
  createAdminBranch,
  getLastApiError,
  type AdminBranch,
  type AdminUser,
} from "@/lib/api-client";
import { useAdminUserData } from "@/components/admin/users/use-admin-user-data";
import { BranchCell, StatusCell, isLocked } from "@/components/admin/users/user-bits";

type BranchTab = "overview" | "users" | "warehouses" | "sales" | "expenses" | "reports";

const TABS: { id: BranchTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "warehouses", label: "Warehouses" },
  { id: "sales", label: "Sales" },
  { id: "expenses", label: "Expenses" },
  { id: "reports", label: "Reports" },
];

const SOON: Partial<Record<BranchTab, string>> = {
  warehouses: "Warehouse assignments will appear here once the inventory module exposes them.",
  sales: "Per-branch sales performance will appear here once the sales module exposes it.",
  expenses: "Per-branch expenses will appear here once the accounts module exposes them.",
  reports: "Branch reports will appear here once reporting is enabled for branches.",
};

export function BranchManagementPage() {
  const { users, branches, loading, reload } = useAdminUserData();
  const [tab, setTab] = useState<BranchTab>("overview");
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  const activeBranches = branches.filter((b) => b.status !== "inactive").length;
  const assignedUsers = users.filter((u) => (u.branches ?? []).length > 0).length;

  const userCountFor = (branch: AdminBranch) =>
    users.filter((u) => (u.branches ?? []).some((b) => b.id === branch.id)).length;

  const branchRows = useMemo(
    () => branches.map((b) => ({ id: String(b.id), branch: b })),
    [branches],
  );

  const userRows = useMemo<{ id: string; user: AdminUser }[]>(
    () => users.map((u) => ({ id: String(u.id), user: u })),
    [users],
  );

  const submit = async () => {
    if (busy) return;
    if (!name.trim()) {
      toast.error("Branch name is required.");
      return;
    }
    setBusy(true);
    const input: { name: string; code?: string; address?: string } = { name: name.trim() };
    if (code.trim()) input.code = code.trim();
    if (address.trim()) input.address = address.trim();
    const created = await createAdminBranch(input);
    setBusy(false);
    if (!created) {
      toast.error("Could not create branch", { description: getLastApiError() ?? undefined });
      return;
    }
    toast.success(`Branch ${created.name} created.`);
    setAddOpen(false);
    setName("");
    setCode("");
    setAddress("");
    reload();
  };

  const branchColumns: Column<{ id: string; branch: AdminBranch }>[] = [
    {
      key: "code",
      header: "Code",
      cell: (r) => <span className="label-tech">{r.branch.code}</span>,
      sortValue: (r) => r.branch.code,
    },
    {
      key: "name",
      header: "Branch",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-elevated">
            <Building2 className="size-3.5 text-muted-foreground" />
          </span>
          <span className="text-[13px] text-foreground">{r.branch.name}</span>
        </div>
      ),
      sortValue: (r) => r.branch.name.toLowerCase(),
    },
    {
      key: "address",
      header: "Address",
      cell: (r) => <span className="text-xs text-muted-foreground">{r.branch.address || "—"}</span>,
      sortValue: (r) => r.branch.address ?? "",
    },
    {
      key: "users",
      header: "Users",
      align: "right",
      cell: (r) => (
        <span className="mono text-xs text-muted-foreground">{userCountFor(r.branch)}</span>
      ),
      sortValue: (r) => userCountFor(r.branch),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <StatusBadge
          status={r.branch.status}
          tone={r.branch.status === "inactive" ? "neutral" : "success"}
          label={r.branch.status === "inactive" ? "Inactive" : "Active"}
        />
      ),
      sortValue: (r) => r.branch.status,
    },
  ];

  const userColumns: Column<{ id: string; user: AdminUser }>[] = [
    {
      key: "user",
      header: "User",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-foreground">{r.user.display_name}</p>
          <p className="mono truncate text-[10.5px] text-subtle">{r.user.username}</p>
        </div>
      ),
      sortValue: (r) => r.user.display_name.toLowerCase(),
    },
    {
      key: "branches",
      header: "Branches",
      cell: (r) => <BranchCell user={r.user} />,
      sortValue: (r) => (r.user.branches ?? []).length,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusCell status={r.user.status} locked={isLocked(r.user)} />,
      sortValue: (r) => r.user.status,
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Branch Management"
        description="Branches across the business, who works in them and their operational context."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add Branch
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Branches"
          numericValue={branches.length}
          accent="info"
          hint="All branches"
        />
        <StatCard
          label="Active"
          numericValue={activeBranches}
          accent="success"
          hint="Currently operating"
        />
        <StatCard
          label="Assigned users"
          numericValue={assignedUsers}
          accent="neutral"
          hint="Users with branch access"
        />
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface/50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
              tab === t.id
                ? "bg-elevated text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <Panel>
          <PanelHeader
            title="All branches"
            hint="Add and review the branches your team works in."
          />
          <DataTable
            rows={branchRows}
            columns={branchColumns}
            loading={loading}
            pageSize={12}
            empty={
              <EmptyState
                title="No branches yet"
                description="Create your first branch to start assigning users and stock."
                action={
                  <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
                    <Plus className="size-3.5" /> Add branch
                  </Button>
                }
              />
            }
          />
        </Panel>
      )}

      {tab === "users" && (
        <Panel>
          <PanelHeader title="Users by branch" hint="Every account that has branch access." />
          <DataTable
            rows={userRows}
            columns={userColumns}
            loading={loading}
            pageSize={12}
            empty={
              <EmptyState
                title="No users found"
                description="Assign branch access from User Management → All Users."
              />
            }
          />
        </Panel>
      )}

      {SOON[tab] && (
        <Panel>
          <EmptyState title="Coming soon" description={SOON[tab]} />
        </Panel>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add branch</DialogTitle>
            <DialogDescription>
              Create a new branch. The code is generated automatically when left blank.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="branch-name">Name</Label>
              <Input
                id="branch-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cebu City"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="branch-code">Code (optional)</Label>
              <Input
                id="branch-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CEB"
                className="font-mono"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="branch-address">Address (optional)</Label>
              <Input
                id="branch-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={busy || !name.trim()}>
              {busy ? "Creating…" : "Create branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
