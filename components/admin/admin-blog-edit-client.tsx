"use client";

import type { MockBlogPost } from "@/lib/data";
import { BLOG_POST_CREATED_STORAGE_KEY, getAdminBlogPostBySlug } from "@/lib/admin/blog-store";
import { useResolvedEntity } from "@/lib/shared/use-resolved-entity";
import { AdminBlogForm } from "@/components/admin/admin-blog-form";
import { AdminEntityEditShell } from "@/components/admin/admin-entity-edit-shell";

type Resolved = { post: MockBlogPost; isAdminCreated: boolean };

export function AdminBlogEditClient({ slug, staticPosts }: { slug: string; staticPosts: MockBlogPost[] }) {
  const state = useResolvedEntity<Resolved>(
    () => {
      const created = getAdminBlogPostBySlug(slug);
      if (created) return { post: created, isAdminCreated: true };
      const base = staticPosts.find((post) => post.slug === slug);
      return base ? { post: base, isAdminCreated: false } : null;
    },
    [BLOG_POST_CREATED_STORAGE_KEY, slug],
  );

  return (
    <AdminEntityEditShell
      entity={state}
      loadingLabel="Loading post..."
      notFoundMessage="This post couldn't be found."
      backHref="/admin/blog"
      backLabel="Back to blog"
      title="Edit post"
      description={(resolved) => `Update "${resolved.post.title}".`}
    >
      {(resolved) => <AdminBlogForm post={resolved.post} isAdminCreated={resolved.isAdminCreated} />}
    </AdminEntityEditShell>
  );
}
