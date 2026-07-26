import type { Metadata } from "next";
import { OrderDocumentPageContent } from "@/components/checkout/order-document-page-content";

export const metadata: Metadata = {
  title: "Receipt — Nexora",
};

export default async function OrderReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDocumentPageContent orderNumber={id} variant="receipt" />;
}
