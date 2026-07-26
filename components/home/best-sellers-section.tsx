import { Crown } from "lucide-react";
import { getBestSellerProducts } from "@/lib/data";
import { ProductCard } from "@/components/marketplace/product-card";
import { SectionHeader } from "@/components/shared/section-header";
import { HorizontalScroller } from "@/components/shared/horizontal-scroller";
import { cn } from "@/lib/utils";

// Medal-tier numeral colors for the top 3 — a real, recognizable ranking
// convention, not arbitrary decoration. Everything past 3rd fades to neutral.
// Darkened past text-primary/zinc-400, which measured ~2.2:1 and ~2.6:1
// against this section's background — below the 3:1 minimum for large text.
const MEDAL_TONES = ["text-yellow-700", "text-zinc-600", "text-amber-800"];

export function BestSellersSection() {
  const bestSellers = getBestSellerProducts();

  return (
    <section className="bg-gradient-to-b from-primary/[0.07] to-transparent py-12 md:py-16">
      <div className="container">
        <SectionHeader
          eyebrow="Ranked"
          title="Best sellers this week"
          description="The most-bought items across every category, updated daily."
          href="/categories"
        />
        <HorizontalScroller>
          {bestSellers.map((product, index) => {
            const rank = index + 1;
            const tone = MEDAL_TONES[index] ?? "text-foreground/15";
            return (
              <div key={product.id} className="flex w-[250px] shrink-0 snap-start items-stretch gap-3 sm:w-[270px]">
                <div className="relative flex shrink-0 items-start">
                  <span className={cn("font-display text-6xl font-bold leading-none", tone)}>{rank}</span>
                  {rank === 1 && (
                    <Crown
                      className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 -rotate-12 fill-primary text-primary"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <ProductCard product={product} />
                </div>
              </div>
            );
          })}
        </HorizontalScroller>
      </div>
    </section>
  );
}
