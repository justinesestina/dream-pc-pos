const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const pesoCents = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export const money = (n: number) => peso.format(n);
export const moneyExact = (n: number) => pesoCents.format(n);
export const num = (n: number) => new Intl.NumberFormat("en-PH").format(n);

export const VAT_RATE = 0.12;

export function dateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateTimeShort(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeOnly(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour12: false });
}

export function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return dateShort(iso);
}

export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

/**
 * The connector/backend stores naive UTC datetimes ("YYYY-MM-DD HH:MM:SS").
 * Browsers parse those as *local* time, which shifts them by the UTC offset.
 * parseServerDate normalizes them to UTC so they can be rendered in Manila time.
 */
export function parseServerDate(iso: string): Date {
  if (!iso) return new Date(NaN);
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(iso)) {
    return new Date(`${iso.replace(" ", "T")}Z`);
  }
  return new Date(iso);
}

const SERVER_TZ = "Asia/Manila";

function serverFormat(iso: string, opts: Intl.DateTimeFormatOptions, fallback = "—") {
  const d = parseServerDate(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-PH", { ...opts, timeZone: SERVER_TZ }).format(d);
}

/** Short server date + time in Philippine time, e.g. "18 Sep, 09:05". */
export function serverDateTimeShort(iso: string) {
  return serverFormat(iso, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Full server date + time in Philippine time, e.g. "18 Sep 2026, 09:05". */
export function serverDateTime(iso: string) {
  return serverFormat(iso, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Server date only in Philippine time, e.g. "18 Sep 2026". */
export function serverDateShort(iso: string) {
  return serverFormat(iso, { month: "short", day: "numeric", year: "numeric" });
}

/** Relative time for a server timestamp (Manila-aware). */
export function serverRelative(iso: string) {
  const d = parseServerDate(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return serverDateShort(iso);
}

export function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
