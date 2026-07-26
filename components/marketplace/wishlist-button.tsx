"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { isInWishlist, toggleWishlistItem, WISHLIST_STORAGE_KEY } from "@/lib/wishlist/wishlist-store";
import { recordEngagementEvent } from "@/lib/engagement/engagement-store";

export function WishlistButton({ productSlug }: { productSlug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(productSlug));

    function handleStorage(event: StorageEvent) {
      if (event.key === WISHLIST_STORAGE_KEY || event.key === null) setSaved(isInWishlist(productSlug));
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [productSlug]);

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "absolute right-2 top-2 rounded-full bg-card/90 p-1.5 text-foreground shadow transition-opacity focus-visible:opacity-100 group-hover:opacity-100",
        saved ? "opacity-100" : "opacity-0",
      )}
      onClick={(event) => {
        event.preventDefault();
        const nowSaved = toggleWishlistItem(productSlug);
        setSaved(nowSaved);
        if (nowSaved) recordEngagementEvent(productSlug, "WISHLIST");
      }}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-sale text-sale")} />
    </button>
  );
}
