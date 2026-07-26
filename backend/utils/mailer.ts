import nodemailer from "nodemailer";
import { env } from "../utils/env";
import { escapeHtml } from "./escape-html";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
});

async function sendMail(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
}

function layout(title: string, bodyHtml: string, ctaLabel: string, ctaUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      <h1 style="font-size: 20px; margin-bottom: 16px;">${title}</h1>
      <div style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${bodyHtml}</div>
      <a href="${ctaUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px;">${ctaLabel}</a>
      <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">If the button doesn't work, copy and paste this link into your browser:<br />${ctaUrl}</p>
    </div>
  `;
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendMail(
    to,
    "Verify your email address",
    layout(
      `Hi ${escapeHtml(name)}, verify your email`,
      `<p>Thanks for signing up. Click the button below to verify your email address. This link expires in ${env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS} hours.</p>`,
      "Verify email",
      url,
    ),
  );
}

export async function sendVendorApplicationVerificationEmail(
  to: string,
  ownerName: string,
  businessName: string,
  verifyUrl: string,
) {
  await sendMail(
    to,
    "Verify your email to continue your Nexora vendor application",
    layout(
      `Hi ${escapeHtml(ownerName)}, verify your email`,
      `
        <p>Thanks for applying to sell on Nexora as <strong>${escapeHtml(businessName)}</strong>. Click the button
        below to verify your email address and continue to the subscription payment step.</p>
        <p>This link expires in ${env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS} hours.</p>
      `,
      "Verify email & continue",
      verifyUrl,
    ),
  );
}

export async function sendVendorSubscriptionReceiptEmail(
  to: string,
  ownerName: string,
  businessName: string,
  payment: { reference: string; planName: string; amountGhs: number; paidAt: string },
) {
  const paidAtLabel = new Date(payment.paidAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await sendMail(
    to,
    `Payment receipt — ${payment.reference}`,
    layout(
      `Payment received, ${escapeHtml(ownerName)}`,
      `
        <p>We've received your subscription payment for <strong>${escapeHtml(businessName)}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr><td style="padding: 4px 0; color: #6b7280;">Reference</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(payment.reference)}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Plan</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(payment.planName)}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Amount</td><td style="padding: 4px 0; text-align: right;">GHS ${payment.amountGhs.toFixed(2)}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Paid via</td><td style="padding: 4px 0; text-align: right;">MTN Mobile Money</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Date</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(paidAtLabel)}</td></tr>
        </table>
      `,
      "Sign in to Nexora",
      `${env.CLIENT_URL}/login`,
    ),
  );
}

export async function sendVendorWelcomeEmail(
  to: string,
  ownerName: string,
  businessName: string,
  account: { temporaryPassword: string | null },
) {
  const credentialsHtml = account.temporaryPassword
    ? `
        <p>Your account is ready. Sign in with:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr><td style="padding: 4px 0; color: #6b7280;">Email</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(to)}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Temporary password</td><td style="padding: 4px 0; text-align: right; font-family: monospace;">${escapeHtml(account.temporaryPassword)}</td></tr>
        </table>
        <p>For your security, please change this password after your first sign-in.</p>
      `
    : `<p>Your existing Nexora account has been upgraded — sign in as usual to get started.</p>`;

  await sendMail(
    to,
    `Welcome to Nexora, ${businessName}!`,
    layout(
      `Welcome to Nexora, ${escapeHtml(ownerName)}`,
      `
        <p><strong>${escapeHtml(businessName)}</strong> is officially subscribed and active on Nexora.</p>
        ${credentialsHtml}
      `,
      "Sign in",
      `${env.CLIENT_URL}/login`,
    ),
  );
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendMail(
    to,
    "Reset your password",
    layout(
      `Hi ${escapeHtml(name)}, reset your password`,
      `<p>We received a request to reset your password. This link expires in ${env.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes. If you didn't request this, you can safely ignore this email.</p>`,
      "Reset password",
      url,
    ),
  );
}

export interface OrderConfirmationItem {
  name: string;
  quantity: number;
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  order: { orderNumber: string; items: OrderConfirmationItem[]; total: number; currency: string },
) {
  const url = `${env.CLIENT_URL}/orders/${order.orderNumber}/confirmation`;
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding: 6px 0; font-size: 13px;">${escapeHtml(item.name)}</td><td style="padding: 6px 0; font-size: 13px; text-align: right; color: #6b7280;">x${item.quantity}</td></tr>`,
    )
    .join("");

  await sendMail(
    to,
    `Order confirmed — ${order.orderNumber}`,
    layout(
      `Thanks for your order, ${escapeHtml(name)}`,
      `
        <p>Your order <strong>${escapeHtml(order.orderNumber)}</strong> is confirmed. Here's what you ordered:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${itemsHtml}
        </table>
        <p style="font-size: 15px; font-weight: bold;">Total: ${escapeHtml(order.currency)} ${order.total.toFixed(2)}</p>
      `,
      "View order",
      url,
    ),
  );
}

export async function sendBookingConfirmationEmail(
  to: string,
  name: string,
  booking: {
    bookingNumber: string;
    serviceName: string;
    providerName: string;
    scheduledDateLabel: string;
    scheduledTimeLabel: string;
    price: number;
    currency: string;
  },
) {
  const url = `${env.CLIENT_URL}/bookings/${booking.bookingNumber}/confirmation`;

  await sendMail(
    to,
    `Booking confirmed — ${booking.bookingNumber}`,
    layout(
      `Thanks for booking, ${escapeHtml(name)}`,
      `
        <p>Your booking <strong>${escapeHtml(booking.bookingNumber)}</strong> for <strong>${escapeHtml(booking.serviceName)}</strong> with
        ${escapeHtml(booking.providerName)} is confirmed.</p>
        <p style="margin: 16px 0;">
          <strong>When:</strong> ${escapeHtml(booking.scheduledDateLabel)} at ${escapeHtml(booking.scheduledTimeLabel)}
        </p>
        <p style="font-size: 15px; font-weight: bold;">Total: ${escapeHtml(booking.currency)} ${booking.price.toFixed(2)}</p>
      `,
      "View booking",
      url,
    ),
  );
}

export async function sendPostDeliveryThankYouEmail(to: string, name: string, order: { orderNumber: string }) {
  const url = `${env.CLIENT_URL}/orders/${order.orderNumber}/track`;
  await sendMail(
    to,
    "Thank you for shopping with Nexora!",
    layout(
      `Thank you for shopping with us, ${escapeHtml(name)}`,
      `<p>We appreciate your business and look forward to serving you again.</p>`,
      "View order",
      url,
    ),
  );
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  heading: string,
  bodyHtml: string,
  order: { orderNumber: string },
) {
  const url = `${env.CLIENT_URL}/orders/${order.orderNumber}/track`;
  await sendMail(to, subject, layout(heading, bodyHtml, "Track order", url));
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  name: string,
  order: { orderNumber: string; statusLabel: string; statusDescription: string },
) {
  const url = `${env.CLIENT_URL}/orders/${order.orderNumber}/track`;
  await sendMail(
    to,
    `Order ${order.orderNumber} — ${order.statusLabel}`,
    layout(
      `Hi ${escapeHtml(name)}, your order status changed`,
      `
        <p>Your order <strong>${escapeHtml(order.orderNumber)}</strong> is now:</p>
        <p style="font-size: 17px; font-weight: bold; margin: 12px 0;">${escapeHtml(order.statusLabel)}</p>
        <p>${escapeHtml(order.statusDescription)}</p>
      `,
      "Track order",
      url,
    ),
  );
}
