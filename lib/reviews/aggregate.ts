import { getProductReviews as getSeedProductReviews } from "@/lib/data";
import { getHiddenReviewIds } from "@/lib/admin/moderation-store";
import { estimateRatingDistribution } from "@/lib/rating";
import { getSubmittedReviewsByProductSlug } from "./review-store";
import { engagementFor, getAllEngagement } from "./engagement-store";
import { getVoterId } from "./voter-id";
import type { DisplayReview } from "./types";

// Prefix scheme shared with admin-reviews-content.tsx's moderation ids, so
// hide/unhide toggled from the admin table actually removes the review from
// customer-facing rendering (previously a no-op — see review-system task).
export function seedReviewModerationId(mockReviewId: string): string {
  return `product-${mockReviewId}`;
}

export function submittedReviewModerationId(reviewId: string): string {
  return `review-${reviewId}`;
}

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

export function getDisplayReviewsForProduct(productSlug: string): DisplayReview[] {
  const hiddenIds = getHiddenReviewIds();
  const voterId = getVoterId();
  // Read the engagement store once instead of once per review — getEngagement()
  // parses the whole blob on every call, which adds up across a full review list.
  const allEngagement = getAllEngagement();

  const seedReviews: DisplayReview[] = getSeedProductReviews(productSlug).map((review) => {
    const id = seedReviewModerationId(review.id);
    const engagement = engagementFor(allEngagement, id);
    return {
      id,
      productSlug: review.productSlug,
      customerName: review.customerName,
      location: review.location,
      rating: review.rating,
      text: review.text,
      photos: [],
      createdAtLabel: review.createdAtLabel,
      sortKey: 0,
      verifiedPurchase: review.verifiedPurchase,
      likeCount: engagement.likes.length,
      helpfulCount: engagement.helpfulVotes.length,
      likedByMe: engagement.likes.includes(voterId),
      markedHelpfulByMe: engagement.helpfulVotes.includes(voterId),
      sellerReply: engagement.sellerReply,
    };
  });

  const submittedReviews: DisplayReview[] = getSubmittedReviewsByProductSlug(productSlug).map((review) => {
    const id = submittedReviewModerationId(review.id);
    const engagement = engagementFor(allEngagement, id);
    return {
      id,
      productSlug: review.productSlug,
      shopSlug: review.shopSlug,
      customerName: review.customerName,
      rating: review.rating,
      title: review.title,
      text: review.text,
      photos: review.photos,
      createdAtLabel: formatRelativeDate(review.createdAt),
      sortKey: new Date(review.createdAt).getTime(),
      verifiedPurchase: review.verifiedPurchase,
      likeCount: engagement.likes.length,
      helpfulCount: engagement.helpfulVotes.length,
      likedByMe: engagement.likes.includes(voterId),
      markedHelpfulByMe: engagement.helpfulVotes.includes(voterId),
      sellerReply: engagement.sellerReply,
    };
  });

  return [...submittedReviews, ...seedReviews]
    .filter((review) => !hiddenIds.has(review.id))
    .sort((a, b) => b.sortKey - a.sortKey);
}

export function getRatingSummaryForProduct(
  productSlug: string,
  fallbackRating: number,
  fallbackCount: number,
  // Callers that already fetched the review list for this product (the
  // common case — the same list is rendered right below the summary) should
  // pass it here rather than letting this function re-run the whole fetch.
  precomputedReviews?: DisplayReview[],
): { average: number; total: number; counts: number[] } {
  const displayReviews = precomputedReviews ?? getDisplayReviewsForProduct(productSlug);
  if (displayReviews.length === 0) {
    return { average: fallbackRating, total: fallbackCount, counts: estimateRatingDistribution(fallbackRating, fallbackCount) };
  }

  const counts = [0, 0, 0, 0, 0]; // [5-star, 4-star, 3-star, 2-star, 1-star]
  let sum = 0;
  for (const review of displayReviews) {
    const stars = Math.min(5, Math.max(1, Math.round(review.rating)));
    counts[5 - stars] += 1;
    sum += review.rating;
  }

  return { average: sum / displayReviews.length, total: displayReviews.length, counts };
}
