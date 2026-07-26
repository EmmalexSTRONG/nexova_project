import type { Request, Response } from "express";
import { z } from "zod";
import { cloudinary } from "../utils/cloudinary";

// Folders are allow-listed rather than accepted as free text, so a caller
// can't write uploads into an arbitrary path on the Cloudinary account.
const UPLOAD_FOLDERS = ["review-photos", "product-images", "shop-logos", "vendor-documents"] as const;

export const signUploadSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS),
});

// Returns a short-lived signature for a direct browser-to-Cloudinary upload.
// The API secret never leaves the server — the client POSTs the file plus
// this signature straight to Cloudinary, which verifies it independently.
export async function signUpload(req: Request, res: Response) {
  const { folder } = req.body;
  const timestamp = Math.round(Date.now() / 1000);
  const fullFolder = `nexora/${folder}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: fullFolder },
    cloudinary.config().api_secret as string,
  );

  res.status(200).json({
    success: true,
    data: {
      timestamp,
      signature,
      folder: fullFolder,
      apiKey: cloudinary.config().api_key,
      cloudName: cloudinary.config().cloud_name,
    },
  });
}
