"use server";

import { expressInternalFetch } from "@/lib/api/express";

interface PaystackInitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializePaystackPaymentAction(input: {
  email: string;
  amountGhs: number;
  orderNumber: string;
  returnPath?: string;
}): Promise<PaystackInitializeResult | null> {
  try {
    const result = await expressInternalFetch<PaystackInitializeResult>("/payments/paystack/initialize", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

interface FlutterwaveInitializeResult {
  paymentLink: string;
  txRef: string;
}

export async function initializeFlutterwavePaymentAction(input: {
  email: string;
  name: string;
  phone: string;
  amountGhs: number;
  orderNumber: string;
  returnPath?: string;
}): Promise<FlutterwaveInitializeResult | null> {
  try {
    const result = await expressInternalFetch<FlutterwaveInitializeResult>("/payments/flutterwave/initialize", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

interface PaystackMobileMoneyChargeResult {
  reference: string;
  status: string;
  displayText?: string;
}

// Direct charge, no redirect — the vendor approves via a prompt on their own
// phone. Pair with verifyPaystackPaymentAction, polled client-side, since
// there's no callback URL for this flow to return through.
export async function chargePaystackMobileMoneyAction(input: {
  email: string;
  amountGhs: number;
  phone: string;
  reference: string;
}): Promise<PaystackMobileMoneyChargeResult | null> {
  try {
    const result = await expressInternalFetch<PaystackMobileMoneyChargeResult>(
      "/payments/paystack/charge-mobile-money",
      { method: "POST", body: JSON.stringify(input) },
    );
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

interface PaymentVerifyResult {
  status: "SUCCESSFUL" | "FAILED";
  reference: string;
}

export async function verifyPaystackPaymentAction(reference: string): Promise<PaymentVerifyResult | null> {
  try {
    const result = await expressInternalFetch<PaymentVerifyResult>(`/payments/paystack/verify/${encodeURIComponent(reference)}`);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function verifyFlutterwavePaymentAction(transactionId: string): Promise<PaymentVerifyResult | null> {
  try {
    const result = await expressInternalFetch<PaymentVerifyResult>(
      `/payments/flutterwave/verify/${encodeURIComponent(transactionId)}`,
    );
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
