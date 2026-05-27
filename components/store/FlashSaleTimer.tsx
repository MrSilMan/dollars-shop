"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeToMidnight(): TimeLeft {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    hours:   Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function FlashSaleTimer() {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeToMidnight());
    const id = setInterval(() => setTime(getTimeToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div className="flex items-center gap-1 text-white" aria-live="polite" aria-label="Flash sale countdown">
      <span className="text-xs text-white/70 mr-0.5">Ends in</span>
      {([time.hours, time.minutes, time.seconds] as [number, number, number]).map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-black/25 rounded px-1.5 py-0.5 font-mono font-black text-sm tabular-nums">
            {pad(val)}
          </span>
          {i < 2 && <span className="font-black text-sm leading-none">:</span>}
        </span>
      ))}
    </div>
  );
}
