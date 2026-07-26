import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  tone = "default",
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  tone?: "default" | "inverted";
  className?: string;
}) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const isInverted = tone === "inverted";
  const emptyTone = isInverted ? "text-ink-muted/40" : "text-muted-foreground/30";
  const countTone = isInverted ? "text-ink-muted" : "text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, rating - i));
          return (
            <span key={i} className="relative inline-block">
              <Star className={cn(starSize, emptyTone)} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className={cn(starSize, "fill-primary text-primary")} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className={cn("text-xs", countTone)}>({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}
