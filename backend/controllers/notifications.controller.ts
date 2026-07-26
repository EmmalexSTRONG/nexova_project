import type { Request, Response } from "express";
import { z } from "zod";
import { sendNotificationEmail } from "../utils/mailer";
import { sendSms, sendWhatsApp } from "../utils/twilio";
import { sendWebPush, type PushSubscription } from "../utils/web-push";
import { escapeHtml } from "../utils/escape-html";

const notificationEventSchema = z.enum([
  "ORDER_PLACED",
  "PAYMENT_SUCCESSFUL",
  "ITEM_SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "POST_DELIVERY_THANK_YOU",
]);

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export const dispatchNotificationSchema = z.object({
  event: notificationEventSchema,
  order: z.object({
    orderNumber: z.string().min(1),
    total: z.number().optional(),
    currency: z.string().default("GHS"),
  }),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
  }),
  pushSubscription: pushSubscriptionSchema.optional(),
});

type NotificationEvent = z.infer<typeof notificationEventSchema>;
type DispatchNotificationInput = z.infer<typeof dispatchNotificationSchema>;

interface NotificationContent {
  subject: string;
  heading: string;
  bodyHtml: string;
  text: string;
  pushTitle: string;
}

const THANK_YOU_TEXT =
  "Thank you for shopping with us. We appreciate your business and look forward to serving you again.";

function buildContent(
  event: NotificationEvent,
  order: DispatchNotificationInput["order"],
  customer: DispatchNotificationInput["customer"],
): NotificationContent {
  const { orderNumber, total, currency } = order;
  const totalLabel = typeof total === "number" ? `${currency} ${total.toFixed(2)}` : undefined;
  // HTML-bound fields (subject/heading/bodyHtml) must escape free text before
  // interpolation, since these strings become part of a raw email template;
  // the plain-text `text` field (used for SMS/WhatsApp/push) is left as-is.
  const safeName = escapeHtml(customer.name);
  const safeOrderNumber = escapeHtml(orderNumber);

  switch (event) {
    case "ORDER_PLACED":
      return {
        subject: `Order received — ${orderNumber}`,
        heading: `Thanks, ${safeName}!`,
        bodyHtml: `<p>We've received your order <strong>${safeOrderNumber}</strong>${totalLabel ? ` for ${escapeHtml(totalLabel)}` : ""}. We'll notify you as it moves through processing.</p>`,
        text: `Thanks ${customer.name}! We've received your order ${orderNumber}${totalLabel ? ` for ${totalLabel}` : ""}.`,
        pushTitle: "Order received",
      };
    case "PAYMENT_SUCCESSFUL":
      return {
        subject: `Payment confirmed — ${orderNumber}`,
        heading: `Payment received, ${safeName}`,
        bodyHtml: `<p>Your payment for order <strong>${safeOrderNumber}</strong> was successful. We're preparing your order now.</p>`,
        text: `Your payment for order ${orderNumber} was successful. We're preparing your order now.`,
        pushTitle: "Payment confirmed",
      };
    case "ITEM_SHIPPED":
      return {
        subject: `Your order is on its way — ${orderNumber}`,
        heading: `Order ${safeOrderNumber} has shipped`,
        bodyHtml: `<p>Good news, ${safeName} — order <strong>${safeOrderNumber}</strong> has been dispatched and is on its way to you.</p>`,
        text: `Order ${orderNumber} has been dispatched and is on its way to you.`,
        pushTitle: "Order shipped",
      };
    case "DELIVERED":
      return {
        subject: `Delivered — ${orderNumber}`,
        heading: `Order ${safeOrderNumber} has been delivered`,
        bodyHtml: `<p>Order <strong>${safeOrderNumber}</strong> has been delivered. We hope you love it!</p>`,
        text: `Order ${orderNumber} has been delivered. We hope you love it!`,
        pushTitle: "Order delivered",
      };
    case "CANCELLED":
      return {
        subject: `Order cancelled — ${orderNumber}`,
        heading: `Order ${safeOrderNumber} was cancelled`,
        bodyHtml: `<p>Order <strong>${safeOrderNumber}</strong> has been cancelled. If you didn't request this, please contact us.</p>`,
        text: `Order ${orderNumber} has been cancelled.`,
        pushTitle: "Order cancelled",
      };
    case "POST_DELIVERY_THANK_YOU":
      return {
        subject: "Thank you for shopping with Nexora!",
        heading: `Thank you for shopping with us, ${safeName}`,
        bodyHtml: `<p>${THANK_YOU_TEXT}</p>`,
        text: THANK_YOU_TEXT,
        pushTitle: "Thank you!",
      };
  }
}

interface ChannelResult {
  attempted: boolean;
  success: boolean;
  error?: string;
}

function toChannelResult(attempted: boolean, result?: PromiseSettledResult<unknown>): ChannelResult {
  if (!attempted || !result) return { attempted: false, success: false };
  if (result.status === "fulfilled") return { attempted: true, success: true };
  return { attempted: true, success: false, error: result.reason instanceof Error ? result.reason.message : String(result.reason) };
}

// Best-effort, multi-channel dispatch: every channel is attempted
// independently via Promise.allSettled so a failure on one (e.g. Twilio or
// Web Push being unreachable) never blocks the others, and the endpoint
// itself never throws — it always reports per-channel outcomes.
export async function dispatchNotification(req: Request, res: Response) {
  const { event, order, customer, pushSubscription } = req.body as DispatchNotificationInput;
  const content = buildContent(event, order, customer);

  const hasEmail = Boolean(customer.email);
  const hasPhone = Boolean(customer.phone);
  const hasPush = Boolean(pushSubscription);

  const [emailResult, smsResult, whatsappResult, pushResult] = await Promise.allSettled([
    hasEmail
      ? sendNotificationEmail(customer.email as string, content.subject, content.heading, content.bodyHtml, order)
      : Promise.reject(new Error("skipped")),
    hasPhone ? sendSms(customer.phone as string, content.text) : Promise.reject(new Error("skipped")),
    hasPhone ? sendWhatsApp(customer.phone as string, content.text) : Promise.reject(new Error("skipped")),
    hasPush
      ? sendWebPush(pushSubscription as PushSubscription, {
          title: content.pushTitle,
          body: content.text,
          url: `/orders/${order.orderNumber}/track`,
        })
      : Promise.reject(new Error("skipped")),
  ]);

  res.status(200).json({
    success: true,
    data: {
      event,
      channels: {
        email: toChannelResult(hasEmail, emailResult),
        sms: toChannelResult(hasPhone, smsResult),
        whatsapp: toChannelResult(hasPhone, whatsappResult),
        push: toChannelResult(hasPush, pushResult),
      },
    },
  });
}
