"use server";

import { expressInternalFetch } from "@/lib/api/express";
import { signIn } from "@/lib/auth/config";

// Best-effort, same resilience contract as the other notification actions in
// this project: a failure here (or the API being unreachable) must never
// crash the calling UI — callers check the boolean and show a retry option.
export async function sendVendorApplicationVerificationEmailAction(input: {
  email: string;
  ownerName: string;
  businessName: string;
  applicationId: string;
  token: string;
}): Promise<boolean> {
  try {
    const result = await expressInternalFetch("/vendor-applications/send-verification", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.success;
  } catch {
    return false;
  }
}

export interface ActivateVendorSubscriptionInput {
  ownerName: string;
  email: string;
  phone: string;
  businessName: string;
  planName: string;
  amountGhs: number;
  reference: string;
  paidAt: string;
}

export interface ActivateVendorSubscriptionResult {
  activated: boolean;
  alreadyExisted: boolean;
  signedIn: boolean;
}

// Called once a payment has been confirmed successful. Creates the vendor's
// real login-capable account (or detects an existing one), sends the
// receipt + welcome emails server-side, and signs the vendor in immediately
// so "payment succeeded" and "can now log in" happen in the same step.
export async function activateVendorSubscriptionAction(
  input: ActivateVendorSubscriptionInput,
): Promise<ActivateVendorSubscriptionResult> {
  try {
    const result = await expressInternalFetch<{ alreadyExisted: boolean; temporaryPassword: string | null }>(
      "/vendor-applications/activate",
      { method: "POST", body: JSON.stringify(input) },
    );
    if (!result.success) {
      return { activated: false, alreadyExisted: false, signedIn: false };
    }

    const { alreadyExisted, temporaryPassword } = result.data;
    if (alreadyExisted || !temporaryPassword) {
      return { activated: true, alreadyExisted, signedIn: false };
    }

    // The account is already created at this point — a sign-in hiccup here
    // must not be reported as an activation failure, since the vendor can
    // always fall back to signing in manually with the emailed password.
    try {
      await signIn("credentials", {
        email: input.email,
        password: temporaryPassword,
        rememberMe: "false",
        redirect: false,
      });
      return { activated: true, alreadyExisted: false, signedIn: true };
    } catch {
      return { activated: true, alreadyExisted: false, signedIn: false };
    }
  } catch {
    return { activated: false, alreadyExisted: false, signedIn: false };
  }
}
