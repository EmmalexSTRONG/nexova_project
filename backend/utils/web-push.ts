import crypto from "crypto";
import { env } from "../utils/env";

// A hand-rolled implementation of the Web Push protocol — VAPID
// application-server authentication (RFC 8292) and aes128gcm payload
// encryption (RFC 8291, built on the content-coding in RFC 8188) — since
// there's no `web-push` package available in this environment. Every step
// here mirrors what that library does internally, using only Node's
// built-in crypto module.

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64");
}

function hmacSha256(key: Buffer, data: Buffer): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest();
}

// HKDF-Expand for a single block — every key we derive here is <=32 bytes,
// so one HMAC round (RFC 5869's T(1)) is always sufficient.
function hkdfExpandOneBlock(prk: Buffer, info: Buffer, length: number): Buffer {
  return hmacSha256(prk, Buffer.concat([info, Buffer.from([0x01])])).subarray(0, length);
}

function getVapidPrivateKey(): crypto.KeyObject {
  const privateRaw = base64UrlDecode(env.VAPID_PRIVATE_KEY);
  const publicRaw = base64UrlDecode(env.VAPID_PUBLIC_KEY);
  const x = publicRaw.subarray(1, 33);
  const y = publicRaw.subarray(33, 65);

  return crypto.createPrivateKey({
    key: { kty: "EC", crv: "P-256", x: base64UrlEncode(x), y: base64UrlEncode(y), d: base64UrlEncode(privateRaw) },
    format: "jwk",
  });
}

function buildVapidAuthorizationHeader(audience: string): string {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: env.VAPID_SUBJECT,
  };

  const signingInput = `${base64UrlEncode(Buffer.from(JSON.stringify(header)))}.${base64UrlEncode(Buffer.from(JSON.stringify(payload)))}`;

  // JWS ES256 requires the raw, fixed-length r||s signature (64 bytes for
  // P-256) — "ieee-p1363" gives that directly instead of crypto.sign()'s
  // default ASN.1 DER encoding.
  const signature = crypto.sign("sha256", Buffer.from(signingInput), {
    key: getVapidPrivateKey(),
    dsaEncoding: "ieee-p1363",
  });

  const jwt = `${signingInput}.${base64UrlEncode(signature)}`;
  return `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`;
}

export interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// RFC 8291 §3.4: derive the content-encryption key and nonce from the
// ECDH shared secret and the subscription's auth secret, then encrypt with
// AES-128-GCM and wrap the result in an RFC 8188 aes128gcm record.
function encryptPayload(subscriptionKeys: PushSubscription["keys"], payload: Buffer) {
  const userPublicKey = base64UrlDecode(subscriptionKeys.p256dh);
  const authSecret = base64UrlDecode(subscriptionKeys.auth);

  const localEcdh = crypto.createECDH("prime256v1");
  localEcdh.generateKeys();
  const serverPublicKey = localEcdh.getPublicKey();
  const ecdhSecret = localEcdh.computeSecret(userPublicKey);

  const keyInfo = Buffer.concat([Buffer.from("WebPush: info\0", "utf8"), userPublicKey, serverPublicKey]);
  const prkKey = hmacSha256(authSecret, ecdhSecret);
  const ikm = hkdfExpandOneBlock(prkKey, keyInfo, 32);

  const salt = crypto.randomBytes(16);
  const prk = hmacSha256(salt, ikm);

  const cek = hkdfExpandOneBlock(prk, Buffer.from("Content-Encoding: aes128gcm\0", "utf8"), 16);
  const nonce = hkdfExpandOneBlock(prk, Buffer.from("Content-Encoding: nonce\0", "utf8"), 12);

  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const paddedPlaintext = Buffer.concat([payload, Buffer.from([0x02])]); // 0x02 = "last record" delimiter, no padding
  const encrypted = Buffer.concat([cipher.update(paddedPlaintext), cipher.final(), cipher.getAuthTag()]);

  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096, 0);
  const keyIdLength = Buffer.from([serverPublicKey.length]);

  return Buffer.concat([salt, recordSize, keyIdLength, serverPublicKey, encrypted]);
}

export async function sendWebPush(
  subscription: PushSubscription,
  payload: Record<string, unknown>,
  options?: { ttlSeconds?: number; urgency?: "very-low" | "low" | "normal" | "high" },
): Promise<{ status: number }> {
  const body = encryptPayload(subscription.keys, Buffer.from(JSON.stringify(payload), "utf8"));
  const endpointUrl = new URL(subscription.endpoint);
  const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: String(options?.ttlSeconds ?? 60 * 60 * 24),
      Urgency: options?.urgency ?? "normal",
      Authorization: buildVapidAuthorizationHeader(audience),
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Web Push request failed with status ${res.status}: ${text}`);
  }

  return { status: res.status };
}
