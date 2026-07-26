"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Newspaper, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { MockBlogPost } from "@/lib/data";
import { blogIcon } from "@/lib/icon-map";
import {
  BLOG_POST_CREATED_STORAGE_KEY,
  BLOG_POST_DELETED_STORAGE_KEY,
  BLOG_POST_EDITS_STORAGE_KEY,
  deleteBlogPost,
  getAllBlogPostsForAdmin,
  getEffectiveStatus,
} from "@/lib/admin/blog-store";
import { getBlogCategories } from "@/lib/admin/blog-categories-store";
import { confirmAndDelete } from "@/lib/shared/confirm-delete";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";

const STATUS_BADGE: Record<MockBlogPost["status"], { label: string; variant: "secondary" | "outline" | "success" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SCHEDULED: { label: "Scheduled", variant: "outline" },
  PUBLISHED: { label: "Published", variant: "success" },
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminBlogContent({ initialPosts }: { initialPosts: MockBlogPost[] }) {
  const [posts, setPosts] = useState<MockBlogPost[]>(() => getAllBlogPostsForAdmin(initialPosts));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | MockBlogPost["status"]>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    function load() {
      setPosts(getAllBlogPostsForAdmin(initialPosts));
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (
        event.key === null ||
        [BLOG_POST_EDITS_STORAGE_KEY, BLOG_POST_CREATED_STORAGE_KEY, BLOG_POST_DELETED_STORAGE_KEY].includes(event.key)
      ) {
        load();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialPosts]);

  const categories = useMemo(() => getBlogCategories(), [posts]);

  const filtered = posts.filter((post) => {
    const effectiveStatus = getEffectiveStatus(post);
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || effectiveStatus === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  function handleDelete(slug: string, title: string) {
    confirmAndDelete(`Delete "${title}"? This can't be undone.`, () => {
      deleteBlogPost(slug);
      setPosts(getAllBlogPostsForAdmin(initialPosts));
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"} · {posts.filter((p) => getEffectiveStatus(p) === "PUBLISHED").length} published
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            aria-label="Search posts"
            className="pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          aria-label="Filter by status"
          className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="ALL">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState
          icon={Newspaper}
          title="No posts found"
          description={posts.length === 0 ? "Create your first blog post to get started." : "Try a different search or filter."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => {
            const status = STATUS_BADGE[getEffectiveStatus(post)];
            return (
              <div
                key={post.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <ProductImage
                  image={post.image}
                  seed={post.seed}
                  icon={blogIcon}
                  alt={post.title}
                  className="h-14 w-20 shrink-0 rounded-md"
                  iconClassName="h-1/3 w-1/3"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-sm font-semibold">{post.title}</h2>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{post.excerpt}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {post.author} · {post.readMinutes} min read ·{" "}
                    {post.status === "SCHEDULED" ? `Scheduled for ${formatDate(post.scheduledAt)}` : formatDate(post.publishedAt ?? post.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/blog/${post.slug}/edit`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.slug, post.title)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-destructive hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
