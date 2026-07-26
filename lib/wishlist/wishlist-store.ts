import { createListStore } from "@/lib/shared/local-storage-store";

export const WISHLIST_STORAGE_KEY = "nexora:wishlist:v1";
const store = createListStore<string>(WISHLIST_STORAGE_KEY);

export function getWishlistSlugs(): string[] {
  return store.readAll();
}

export function isInWishlist(productSlug: string): boolean {
  return store.readAll().includes(productSlug);
}

// Returns the item's new saved state, so callers can update UI immediately
// without a second read.
export function toggleWishlistItem(productSlug: string): boolean {
  const slugs = store.readAll();
  const index = slugs.indexOf(productSlug);
  if (index === -1) {
    slugs.push(productSlug);
    store.writeAll(slugs);
    return true;
  }
  slugs.splice(index, 1);
  store.writeAll(slugs);
  return false;
}
