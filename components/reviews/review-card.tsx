"use client";

import { useState } from "react";
import { BadgeCheck, Heart, MessageSquare, Store, ThumbsUp } from "lucide-react";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DisplayReview } from "@/lib/reviews/types";
import { ReviewPhotoLightbox } from "./review-photo-lightbox";

const AVATAR_TONES = [
  "bg-amber-200 text-amber-900",
  "bg-rose-200 text-rose-900",
  "bg-emerald-200 text-emerald-900",
  "bg-sky-200 text-sky-900",
  "bg-violet-200 text-violet-900",
];

function toneForName(name: string): string {
  const seed = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_TONES[seed % AVATAR_TONES.length];
}

export function ReviewCard({
  review,
  onToggleLike,
  onToggleHelpful,
  canReply = false,
  onSubmitReply,
}: {
  review: DisplayReview;
  onToggleLike?: () => void;
  onToggleHelpful?: () => void;
  canReply?: boolean;
  onSubmitReply?: (text: string) => void;
}) {
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const initials = review.customerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const lightboxPhoto = review.photos.find((photo) => photo.id === lightboxPhotoId);

  function handleSubmitReply() {
    const trimmed = replyText.trim();
    if (!trimmed || !onSubmitReply) return;
    onSubmitReply(trimmed);
    setIsReplying(false);
    setReplyText("");
  }

  return (
    <div className="flex gap-3 border-b py-4 last:border-b-0">
      <Avatar className="shrink-0">
        <AvatarFallback className={toneForName(review.customerName)}>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-medium">
            {review.customerName}
            {review.location && <span className="font-normal text-muted-foreground"> · {review.location}</span>}
          </p>
          <span className="text-xs text-muted-foreground">{review.createdAtLabel}</span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StarRating rating={review.rating} />
          {review.verifiedPurchase && (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified purchase
            </span>
          )}
        </div>

        {review.title && <p className="mt-2 text-sm font-semibold">{review.title}</p>}
        <p className="mt-1 text-sm leading-relaxed text-foreground">{review.text}</p>

        {review.photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {review.photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.dataUrl}
                alt="Review photo"
                loading="lazy"
                onClick={() => setLightboxPhotoId(photo.id)}
                className="h-16 w-16 cursor-pointer rounded-md border object-cover transition-opacity hover:opacity-80"
              />
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleLike}
            disabled={!onToggleLike}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              review.likedByMe ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", review.likedByMe && "fill-primary")} />
            Like{review.likeCount > 0 ? ` (${review.likeCount})` : ""}
          </button>
          <button
            type="button"
            onClick={onToggleHelpful}
            disabled={!onToggleHelpful}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              review.markedHelpfulByMe ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", review.markedHelpfulByMe && "fill-primary")} />
            Helpful{review.helpfulCount > 0 ? ` (${review.helpfulCount})` : ""}
          </button>
          {canReply && !review.sellerReply && !isReplying && (
            <button
              type="button"
              onClick={() => setIsReplying(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Reply
            </button>
          )}
        </div>

        {review.sellerReply && (
          <div className="mt-3 rounded-md border bg-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Store className="h-3.5 w-3.5" />
              Reply from {review.sellerReply.shopName}
              <span className="font-normal text-muted-foreground">· {review.sellerReply.repliedAt}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{review.sellerReply.text}</p>
          </div>
        )}

        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a public reply to this review..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitReply} disabled={!replyText.trim()}>
                Post reply
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {lightboxPhoto && <ReviewPhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhotoId(null)} />}
    </div>
  );
}
