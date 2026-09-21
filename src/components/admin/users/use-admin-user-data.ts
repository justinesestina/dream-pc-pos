import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminBranches,
  fetchAdminRoles,
  fetchAdminUsers,
  type AdminBranch,
  type AdminRole,
  type AdminUser,
} from "@/lib/api-client";
import { isDpcConnectorEnabled } from "@/lib/dpc-connector";

export interface AdminUserData {
  users: AdminUser[];
  roles: AdminRole[];
  branches: AdminBranch[];
  loading: boolean;
  reload: () => void;
}

/** Shared loader for the User Management pages (users, roles, branches). */
export function useAdminUserData(): AdminUserData {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([
      fetchAdminUsers({ per_page: 200 }).then((r) => r.items),
      fetchAdminRoles().then((r) => r.items),
      fetchAdminBranches(),
    ])
      .then(([u, r, b]) => {
        if (!active) return;
        console.log("Loaded users:", u.length, "roles:", r.length, "branches:", b.length);
        console.log("Sample user:", u[0]);
        console.log("DPC Connector enabled:", isDpcConnectorEnabled());
        setUsers(u.map(normalizeUser));
        setRoles(r);
        setBranches(b);
      })
      .catch((err) => {
        console.error("Failed to load admin data:", err);
        if (!active) return;
        setUsers([]);
        setRoles([]);
        setBranches([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { users, roles, branches, loading, reload };
}

/** Fill in fields an older connector may have omitted so tables never crash. */
function normalizeUser(u: AdminUser): AdminUser {
  return {
    ...u,
    roles: u.roles ?? [],
    branches: u.branches ?? [],
    status: u.status ?? "active",
    failed_attempts: u.failed_attempts ?? 0,
    locked_until: u.locked_until ?? null,
    primary_branch_id: u.primary_branch_id ?? null,
    phone: u.phone ?? "",
  };
}

/** Minimal client-side filtering shared by table pages. */
export function filterUsers(
  users: AdminUser[],
  query: string,
  status: string,
  role: string,
  branch: string,
): AdminUser[] {
  const needle = query.trim().toLowerCase();
  console.log("Filtering users:", { totalUsers: users.length, query, status, role, branch, needle });
  const filtered = users.filter((u) => {
    if (status !== "all" && u.status !== status) return false;
    if (role !== "all" && !(u.roles ?? []).some((r) => r.slug === role)) return false;
    if (branch !== "all" && !(u.branches ?? []).some((b) => String(b.id) === branch)) return false;
    if (!needle) return true;
    const matches = 
      u.username.toLowerCase().includes(needle) ||
      u.email.toLowerCase().includes(needle) ||
      u.display_name.toLowerCase().includes(needle) ||
      (u.phone && u.phone.toLowerCase().includes(needle));
    if (matches) {
      console.log("Match found:", u.username, u.email, u.display_name, u.phone);
    }
    return matches;
  });
  console.log("Filtered result:", filtered.length, "users");
  return filtered;
}
