"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { getVisibleProducts, type MockProduct } from "@/lib/data";
import {
  FLASH_SALE_CAMPAIGNS_STORAGE_KEY,
  getEffectiveFlashSaleProducts,
  getSoonestFlashSaleEndTime,
} from "@/lib/admin/flash-sale-store";
import { LIVE_REFRESH_FAST_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { ProductCard } from "@/components/marketplace/product-card";
import { HorizontalScroller } from "@/components/shared/horizontal-scroller";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { Button } from "@/components/ui/button";

function fallbackTargetTime(): string {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
}

export function FlashSalesSection() {
  const [flashProducts, setFlashProducts] = useState<MockProduct[]>(() =>
    getEffectiveFlashSaleProducts(getVisibleProducts(), true),
  );
  const [targetTime, setTargetTime] = useState<string>(fallbackTargetTime);

  useLiveRefresh(
    () => {
      setFlashProducts(getEffectiveFlashSaleProducts(getVisibleProducts()));
      setTargetTime(getSoonestFlashSaleEndTime() ?? fallbackTargetTime());
    },
    [FLASH_SALE_CAMPAIGNS_STORAGE_KEY],
    LIVE_REFRESH_FAST_MS,
  );

  return (
    <section className="relative overflow-hidden bg-ink py-12 text-ink-foreground md:py-16">
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-sale/25 blur-3xl animate-pulse-glow"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-sale/10 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sale to-transparent opacity-70" aria-hidden="true" />

      <div className="container relative">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="tag-notch inline-flex items-center gap-1.5 bg-sale px-3 py-1.5 font-mono text-sm font-bold text-sale-foreground">
              <Zap className="h-4 w-4" />
              FLASH SALE
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-foreground sm:text-3xl">
              Prices this low won&apos;t last
            </h2>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Grab them before the clock — and the stock — runs out.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-sale">Deals end in</span>
            <CountdownTimer targetTime={targetTime} size="lg" />
          </div>
        </div>

        <HorizontalScroller>
          {flashProducts.map((product) => (
            <div key={product.id} className="relative w-[210px] shrink-0 snap-start sm:w-[230px]">
              <span
                className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-sale shadow-[0_4px_16px_-2px_rgba(200,50,30,0.6)]"
                aria-hidden="true"
              >
                <Flame className="h-4 w-4 text-sale-foreground" fill="currentColor" />
              </span>
              <ProductCard product={product} />
            </div>
          ))}
        </HorizontalScroller>

        <div className="mt-6 flex justify-end">
          <Button
            asChild
            variant="outline"
            className="border-ink-border bg-transparent text-ink-foreground hover:border-sale hover:bg-ink-border hover:text-ink-foreground"
          >
            <Link href="/deals">View all deals</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
