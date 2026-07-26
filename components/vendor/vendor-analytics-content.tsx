"use client";

import { useEffect, useState } from "react";
import { getVendorOrders, getVendorTopProducts } from "@/lib/vendor/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import type { MockProduct } from "@/lib/data";
import { RatingBreakdown } from "@/components/marketplace/rating-breakdown";
import { StarRating } from "@/components/shared/star-rating";

export function VendorAnalyticsContent({
  shopSlug,
  products,
  rating,
  ratingTotal,
  ratingCounts,
}: {
  shopSlug: string;
  products: MockProduct[];
  rating: number;
  ratingTotal: number;
  ratingCounts: number[];
}) {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);

  useEffect(() => {
    function load() {
      setOrders(getVendorOrders(shopSlug));
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [shopSlug]);

  const topProducts = orders ? getVendorTopProducts(orders, shopSlug, 8) : [];
  const bestRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">How your shop and products are performing.</p>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold">Shop rating</h2>
        <RatingBreakdown rating={rating} total={ratingTotal} counts={ratingCounts} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-display text-sm font-semibold">Best-selling products</h2>
          {!orders ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales recorded yet.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {topProducts.map((product, index) => (
                <li key={product.productSlug} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-4 shrink-0 font-mono text-xs text-muted-foreground">{index + 1}</span>
                    {product.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{product.quantitySold} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-display text-sm font-semibold">Highest rated products</h2>
          <ul className="space-y-2.5 text-sm">
            {bestRated.map((product) => (
              <li key={product.slug} className="flex items-center justify-between gap-3">
                <span className="truncate">{product.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <StarRating rating={product.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
