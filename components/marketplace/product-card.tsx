import Link from "next/link";
import type { MockProduct } from "@/lib/data";
import { getCategoryIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";
import { Price, discountPercent } from "@/components/shared/price";
import { DiscountBadge } from "@/components/shared/discount-badge";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { WishlistButton } from "@/components/marketplace/wishlist-button";
import { getStockStatus } from "@/lib/stock";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: MockProduct }) {
  const Icon = getCategoryIcon(product.categorySlug);
  const percent = discountPercent(product.price, product.compareAtPrice);
  const stock = getStockStatus(product);

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden">
        <ProductImage
          image={product.image}
          seed={product.seed}
          icon={Icon}
          alt={product.name}
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {percent && <DiscountBadge percent={percent} />}
          {product.isNew && <Badge variant="success">New</Badge>}
          {product.isBestSeller && <Badge variant="ink">Best seller</Badge>}
        </div>
        <WishlistButton productSlug={product.slug} />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {product.shopName}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary"
        >
          {product.name}
        </Link>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-auto border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            <Price amount={product.price} currency={product.currency} compareAt={product.compareAtPrice} />
            <AddToCartButton productSlug={product.slug} disabled={!stock.purchasable} />
          </div>
          {product.isFlashSale && product.stockPercent !== undefined ? (
            <div className="pt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-sale" style={{ width: `${product.stockPercent}%` }} />
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{product.stockPercent}% claimed</p>
            </div>
          ) : (
            stock.tone !== "success" && (
              <p className={cn("mt-1.5 font-mono text-[11px]", stock.tone === "sale" ? "text-sale" : "text-muted-foreground")}>
                {stock.label}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
