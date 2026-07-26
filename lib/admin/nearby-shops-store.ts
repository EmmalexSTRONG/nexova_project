import { createListStore } from "@/lib/shared/local-storage-store";

// Admin merchandising override: shops pinned here always appear in the
// homepage "Shop Near You" section, regardless of the visitor's actual
// distance — useful for promoting a shop, and as a fallback list before a
// visitor grants (or if they deny) location access.
export const PINNED_NEARBY_SHOPS_STORAGE_KEY = "nexora:admin-pinned-nearby-shops:v1";
const store = createListStore<string>(PINNED_NEARBY_SHOPS_STORAGE_KEY);

export function getPinnedShopSlugs(): string[] {
  return store.readAll();
}

export function isShopPinnedNearby(shopSlug: string): boolean {
  return store.readAll().includes(shopSlug);
}

export function setShopPinnedNearby(shopSlug: string, pinned: boolean): void {
  const current = store.readAll();
  if (pinned) {
    if (!current.includes(shopSlug)) store.writeAll([...current, shopSlug]);
  } else {
    store.writeAll(current.filter((slug) => slug !== shopSlug));
  }
}
