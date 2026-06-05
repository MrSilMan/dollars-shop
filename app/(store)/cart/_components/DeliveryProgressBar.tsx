"use client";

interface Props {
  percent: number;
}

export function DeliveryProgressBar({ percent }: Props) {
  return (
    <div className="h-1.5 bg-(--color-border) rounded-full mt-2 overflow-hidden">
      <div
        className="h-full bg-(--color-accent) rounded-full transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
