import type { Metadata } from "next";
import { blogPosts } from "@/lib/data";
import { BlogIndexContent } from "@/components/marketplace/blog-index-content";

export const metadata: Metadata = {
  title: "Blog — Nexora",
  description: "Shopping guides, vendor spotlights, and market news from Nexora.",
};

export default function BlogIndexPage() {
  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Nexora Blog</h1>
      <p className="mt-1 text-sm text-muted-foreground">Shopping guides, vendor spotlights, and market news.</p>
      <BlogIndexContent staticPosts={blogPosts} />
    </div>
  );
}
