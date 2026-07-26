"use client";

import { useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateReviewId, hasCustomerReviewedProduct, saveReview } from "@/lib/reviews/review-store";
import { hasVerifiedPurchase } from "@/lib/reviews/verified-purchase";
import type { ReviewPhoto } from "@/lib/reviews/types";
import { StarRatingInput } from "./star-rating-input";
import { ReviewPhotoUpload } from "./review-photo-upload";

const MIN_TEXT_LENGTH = 10;

export function ReviewForm({
  productSlug,
  shopSlug,
  defaultName,
  defaultEmail,
  onSubmitted,
  onCancel,
}: {
  productSlug: string;
  shopSlug: string;
  defaultName?: string;
  defaultEmail?: string;
  onSubmitted: () => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // hasVerifiedPurchase parses and sorts every order in the store — memoized
  // so typing in unrelated fields (title, text) doesn't re-trigger it.
  const verified = useMemo(() => (email ? hasVerifiedPurchase(email, productSlug) : false), [email, productSlug]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (text.trim().length < MIN_TEXT_LENGTH) {
      setError(`Please write at least ${MIN_TEXT_LENGTH} characters.`);
      return;
    }
    if (hasCustomerReviewedProduct(email, productSlug)) {
      setError("You've already reviewed this product.");
      return;
    }

    setIsSubmitting(true);
    saveReview({
      id: generateReviewId(),
      productSlug,
      shopSlug,
      customerName: name.trim(),
      customerEmail: email.trim(),
      rating,
      title: title.trim() || undefined,
      text: text.trim(),
      photos,
      createdAt: new Date().toISOString(),
      verifiedPurchase: verified,
    });
    setIsSubmitting(false);
    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-5">
      <div>
        <Label>Your rating</Label>
        <div className="mt-1.5">
          <StarRatingInput value={rating} onChange={setRating} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="review-name">Your name</Label>
          <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="review-email">Email</Label>
          <Input
            id="review-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
          />
          {verified && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
              <BadgeCheck className="h-3.5 w-3.5" />
              We found a matching order — this will show as a verified purchase.
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your review in a few words"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="review-text">Review</Label>
        <Textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you like or dislike? How did you use this product?"
          rows={4}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label>Photos (optional)</Label>
        <div className="mt-1.5">
          <ReviewPhotoUpload photos={photos} onChange={setPhotos} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post review"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
