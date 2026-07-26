"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { MockBlogPost } from "@/lib/data";
import { blogIcon } from "@/lib/icon-map";
import {
  BLOG_POST_CREATED_STORAGE_KEY,
  BLOG_POST_DELETED_STORAGE_KEY,
  BLOG_POST_EDITS_STORAGE_KEY,
  getAllBlogPostsForAdmin,
  getEffectiveStatus,
  getPublishedBlogPosts,
} from "@/lib/admin/blog-store";
import { LIVE_REFRESH_MEDIUM_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/marketplace/blog-card";

function resolvePost(staticPosts: MockBlogPost[], slug: string, skipOverlay = false): MockBlogPost | null {
  const found = getAllBlogPostsForAdmin(staticPosts, skipOverlay).find((p) => p.slug === slug);
  return found && getEffectiveStatus(found) === "PUBLISHED" ? found : null;
}

function resolveRelated(staticPosts: MockBlogPost[], slug: string, skipOverlay = false): MockBlogPost[] {
  return getPublishedBlogPosts(staticPosts, undefined, skipOverlay)
    .filter((p) => p.slug !== slug)
    .slice(0, 3);
}

export function BlogDetailContent({ slug, staticPosts }: { slug: string; staticPosts: MockBlogPost[] }) {
  // Seeded synchronously (safe during SSR too — the store's localStorage
  // read is a no-op on the server, so this degrades to the static post) so
  // the initial HTML has real content instead of a loading placeholder.
  const [post, setPost] = useState<MockBlogPost | null>(() => resolvePost(staticPosts, slug, true));
  const [related, setRelated] = useState<MockBlogPost[]>(() => resolveRelated(staticPosts, slug, true));

  useLiveRefresh(
    () => {
      setPost(resolvePost(staticPosts, slug));
      setRelated(resolveRelated(staticPosts, slug));
    },
    [BLOG_POST_EDITS_STORAGE_KEY, BLOG_POST_CREATED_STORAGE_KEY, BLOG_POST_DELETED_STORAGE_KEY, slug],
    LIVE_REFRESH_MEDIUM_MS,
  );

  if (post === null) {
    return (
      <div className="container max-w-2xl space-y-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">This article couldn&apos;t be found.</p>
        <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
        <span>/</span>
        <span className="text-foreground">{post.title}</span>
      </nav>

      <Badge variant="ink">{post.category}</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance">{post.title}</h1>
      <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
        <span>{post.author}</span>
        <span aria-hidden="true">·</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {post.readMinutes} min read
        </span>
      </div>

      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg">
        <ProductImage image={post.image} seed={post.seed} icon={blogIcon} alt={post.title} className="h-full w-full" />
      </div>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground">
        {post.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-lg font-semibold">More from the blog</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((relatedPost) => (
              <BlogCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
