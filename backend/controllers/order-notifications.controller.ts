import type { Request, Response } from "express";
import { z } from "zod";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "../utils/mailer";

export const sendOrderConfirmationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1),
  orderNumber: z.string().trim().min(1),
  items: z
    .array(z.object({ name: z.string().trim().min(1), quantity: z.number().int().positive() }))
    .min(1),
  total: z.number().nonnegative(),
  currency: z.string().trim().min(1).max(5),
});

export async function sendOrderConfirmation(req: Request, res: Response) {
  const { email, name, orderNumber, items, total, currency } = req.body;
  await sendOrderConfirmationEmail(email, name, { orderNumber, items, total, currency });
  res.status(200).json({ success: true, data: { sent: true } });
}

export const sendOrderStatusUpdateSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1),
  orderNumber: z.string().trim().min(1),
  statusLabel: z.string().trim().min(1),
  statusDescription: z.string().trim().min(1),
});

export async function sendOrderStatusUpdate(req: Request, res: Response) {
  const { email, name, orderNumber, statusLabel, statusDescription } = req.body;
  await sendOrderStatusUpdateEmail(email, name, { orderNumber, statusLabel, statusDescription });
  res.status(200).json({ success: true, data: { sent: true } });
}
