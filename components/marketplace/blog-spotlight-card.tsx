import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { MockBlogPost } from "@/lib/data";
import { blogIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { cn } from "@/lib/utils";

export function BlogFeatureCard({ post, className }: { post: MockBlogPost; className?: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group relative block h-56 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-72 lg:h-full",
        className,
      )}
    >
      <ProductImage
        image={post.image}
        seed={post.seed}
        icon={blogIcon}
        alt=""
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
      <span className="tag-notch absolute left-4 top-4 bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
        {post.category}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className="font-display text-xl font-bold leading-snug text-ink-foreground sm:text-2xl">{post.title}</h3>
        <p className="mt-2 line-clamp-2 max-w-md text-sm text-ink-muted">{post.excerpt}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
          <span>{post.author}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BlogCompactCard({ post, className }: { post: MockBlogPost; className?: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-2.5 transition-colors duration-300 hover:border-primary/50 hover:bg-white/[0.07]",
        className,
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24">
        <ProductImage
          image={post.image}
          seed={post.seed}
          icon={blogIcon}
          alt={post.title}
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">{post.category}</span>
        <h4 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink-foreground">{post.title}</h4>
        <span className="flex items-center gap-1 text-[11px] text-ink-muted">
          <Clock className="h-3 w-3" />
          {post.readMinutes} min read
        </span>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 self-start text-ink-muted transition-colors duration-300 group-hover:text-primary" />
    </Link>
  );
}
