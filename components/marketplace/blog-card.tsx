import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { MockBlogPost } from "@/lib/data";
import { blogIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";

export function BlogCard({ post }: { post: MockBlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9]">
        <ProductImage image={post.image} seed={post.seed} icon={blogIcon} alt={post.title} className="h-full w-full" />
        <Badge variant="ink" className="absolute left-2 top-2">
          {post.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug group-hover:underline">
          {post.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readMinutes} min read
          </span>
          <span className="flex items-center gap-1 font-medium text-foreground">
            Read more
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
