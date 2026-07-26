import Link from "next/link";
import Image from "next/image";
import type { MockCategory } from "@/lib/data";

export function CategoryCard({ category }: { category: MockCategory }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col items-center gap-2.5 text-center"
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <Image
          src={`${category.image}?w=320&h=320&fit=crop&q=80&auto=format`}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 160px, (min-width: 640px) 20vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </span>
      <span>
        <span className="block text-sm font-medium leading-tight">{category.name}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {category.productCount.toLocaleString()} items
        </span>
      </span>
    </Link>
  );
}
