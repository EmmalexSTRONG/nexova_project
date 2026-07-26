"use client";

import { useEffect, useState } from "react";
import { MessageSquareOff } from "lucide-react";
import { getVendorProducts } from "@/lib/data";
import { getDisplayReviewsForProduct } from "@/lib/reviews/aggregate";
import { setSellerReply, toggleHelpful, toggleLike } from "@/lib/reviews/engagement-store";
import { getVoterId } from "@/lib/reviews/voter-id";
import type { DisplayReview } from "@/lib/reviews/types";
import { ReviewCard } from "@/components/reviews/review-card";

interface ShopReviewRow {
  productName: string;
  productSlug: string;
  review: DisplayReview;
}

export function VendorReviewsContent({ shopSlug, shopName }: { shopSlug: string; shopName: string }) {
  const [rows, setRows] = useState<ShopReviewRow[] | undefined>(undefined);

  function refresh() {
    const shopProducts = getVendorProducts(shopSlug);
    const nextRows: ShopReviewRow[] = shopProducts.flatMap((product) =>
      getDisplayReviewsForProduct(product.slug).map((review) => ({
        productName: product.name,
        productSlug: product.slug,
        review,
      })),
    );
    nextRows.sort((a, b) => b.review.sortKey - a.review.sortKey);
    setRows(nextRows);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopSlug]);

  function handleReply(reviewId: string, text: string) {
    setSellerReply(reviewId, { text, repliedAt: "Just now", shopName });
    refresh();
  }

  function handleToggleLike(reviewId: string) {
    toggleLike(reviewId, getVoterId());
    refresh();
  }

  function handleToggleHelpful(reviewId: string) {
    toggleHelpful(reviewId, getVoterId());
    refresh();
  }

  if (rows === undefined) {
    return <p className="text-sm text-muted-foreground">Loading reviews...</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <MessageSquareOff className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">No reviews yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Reviews customers leave on your products will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card px-5">
      {rows.map(({ review, productName, productSlug }) => (
        <div key={review.id}>
          <a
            href={`/products/${productSlug}#reviews`}
            className="mt-4 block text-xs font-medium text-primary hover:underline"
          >
            {productName}
          </a>
          <ReviewCard
            review={review}
            onToggleLike={() => handleToggleLike(review.id)}
            onToggleHelpful={() => handleToggleHelpful(review.id)}
            canReply
            onSubmitReply={(text) => handleReply(review.id, text)}
          />
        </div>
      ))}
    </div>
  );
}
