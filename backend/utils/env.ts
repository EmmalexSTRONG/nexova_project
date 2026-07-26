import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url(),
  // Pooled connection (PgBouncer transaction mode) — used at runtime by Prisma Client.
  DATABASE_URL: z.string().min(1),
  // Direct (non-pooled) connection — required by `prisma migrate` because the
  // pooled connection doesn't support the prepared statements migrations need.
  // Supabase: copy this from the "Direct connection" tab, DATABASE_URL from "Transaction" pooler.
  // Defaults to DATABASE_URL so local/dev setups without a pooler don't need to set both.
  DIRECT_URL: z.string().min(1).optional(),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
  REFRESH_TOKEN_TTL_DAYS_REMEMBER: z.coerce.number().default(30),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  EMAIL_VERIFICATION_TOKEN_TTL_HOURS: z.coerce.number().default(24),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().default(30),

  INTERNAL_API_SECRET: z.string().min(32, "INTERNAL_API_SECRET must be at least 32 characters"),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().min(1),

  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_PUBLIC_KEY: z.string().min(1).optional(),

  FLUTTERWAVE_SECRET_KEY: z.string().min(1),
  FLUTTERWAVE_WEBHOOK_HASH: z.string().min(1),

  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),

  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_SMS_FROM: z.string().min(1),
  TWILIO_WHATSAPP_FROM: z.string().min(1),

  VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().min(1).default("mailto:support@nexora.example"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = {
  ...parsed.data,
  // Migrations need a non-pooled connection; fall back to DATABASE_URL when
  // the deployment has no separate pooler (local Docker/dev Postgres).
  DIRECT_URL: parsed.data.DIRECT_URL ?? parsed.data.DATABASE_URL,
};
