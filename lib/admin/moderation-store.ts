import { createListStore } from "@/lib/shared/local-storage-store";

// Reviews themselves are static mock content (no live database), so
// moderation is modeled as a set of hidden review ids overlaid on top of
// that content — genuinely toggling what would be shown to customers if
// review rendering checked this store too.
const store = createListStore<string>("nexora:admin-hidden-reviews:v1");

export function getHiddenReviewIds(): Set<string> {
  return new Set(store.readAll());
}

export function setReviewHidden(reviewId: string, hidden: boolean): void {
  const ids = new Set(store.readAll());
  if (hidden) ids.add(reviewId);
  else ids.delete(reviewId);
  store.writeAll([...ids]);
}
