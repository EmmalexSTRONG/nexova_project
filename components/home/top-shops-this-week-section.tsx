"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Crown, TrendingUp } from "lucide-react";
import { shopIcon } from "@/lib/icon-map";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { getBestSellerShopsThisWeek, type ShopWeeklyStats } from "@/lib/marketplace/weekly-best-sellers";
import { LIVE_REFRESH_SLOW_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";
import { SectionHeader } from "@/components/shared/section-header";
import { HorizontalScroller } from "@/components/shared/horizontal-scroller";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Darkened past the earlier text-primary/zinc-400 pair, which measured
// ~2.2:1 and ~2.6:1 against this section's background — below even the
// 3:1 minimum for large text.
const MEDAL_TONES = ["text-yellow-700", "text-zinc-600", "text-amber-800"];

export function TopShopsThisWeekSection() {
  const [ranked, setRanked] = useState<ShopWeeklyStats[]>(() => getBestSellerShopsThisWeek(6, true));

  useLiveRefresh(() => setRanked(getBestSellerShopsThisWeek(6)), [ORDERS_STORAGE_KEY], LIVE_REFRESH_SLOW_MS);

  return (
    <section className="bg-gradient-to-b from-primary/[0.07] to-transparent py-12 md:py-16">
      <div className="container">
        <SectionHeader
          eyebrow="Ranked"
          title="Best seller shops this week"
          description="The vendors selling the most across Nexora, refreshed every week."
          href="/vendors"
        />
        <HorizontalScroller>
          {ranked.map((entry, index) => {
            const rank = index + 1;
            const tone = MEDAL_TONES[index] ?? "text-foreground/15";
            return (
              <div key={entry.shop.slug} className="flex w-[270px] shrink-0 snap-start items-stretch gap-3 sm:w-[290px]">
                <div className="relative flex shrink-0 items-start">
                  <span className={cn("font-display text-6xl font-bold leading-none", tone)}>{rank}</span>
                  {rank === 1 && (
                    <Crown
                      className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 -rotate-12 fill-primary text-primary"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex-1 rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <ProductImage
                      image={entry.shop.image}
                      seed={entry.shop.seed}
                      icon={shopIcon}
                      alt={entry.shop.name}
                      className="h-12 w-12 shrink-0 rounded-full"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-display text-sm font-semibold">{entry.shop.name}</span>
                        {entry.shop.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-success" />}
                      </div>
                      <StarRating rating={entry.shop.rating} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    {entry.hasRealSales ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {entry.unitsSold} sold this week
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Popular shop</span>
                    )}
                    <Button asChild size="sm" variant="outline" className="h-7 gap-1 px-2.5 text-xs">
                      <Link href={`/vendors/${entry.shop.slug}`}>
                        Visit shop
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </HorizontalScroller>
      </div>
    </section>
  );
}

