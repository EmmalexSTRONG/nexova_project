"use client";

import { useMemo, useState } from "react";

// Client-side "load more" pagination: caps what renders at once for lists
// that can grow without bound now that admins/vendors can add to them
// freely (blog posts, flash-sale deal products, per-category catalogs).
// Newest-first lists stay correct as items are added, since a prepended
// item lands inside the existing visible window rather than past it.
//
// `announcement` is meant for a visually-hidden aria-live region — clicking
// "Load more" doesn't move keyboard focus or shift the viewport, so without
// it a screen reader user gets no signal that anything happened.
export function usePagedList<T>(items: T[], pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [announcement, setAnnouncement] = useState("");
  const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  function loadMore() {
    const added = Math.min(pageSize, items.length - visibleCount);
    setVisibleCount((count) => count + pageSize);
    setAnnouncement(`${added} more item${added === 1 ? "" : "s"} loaded`);
  }

  return { visible, hasMore, loadMore, announcement };
}
