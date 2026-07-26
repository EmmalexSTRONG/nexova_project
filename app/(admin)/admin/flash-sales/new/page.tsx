import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminFlashSaleForm } from "@/components/admin/admin-flash-sale-form";

export const metadata: Metadata = {
  title: "New flash sale — Nexora Admin",
};

export default function AdminNewFlashSalePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href="/admin/flash-sales" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to flash sales
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">New flash sale campaign</h1>
        <p className="text-sm text-muted-foreground">Select products, set a discount, and pick a start and end time.</p>
      </div>
      <AdminFlashSaleForm />
    </div>
  );
}
