import { env } from "../utils/env";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<PaystackResponse<T>> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = (await res.json()) as PaystackResponse<T>;
  if (!res.ok) {
    throw new Error(body.message || `Paystack request failed with status ${res.status}`);
  }
  return body;
}

export interface PaystackInitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializeTransaction(input: {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitializeResult> {
  const result = await paystackRequest<{ authorization_url: string; access_code: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        // Paystack expects the smallest currency unit — pesewas for GHS.
        amount: Math.round(input.amountGhs * 100),
        currency: "GHS",
        reference: input.reference,
        callback_url: input.callbackUrl,
        channels: ["card", "bank", "bank_transfer", "mobile_money"],
        metadata: input.metadata,
      }),
    },
  );

  return {
    authorizationUrl: result.data.authorization_url,
    accessCode: result.data.access_code,
    reference: result.data.reference,
  };
}

export type PaystackTransactionStatus = "success" | "failed" | "abandoned";

export interface PaystackVerifyResult {
  status: PaystackTransactionStatus;
  reference: string;
  amountGhs: number;
  currency: string;
  paidAt: string | null;
  channel: string;
}

export interface PaystackMobileMoneyChargeResult {
  status: string; // "pay_offline" | "success" | "failed" | "send_otp" | ...
  reference: string;
  displayText?: string;
}

// Direct charge — no hosted checkout redirect. The customer approves via a
// prompt/USSD flow on their own phone; `verifyTransaction` (below) is then
// polled until the charge resolves. Ghana mobile money on Paystack expects
// the phone in local format (0XXXXXXXXX), not +233 — the caller normalizes.
export async function chargeMobileMoney(input: {
  email: string;
  amountGhs: number;
  reference: string;
  phone: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackMobileMoneyChargeResult> {
  const result = await paystackRequest<{ status: string; reference: string; display_text?: string }>("/charge", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountGhs * 100),
      currency: "GHS",
      reference: input.reference,
      mobile_money: { phone: input.phone, provider: "mtn" },
      metadata: input.metadata,
    }),
  });

  return { status: result.data.status, reference: result.data.reference, displayText: result.data.display_text };
}

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
  const result = await paystackRequest<{
    status: PaystackTransactionStatus;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string | null;
    channel: string;
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);

  return {
    status: result.data.status,
    reference: result.data.reference,
    amountGhs: result.data.amount / 100,
    currency: result.data.currency,
    paidAt: result.data.paid_at,
    channel: result.data.channel,
  };
}
