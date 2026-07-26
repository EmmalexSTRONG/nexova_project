import type { Metadata } from "next";
import { blogPosts } from "@/lib/data";
import { AdminBlogContent } from "@/components/admin/admin-blog-content";

export const metadata: Metadata = {
  title: "Blog — Nexora Admin",
};

export default function AdminBlogPage() {
  return <AdminBlogContent initialPosts={blogPosts} />;
}
