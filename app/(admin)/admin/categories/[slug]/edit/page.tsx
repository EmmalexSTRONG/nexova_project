import type { Metadata } from "next";
import { categories } from "@/lib/data";
import { AdminCategoryEditClient } from "@/components/admin/admin-category-edit-client";

export const metadata: Metadata = {
  title: "Edit category — Nexora Admin",
};

export default async function AdminEditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AdminCategoryEditClient slug={slug} staticCategories={categories} />;
}
