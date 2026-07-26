import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin } from "lucide-react";
import type { MockShop } from "@/lib/data";
import { shopIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";

export function ShopSpotlightCard({ shop, featured = false }: { shop: MockShop; featured?: boolean }) {
  return (
    <Link
      href={`/vendors/${shop.slug}`}
      className="group relative flex w-[248px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:bg-white/[0.06] hover:shadow-[0_24px_60px_-20px_rgba(240,169,60,0.45)] sm:w-[272px]"
    >
      <div className="relative h-32 w-full overflow-hidden sm:h-36">
        <ProductImage
          image={shop.image}
          seed={shop.bannerSeed}
          icon={shopIcon}
          alt=""
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        {featured && (
          <span className="tag-notch absolute left-3 top-3 bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Featured
          </span>
        )}
      </div>

      <div className="relative px-4">
        <ProductImage
          image={shop.image}
          seed={shop.seed}
          icon={shopIcon}
          alt={shop.name}
          className="absolute -top-8 left-4 h-16 w-16 rounded-full ring-4 ring-ink"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-10">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-display text-base font-semibold text-ink-foreground">{shop.name}</h3>
          {shop.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
        </div>
        <p className="line-clamp-1 text-xs text-ink-muted">{shop.tagline}</p>

        <div className="mt-0.5 flex items-center justify-between gap-2 text-xs">
          <StarRating rating={shop.rating} tone="inverted" />
          <span className="flex shrink-0 items-center gap-1 text-ink-muted">
            <MapPin className="h-3 w-3" />
            {shop.location.city}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-mono text-[11px] text-ink-muted">
            {shop.productCount.toLocaleString()} products
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
