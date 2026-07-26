import { Router } from "express";
import * as orderNotificationsController from "../../controllers/order-notifications.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { validate } from "../../middleware/validate";
import { orderNotificationRateLimiter } from "../../middleware/rate-limiter";
import { internalOnly } from "../../middleware/internal-only";

const router = Router();

// These send real email on the caller's behalf with no order/booking lookup
// to verify against (no live DB) — internalOnly restricts them to our own
// Next.js server (which calls them via expressInternalFetch), not the
// public internet, without requiring a logged-in user (checkout is guest-friendly).
router.post(
  "/send-confirmation",
  internalOnly,
  orderNotificationRateLimiter,
  validate(orderNotificationsController.sendOrderConfirmationSchema),
  asyncHandler(orderNotificationsController.sendOrderConfirmation),
);

router.post(
  "/send-status-update",
  internalOnly,
  orderNotificationRateLimiter,
  validate(orderNotificationsController.sendOrderStatusUpdateSchema),
  asyncHandler(orderNotificationsController.sendOrderStatusUpdate),
);

export default router;
