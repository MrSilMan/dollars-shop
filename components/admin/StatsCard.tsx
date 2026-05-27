import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color?: string;
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon, color = "var(--color-primary)" }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-(--color-border) p-5 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-(--color-text-muted)">{title}</p>
        <p className="text-2xl font-bold mt-0.5 truncate">{value}</p>
        {change && (
          <p className={`text-xs mt-1 font-medium ${changeType === "up" ? "text-(--color-success)" : changeType === "down" ? "text-(--color-primary)" : "text-(--color-text-muted)"}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
