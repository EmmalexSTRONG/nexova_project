import { Router } from "express";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  oauthUpsertSchema,
  refreshTokenSchema,
  registerCustomerSchema,
  registerVendorSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from "../../utils/validators";
import * as authController from "../../controllers/auth.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { internalOnly } from "../../middleware/internal-only";
import {
  adminLoginRateLimiter,
  changePasswordRateLimiter,
  forgotPasswordRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  verificationRateLimiter,
} from "../../middleware/rate-limiter";

const router = Router();

router.post(
  "/register/customer",
  registerRateLimiter,
  validate(registerCustomerSchema),
  asyncHandler(authController.registerCustomer),
);

router.post(
  "/register/vendor",
  registerRateLimiter,
  validate(registerVendorSchema),
  asyncHandler(authController.registerVendor),
);

router.post("/login", loginRateLimiter, validate(loginSchema), asyncHandler(authController.login));

router.post(
  "/admin/login",
  adminLoginRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.adminLogin),
);

router.post("/refresh", validate(refreshTokenSchema), asyncHandler(authController.refresh));

router.post("/logout", validate(refreshTokenSchema), asyncHandler(authController.logout));

router.post("/logout-all", authenticate, asyncHandler(authController.logoutAll));

router.get("/me", authenticate, asyncHandler(authController.me));

router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(authController.updateProfile),
);

router.post(
  "/change-password",
  authenticate,
  changePasswordRateLimiter,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
);

router.post("/sessions", authenticate, asyncHandler(authController.listSessions));

router.delete("/sessions/:sessionId", authenticate, asyncHandler(authController.revokeSession));

router.post(
  "/verify-email",
  verificationRateLimiter,
  validate(verifyEmailSchema),
  asyncHandler(authController.verifyEmail),
);

router.post(
  "/resend-verification",
  verificationRateLimiter,
  validate(resendVerificationSchema),
  asyncHandler(authController.resendVerification),
);

router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);

router.post(
  "/reset-password",
  forgotPasswordRateLimiter,
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

router.post(
  "/oauth/upsert",
  internalOnly,
  validate(oauthUpsertSchema),
  asyncHandler(authController.oauthUpsert),
);

export default router;
