import type { Metadata } from "next";
import { OrderDocumentPageContent } from "@/components/checkout/order-document-page-content";

export const metadata: Metadata = {
  title: "Invoice — Nexora",
};

export default async function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDocumentPageContent orderNumber={id} variant="invoice" />;
}
