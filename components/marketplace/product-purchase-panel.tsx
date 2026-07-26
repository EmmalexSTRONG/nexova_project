"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import type { StockStatus } from "@/lib/stock";

export function ProductPurchasePanel({
  productSlug,
  stock,
  maxQuantity,
}: {
  productSlug: string;
  stock: StockStatus;
  maxQuantity: number;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!stock.purchasable) {
    return (
      <Button size="lg" className="w-full" disabled>
        {stock.label}
      </Button>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-mono text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          size="lg"
          className="flex-1 gap-2"
          onClick={() => {
            addItem(productSlug, quantity);
            setJustAdded(true);
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </Button>
      </div>
      {justAdded && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-success">
          <Check className="h-4 w-4" />
          Added to cart.{" "}
          <Link href="/cart" className="font-medium underline underline-offset-2">
            View cart
          </Link>
        </p>
      )}
    </div>
  );
}
