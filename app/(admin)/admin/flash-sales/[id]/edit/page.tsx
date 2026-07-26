import type { Metadata } from "next";
import { AdminFlashSaleEditClient } from "@/components/admin/admin-flash-sale-edit-client";

export const metadata: Metadata = {
  title: "Edit campaign — Nexora Admin",
};

export default async function AdminEditFlashSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminFlashSaleEditClient id={id} />;
}
