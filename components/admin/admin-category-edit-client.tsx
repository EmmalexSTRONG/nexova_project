"use client";

import type { MockCategory } from "@/lib/data";
import {
  CATEGORY_CREATED_STORAGE_KEY,
  CATEGORY_DELETED_STORAGE_KEY,
  CATEGORY_EDITS_STORAGE_KEY,
  getCategoryBySlugForAdmin,
} from "@/lib/admin/category-store";
import { useResolvedEntity } from "@/lib/shared/use-resolved-entity";
import { AdminCategoryForm } from "@/components/admin/admin-category-form";
import { AdminEntityEditShell } from "@/components/admin/admin-entity-edit-shell";

export function AdminCategoryEditClient({ slug, staticCategories }: { slug: string; staticCategories: MockCategory[] }) {
  const category = useResolvedEntity<MockCategory>(
    () => getCategoryBySlugForAdmin(staticCategories, slug) ?? null,
    [CATEGORY_EDITS_STORAGE_KEY, CATEGORY_CREATED_STORAGE_KEY, CATEGORY_DELETED_STORAGE_KEY, slug],
  );

  return (
    <AdminEntityEditShell
      entity={category}
      loadingLabel="Loading category..."
      notFoundMessage="This category couldn't be found."
      backHref="/admin/categories"
      backLabel="Back to categories"
      title="Edit category"
      description={(resolved) => `Update "${resolved.name}".`}
    >
      {(resolved) => <AdminCategoryForm category={resolved} />}
    </AdminEntityEditShell>
  );
}
