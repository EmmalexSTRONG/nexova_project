import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { categories } from "@/lib/data";
import { AdminCategoryForm } from "@/components/admin/admin-category-form";

export const metadata: Metadata = {
  title: "Add category — Nexora Admin",
};

export default function AdminNewCategoryPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href="/admin/categories" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to categories
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Add category</h1>
        <p className="text-sm text-muted-foreground">New categories appear across the site immediately.</p>
      </div>
      <AdminCategoryForm nextSortOrder={categories.length} />
    </div>
  );
}
