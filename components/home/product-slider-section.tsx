"use client";

import { useState } from "react";
import { getVisibleProducts, type MockProduct } from "@/lib/data";
import { ENGAGEMENT_EVENTS_STORAGE_KEY, getTrendingProducts } from "@/lib/engagement/engagement-store";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { LIVE_REFRESH_SLOW_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { ProductCard } from "@/components/marketplace/product-card";
import { SectionHeader } from "@/components/shared/section-header";
import { HorizontalScroller } from "@/components/shared/horizontal-scroller";

export function ProductSliderSection() {
  const [products, setProducts] = useState<MockProduct[]>(() => getTrendingProducts(getVisibleProducts(), undefined, true));

  useLiveRefresh(
    () => setProducts(getTrendingProducts(getVisibleProducts())),
    [ENGAGEMENT_EVENTS_STORAGE_KEY, ORDERS_STORAGE_KEY],
    LIVE_REFRESH_SLOW_MS,
  );

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <SectionHeader
          eyebrow="Trending"
          title="Trending this week"
          description="What shoppers across Ghana are adding to their carts right now."
          href="/categories"
        />
        <HorizontalScroller>
          {products.map((product) => (
            <div key={product.id} className="w-[210px] shrink-0 snap-start sm:w-[230px]">
              <ProductCard product={product} />
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}
