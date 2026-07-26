"use client";

import { useEffect } from "react";

// Keeps a section's data current without a manual page refresh. Two
// mechanisms, because one alone isn't enough in a backend-less, localStorage
// app:
//  - a `storage` listener, which the browser fires natively in every OTHER
//    tab the moment a watched key is written (an admin edit in one tab
//    reaches an already-open storefront tab for free);
//  - an optional poll, for state that's a pure function of wall-clock time —
//    a flash sale's start/end, a scheduled post's publish time — where
//    nothing ever calls `localStorage.setItem` at the moment the transition
//    actually happens, so no storage event would ever fire for it.
// Shared poll cadences, picked by how visibly stale each kind of data gets:
// a flash sale flipping live/expired matters within seconds; a scheduled
// post publishing is fine within a minute; a 7-day ranking window rolling
// over doesn't need better than occasional freshness.
export const LIVE_REFRESH_FAST_MS = 30_000;
export const LIVE_REFRESH_MEDIUM_MS = 60_000;
export const LIVE_REFRESH_SLOW_MS = 5 * 60_000;

export function useLiveRefresh(load: () => void, watchKeys: string[], pollMs?: number): void {
  useEffect(() => {
    load();

    function handleStorage(event: StorageEvent) {
      if (event.key === null || watchKeys.includes(event.key)) load();
    }
    window.addEventListener("storage", handleStorage);

    const interval = pollMs ? setInterval(load, pollMs) : undefined;

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (interval) clearInterval(interval);
    };
    // watchKeys/pollMs are treated as stable per call site; load is recreated
    // each render but only ever invoked via the listeners set up here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, watchKeys);
}
