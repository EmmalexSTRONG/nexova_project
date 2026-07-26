"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProductImageGallery({
  images,
  thumbnails,
  name,
}: {
  images: ReactNode[];
  thumbnails: ReactNode[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {images[active]}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {thumbnails.map((thumb, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${name} photo ${index + 1}`}
              aria-pressed={active === index}
              className={cn(
                "overflow-hidden rounded-md ring-2 ring-transparent transition-all",
                active === index && "ring-primary",
              )}
            >
              {thumb}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
