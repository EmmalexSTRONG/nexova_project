import { Router } from "express";
import * as vendorApplicationsController from "../../controllers/vendor-applications.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { validate } from "../../middleware/validate";
import { verificationRateLimiter } from "../../middleware/rate-limiter";
import { internalOnly } from "../../middleware/internal-only";

const router = Router();

router.post(
  "/send-verification",
  internalOnly,
  verificationRateLimiter,
  validate(vendorApplicationsController.sendVerificationSchema),
  asyncHandler(vendorApplicationsController.sendVerification),
);

router.post(
  "/activate",
  internalOnly,
  verificationRateLimiter,
  validate(vendorApplicationsController.activateSchema),
  asyncHandler(vendorApplicationsController.activate),
);

export default router;
