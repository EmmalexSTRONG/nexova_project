"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// Always shown in Ghana's local time, regardless of the visitor's own device
// timezone — this is a Ghana-focused marketplace, so "now" should mean the
// same thing to everyone reading it (e.g. flash sale countdowns, "delivering
// across Ghana"). Renders nothing until mounted to avoid a server/client
// hydration mismatch, since the server has no reliable notion of "now" that
// matches the client's clock.
export function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return <span className={className} aria-hidden="true" />;
  }

  const date = now.toLocaleDateString("en-GB", {
    timeZone: "Africa/Accra",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = now.toLocaleTimeString("en-US", {
    timeZone: "Africa/Accra",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <span className={className}>
      <Clock className="h-3.5 w-3.5" />
      {date} · {time} GMT
    </span>
  );
}
