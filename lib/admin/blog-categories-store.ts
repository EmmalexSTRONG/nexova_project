import { createListStore } from "@/lib/shared/local-storage-store";

// Blog post categories are a simple admin-managed tag list — distinct from
// product/service Category (see category-store.ts), which needs the fuller
// icon/image/reorder/enable-disable treatment. Seeded from the categories
// already used by the static blog posts.
export const BLOG_CATEGORIES_STORAGE_KEY = "nexora:admin-blog-categories:v1";
const store = createListStore<string>(BLOG_CATEGORIES_STORAGE_KEY);

const SEED_BLOG_CATEGORIES = ["Fashion", "Guides", "Vendor Spotlight", "Family"];

export function getBlogCategories(): string[] {
  return Array.from(new Set([...SEED_BLOG_CATEGORIES, ...store.readAll()]));
}

export function addBlogCategory(name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = getBlogCategories();
  if (existing.some((category) => category.toLowerCase() === trimmed.toLowerCase())) return;
  const added = store.readAll();
  added.push(trimmed);
  store.writeAll(added);
}
