import { createRecordStore, createListStore } from "@/lib/shared/local-storage-store";
import type { MockCategory } from "@/lib/data";

// Same overlay pattern as blog-store.ts: static seed categories get a
// partial-edit overlay keyed by slug, admin-added categories live in a
// mutable list store, and deletions of seed categories are tracked as
// tombstones since the static array can't be spliced at runtime.
export const CATEGORY_EDITS_STORAGE_KEY = "nexora:admin-category-edits:v1";
export const CATEGORY_CREATED_STORAGE_KEY = "nexora:admin-category-created:v1";
export const CATEGORY_DELETED_STORAGE_KEY = "nexora:admin-category-deleted:v1";

const editsStore = createRecordStore<Partial<MockCategory>>(CATEGORY_EDITS_STORAGE_KEY);
const createdStore = createListStore<MockCategory>(CATEGORY_CREATED_STORAGE_KEY);
const deletedStore = createListStore<string>(CATEGORY_DELETED_STORAGE_KEY);

function applyCategoryEdits(categories: MockCategory[]): MockCategory[] {
  const edits = editsStore.readAll();
  return categories.map((category) => (edits[category.slug] ? { ...category, ...edits[category.slug] } : category));
}

// Writes a patch to whichever store the category actually lives in.
function persistCategoryPatch(slug: string, patch: Partial<MockCategory>): void {
  const created = createdStore.readAll();
  const index = created.findIndex((category) => category.slug === slug);
  if (index !== -1) {
    created[index] = { ...created[index], ...patch };
    createdStore.writeAll(created);
    return;
  }
  const edits = editsStore.readAll();
  edits[slug] = { ...edits[slug], ...patch };
  editsStore.writeAll(edits);
}

export function addCategory(category: MockCategory): void {
  const all = createdStore.readAll();
  all.unshift(category);
  createdStore.writeAll(all);
}

export function updateCategory(slug: string, patch: Partial<MockCategory>): void {
  persistCategoryPatch(slug, patch);
}

export function setCategoryActive(slug: string, isActive: boolean): void {
  persistCategoryPatch(slug, { isActive });
}

export function deleteCategory(slug: string): void {
  const created = createdStore.readAll();
  if (created.some((category) => category.slug === slug)) {
    createdStore.writeAll(created.filter((category) => category.slug !== slug));
    return;
  }
  const deleted = deletedStore.readAll();
  if (!deleted.includes(slug)) {
    deleted.push(slug);
    deletedStore.writeAll(deleted);
  }
}

// Persists a new top-to-bottom display order for every visible category.
export function reorderCategories(orderedSlugs: string[]): void {
  orderedSlugs.forEach((slug, index) => persistCategoryPatch(slug, { sortOrder: index }));
}

// Full merged list for the admin table: static (edited, minus deleted) +
// admin-added, sorted by sortOrder. `skipOverlay` forces the same result the
// server sees (no localStorage) — used to seed client `useState` initial
// values so the first client render matches the SSR'd HTML exactly; the
// overlay is then applied a moment later via `useLiveRefresh`, instead of
// racing hydration and risking a mismatch whenever the browser already has
// admin edits saved from a previous visit.
export function getAllCategoriesForAdmin(staticCategories: MockCategory[], skipOverlay = false): MockCategory[] {
  if (skipOverlay) {
    return [...staticCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }
  const deleted = new Set(deletedStore.readAll());
  const edited = applyCategoryEdits(staticCategories).filter((category) => !deleted.has(category.slug));
  const created = createdStore.readAll();
  return [...edited, ...created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getCategoryBySlugForAdmin(
  staticCategories: MockCategory[],
  slug: string,
  skipOverlay = false,
): MockCategory | undefined {
  return getAllCategoriesForAdmin(staticCategories, skipOverlay).find((category) => category.slug === slug);
}

// Public read API for every site-wide consumer (header strip, homepage
// grid, product/service category pickers): active categories, in order.
export function getActiveCategoriesSorted(staticCategories: MockCategory[], skipOverlay = false): MockCategory[] {
  return getAllCategoriesForAdmin(staticCategories, skipOverlay).filter((category) => category.isActive !== false);
}
