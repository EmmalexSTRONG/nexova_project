"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
            aria-pressed={value === star}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="p-0.5"
          >
            <Star className={cn("h-6 w-6 transition-colors", filled ? "fill-primary text-primary" : "text-muted-foreground/30")} />
          </button>
        );
      })}
    </div>
  );
}
