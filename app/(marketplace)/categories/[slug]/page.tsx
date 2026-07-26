import type { Metadata } from "next";
import { categories } from "@/lib/data";
import { CategoryDetailContent } from "@/components/marketplace/category-detail-content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Nexora" };
  const title = `${category.name} — Nexora`;
  const description = `Shop ${category.name.toLowerCase()} from thousands of vendors across Ghana.`;
  return {
    title,
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title,
      description,
      url: `/categories/${slug}`,
      ...(category.image ? { images: [{ url: category.image }] } : {}),
    },
    twitter: { title, description, ...(category.image ? { images: [category.image] } : {}) },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryDetailContent slug={slug} staticCategories={categories} />;
}
