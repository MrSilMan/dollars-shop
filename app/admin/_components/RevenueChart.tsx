"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-(--color-border) rounded-xl shadow-lg px-3 py-2.5">
      <p className="text-xs text-(--color-text-muted) mb-1">
        {new Date(label ?? "").toLocaleDateString("en-ZW", { dateStyle: "medium" })}
      </p>
      <p className="text-sm font-bold text-(--color-text-primary) price">
        ${Number(payload[0]?.value ?? 0).toFixed(2)}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A4D3A" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#1A4D3A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#EEF2F0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) =>
            new Date(v).toLocaleDateString("en-ZW", { month: "short", day: "numeric" })
          }
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#1A4D3A", strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#1A4D3A"
          strokeWidth={2.5}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#1A4D3A", strokeWidth: 2.5, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
