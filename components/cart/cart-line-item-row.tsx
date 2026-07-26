"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { getCategoryIcon } from "@/lib/icon-map";
import { getStockStatus } from "@/lib/stock";
import { useCart } from "@/lib/cart/cart-context";
import type { ResolvedCartLine } from "@/lib/cart/use-cart-lines";
import { ProductImage } from "@/components/shared/product-image";
import { Price } from "@/components/shared/price";

export function CartLineItemRow({ line }: { line: ResolvedCartLine }) {
  const { increaseQuantity, decreaseQuantity, removeItem, saveForLater } = useCart();
  const { product, quantity } = line;
  const Icon = getCategoryIcon(product.categorySlug);
  const stock = getStockStatus(product);

  return (
    <div className="flex gap-4 border-b py-4 last:border-b-0">
      <Link href={`/products/${product.slug}`} className="shrink-0">
        <ProductImage image={product.image} seed={product.seed} icon={Icon} alt={product.name} className="h-20 w-20 rounded-md" iconClassName="h-1/3 w-1/3" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${product.slug}`} className="text-sm font-medium hover:underline">
              {product.name}
            </Link>
            <p className="text-xs text-muted-foreground">{product.shopName}</p>
          </div>
          <Price amount={product.price * quantity} currency={product.currency} size="sm" className="shrink-0" />
        </div>

        {!stock.purchasable && (
          <p className="mt-1 text-xs font-medium text-sale">{stock.label} — remove or save for later</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
          <div className="flex items-center rounded-md border">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
              onClick={() => decreaseQuantity(product.slug)}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center font-mono text-sm tabular-nums">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
              onClick={() => increaseQuantity(product.slug)}
              disabled={quantity >= product.stockLevel}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => saveForLater(product.slug)}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Save for later
          </button>

          <button
            type="button"
            onClick={() => removeItem(product.slug)}
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
