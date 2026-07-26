import { env } from "../utils/env";

const TWILIO_BASE_URL = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;

interface TwilioMessageResponse {
  sid?: string;
  status?: string;
  message?: string;
  error_message?: string | null;
}

async function sendTwilioMessage(input: { to: string; from: string; body: string }): Promise<{ sid: string; status: string }> {
  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const params = new URLSearchParams({ To: input.to, From: input.from, Body: input.body });

  const res = await fetch(TWILIO_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const result = (await res.json()) as TwilioMessageResponse;
  if (!res.ok) {
    throw new Error(result.message || result.error_message || `Twilio request failed with status ${res.status}`);
  }
  return { sid: result.sid ?? "", status: result.status ?? "unknown" };
}

export async function sendSms(to: string, body: string) {
  return sendTwilioMessage({ to, from: env.TWILIO_SMS_FROM, body });
}

// Twilio's WhatsApp product reuses the same Messages API — only the
// "whatsapp:" scheme prefix on To/From distinguishes it from plain SMS.
export async function sendWhatsApp(to: string, body: string) {
  const normalizedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  return sendTwilioMessage({ to: normalizedTo, from: env.TWILIO_WHATSAPP_FROM, body });
}
