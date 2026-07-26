import { Quote } from "lucide-react";
import type { MockReview } from "@/lib/data";
import { StarRating } from "@/components/shared/star-rating";
import { cn } from "@/lib/utils";

const AVATAR_TONES = [
  "bg-primary/20 text-primary",
  "bg-sale/20 text-sale",
  "bg-emerald-500/20 text-emerald-400",
  "bg-sky-500/20 text-sky-400",
  "bg-violet-500/20 text-violet-400",
];

export function ReviewMarqueeCard({ review }: { review: MockReview }) {
  const initials = review.customerName
    .split(" ")
    .map((part) => part[0])
    .join("");
  const tone = AVATAR_TONES[review.seed % AVATAR_TONES.length];

  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-ink p-5 sm:w-[360px]">
      <Quote className="h-6 w-6 text-primary" strokeWidth={1.5} />
      <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-ink-foreground/90">{review.text}</p>
      <div className="flex items-center justify-between gap-2">
        <StarRating rating={review.rating} tone="inverted" />
        <span className="truncate text-[11px] text-ink-muted">On {review.productName}</span>
      </div>
      <div className="flex items-center gap-3 border-t border-white/10 pt-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold", tone)}>
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-foreground">{review.customerName}</p>
          <p className="truncate text-xs text-ink-muted">{review.location}</p>
        </div>
      </div>
    </div>
  );
}
