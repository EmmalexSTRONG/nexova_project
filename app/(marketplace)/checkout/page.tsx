import type { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { CheckoutPageContent } from "@/components/checkout/checkout-page-content";

export const metadata: Metadata = {
  title: "Checkout — Nexora",
};

export default async function CheckoutPage() {
  const session = await auth();

  return (
    <CheckoutPageContent defaultName={session?.user?.name ?? undefined} defaultEmail={session?.user?.email ?? undefined} />
  );
}
