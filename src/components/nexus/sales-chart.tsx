import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PanelHeader } from "./primitives";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

type Point = { label: string; revenue: number; orders: number };

const ranges = ["Today", "7 days", "30 days"] as const;

export function SalesChart({ daily, hourly }: { daily: Point[]; hourly: Point[] }) {
  const [range, setRange] = useState<(typeof ranges)[number]>("7 days");
  const data = range === "Today" ? hourly : range === "7 days" ? daily.slice(-7) : daily;
  const revenue = data.reduce((s, d) => s + d.revenue, 0);
  const orders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <div>
      <PanelHeader
        title="Sales performance"
        hint={`${money(revenue)} revenue · ${orders} orders`}
        action={
          <div role="tablist" aria-label="Range" className="flex rounded-md border border-border bg-background p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={cn(
                  "mono rounded px-2 py-1 text-[10.5px] tracking-wide uppercase transition-colors",
                  range === r ? "bg-elevated text-foreground" : "text-subtle hover:text-muted-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />
      <div className="h-[248px] px-2 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-subtle)" }} stroke="var(--color-border)" tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-subtle)" }}
              stroke="var(--color-border)"
              tickLine={false}
              width={54}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number, name) => (name === "revenue" ? money(v) : v)}
            />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-info)" strokeWidth={1.8} fill="url(#revFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
