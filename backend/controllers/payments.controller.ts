import type { Request, Response } from "express";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import * as paystack from "../utils/paystack";
import * as flutterwave from "../utils/flutterwave";
import { env } from "../utils/env";
import { Errors } from "../utils/app-error";

// ==================== Paystack ====================

export const paystackInitializeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  amountGhs: z.number().positive(),
  orderNumber: z.string().trim().min(1),
  // Lets callers other than checkout (e.g. service bookings) redirect back
  // to their own confirmation page instead of /orders/:id/confirmation.
  returnPath: z.string().trim().min(1).optional(),
});

export async function initializePaystack(req: Request, res: Response) {
  const { email, amountGhs, orderNumber, returnPath } = req.body;
  const reference = `${orderNumber}-${Date.now()}`;
  const path = returnPath ?? `/orders/${encodeURIComponent(orderNumber)}/confirmation`;
  const callbackUrl = `${env.CLIENT_URL}${path}?provider=paystack`;

  const result = await paystack.initializeTransaction({
    email,
    amountGhs,
    reference,
    callbackUrl,
    metadata: { orderNumber },
  });

  res.status(200).json({ success: true, data: result });
}

// Normalizes to Ghana local format (0XXXXXXXXX) — Paystack's mobile money
// charge rejects +233-prefixed numbers.
function toGhanaLocalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0")) return digits;
  return `0${digits}`;
}

export const paystackChargeMobileMoneySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  amountGhs: z.number().positive(),
  phone: z.string().trim().min(9),
  reference: z.string().trim().min(1),
});

export async function chargePaystackMobileMoney(req: Request, res: Response) {
  const { email, amountGhs, phone, reference } = req.body;

  const result = await paystack.chargeMobileMoney({
    email,
    amountGhs,
    reference,
    phone: toGhanaLocalPhone(phone),
    metadata: { reference },
  });

  res.status(200).json({
    success: true,
    data: { reference: result.reference, status: result.status, displayText: result.displayText },
  });
}

export async function verifyPaystack(req: Request, res: Response) {
  const reference = req.params.reference as string | undefined;
  if (!reference) throw Errors.notFound("Transaction reference");

  const result = await paystack.verifyTransaction(reference);
  const status = result.status === "success" ? "SUCCESSFUL" : "FAILED";

  res.status(200).json({
    success: true,
    data: { status, reference: result.reference, amountGhs: result.amountGhs, paidAt: result.paidAt, channel: result.channel },
  });
}

export async function paystackWebhook(req: Request, res: Response) {
  const signature = req.headers["x-paystack-signature"];
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

  if (typeof signature !== "string" || !rawBody) {
    return res.status(401).json({ success: false, error: { code: "INVALID_SIGNATURE", message: "Missing signature" } });
  }

  const expected = createHmac("sha512", env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  const valid =
    expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!valid) {
    return res.status(401).json({ success: false, error: { code: "INVALID_SIGNATURE", message: "Signature mismatch" } });
  }

  const event = req.body?.event;
  if (event === "charge.success") {
    const { reference, metadata } = req.body.data ?? {};
    // TODO: once orders are persisted in a database, look up the order by
    // metadata.orderNumber / reference and mark its payment SUCCESSFUL here.
    // Today orders live in the browser's localStorage, which this
    // server-to-server webhook has no way to reach — verify-on-return
    // (GET /paystack/verify/:reference, called by the client on redirect
    // back from Paystack) is what actually updates status in this build.
    console.log(`[paystack webhook] charge.success for reference=${reference}, order=${metadata?.orderNumber}`);
  }

  res.status(200).json({ success: true, data: { received: true } });
}

// ==================== Flutterwave ====================

export const flutterwaveInitializeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  amountGhs: z.number().positive(),
  orderNumber: z.string().trim().min(1),
  returnPath: z.string().trim().min(1).optional(),
});

export async function initializeFlutterwave(req: Request, res: Response) {
  const { email, name, phone, amountGhs, orderNumber, returnPath } = req.body;
  const txRef = `${orderNumber}-${Date.now()}`;
  const path = returnPath ?? `/orders/${encodeURIComponent(orderNumber)}/confirmation`;
  const redirectUrl = `${env.CLIENT_URL}${path}?provider=flutterwave`;

  const result = await flutterwave.initializePayment({
    email,
    name,
    phone,
    amountGhs,
    txRef,
    redirectUrl,
    meta: { orderNumber },
  });

  res.status(200).json({ success: true, data: result });
}

export async function verifyFlutterwave(req: Request, res: Response) {
  const transactionId = req.params.transactionId as string | undefined;
  if (!transactionId) throw Errors.notFound("Transaction");

  const result = await flutterwave.verifyTransaction(transactionId);
  const status = result.status === "successful" ? "SUCCESSFUL" : "FAILED";

  res.status(200).json({
    success: true,
    data: { status, reference: result.txRef, amountGhs: result.amountGhs, channel: result.processorResponse },
  });
}

export async function flutterwaveWebhook(req: Request, res: Response) {
  const signature = req.headers["verif-hash"];

  if (typeof signature !== "string") {
    return res.status(401).json({ success: false, error: { code: "INVALID_SIGNATURE", message: "Missing signature" } });
  }

  const valid =
    signature.length === env.FLUTTERWAVE_WEBHOOK_HASH.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(env.FLUTTERWAVE_WEBHOOK_HASH));
  if (!valid) {
    return res.status(401).json({ success: false, error: { code: "INVALID_SIGNATURE", message: "Signature mismatch" } });
  }

  const event = req.body?.event;
  if (event === "charge.completed" && req.body?.data?.status === "successful") {
    const { tx_ref, meta } = req.body.data;
    // TODO: same as the Paystack webhook — persist to the order once a
    // database exists. Verify-on-return handles this in the meantime.
    console.log(`[flutterwave webhook] charge.completed for tx_ref=${tx_ref}, order=${meta?.orderNumber}`);
  }

  res.status(200).json({ success: true, data: { received: true } });
}
