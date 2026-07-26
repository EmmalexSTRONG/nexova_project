import Link from "next/link";
import { getCategoryIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { Price } from "@/components/shared/price";
import type { ChatProductCard as ChatProductCardData } from "@/lib/chat/types";

export function ChatProductCard({ product }: { product: ChatProductCardData }) {
  const Icon = getCategoryIcon(product.categorySlug);

  return (
    <Link
      href={`/products/${product.slug}`}
      target="_blank"
      className="flex w-32 shrink-0 flex-col gap-1.5 rounded-lg border bg-background p-2 text-left transition-shadow hover:shadow-md"
    >
      <ProductImage image={product.image} seed={product.seed} icon={Icon} alt={product.name} className="aspect-square w-full rounded-md" iconClassName="h-1/3 w-1/3" />
      <p className="line-clamp-2 text-xs font-medium leading-snug">{product.name}</p>
      <Price amount={product.price} currency={product.currency} size="sm" />
    </Link>
  );
}
