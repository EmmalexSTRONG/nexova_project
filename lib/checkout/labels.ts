import type { CheckoutPaymentMethod } from "./types";

export const PAYMENT_METHOD_LABEL: Record<CheckoutPaymentMethod, string> = {
  PAYSTACK: "Paystack",
  FLUTTERWAVE: "Flutterwave",
  CASH: "Cash",
};
