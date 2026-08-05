import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export type CardColor = "green" | "blue" | "amber" | "red" | "teal";

const colorMap: Record<
  CardColor,
  { iconBg: string; iconText: string; bar: string }
> = {
  green:  { iconBg: "bg-green-50",  iconText: "text-green-800",  bar: "from-green-800" },
  blue:   { iconBg: "bg-blue-50",   iconText: "text-blue-600",   bar: "from-blue-500" },
  amber:  { iconBg: "bg-amber-50",  iconText: "text-amber-600",  bar: "from-amber-500" },
  red:    { iconBg: "bg-red-50",    iconText: "text-red-500",    bar: "from-red-500" },
  teal:   { iconBg: "bg-teal-50",   iconText: "text-teal-700",   bar: "from-teal-500" },
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
    changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : null;

  const changeCls =
    changeType === "up"
      ? "text-emerald-700 bg-emerald-50"
      : changeType === "down"
        ? "text-rose-600 bg-rose-50"
        : "text-(--color-text-muted) bg-(--color-surface-alt)";

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-(--color-border) px-3.5 py-3.5 sm:px-4 sm:py-4 flex flex-col gap-2.5 hover:shadow-md transition-shadow duration-200">
      {/* Thin top color bar */}
      <div className={`absolute inset-x-0 top-0 h-0.75 bg-linear-to-r ${bar} to-transparent`} />

      {/* Icon + label — label sits next to the icon so it never fights the value */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={16} className={iconText} />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted) truncate">
          {title}
        </p>
      </div>

      {/* Value */}
      <p className="text-2xl 2xl:text-[26px] font-bold leading-none tracking-tight tabular-nums truncate">
        {value}
      </p>

      {/* Badge — single line, clipped rather than wrapped in tight columns */}
      {change && (
        <span
          title={change}
          className={`mt-auto inline-flex w-fit max-w-full items-center gap-1 text-[11px] font-semibold px-2 py-0.75 rounded-full whitespace-nowrap ${changeCls}`}
        >
          {ChangeIcon ? (
            <ChangeIcon size={11} className="shrink-0" />
          ) : (
            <span className="w-1.25 h-1.25 rounded-full bg-current opacity-60 shrink-0" />
          )}
          <span className="truncate">{change}</span>
        </span>
      )}
    </div>
  );
}
