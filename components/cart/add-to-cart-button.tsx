"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { cn } from "@/lib/utils";

export function AddToCartButton({ productSlug, disabled }: { productSlug: string; disabled: boolean }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  return (
    <Button
      type="button"
      size="icon"
      className={cn(
        "h-9 w-9 shrink-0 rounded-full shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95",
        justAdded && "bg-success text-success-foreground hover:bg-success",
      )}
      aria-label="Add to cart"
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        addItem(productSlug);
        setJustAdded(true);
      }}
    >
      {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
    </Button>
  );
}
