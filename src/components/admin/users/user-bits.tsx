import { StatusBadge } from "@/components/nexus/status-badge";
import type { AdminUser, AdminUserStatus } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { parseServerDate } from "@/lib/format";

export function statusLabel(status: string): string {
  return status === "active"
    ? "Active"
    : status === "suspended"
      ? "Suspended"
      : status === "locked"
        ? "Locked"
        : status === "inactive"
          ? "Inactive"
          : "Deactivated";
}

export function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "active") return "success";
  if (status === "suspended" || status === "inactive") return "warning";
  if (status === "locked" || status === "deactivated") return "danger";
  return "neutral";
}

export function roleTone(slug: string): "danger" | "info" | "neutral" {
  if (slug === "owner") return "danger";
  if (slug === "administrator" || slug === "manager") return "info";
  return "neutral";
}

/** True while the account is temporarily locked after failed attempts. */
export function isLocked(u: AdminUser): boolean {
  return Boolean(u.locked_until && parseServerDate(u.locked_until).getTime() > Date.now());
}

/** Check if user has the owner role. */
export function isOwner(u: AdminUser): boolean {
  return (u.roles ?? []).some((r) => r.slug === "owner");
}

/** Check if the current user is an owner (from localStorage/session). */
export function isCurrentUserOwner(): boolean {
  try {
    const userRaw = localStorage.getItem("dpc-nexus-user");
    if (!userRaw) return false;
    const user = JSON.parse(userRaw);
    return user?.role === "owner" || (user?.roles ?? []).some((r: { slug: string }) => r.slug === "owner");
  } catch {
    return false;
  }
}

const AVATAR_SIZES = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
  xl: "size-16 text-lg",
} as const;

/** Any object carrying avatar + display identity (AdminUser, User, TeamMember, …). */
type AvatarUser = {
  avatar_url?: string;
  initials?: string;
  display_name?: string;
  name?: string;
};

/** Profile photo with the initials chip as a fallback. */
export function UserAvatar({
  user,
  size = "md",
  rounded = "md",
  className,
}: {
  user: AvatarUser;
  size?: keyof typeof AVATAR_SIZES;
  rounded?: "md" | "full";
  className?: string;
}) {
  const url = user.avatar_url?.trim();
  const theme = rounded === "full" ? "rounded-full" : "rounded-md";
  const base = `${AVATAR_SIZES[size]} shrink-0 border object-cover border-border bg-elevated`;
  const label = user.display_name || user.name || "User";
  if (url) {
    return (
      <img
        src={url}
        alt={label}
        referrerPolicy="no-referrer"
        className={cn(base, theme, className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "mono flex items-center justify-center text-foreground",
        base,
        theme,
        className,
      )}
    >
      {user.initials || "?"}
    </span>
  );
}

export function StatusCell({ status, locked }: { status: string; locked?: boolean }) {
  const effective = locked ? "locked" : status;
  return (
    <StatusBadge
      status={effective}
      tone={statusTone(effective)}
      label={locked ? "Locked" : statusLabel(status)}
    />
  );
}

export function RoleBadges({ user }: { user: AdminUser }) {
  const roles = user.roles ?? [];
  if (roles.length === 0) return <span className="text-xs text-subtle">—</span>;
  return (
    <div className="flex max-w-[240px] flex-wrap gap-1">
      {roles.map((role) => (
        <StatusBadge
          key={role.slug}
          status={role.slug}
          label={role.name}
          tone={roleTone(role.slug)}
        />
      ))}
    </div>
  );
}

export function BranchCell({ user }: { user: AdminUser }) {
  const branches = user.branches ?? [];
  if (branches.length === 0) return <span className="text-xs text-subtle">—</span>;
  return (
    <div className="flex max-w-[220px] flex-wrap gap-1">
      {branches.map((b) => (
        <StatusBadge
          key={b.id}
          status={String(b.id)}
          label={b.name}
          tone={user.primary_branch_id === b.id ? "info" : "neutral"}
          {...(user.primary_branch_id === b.id
            ? { className: "border-info/30 bg-info/10 text-info" }
            : {})}
        />
      ))}
    </div>
  );
}

/** Best-effort "Device" label derived from a user agent string. */
export function deviceFromUA(ua: string): string {
  if (!ua) return "—";
  const lower = ua.toLowerCase();
  let os = "—";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("linux")) os = "Linux";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ios")) os = "iOS";
  let browser = "—";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("opr/") || lower.includes("opera")) browser = "Opera";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("chrome")) browser = "Chrome";
  else if (lower.includes("safari")) browser = "Safari";
  else if (lower.includes("postman")) browser = "Postman";
  return `${os} · ${browser}`;
}

export function formatDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
