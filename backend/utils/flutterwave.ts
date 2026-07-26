import { env } from "../utils/env";

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

interface FlutterwaveResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
}

async function flutterwaveRequest<T>(path: string, init?: RequestInit): Promise<FlutterwaveResponse<T>> {
  const res = await fetch(`${FLUTTERWAVE_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = (await res.json()) as FlutterwaveResponse<T>;
  if (!res.ok || body.status === "error") {
    throw new Error(body.message || `Flutterwave request failed with status ${res.status}`);
  }
  return body;
}

export interface FlutterwaveInitializeResult {
  paymentLink: string;
  txRef: string;
}

export async function initializePayment(input: {
  email: string;
  name: string;
  phone: string;
  amountGhs: number;
  txRef: string;
  redirectUrl: string;
  meta?: Record<string, unknown>;
}): Promise<FlutterwaveInitializeResult> {
  const result = await flutterwaveRequest<{ link: string }>("/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amountGhs,
      currency: "GHS",
      redirect_url: input.redirectUrl,
      payment_options: "card,banktransfer,mobilemoneyghana",
      customer: { email: input.email, name: input.name, phonenumber: input.phone },
      meta: input.meta,
    }),
  });

  return { paymentLink: result.data.link, txRef: input.txRef };
}

export type FlutterwaveTransactionStatus = "successful" | "failed" | "cancelled";

export interface FlutterwaveVerifyResult {
  status: FlutterwaveTransactionStatus;
  txRef: string;
  amountGhs: number;
  currency: string;
  processorResponse: string;
}

export async function verifyTransaction(transactionId: string): Promise<FlutterwaveVerifyResult> {
  const result = await flutterwaveRequest<{
    status: FlutterwaveTransactionStatus;
    tx_ref: string;
    amount: number;
    currency: string;
    processor_response: string;
  }>(`/transactions/${encodeURIComponent(transactionId)}/verify`);

  return {
    status: result.data.status,
    txRef: result.data.tx_ref,
    amountGhs: result.data.amount,
    currency: result.data.currency,
    processorResponse: result.data.processor_response,
  };
}
