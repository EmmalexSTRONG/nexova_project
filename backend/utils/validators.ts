import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number in international format")
  .optional();

export const registerCustomerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});
export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;

export const registerVendorSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").max(150),
});
export type RegisterVendorInput = z.infer<typeof registerVendorSchema>;

const requiredPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number in international format");

export const becomeVendorSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").max(150),
  ownerName: nameSchema,
  phone: requiredPhoneSchema,
  whatsapp: requiredPhoneSchema,
  email: emailSchema,
  businessAddress: z.string().trim().min(5, "Enter a full business address").max(300),
  shopName: z.string().trim().min(2, "Shop name must be at least 2 characters").max(150),
  category: z.string().trim().min(1, "Choose a category"),
});
export type BecomeVendorInput = z.infer<typeof becomeVendorSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: emailSchema,
});
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const oauthUpsertSchema = z.object({
  provider: z.enum(["google", "facebook"]),
  providerAccountId: z.string().min(1),
  email: emailSchema,
  name: nameSchema,
  avatarUrl: z.string().url().optional(),
});
export type OauthUpsertInput = z.infer<typeof oauthUpsertSchema>;
