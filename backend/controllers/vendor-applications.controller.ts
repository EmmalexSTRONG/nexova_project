import type { Request, Response } from "express";
import { z } from "zod";
import { sendVendorApplicationVerificationEmail, sendVendorSubscriptionReceiptEmail, sendVendorWelcomeEmail } from "../utils/mailer";
import { activateVendorFromApplication } from "../services/auth.service";
import { env } from "../utils/env";

export const sendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  ownerName: z.string().trim().min(1),
  businessName: z.string().trim().min(1),
  applicationId: z.string().trim().min(1),
  token: z.string().trim().min(1),
});

type SendVerificationInput = z.infer<typeof sendVerificationSchema>;

// No DB lookup here on purpose — the vendor application itself lives in the
// caller's (Next.js server action's) hands; this endpoint's only job is the
// one thing that needs real server-side credentials, sending the email.
export async function sendVerification(req: Request, res: Response) {
  const { email, ownerName, businessName, applicationId, token } = req.body as SendVerificationInput;
  const verifyUrl = `${env.CLIENT_URL}/register/vendor/verify?applicationId=${encodeURIComponent(applicationId)}&token=${encodeURIComponent(token)}`;

  await sendVendorApplicationVerificationEmail(email, ownerName, businessName, verifyUrl);

  res.status(200).json({ success: true, data: { sent: true } });
}

export const activateSchema = z.object({
  ownerName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(1),
  businessName: z.string().trim().min(1),
  planName: z.string().trim().min(1),
  amountGhs: z.number().positive(),
  reference: z.string().trim().min(1),
  paidAt: z.string().trim().min(1),
});

type ActivateInput = z.infer<typeof activateSchema>;

// Called once, after the client has confirmed (by polling the payment
// verify endpoint) that the MTN Mobile Money charge succeeded. Creates the
// real vendor account, then fires the receipt + welcome emails — both
// best-effort so a flaky SMTP relay never turns a successful payment into
// an error response.
export async function activate(req: Request, res: Response) {
  const { ownerName, email, phone, businessName, planName, amountGhs, reference, paidAt } = req.body as ActivateInput;

  const { alreadyExisted, temporaryPassword } = await activateVendorFromApplication({
    name: ownerName,
    email,
    phone,
    businessName,
  });

  await Promise.allSettled([
    sendVendorSubscriptionReceiptEmail(email, ownerName, businessName, { reference, planName, amountGhs, paidAt }),
    sendVendorWelcomeEmail(email, ownerName, businessName, { temporaryPassword }),
  ]);

  res.status(200).json({ success: true, data: { alreadyExisted, temporaryPassword } });
}
