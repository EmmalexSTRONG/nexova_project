import type { Metadata } from "next";
import { AdminFlashSalesContent } from "@/components/admin/admin-flash-sales-content";

export const metadata: Metadata = {
  title: "Flash sales — Nexora Admin",
};

export default function AdminFlashSalesPage() {
  return <AdminFlashSalesContent />;
}
