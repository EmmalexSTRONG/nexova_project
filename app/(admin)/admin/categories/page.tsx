import type { Metadata } from "next";
import { categories } from "@/lib/data";
import { AdminCategoriesContent } from "@/components/admin/admin-categories-content";

export const metadata: Metadata = {
  title: "Categories — Nexora Admin",
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesContent initialCategories={categories} />;
}
