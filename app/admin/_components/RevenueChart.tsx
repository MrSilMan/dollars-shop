"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4251C" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#D4251C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-ZW", { month: "short", day: "numeric" })} />
        <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          formatter={(v) => {
            const num = typeof v === "number" ? v : 0;
            return [`$${num.toFixed(2)}`, "Revenue"] as [string, string];
          }}
          labelFormatter={(l) => new Date(l as string).toLocaleDateString("en-ZW", { dateStyle: "medium" })}
        />
        <Area type="monotone" dataKey="revenue" stroke="#D4251C" strokeWidth={2} fill="url(#revenueGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
