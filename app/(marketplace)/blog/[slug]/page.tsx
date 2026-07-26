import type { Metadata } from "next";
import { blogPosts } from "@/lib/data";
import { BlogDetailContent } from "@/components/marketplace/blog-detail-content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Nexora Blog" };
  const title = `${post.title} — Nexora Blog`;
  return {
    title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      type: "article",
      ...(post.image ? { images: [{ url: post.image }] } : {}),
    },
    twitter: {
      title,
      description: post.excerpt,
      ...(post.image ? { images: [post.image] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogDetailContent slug={slug} staticPosts={blogPosts} />;
}
