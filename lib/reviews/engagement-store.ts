import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { ReviewEngagement, SellerReply } from "./types";

// Keyed by review id (either a seed review's synthetic "product-{mockId}" id
// or a submitted review's "review-{REV-...}" id — see aggregate.ts) so likes,
// helpful votes, and seller replies work uniformly across both origins.
export const REVIEW_ENGAGEMENT_STORAGE_KEY = "nexora:review-engagement:v1";
const store = createRecordStore<ReviewEngagement>(REVIEW_ENGAGEMENT_STORAGE_KEY);

const EMPTY_ENGAGEMENT: ReviewEngagement = { likes: [], helpfulVotes: [] };

export function getEngagement(reviewId: string): ReviewEngagement {
  return store.readAll()[reviewId] ?? EMPTY_ENGAGEMENT;
}

// For call sites that need engagement for many reviews at once (e.g.
// rendering a whole review list) — parses the store once instead of once
// per review, which getEngagement() would otherwise do if called in a loop.
export function getAllEngagement(): Record<string, ReviewEngagement> {
  return store.readAll();
}

export function engagementFor(all: Record<string, ReviewEngagement>, reviewId: string): ReviewEngagement {
  return all[reviewId] ?? EMPTY_ENGAGEMENT;
}

export function toggleLike(reviewId: string, voterId: string): ReviewEngagement {
  const all = store.readAll();
  const current = all[reviewId] ?? { likes: [], helpfulVotes: [] };
  const likes = current.likes.includes(voterId)
    ? current.likes.filter((id) => id !== voterId)
    : [...current.likes, voterId];
  const updated: ReviewEngagement = { ...current, likes };
  all[reviewId] = updated;
  store.writeAll(all);
  return updated;
}

export function toggleHelpful(reviewId: string, voterId: string): ReviewEngagement {
  const all = store.readAll();
  const current = all[reviewId] ?? { likes: [], helpfulVotes: [] };
  const helpfulVotes = current.helpfulVotes.includes(voterId)
    ? current.helpfulVotes.filter((id) => id !== voterId)
    : [...current.helpfulVotes, voterId];
  const updated: ReviewEngagement = { ...current, helpfulVotes };
  all[reviewId] = updated;
  store.writeAll(all);
  return updated;
}

export function setSellerReply(reviewId: string, reply: SellerReply): ReviewEngagement {
  const all = store.readAll();
  const current = all[reviewId] ?? { likes: [], helpfulVotes: [] };
  const updated: ReviewEngagement = { ...current, sellerReply: reply };
  all[reviewId] = updated;
  store.writeAll(all);
  return updated;
}
