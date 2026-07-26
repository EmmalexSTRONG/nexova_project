"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, LayoutGrid, Pencil, Plus, Trash2 } from "lucide-react";
import type { MockCategory } from "@/lib/data";
import { getCategoryIconForCategory } from "@/lib/icon-map";
import {
  CATEGORY_CREATED_STORAGE_KEY,
  CATEGORY_DELETED_STORAGE_KEY,
  CATEGORY_EDITS_STORAGE_KEY,
  deleteCategory,
  getAllCategoriesForAdmin,
  reorderCategories,
  setCategoryActive,
} from "@/lib/admin/category-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { confirmAndDelete } from "@/lib/shared/confirm-delete";

export function AdminCategoriesContent({ initialCategories }: { initialCategories: MockCategory[] }) {
  const [categories, setCategories] = useState<MockCategory[]>(() => getAllCategoriesForAdmin(initialCategories));

  useEffect(() => {
    function load() {
      setCategories(getAllCategoriesForAdmin(initialCategories));
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (
        event.key === null ||
        [CATEGORY_EDITS_STORAGE_KEY, CATEGORY_CREATED_STORAGE_KEY, CATEGORY_DELETED_STORAGE_KEY].includes(event.key)
      ) {
        load();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialCategories]);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorderCategories(reordered.map((category) => category.slug));
    setCategories(getAllCategoriesForAdmin(initialCategories));
  }

  function handleToggleActive(category: MockCategory) {
    setCategoryActive(category.slug, category.isActive === false);
    setCategories(getAllCategoriesForAdmin(initialCategories));
  }

  function handleDelete(category: MockCategory) {
    confirmAndDelete(
      `Delete "${category.name}"? Products already using it keep the label, but it disappears from browsing.`,
      () => {
        deleteCategory(category.slug);
        setCategories(getAllCategoriesForAdmin(initialCategories));
      },
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} categories · {categories.filter((c) => c.isActive !== false).length} active
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" />
            Add category
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <AdminEmptyState icon={LayoutGrid} title="No categories yet" description="Add your first category to organize the catalog." />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-16 px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category, index) => {
                const Icon = getCategoryIconForCategory(category);
                return (
                  <tr key={category.slug} className="transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${category.name} up`}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === categories.length - 1}
                          aria-label={`Move ${category.name} down`}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-accent">
                          {category.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={`${category.image}?w=80&h=80&fit=crop&q=80`} alt="" className="h-full w-full object-cover" />
                          )}
                        </span>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </span>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">/{category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{category.productCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(category)}
                        aria-label={
                          category.isActive === false ? `Activate ${category.name}` : `Deactivate ${category.name}`
                        }
                      >
                        <Badge variant={category.isActive === false ? "secondary" : "success"} className="cursor-pointer">
                          {category.isActive === false ? "Disabled" : "Active"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/categories/${category.slug}/edit`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-destructive hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
