"use client";

import { useState } from "react";
import { categories as staticCategories } from "@/lib/data";
import {
  CATEGORY_CREATED_STORAGE_KEY,
  CATEGORY_DELETED_STORAGE_KEY,
  CATEGORY_EDITS_STORAGE_KEY,
  getActiveCategoriesSorted,
} from "@/lib/admin/category-store";
import { useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { CategoryCard } from "@/components/marketplace/category-card";
import { SectionHeader } from "@/components/shared/section-header";

export function CategoriesSection() {
  const [categories, setCategories] = useState(() => getActiveCategoriesSorted(staticCategories, true));

  useLiveRefresh(
    () => setCategories(getActiveCategoriesSorted(staticCategories)),
    [CATEGORY_EDITS_STORAGE_KEY, CATEGORY_CREATED_STORAGE_KEY, CATEGORY_DELETED_STORAGE_KEY],
  );

  return (
    <section className="bg-card py-12 md:py-16">
      <div className="container">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by category"
          description="From street fashion to home essentials — find your vendor by department."
          href="/categories"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
