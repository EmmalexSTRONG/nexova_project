"use client";

import { useState } from "react";
import Link from "next/link";
import type { MockCategory } from "@/lib/data";
import { getProductsByCategory } from "@/lib/data";
import {
  CATEGORY_CREATED_STORAGE_KEY,
  CATEGORY_DELETED_STORAGE_KEY,
  CATEGORY_EDITS_STORAGE_KEY,
  getCategoryBySlugForAdmin,
} from "@/lib/admin/category-store";
import { getCategoryIconForCategory } from "@/lib/icon-map";
import { useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { usePagedList } from "@/lib/shared/use-paged-list";
import { ProductCard } from "@/components/marketplace/product-card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 16;

export function CategoryDetailContent({ slug, staticCategories }: { slug: string; staticCategories: MockCategory[] }) {
  // Seeded synchronously (safe during SSR too — the store's localStorage
  // read is a no-op on the server, so this degrades to the static category)
  // so the initial HTML has real content instead of a loading placeholder.
  const [category, setCategory] = useState<MockCategory | null>(
    () => getCategoryBySlugForAdmin(staticCategories, slug, true) ?? null,
  );

  useLiveRefresh(
    () => setCategory(getCategoryBySlugForAdmin(staticCategories, slug) ?? null),
    [CATEGORY_EDITS_STORAGE_KEY, CATEGORY_CREATED_STORAGE_KEY, CATEGORY_DELETED_STORAGE_KEY, slug],
  );

  if (category === null) {
    return (
      <div className="container max-w-2xl space-y-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">This category couldn&apos;t be found.</p>
        <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
          Back to categories
        </Link>
      </div>
    );
  }

  const CategoryIcon = getCategoryIconForCategory(category);
  const categoryProducts = getProductsByCategory(category.slug);
  const { visible, hasMore, loadMore, announcement } = usePagedList(categoryProducts, PAGE_SIZE);

  return (
    <div className="container py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-foreground">
          Categories
        </Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <CategoryIcon className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-sm text-muted-foreground">{categoryProducts.length.toLocaleString()} products</p>
        </div>
      </div>

      {categoryProducts.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">No products listed in this category yet.</p>
      )}
    </div>
  );
}
