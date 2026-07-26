import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminBlogForm } from "@/components/admin/admin-blog-form";

export const metadata: Metadata = {
  title: "New post — Nexora Admin",
};

export default function AdminNewBlogPostPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">New post</h1>
        <p className="text-sm text-muted-foreground">Write a new article for the Nexora blog.</p>
      </div>
      <AdminBlogForm />
    </div>
  );
}
