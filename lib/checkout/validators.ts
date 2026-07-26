import { z } from "zod";
import { GHANA_REGIONS } from "@/lib/shipping";

export const checkoutContactAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number in international format"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  line1: z.string().trim().min(3, "Enter your street address"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city or town"),
  region: z.enum(GHANA_REGIONS, { message: "Select your region" }),
});

export type CheckoutContactAddressInput = z.infer<typeof checkoutContactAddressSchema>;

export const checkoutContactOnlySchema = checkoutContactAddressSchema.pick({
  fullName: true,
  phone: true,
  email: true,
});

export type CheckoutContactOnlyInput = z.infer<typeof checkoutContactOnlySchema>;
