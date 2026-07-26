import type { Metadata } from "next";
import { blogPosts } from "@/lib/data";
import { AdminBlogEditClient } from "@/components/admin/admin-blog-edit-client";

export const metadata: Metadata = {
  title: "Edit post — Nexora Admin",
};

export default async function AdminEditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AdminBlogEditClient slug={slug} staticPosts={blogPosts} />;
}
