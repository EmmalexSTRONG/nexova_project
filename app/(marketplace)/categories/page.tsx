import type { Metadata } from "next";
import { categories } from "@/lib/data";
import { CategoriesGrid } from "@/components/marketplace/categories-grid";

export const metadata: Metadata = {
  title: "Shop by category — Nexora",
  description: "Browse every category on Nexora — phones, fashion, home, beauty, groceries, and more.",
};

export default function CategoriesPage() {
  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Shop by category</h1>
      <CategoriesGrid staticCategories={categories} />
    </div>
  );
}
