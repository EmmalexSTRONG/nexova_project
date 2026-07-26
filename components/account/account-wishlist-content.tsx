"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getWishlistSlugs, WISHLIST_STORAGE_KEY } from "@/lib/wishlist/wishlist-store";
import { getVisibleProducts } from "@/lib/data";
import type { MockProduct } from "@/lib/data";
import { ProductCard } from "@/components/marketplace/product-card";
import { Button } from "@/components/ui/button";

export function AccountWishlistContent() {
  const [products, setProducts] = useState<MockProduct[] | undefined>(undefined);

  useEffect(() => {
    function load() {
      const slugs = new Set(getWishlistSlugs());
      setProducts(getVisibleProducts().filter((product) => slugs.has(product.slug)));
    }
    load();

    function handleStorage(event: StorageEvent) {
      if (event.key === WISHLIST_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (products === undefined) {
    return <p className="text-sm text-muted-foreground">Loading your wishlist...</p>;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <Heart className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">Your wishlist is empty</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Tap the heart on any product to save it here for later.
        </p>
        <Button asChild size="sm">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
