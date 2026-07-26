"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { fileToDownscaledDataUrl } from "@/lib/images/downscale-image";

// The "big" photo — shown on product cards, listings, and as the PDP's main
// image. Single file, larger preview.
export function VendorMainPhotoUpload({
  image,
  onChange,
}: {
  image: string | undefined;
  onChange: (url: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      onChange(await fileToDownscaledDataUrl(file, 1000, 0.85));
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {image ? (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              aria-label="Remove main photo"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-ink-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            <span className="text-[11px]">Upload photo</span>
          </button>
        )}
        {image && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Replace photo"}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
      <p className="mt-1.5 text-xs text-muted-foreground">
        Shown on your storefront, product cards, and listings. Skip to use a placeholder.
      </p>
    </div>
  );
}

const MAX_GALLERY_PHOTOS = 6;

// The "small" photos — the PDP's thumbnail gallery. Multiple files, small
// previews. When left empty, every gallery slot falls back to the main photo.
export function VendorGalleryPhotoUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_GALLERY_PHOTOS - images.length;
    const files = Array.from(fileList).slice(0, remaining);
    setIsProcessing(true);
    try {
      const newImages = await Promise.all(files.map((file) => fileToDownscaledDataUrl(file)));
      onChange([...images, ...newImages]);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((src, index) => (
          <div key={index} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              aria-label="Remove photo"
              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink/70 text-ink-foreground"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        {images.length < MAX_GALLERY_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            <span className="text-[10px]">Add</span>
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
      <p className="mt-1.5 text-xs text-muted-foreground">
        Extra angles shown in the product gallery (up to {MAX_GALLERY_PHOTOS}). Leave empty to reuse the main photo.
      </p>
    </div>
  );
}
