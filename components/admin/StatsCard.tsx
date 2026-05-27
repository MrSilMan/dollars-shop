import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

export type CardColor = "green" | "blue" | "amber" | "red";

const colorMap: Record<
  CardColor,
  { iconBg: string; iconText: string; bar: string }
> = {
  green:  { iconBg: "bg-green-50",  iconText: "text-green-800",  bar: "from-green-800" },
  blue:   { iconBg: "bg-blue-50",   iconText: "text-blue-600",   bar: "from-blue-500" },
  amber:  { iconBg: "bg-amber-50",  iconText: "text-amber-600",  bar: "from-amber-500" },
  red:    { iconBg: "bg-red-50",    iconText: "text-red-500",    bar: "from-red-500" },
};

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color?: CardColor;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color = "green",
}: StatsCardProps) {
  const { iconBg, iconText, bar } = colorMap[color];

  const ChangeIcon =
    changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : Minus;

  const changeCls =
    changeType === "up"
      ? "text-emerald-600 bg-emerald-50"
      : changeType === "down"
        ? "text-rose-500 bg-rose-50"
        : "text-gray-400 bg-gray-100";

  return (
    <div className="bg-white rounded-2xl border border-(--color-border) p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
      {/* Thin top color bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.75 rounded-t-2xl bg-linear-to-r ${bar} to-transparent`} />

      {/* Icon + badge */}
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={20} className={iconText} />
        </div>
        {change && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${changeCls}`}>
            <ChangeIcon size={11} />
            {change}
          </span>
        )}
      </div>

      {/* Value + label */}
      <div>
        <p className="text-[26px] font-bold leading-tight tracking-tight truncate">{value}</p>
        <p className="text-sm text-(--color-text-muted) font-medium mt-0.5">{title}</p>
      </div>
    </div>
  );
}
