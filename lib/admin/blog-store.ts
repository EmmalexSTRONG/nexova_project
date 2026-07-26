import { createRecordStore, createListStore } from "@/lib/shared/local-storage-store";
import type { MockBlogPost } from "@/lib/data";

// Seed posts (lib/data/blog.ts) are static, so edits are stored as a partial
// overlay keyed by slug, mirroring the vendor product-edit-store pattern.
// Admin-authored posts live in a separate, directly-mutable list store, and
// deleted seed posts are tracked as a tombstone list of slugs since the seed
// array itself can't be spliced at runtime.
export const BLOG_POST_EDITS_STORAGE_KEY = "nexora:admin-blog-edits:v1";
export const BLOG_POST_CREATED_STORAGE_KEY = "nexora:admin-blog-created:v1";
export const BLOG_POST_DELETED_STORAGE_KEY = "nexora:admin-blog-deleted:v1";

const editsStore = createRecordStore<Partial<MockBlogPost>>(BLOG_POST_EDITS_STORAGE_KEY);
const createdStore = createListStore<MockBlogPost>(BLOG_POST_CREATED_STORAGE_KEY);
const deletedStore = createListStore<string>(BLOG_POST_DELETED_STORAGE_KEY);

export function saveBlogPostEdit(slug: string, patch: Partial<MockBlogPost>): void {
  const all = editsStore.readAll();
  all[slug] = { ...all[slug], ...patch };
  editsStore.writeAll(all);
}

function applyBlogPostEdits(posts: MockBlogPost[]): MockBlogPost[] {
  const edits = editsStore.readAll();
  return posts.map((post) => (edits[post.slug] ? { ...post, ...edits[post.slug] } : post));
}

export function addAdminBlogPost(post: MockBlogPost): void {
  const all = createdStore.readAll();
  all.unshift(post);
  createdStore.writeAll(all);
}

export function getAdminBlogPostBySlug(slug: string): MockBlogPost | undefined {
  return createdStore.readAll().find((post) => post.slug === slug);
}

export function updateAdminBlogPost(slug: string, patch: Partial<MockBlogPost>): void {
  const all = createdStore.readAll();
  const index = all.findIndex((post) => post.slug === slug);
  if (index === -1) return;
  all[index] = { ...all[index], ...patch };
  createdStore.writeAll(all);
}

export function deleteBlogPost(slug: string): void {
  const created = createdStore.readAll();
  if (created.some((post) => post.slug === slug)) {
    createdStore.writeAll(created.filter((post) => post.slug !== slug));
    return;
  }
  const deleted = deletedStore.readAll();
  if (!deleted.includes(slug)) {
    deleted.push(slug);
    deletedStore.writeAll(deleted);
  }
}

// Unified read: seed posts (edited, minus deleted) + admin-created posts,
// newest first — this is what the admin list table reads. `skipOverlay`
// forces the same (localStorage-free) result the server sees, for seeding
// client `useState` initial values so the first client render matches the
// SSR'd HTML — see the matching comment in category-store.ts.
export function getAllBlogPostsForAdmin(staticPosts: MockBlogPost[], skipOverlay = false): MockBlogPost[] {
  if (skipOverlay) {
    return [...staticPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const deleted = new Set(deletedStore.readAll());
  const edited = applyBlogPostEdits(staticPosts).filter((post) => !deleted.has(post.slug));
  const created = createdStore.readAll();
  return [...created, ...edited].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// A scheduled post whose scheduledAt has passed is treated as published
// without any manual admin action — satisfies "auto activate" scheduling.
export function getEffectiveStatus(post: MockBlogPost): MockBlogPost["status"] {
  if (post.status === "SCHEDULED" && post.scheduledAt && new Date(post.scheduledAt).getTime() <= Date.now()) {
    return "PUBLISHED";
  }
  return post.status;
}

export function getPublishedBlogPosts(staticPosts: MockBlogPost[], limit?: number, skipOverlay = false): MockBlogPost[] {
  const all = getAllBlogPostsForAdmin(staticPosts, skipOverlay);
  const published = all
    .filter((post) => getEffectiveStatus(post) === "PUBLISHED")
    .sort((a, b) => {
      const aTime = new Date(a.publishedAt ?? a.scheduledAt ?? a.createdAt).getTime();
      const bTime = new Date(b.publishedAt ?? b.scheduledAt ?? b.createdAt).getTime();
      return bTime - aTime;
    });
  return limit ? published.slice(0, limit) : published;
}
