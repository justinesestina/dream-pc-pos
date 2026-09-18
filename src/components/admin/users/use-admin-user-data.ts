import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminBranches,
  fetchAdminRoles,
  fetchAdminUsers,
  type AdminBranch,
  type AdminRole,
  type AdminUser,
} from "@/lib/api-client";

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
        setUsers(u);
        setRoles(r);
        setBranches(b);
      })
      .catch(() => {
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

/** Minimal client-side filtering shared by table pages. */
export function filterUsers(
  users: AdminUser[],
  query: string,
  status: string,
  role: string,
  branch: string,
): AdminUser[] {
  const needle = query.trim().toLowerCase();
  return users.filter((u) => {
    if (status !== "all" && u.status !== status) return false;
    if (role !== "all" && !u.roles.some((r) => r.slug === role)) return false;
    if (branch !== "all" && !u.branches.some((b) => String(b.id) === branch)) return false;
    if (!needle) return true;
    return (
      u.username.toLowerCase().includes(needle) ||
      u.email.toLowerCase().includes(needle) ||
      u.display_name.toLowerCase().includes(needle)
    );
  });
}
