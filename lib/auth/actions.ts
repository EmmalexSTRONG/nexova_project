"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerCustomerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterCustomerInput,
  type ResendVerificationInput,
  type ResetPasswordInput,
  type UpdateProfileInput,
  type VerifyEmailInput,
} from "@/lib/validators";
import type { AuthResponse } from "@/types";
import { expressFetch } from "../api/express";
import { auth, signIn, signOut } from "./config";

export interface ActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

async function credentialsSignIn(
  providerId: "credentials" | "admin-credentials",
  input: LoginInput,
): Promise<ActionResult | null> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn(providerId, {
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: String(parsed.data.rememberMe),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const message =
        providerId === "admin-credentials"
          ? "Invalid credentials or this account does not have admin access"
          : "Invalid email or password";
      return { success: false, message };
    }
    throw error;
  }

  return null;
}

export async function loginAction(input: LoginInput, callbackUrl?: string): Promise<ActionResult> {
  const failure = await credentialsSignIn("credentials", input);
  if (failure) return failure;

  redirect(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/account");
}

export async function adminLoginAction(input: LoginInput, callbackUrl?: string): Promise<ActionResult> {
  const failure = await credentialsSignIn("admin-credentials", input);
  if (failure) return failure;

  redirect(callbackUrl && callbackUrl.startsWith("/admin") ? callbackUrl : "/admin/dashboard");
}

export async function registerCustomerAction(input: RegisterCustomerInput): Promise<ActionResult> {
  const parsed = registerCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await expressFetch<AuthResponse>("/auth/register/customer", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (!result.success) {
    return { success: false, message: result.error.message };
  }

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    rememberMe: "false",
    redirect: false,
  });

  redirect("/account");
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await expressFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (!result.success) {
    return { success: false, message: result.error.message };
  }

  return { success: true, message: "If that email exists, we've sent a password reset link." };
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await expressFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (!result.success) {
    return { success: false, message: result.error.message };
  }

  return { success: true, message: "Your password has been reset. You can now sign in." };
}

export async function verifyEmailAction(input: VerifyEmailInput): Promise<ActionResult> {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await expressFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (!result.success) {
    return { success: false, message: result.error.message };
  }

  return { success: true, message: "Your email has been verified." };
}

export async function resendVerificationAction(input: ResendVerificationInput): Promise<ActionResult> {
  const parsed = resendVerificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await expressFetch("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (!result.success) {
    return { success: false, message: result.error.message };
  }

  return { success: true, message: "If that account needs verifying, we've sent a new link." };
}

export async function updateProfileAction(input: UpdateProfileInput): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const session = await auth();
  if (!session?.accessToken) return { success: false, message: "Not authenticated" };

  const emailChanged = parsed.data.email !== session.user.email;

  const result = await expressFetch("/auth/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify(parsed.data),
  });
  if (!result.success) return { success: false, message: result.error.message };

  revalidatePath("/admin/settings");
  return {
    success: true,
    message: emailChanged
      ? "Profile updated. Check your new email address to verify it — sign out and back in once you have."
      : "Profile updated.",
  };
}

export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const session = await auth();
  if (!session?.accessToken) return { success: false, message: "Not authenticated" };

  const result = await expressFetch("/auth/change-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify(parsed.data),
  });
  if (!result.success) return { success: false, message: result.error.message };

  return { success: true, message: "Password changed. You've been signed out of your other sessions." };
}

export async function signOutAction(): Promise<void> {
  const session = await auth();
  if (session?.refreshToken) {
    await expressFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
  }
  await signOut({ redirectTo: "/login" });
}

export async function signOutAllDevicesAction(): Promise<void> {
  const session = await auth();
  if (session?.accessToken) {
    await expressFetch("/auth/logout-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  }
  await signOut({ redirectTo: "/login" });
}

export async function revokeSessionAction(sessionId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.accessToken) return { success: false, message: "Not authenticated" };

  const result = await expressFetch(`/auth/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (!result.success) return { success: false, message: result.error.message };

  revalidatePath("/account");
  return { success: true };
}
