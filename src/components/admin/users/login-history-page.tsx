import { useCallback, useEffect, useRef, useState } from "react";
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
import { fetchGlobalLoginHistory, type AdminLoginHistoryRow } from "@/lib/api-client";
import { dateTime } from "@/lib/format";
import { deviceFromUA } from "./user-bits";

const PER_PAGE = 15;

export function LoginHistoryPage() {
  const { user } = useSearch({ from: "/_app/administration/users/login-history" });
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminLoginHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<AdminLoginHistoryRow | null>(null);
  const debounce = useRef<number | null>(null);

  const load = useCallback(
    (p: number, q: string, r: string, f: string, t: string, uid?: number) => {
      setLoading(true);
      fetchGlobalLoginHistory({
        search: q || undefined,
        result: r === "all" ? undefined : (r as "success" | "failed"),
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
    },
    [],
  );

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      setPage(1);
      load(1, query, resultFilter, from, to, user ? Number(user) : undefined);
    }, 350);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [load, query, resultFilter, from, to, user]);

  useEffect(() => {
    if (page > 1) {
      load(page, query, resultFilter, from, to, user ? Number(user) : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Login History"
        description="Every sign-in attempt across all accounts, from last week to today."
      />

      <Panel>
        <PanelHeader title="Attempts" hint="Filter by outcome or sign-in window." />
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search username, display name…"
          />
          <FilterSelect
            value={resultFilter}
            onChange={setResultFilter}
            options={[
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" },
            ]}
            label="RESULT"
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
          <ResultCount shown={items.length} total={total} noun="attempts" />
        </Toolbar>

        {loading && items.length === 0 ? (
          <RowsSkeleton rows={6} />
        ) : items.length === 0 ? (
          <EmptyState title="No attempts" description="Nothing matches these filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    When
                  </th>
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    User
                  </th>
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    IP
                  </th>
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    Result
                  </th>
                  <th scope="col" className="label-tech px-4 py-2.5 font-normal">
                    Reason
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
                      <span className="text-[13px] text-foreground">{row.display_name || "—"}</span>
                      {row.username && (
                        <span className="mono ml-1.5 text-[10.5px] text-subtle">
                          @{row.username}
                        </span>
                      )}
                    </td>
                    <td className="mono px-4 py-2.5 text-xs text-muted-foreground">{row.ip}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        status={row.result === "success" ? "ok" : "fail"}
                        label={row.result === "success" ? "Success" : "Failed"}
                      />
                    </td>
                    <td className="max-w-[16rem] truncate px-4 py-2.5 text-xs text-subtle">
                      {row.reason || "—"}
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
              {total} attempts · page {page} / {pageCount}
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
              {detail
                ? detail.display_name || detail.username || "Sign-in attempt"
                : "Sign-in attempt"}
            </DialogTitle>
            <DialogDescription>{detail ? dateTime(detail.created_at) : ""}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="grid gap-2.5 text-[13px]">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="label-tech">User</p>
                  <p className="mono mt-0.5 text-muted-foreground">{detail.username || "—"}</p>
                </div>
                <div>
                  <p className="label-tech">Display name</p>
                  <p className="mt-0.5 text-foreground">{detail.display_name || "—"}</p>
                </div>
                <div>
                  <p className="label-tech">IP address</p>
                  <p className="mono mt-0.5 text-muted-foreground">{detail.ip}</p>
                </div>
                <div>
                  <p className="label-tech">Result</p>
                  <div className="mt-1">
                    <StatusBadge
                      status={detail.result === "success" ? "ok" : "fail"}
                      label={detail.result === "success" ? "Success" : "Failed"}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="label-tech">Reason</p>
                  <p className="mt-0.5 text-foreground">{detail.reason || "No reason recorded."}</p>
                </div>
                <div className="col-span-2">
                  <p className="label-tech">Device</p>
                  <p className="mt-0.5 text-muted-foreground">{deviceFromUA(detail.user_agent)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
