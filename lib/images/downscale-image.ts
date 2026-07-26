// Reads an image file, downscales it to `maxDimension` on its longest side,
// and returns a JPEG data URL — keeps user-uploaded photos from blowing past
// localStorage quota, since there's no real object storage backing uploads.
// Always re-encodes through <canvas> rather than ever passing the original
// file bytes through untouched, so an SVG (which can carry embedded script)
// can't reach storage as anything other than a flattened raster image.
export function fileToDownscaledDataUrl(file: File, maxDimension = 900, quality = 0.82): Promise<string> {
  if (file.type === "image/svg+xml") {
    return Promise.reject(new Error("SVG images aren't supported — upload a JPEG or PNG instead."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not read image"));
      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process this image."));
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
