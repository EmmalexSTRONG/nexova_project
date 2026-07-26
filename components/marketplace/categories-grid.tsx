"use client";

import { useState } from "react";
import type { MockCategory } from "@/lib/data";
import {
  CATEGORY_CREATED_STORAGE_KEY,
  CATEGORY_DELETED_STORAGE_KEY,
  CATEGORY_EDITS_STORAGE_KEY,
  getActiveCategoriesSorted,
} from "@/lib/admin/category-store";
import { useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { CategoryCard } from "@/components/marketplace/category-card";

export function CategoriesGrid({ staticCategories }: { staticCategories: MockCategory[] }) {
  const [categories, setCategories] = useState<MockCategory[]>(() => getActiveCategoriesSorted(staticCategories, true));

  useLiveRefresh(
    () => setCategories(getActiveCategoriesSorted(staticCategories)),
    [CATEGORY_EDITS_STORAGE_KEY, CATEGORY_CREATED_STORAGE_KEY, CATEGORY_DELETED_STORAGE_KEY],
  );

  return (
    <>
      <p className="mt-1 text-sm text-muted-foreground">{categories.length} categories across thousands of vendors.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </>
  );
}
