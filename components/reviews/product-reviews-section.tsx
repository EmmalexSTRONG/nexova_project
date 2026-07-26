"use client";

import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingBreakdown } from "@/components/marketplace/rating-breakdown";
import { getDisplayReviewsForProduct, getRatingSummaryForProduct } from "@/lib/reviews/aggregate";
import { toggleHelpful, toggleLike } from "@/lib/reviews/engagement-store";
import { getVoterId } from "@/lib/reviews/voter-id";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";

export function ProductReviewsSection({
  productSlug,
  shopSlug,
  fallbackRating,
  fallbackReviewCount,
  defaultName,
  defaultEmail,
}: {
  productSlug: string;
  shopSlug: string;
  fallbackRating: number;
  fallbackReviewCount: number;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [reviews, setReviews] = useState<ReturnType<typeof getDisplayReviewsForProduct>>([]);
  const [summary, setSummary] = useState<ReturnType<typeof getRatingSummaryForProduct> | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  function refresh() {
    const nextReviews = getDisplayReviewsForProduct(productSlug);
    setReviews(nextReviews);
    // Pass the list we just fetched so the summary doesn't re-run the same
    // store read + engagement lookups a second time.
    setSummary(getRatingSummaryForProduct(productSlug, fallbackRating, fallbackReviewCount, nextReviews));
  }

  useEffect(() => {
    refresh();
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug]);

  function handleToggleLike(reviewId: string) {
    toggleLike(reviewId, getVoterId());
    refresh();
  }

  function handleToggleHelpful(reviewId: string) {
    toggleHelpful(reviewId, getVoterId());
    refresh();
  }

  return (
    <section id="reviews" className="scroll-mt-24 mt-12 border-t pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Reviews & ratings</h2>
        {!isWriting && (
          <Button size="sm" variant="outline" onClick={() => setIsWriting(true)}>
            <PenLine className="h-3.5 w-3.5" />
            Write a review
          </Button>
        )}
      </div>

      <div className="mt-4 rounded-lg border bg-card p-5">
        <RatingBreakdown
          rating={summary?.average ?? fallbackRating}
          total={summary?.total ?? fallbackReviewCount}
          counts={summary?.counts ?? [0, 0, 0, 0, 0]}
        />
      </div>

      {isWriting && (
        <div className="mt-4">
          <ReviewForm
            productSlug={productSlug}
            shopSlug={shopSlug}
            defaultName={defaultName}
            defaultEmail={defaultEmail}
            onCancel={() => setIsWriting(false)}
            onSubmitted={() => {
              setIsWriting(false);
              refresh();
            }}
          />
        </div>
      )}

      {isLoaded && reviews.length > 0 && (
        <div className="mt-4 rounded-lg border bg-card px-5">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onToggleLike={() => handleToggleLike(review.id)}
              onToggleHelpful={() => handleToggleHelpful(review.id)}
            />
          ))}
        </div>
      )}

      {isLoaded && reviews.length === 0 && !isWriting && (
        <p className="mt-4 text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience with this product.
        </p>
      )}
    </section>
  );
}
