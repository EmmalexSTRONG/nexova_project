import { Router } from "express";
import * as paymentsController from "../../controllers/payments.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { validate } from "../../middleware/validate";
import { paymentInitializeRateLimiter } from "../../middleware/rate-limiter";
import { internalOnly } from "../../middleware/internal-only";

const router = Router();

// initialize/verify are only ever called by our own Next.js server (via
// expressInternalFetch from a Server Action), never directly by a browser —
// internalOnly closes that off. Webhooks stay public: they're called by
// Paystack/Flutterwave's own servers and are protected by HMAC signature
// verification inside the controller instead.
router.post(
  "/paystack/initialize",
  internalOnly,
  paymentInitializeRateLimiter,
  validate(paymentsController.paystackInitializeSchema),
  asyncHandler(paymentsController.initializePaystack),
);
router.get("/paystack/verify/:reference", internalOnly, asyncHandler(paymentsController.verifyPaystack));
router.post("/paystack/webhook", asyncHandler(paymentsController.paystackWebhook));

router.post(
  "/paystack/charge-mobile-money",
  internalOnly,
  paymentInitializeRateLimiter,
  validate(paymentsController.paystackChargeMobileMoneySchema),
  asyncHandler(paymentsController.chargePaystackMobileMoney),
);

router.post(
  "/flutterwave/initialize",
  internalOnly,
  paymentInitializeRateLimiter,
  validate(paymentsController.flutterwaveInitializeSchema),
  asyncHandler(paymentsController.initializeFlutterwave),
);
router.get("/flutterwave/verify/:transactionId", internalOnly, asyncHandler(paymentsController.verifyFlutterwave));
router.post("/flutterwave/webhook", asyncHandler(paymentsController.flutterwaveWebhook));

export default router;
