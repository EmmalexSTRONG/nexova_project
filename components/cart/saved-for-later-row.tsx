"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { getCategoryIcon } from "@/lib/icon-map";
import { getStockStatus } from "@/lib/stock";
import { useCart } from "@/lib/cart/cart-context";
import type { ResolvedCartLine } from "@/lib/cart/use-cart-lines";
import { ProductImage } from "@/components/shared/product-image";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

export function SavedForLaterRow({ line }: { line: ResolvedCartLine }) {
  const { moveToCart, removeSavedItem } = useCart();
  const { product } = line;
  const Icon = getCategoryIcon(product.categorySlug);
  const stock = getStockStatus(product);

  return (
    <div className="flex gap-4 border-b py-4 last:border-b-0">
      <Link href={`/products/${product.slug}`} className="shrink-0">
        <ProductImage image={product.image} seed={product.seed} icon={Icon} alt={product.name} className="h-16 w-16 rounded-md" iconClassName="h-1/3 w-1/3" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${product.slug}`} className="text-sm font-medium hover:underline">
              {product.name}
            </Link>
            <p className="text-xs text-muted-foreground">{product.shopName}</p>
          </div>
          <Price amount={product.price} currency={product.currency} size="sm" className="shrink-0" />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!stock.purchasable}
            onClick={() => moveToCart(product.slug)}
          >
            {stock.purchasable ? "Move to cart" : stock.label}
          </Button>
          <button
            type="button"
            onClick={() => removeSavedItem(product.slug)}
            className="flex items-center gap-1 text-xs text-sale hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
