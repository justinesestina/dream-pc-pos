import { useEffect, useRef, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, PanelHeader, EmptyState, RowsSkeleton } from "@/components/nexus/primitives";
import { Toolbar, SearchInput, FilterSelect, ResultCount } from "@/components/nexus/toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/nexus/status-badge";
import { fetchAdminActivity, type AdminActivityRow } from "@/lib/api-client";
import { dateTime, titleCase } from "@/lib/format";

const PER_PAGE = 15;
const MODULES = [
  "users",
  "roles",
  "branches",
  "auth",
  "sales",
  "inventory",
  "customers",
  "settings",
  "audit",
];

export function ActivityPage() {
  const { user } = useSearch({ from: "/_app/administration/users/activity" });
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminActivityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<AdminActivityRow | null>(null);
  const debounce = useRef<number | null>(null);

  const load = (p: number, q: string, m: string, f: string, t: string, uid?: number) => {
    setLoading(true);
    fetchAdminActivity({
      search: q || undefined,
      module: m === "all" ? undefined : m,
      from: f || undefined,
      to: t || undefined,
      user_id: uid,
      page: p,
      per_page: PER_PAGE,
    }).then((res) => {
      setItems(res.items);
      setTotal(res.total);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      setPage(1);
      load(1, query, module, from, to, user ? Number(user) : undefined);
    }, 350);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [query, module, from, to, user]);

  useEffect(() => {
    if (page > 1) {
      load(page, query, module, from, to, user ? Number(user) : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Activity Log"
        description="A running log of actions taken across the system, newest first."
      />

      <Panel>
        <PanelHeader title="Events" hint="Filter by module, text or time window." />
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search description or resource…"
          />
          <FilterSelect
            value={module}
            onChange={setModule}
            options={MODULES.map((m) => ({ value: m, label: titleCase(m) }))}
            label="MODULE"
          />
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
              className="h-8 w-[8.5rem] text-[12px]"
            />
            <span className="text-[11px] text-subtle">→</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
              className="h-8 w-[8.5rem] text-[12px]"
            />
          </div>
          <ResultCount shown={items.length} total={total} noun="events" />
        </Toolbar>

        {loading && items.length === 0 ? (
          <RowsSkeleton rows={6} />
        ) : items.length === 0 ? (
          <EmptyState title="No activity" description="Nothing matches these filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    When
                  </th>
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    Module
                  </th>
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    Action
                  </th>
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    Description
                  </th>
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    User ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    onClick={() => setDetail(row)}
                    onKeyDown={(e) => e.key === "Enter" && setDetail(row)}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-elevated/70"
                  >
                    <td className="mono px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {dateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status="neutral" label={titleCase(row.module)} />
                    </td>
                    <td className="mono px-4 py-2.5 text-xs text-foreground">{row.action}</td>
                    <td className="max-w-[22rem] truncate px-4 py-2.5 text-xs text-muted-foreground">
                      {row.description || "—"}
                    </td>
                    <td className="mono px-4 py-2.5 text-xs text-subtle">
                      {row.user_id != null ? `#${row.user_id}` : "system"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <p className="mono text-[11px] text-subtle">
              {total} events · page {page} / {pageCount}
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                aria-label="Previous page"
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                aria-label="Next page"
                disabled={page >= pageCount || loading}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Panel>

      <Dialog open={detail !== null} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {detail ? `${titleCase(detail.module)} · ${detail.action}` : "Event"}
            </DialogTitle>
            <DialogDescription>{detail ? dateTime(detail.created_at) : ""}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="grid gap-2.5 text-[13px]">
              <div>
                <p className="label-tech">Description</p>
                <p className="mt-0.5 text-foreground">{detail.description || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="label-tech">Module</p>
                  <p className="mt-0.5 text-muted-foreground">{titleCase(detail.module)}</p>
                </div>
                <div>
                  <p className="label-tech">Action</p>
                  <p className="mono mt-0.5 text-muted-foreground">{detail.action}</p>
                </div>
                <div>
                  <p className="label-tech">Record</p>
                  <p className="mono mt-0.5 text-muted-foreground">{detail.record_id || "—"}</p>
                </div>
                <div>
                  <p className="label-tech">Branch</p>
                  <p className="mono mt-0.5 text-muted-foreground">
                    {detail.branch_id != null ? `#${detail.branch_id}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="label-tech">Actor</p>
                  <p className="mono mt-0.5 text-muted-foreground">
                    {detail.user_id != null ? `#${detail.user_id}` : "system"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
