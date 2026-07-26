import { Quote } from "lucide-react";
import type { MockReview } from "@/lib/data";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AVATAR_TONES = [
  "bg-amber-200 text-amber-900",
  "bg-rose-200 text-rose-900",
  "bg-emerald-200 text-emerald-900",
  "bg-sky-200 text-sky-900",
  "bg-violet-200 text-violet-900",
];

export function ReviewCard({ review }: { review: MockReview }) {
  const initials = review.customerName
    .split(" ")
    .map((part) => part[0])
    .join("");
  const tone = AVATAR_TONES[review.seed % AVATAR_TONES.length];

  return (
    <div className="flex h-full w-full flex-col gap-4 rounded-lg border bg-card p-5">
      <Quote className="h-6 w-6 text-primary" strokeWidth={1.5} />
      <p className="flex-1 text-sm leading-relaxed text-foreground">{review.text}</p>
      <div>
        <StarRating rating={review.rating} />
        <p className="mt-1 text-xs text-muted-foreground">On {review.productName}</p>
      </div>
      <div className="flex items-center gap-3 border-t pt-4">
        <Avatar>
          <AvatarFallback className={tone}>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{review.customerName}</p>
          <p className="text-xs text-muted-foreground">{review.location}</p>
        </div>
      </div>
    </div>
  );
}
