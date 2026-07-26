import type { Metadata } from "next";
import { OrderTrackingContent } from "@/components/checkout/order-tracking-content";

export const metadata: Metadata = {
  title: "Track order — Nexora",
};

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderTrackingContent orderNumber={id} />;
}
