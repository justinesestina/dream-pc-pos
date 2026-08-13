import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RowsSkeleton } from "./primitives";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  align?: "left" | "right";
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  onRowClick,
  loading,
  empty,
  pageSize = 12,
  initialSort,
  dense,
}: {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: ReactNode;
  pageSize?: number;
  initialSort?: { key: string; dir: "asc" | "desc" };
  dense?: boolean;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(
    initialSort ?? null,
  );
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const get = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);

  if (loading) return <RowsSkeleton rows={6} />;
  if (rows.length === 0) return <>{empty}</>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {columns.map((c) => {
                const sortable = Boolean(c.sortValue);
                const isActive = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn(
                      "label-tech px-4 py-2.5 font-normal whitespace-nowrap",
                      c.align === "right" && "text-right",
                      c.className,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSort(
                            isActive
                              ? { key: c.key, dir: sort.dir === "asc" ? "desc" : "asc" }
                              : { key: c.key, dir: "asc" },
                          )
                        }
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                          isActive && "text-foreground",
                          c.align === "right" && "flex-row-reverse",
                        )}
                      >
                        {c.header}
                        {isActive &&
                          (sort.dir === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          ))}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter") onRowClick(row);
                      }
                    : undefined
                }
                className={cn(
                  "border-b border-border/60 transition-colors last:border-0",
                  onRowClick && "cursor-pointer hover:bg-elevated/70",
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 align-middle",
                      dense ? "py-2" : "py-2.5",
                      c.align === "right" && "text-right",
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <p className="mono text-[11px] text-subtle">
            {current * pageSize + 1}–{Math.min(sorted.length, (current + 1) * pageSize)} of{" "}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label="Previous page"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="mono px-1 text-[11px] text-muted-foreground">
              {current + 1} / {pageCount}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label="Next page"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
