"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { fileToDownscaledDataUrl } from "@/lib/images/downscale-image";
import type { ReviewPhoto } from "@/lib/reviews/types";

const MAX_PHOTOS = 5;

export function ReviewPhotoUpload({
  photos,
  onChange,
}: {
  photos: ReviewPhoto[];
  onChange: (photos: ReviewPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_PHOTOS - photos.length;
    const files = Array.from(fileList).slice(0, remaining);
    setIsProcessing(true);
    try {
      const newPhotos = await Promise.all(
        files.map(async (file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          dataUrl: await fileToDownscaledDataUrl(file),
        })),
      );
      onChange([...photos, ...newPhotos]);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto(id: string) {
    onChange(photos.filter((photo) => photo.id !== id));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={photo.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
            <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(photo.id)}
              aria-label="Remove photo"
              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink/70 text-ink-foreground"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            <span className="text-[10px]">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-1.5 text-xs text-muted-foreground">Up to {MAX_PHOTOS} photos.</p>
    </div>
  );
}
