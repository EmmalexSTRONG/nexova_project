"use client";

import { useState } from "react";
import { shops } from "@/lib/data";
import { getFeaturedShopSlugsInOrder } from "@/lib/advertising/placements";
import { AD_CAMPAIGNS_STORAGE_KEY } from "@/lib/advertising/ad-campaign-store";
import { LIVE_REFRESH_SLOW_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { ShopSpotlightCard } from "@/components/marketplace/shop-spotlight-card";
import { SectionHeader } from "@/components/shared/section-header";
import { HorizontalScroller } from "@/components/shared/horizontal-scroller";
import type { MockShop } from "@/lib/data";

export function FeaturedShopsSection() {
  const [orderedShops, setOrderedShops] = useState<MockShop[]>(shops);
  const [featuredSlugs, setFeaturedSlugs] = useState<Set<string>>(new Set());

  // Poll, not just storage events: a campaign's paid-for window starting or
  // lapsing is a pure function of the clock (see isCampaignLive), so nothing
  // ever writes to storage at the moment a shop should rotate in or out.
  useLiveRefresh(
    () => {
      const featured = getFeaturedShopSlugsInOrder();
      const featuredSet = new Set(featured);
      const featuredShops = featured
        .map((slug) => shops.find((shop) => shop.slug === slug))
        .filter((shop): shop is MockShop => Boolean(shop));
      const organicShops = shops.filter((shop) => !featuredSet.has(shop.slug));
      setOrderedShops([...featuredShops, ...organicShops]);
      setFeaturedSlugs(featuredSet);
    },
    [AD_CAMPAIGNS_STORAGE_KEY],
    LIVE_REFRESH_SLOW_MS,
  );

  return (
    <section className="relative overflow-hidden bg-ink py-12 md:py-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px gold-gradient opacity-40" aria-hidden="true" />

      <div className="container relative">
        <SectionHeader
          eyebrow="Featured"
          title="Shops worth following"
          description="Independent vendors with fast shipping and top-rated service."
          href="/vendors"
          tone="inverted"
        />
        <HorizontalScroller className="pt-2">
          {orderedShops.map((shop) => (
            <ShopSpotlightCard key={shop.id} shop={shop} featured={featuredSlugs.has(shop.slug)} />
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}
