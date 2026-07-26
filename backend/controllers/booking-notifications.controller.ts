import type { Request, Response } from "express";
import { z } from "zod";
import { sendBookingConfirmationEmail } from "../utils/mailer";

export const sendBookingConfirmationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1),
  bookingNumber: z.string().trim().min(1),
  serviceName: z.string().trim().min(1),
  providerName: z.string().trim().min(1),
  scheduledDateLabel: z.string().trim().min(1),
  scheduledTimeLabel: z.string().trim().min(1),
  price: z.number().nonnegative(),
  currency: z.string().trim().min(1).max(5),
});

export async function sendBookingConfirmation(req: Request, res: Response) {
  const { email, name, bookingNumber, serviceName, providerName, scheduledDateLabel, scheduledTimeLabel, price, currency } = req.body;
  await sendBookingConfirmationEmail(email, name, {
    bookingNumber,
    serviceName,
    providerName,
    scheduledDateLabel,
    scheduledTimeLabel,
    price,
    currency,
  });
  res.status(200).json({ success: true, data: { sent: true } });
}
