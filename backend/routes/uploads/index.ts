import { Router } from "express";
import * as uploadsController from "../../controllers/uploads.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { uploadSignatureRateLimiter } from "../../middleware/rate-limiter";

const router = Router();

// Requires a real signed-in user (not internalOnly) — uploading a photo is a
// user-initiated action, unlike the guest-checkout notification/payment
// routes elsewhere in the API.
router.post(
  "/signature",
  authenticate,
  uploadSignatureRateLimiter,
  validate(uploadsController.signUploadSchema),
  asyncHandler(uploadsController.signUpload),
);

export default router;
