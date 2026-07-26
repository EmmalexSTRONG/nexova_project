"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { fileToDownscaledDataUrl } from "@/lib/images/downscale-image";

export function AdCreativeUpload({
  imageDataUrl,
  onChange,
}: {
  imageDataUrl: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
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

  if (imageDataUrl) {
    return (
      <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-md border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageDataUrl} alt="" className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="Remove image"
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-ink-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isProcessing}
        className="flex h-32 w-full max-w-xs flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        <span className="text-xs">Upload creative image</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
      <p className="mt-1.5 text-xs text-muted-foreground">Optional — a placeholder graphic is used if you skip this.</p>
    </div>
  );
}
