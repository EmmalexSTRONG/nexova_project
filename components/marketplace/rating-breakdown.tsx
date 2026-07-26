import { StarRating } from "@/components/shared/star-rating";

export function RatingBreakdown({
  rating,
  total,
  counts,
}: {
  rating: number;
  total: number;
  counts: number[]; // [5-star count, 4-star count, 3-star count, 2-star count, 1-star count]
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex shrink-0 flex-col items-center gap-1 sm:items-start">
        <span className="font-mono text-4xl font-bold">{rating.toFixed(1)}</span>
        <StarRating rating={rating} size="md" />
        <span className="text-xs text-muted-foreground">{total.toLocaleString()} ratings</span>
      </div>
      <div className="flex-1 space-y-1.5">
        {counts.map((count, index) => {
          const stars = 5 - index;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-8 shrink-0 text-muted-foreground">{stars} star</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right text-muted-foreground">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
