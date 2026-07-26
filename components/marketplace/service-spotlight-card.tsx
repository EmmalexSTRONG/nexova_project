import Link from "next/link";
import { Clock } from "lucide-react";
import type { MockService } from "@/lib/data";
import { getServiceIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";

export function ServiceSpotlightCard({ service }: { service: MockService }) {
  const Icon = getServiceIcon(service.seed);

  return (
    <div className="group flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:bg-white/[0.06] hover:shadow-[0_24px_60px_-20px_rgba(240,169,60,0.45)] sm:w-[260px]">
      <Link href={`/services/${service.slug}`} className="relative block aspect-[4/3] w-full overflow-hidden">
        <ProductImage
          image={service.image}
          seed={service.seed}
          icon={Icon}
          alt={service.name}
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        <span className="tag-notch absolute left-3 top-3 bg-ink/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-foreground backdrop-blur-sm">
          {service.category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-primary px-2.5 py-1 font-mono text-xs font-bold text-primary-foreground">
          {service.currency} {service.price.toLocaleString()}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="truncate text-xs text-ink-muted">{service.providerName}</p>
        <Link
          href={`/services/${service.slug}`}
          className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink-foreground hover:underline"
        >
          {service.name}
        </Link>
        <StarRating rating={service.rating} reviewCount={service.reviewCount} tone="inverted" />

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <Clock className="h-3.5 w-3.5" />
            {service.durationLabel}
          </span>
          <Link
            href={`/services/${service.slug}/book`}
            className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            Book now
          </Link>
        </div>
      </div>
    </div>
  );
}
