import type { Metadata } from "next";
import { OrderConfirmationContent } from "@/components/checkout/order-confirmation-content";

export const metadata: Metadata = {
  title: "Order confirmed — Nexora",
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderConfirmationContent orderNumber={id} />;
}
