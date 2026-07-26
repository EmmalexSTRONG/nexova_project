"use client";

import { useCart } from "@/lib/cart/cart-context";

export function CartCountBadge() {
  const { itemCount, isLoaded } = useCart();

  if (!isLoaded || itemCount === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 font-mono text-[10px] font-bold text-sale-foreground">
      {itemCount > 99 ? "99+" : itemCount}
    </span>
  );
}
