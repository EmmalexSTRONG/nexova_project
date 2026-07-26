"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Remaining {
  hours: number;
  minutes: number;
  seconds: number;
}

function getRemaining(target: number): Remaining {
  const diff = Math.max(0, target - Date.now());
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

export function CountdownTimer({
  targetTime,
  size = "sm",
  className,
}: {
  targetTime: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  // Starts null so server render and first client render match exactly
  // (both show the zeroed placeholder); the real countdown takes over
  // once mounted, avoiding a hydration mismatch on the current second.
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const target = new Date(targetTime).getTime();
    setRemaining(getRemaining(target));
    const interval = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const display = remaining ?? { hours: 0, minutes: 0, seconds: 0 };
  const isLg = size === "lg";

  return (
    <div className={cn("flex items-center", isLg ? "gap-2" : "gap-1.5", className)}>
      <TimeBox value={display.hours} label="hrs" size={size} />
      <span className={cn("pb-4 font-mono text-sale", isLg && "text-2xl")}>:</span>
      <TimeBox value={display.minutes} label="min" size={size} />
      <span className={cn("pb-4 font-mono text-sale", isLg && "text-2xl")}>:</span>
      <TimeBox value={display.seconds} label="sec" size={size} />
    </div>
  );
}

function TimeBox({ value, label, size }: { value: number; label: string; size: "sm" | "lg" }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "rounded-md bg-white/10 text-center font-mono font-bold tabular-nums text-ink-foreground",
          size === "sm" ? "min-w-[2.5rem] px-2 py-1 text-lg" : "min-w-[3.25rem] px-2.5 py-1.5 text-3xl",
        )}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">{label}</span>
    </div>
  );
}
