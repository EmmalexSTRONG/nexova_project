import type { MockShopReview } from "@/lib/data";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AVATAR_TONES = [
  "bg-amber-200 text-amber-900",
  "bg-rose-200 text-rose-900",
  "bg-emerald-200 text-emerald-900",
  "bg-sky-200 text-sky-900",
  "bg-violet-200 text-violet-900",
];

export function ShopReviewCard({ review }: { review: MockShopReview }) {
  const initials = review.customerName
    .split(" ")
    .map((part) => part[0])
    .join("");
  const tone = AVATAR_TONES[review.seed % AVATAR_TONES.length];

  return (
    <div className="flex gap-3 border-b py-4 last:border-b-0">
      <Avatar className="shrink-0">
        <AvatarFallback className={tone}>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-medium">
            {review.customerName} <span className="font-normal text-muted-foreground">· {review.location}</span>
          </p>
          <span className="text-xs text-muted-foreground">{review.createdAtLabel}</span>
        </div>
        <StarRating rating={review.rating} className="mt-1" />
        <p className="mt-2 text-sm leading-relaxed text-foreground">{review.text}</p>
      </div>
    </div>
  );
}
