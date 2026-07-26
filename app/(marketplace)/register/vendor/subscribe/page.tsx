import type { Metadata } from "next";
import { VendorSubscriptionContent } from "@/components/auth/vendor-subscription-content";

export const metadata: Metadata = { title: "Choose a subscription plan — Nexora" };

export default async function VendorSubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string }>;
}) {
  const { applicationId } = await searchParams;

  return <VendorSubscriptionContent applicationId={applicationId} />;
}
