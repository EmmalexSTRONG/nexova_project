"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { fileToDownscaledDataUrl } from "@/lib/images/downscale-image";

// Single-image upload used across admin CRUD forms (blog featured image,
// category image) — same downscale-to-data-URL approach as the vendor
// product photo uploader, just laid out wider for a form context.
export function AdminImageUpload({
  image,
  onChange,
  label = "Upload image",
}: {
  image: string | undefined;
  onChange: (url: string | undefined) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      onChange(await fileToDownscaledDataUrl(file, 1200, 0.85));
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      {image ? (
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Remove image"
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
          className="flex h-24 w-40 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span className="text-[11px]">{label}</span>
        </button>
      )}
      {image && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Replace image"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
    </div>
  );
}
