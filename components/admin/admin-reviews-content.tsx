"use client";

import { useEffect, useState } from "react";
import { Camera, MessageSquare, ThumbsUp } from "lucide-react";
import { shopReviews, productReviews, reviews as homepageReviews } from "@/lib/data";
import { getHiddenReviewIds, setReviewHidden } from "@/lib/admin/moderation-store";
import { getAllSubmittedReviews } from "@/lib/reviews/review-store";
import { engagementFor, getAllEngagement } from "@/lib/reviews/engagement-store";
import { seedReviewModerationId, submittedReviewModerationId } from "@/lib/reviews/aggregate";
import type { ReviewEngagement } from "@/lib/reviews/types";
import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminLoadingState } from "./admin-loading-state";

interface ReviewRow {
  id: string;
  source: "Shop" | "Product" | "Homepage" | "Submitted";
  context: string;
  author: string;
  rating: number;
  text: string;
  photoCount: number;
  likeCount: number;
  helpfulCount: number;
  hasReply: boolean;
}

function buildRows(allEngagement: Record<string, ReviewEngagement>): ReviewRow[] {
  const shopRows: ReviewRow[] = shopReviews.map((r) => ({
    id: `shop-${r.id}`,
    source: "Shop",
    context: r.shopSlug,
    author: r.customerName,
    rating: r.rating,
    text: r.text,
    photoCount: 0,
    likeCount: 0,
    helpfulCount: 0,
    hasReply: false,
  }));
  const productRows: ReviewRow[] = productReviews.map((r) => {
    const engagement = engagementFor(allEngagement, seedReviewModerationId(r.id));
    return {
      id: seedReviewModerationId(r.id),
      source: "Product",
      context: r.productSlug,
      author: r.customerName,
      rating: r.rating,
      text: r.text,
      photoCount: 0,
      likeCount: engagement.likes.length,
      helpfulCount: engagement.helpfulVotes.length,
      hasReply: Boolean(engagement.sellerReply),
    };
  });
  const homepageRows: ReviewRow[] = homepageReviews.map((r) => ({
    id: `homepage-${r.id}`,
    source: "Homepage",
    context: r.productName,
    author: r.customerName,
    rating: r.rating,
    text: r.text,
    photoCount: 0,
    likeCount: 0,
    helpfulCount: 0,
    hasReply: false,
  }));
  const submittedRows: ReviewRow[] = getAllSubmittedReviews().map((r) => {
    const engagement = engagementFor(allEngagement, submittedReviewModerationId(r.id));
    return {
      id: submittedReviewModerationId(r.id),
      source: "Submitted",
      context: r.productSlug,
      author: r.customerName,
      rating: r.rating,
      text: r.text,
      photoCount: r.photos.length,
      likeCount: engagement.likes.length,
      helpfulCount: engagement.helpfulVotes.length,
      hasReply: Boolean(engagement.sellerReply),
    };
  });
  return [...submittedRows, ...shopRows, ...productRows, ...homepageRows];
}

export function AdminReviewsContent() {
  const [hiddenIds, setHiddenIds] = useState<Set<string> | null>(null);
  const [rows, setRows] = useState<ReviewRow[] | undefined>(undefined);

  useEffect(() => {
    setHiddenIds(getHiddenReviewIds());
    setRows(buildRows(getAllEngagement()));
  }, []);

  function toggleHidden(id: string) {
    const isHidden = hiddenIds?.has(id) ?? false;
    setReviewHidden(id, !isHidden);
    setHiddenIds(getHiddenReviewIds());
  }

  if (rows === undefined) {
    return <AdminLoadingState label="Loading reviews..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} reviews across shops, products, the homepage, and customer submissions. Hiding a review
          removes it from customer-facing pages immediately.
        </p>
      </div>

      {rows.length === 0 ? (
        <AdminEmptyState icon={MessageSquare} title="No reviews yet" />
      ) : (
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Engagement</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => {
              const hidden = hiddenIds?.has(row.id) ?? false;
              return (
                <tr key={row.id} className={hidden ? "opacity-50" : "transition-colors hover:bg-muted/30"}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.author}</p>
                    <p className="text-xs text-muted-foreground">{row.context}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{row.source}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={row.rating} />
                  </td>
                  <td className="px-4 py-3 max-w-md text-muted-foreground">
                    <p className="line-clamp-2">{row.text}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      {row.photoCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5" />
                          {row.photoCount}
                        </span>
                      )}
                      {row.helpfulCount > 0 && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {row.helpfulCount}
                        </span>
                      )}
                      {row.hasReply && (
                        <span className="flex items-center gap-1 text-primary">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Replied
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleHidden(row.id)}>
                      {hidden ? "Unhide" : "Hide"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
