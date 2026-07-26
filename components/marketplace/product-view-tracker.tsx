"use client";

import { useEffect } from "react";
import { recordEngagementEvent } from "@/lib/engagement/engagement-store";

// Invisible — just logs a real page-view event once per mount, feeding the
// "Trending this week" ranking. Rendered from the PDP server component.
export function ProductViewTracker({ productSlug }: { productSlug: string }) {
  useEffect(() => {
    recordEngagementEvent(productSlug, "VIEW");
  }, [productSlug]);

  return null;
}
