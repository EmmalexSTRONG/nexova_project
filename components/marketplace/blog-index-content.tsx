"use client";

import { useState } from "react";
import type { MockBlogPost } from "@/lib/data";
import {
  BLOG_POST_CREATED_STORAGE_KEY,
  BLOG_POST_DELETED_STORAGE_KEY,
  BLOG_POST_EDITS_STORAGE_KEY,
  getPublishedBlogPosts,
} from "@/lib/admin/blog-store";
import { LIVE_REFRESH_MEDIUM_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { usePagedList } from "@/lib/shared/use-paged-list";
import { BlogCard } from "@/components/marketplace/blog-card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

export function BlogIndexContent({ staticPosts }: { staticPosts: MockBlogPost[] }) {
  const [posts, setPosts] = useState<MockBlogPost[]>(() => getPublishedBlogPosts(staticPosts, undefined, true));

  useLiveRefresh(
    () => setPosts(getPublishedBlogPosts(staticPosts)),
    [BLOG_POST_EDITS_STORAGE_KEY, BLOG_POST_CREATED_STORAGE_KEY, BLOG_POST_DELETED_STORAGE_KEY],
    LIVE_REFRESH_MEDIUM_MS,
  );

  const { visible, hasMore, loadMore, announcement } = usePagedList(posts, PAGE_SIZE);

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((post) => (
          <BlogCard key={post.id} post={post} />
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
  );
}
