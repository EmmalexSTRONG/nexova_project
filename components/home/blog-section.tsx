"use client";

import { useState } from "react";
import { blogPosts as staticPosts } from "@/lib/data";
import {
  BLOG_POST_CREATED_STORAGE_KEY,
  BLOG_POST_DELETED_STORAGE_KEY,
  BLOG_POST_EDITS_STORAGE_KEY,
  getPublishedBlogPosts,
} from "@/lib/admin/blog-store";
import { LIVE_REFRESH_MEDIUM_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { BlogFeatureCard, BlogCompactCard } from "@/components/marketplace/blog-spotlight-card";
import { SectionHeader } from "@/components/shared/section-header";

export function BlogSection() {
  const [posts, setPosts] = useState(() => getPublishedBlogPosts(staticPosts, 4, true));

  useLiveRefresh(
    () => setPosts(getPublishedBlogPosts(staticPosts, 4)),
    [BLOG_POST_EDITS_STORAGE_KEY, BLOG_POST_CREATED_STORAGE_KEY, BLOG_POST_DELETED_STORAGE_KEY],
    LIVE_REFRESH_MEDIUM_MS,
  );

  const [featured, ...rest] = posts;
  const sidebar = rest.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-ink py-12 md:py-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px gold-gradient opacity-40" aria-hidden="true" />

      <div className="container relative">
        <SectionHeader
          eyebrow="Read"
          title="From the blog"
          description="Shopping guides, vendor spotlights, and market news."
          href="/blog"
          tone="inverted"
        />
        {featured && (
          <div className="flex flex-col gap-4 lg:h-[420px] lg:flex-row">
            <BlogFeatureCard post={featured} className="lg:w-[58%]" />
            <div className="flex flex-col gap-3 lg:h-full lg:w-[42%]">
              {sidebar.map((post) => (
                <BlogCompactCard key={post.id} post={post} className="lg:flex-1" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
