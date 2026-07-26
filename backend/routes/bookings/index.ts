import { Router } from "express";
import * as bookingNotificationsController from "../../controllers/booking-notifications.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { validate } from "../../middleware/validate";
import { orderNotificationRateLimiter } from "../../middleware/rate-limiter";
import { internalOnly } from "../../middleware/internal-only";

const router = Router();

router.post(
  "/send-confirmation",
  internalOnly,
  orderNotificationRateLimiter,
  validate(bookingNotificationsController.sendBookingConfirmationSchema),
  asyncHandler(bookingNotificationsController.sendBookingConfirmation),
);

export default router;
