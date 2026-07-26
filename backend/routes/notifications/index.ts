import { Router } from "express";
import * as notificationsController from "../../controllers/notifications.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { validate } from "../../middleware/validate";
import { notificationDispatchRateLimiter } from "../../middleware/rate-limiter";
import { internalOnly } from "../../middleware/internal-only";

const router = Router();

router.post(
  "/dispatch",
  internalOnly,
  notificationDispatchRateLimiter,
  validate(notificationsController.dispatchNotificationSchema),
  asyncHandler(notificationsController.dispatchNotification),
);

export default router;
