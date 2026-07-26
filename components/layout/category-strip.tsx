"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories as staticCategories } from "@/lib/data";
import {
  CATEGORY_CREATED_STORAGE_KEY,
  CATEGORY_DELETED_STORAGE_KEY,
  CATEGORY_EDITS_STORAGE_KEY,
  getActiveCategoriesSorted,
} from "@/lib/admin/category-store";
import { useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { cn } from "@/lib/utils";

export function CategoryStrip() {
  const pathname = usePathname();
  const [categories, setCategories] = useState(() => getActiveCategoriesSorted(staticCategories, true));

  useLiveRefresh(
    () => setCategories(getActiveCategoriesSorted(staticCategories)),
    [CATEGORY_EDITS_STORAGE_KEY, CATEGORY_CREATED_STORAGE_KEY, CATEGORY_DELETED_STORAGE_KEY],
  );

  return (
    <div className="border-t border-ink-border bg-ink">
      <nav className="container flex overflow-x-auto text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CategoryTab href="/categories" label="All Categories" active={pathname === "/categories"} />
        {categories.map((category) => (
          <CategoryTab
            key={category.id}
            href={`/categories/${category.slug}`}
            label={category.name}
            active={pathname === `/categories/${category.slug}`}
          />
        ))}
      </nav>
    </div>
  );
}

function CategoryTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 font-medium transition-colors first:pl-0",
        active
          ? "border-primary text-primary"
          : "border-transparent text-ink-muted hover:border-ink-border hover:text-ink-foreground",
      )}
    >
      {label}
    </Link>
  );
}
