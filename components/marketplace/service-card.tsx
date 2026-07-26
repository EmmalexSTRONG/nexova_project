import Link from "next/link";
import { Clock } from "lucide-react";
import type { MockService } from "@/lib/data";
import { getServiceIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

export function ServiceCard({ service }: { service: MockService }) {
  const Icon = getServiceIcon(service.seed);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <Link href={`/services/${service.slug}`} className="relative block aspect-[4/3]">
        <ProductImage image={service.image} seed={service.seed} icon={Icon} alt={service.name} className="h-full w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="truncate text-xs text-muted-foreground">{service.providerName}</p>
        <Link href={`/services/${service.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
          {service.name}
        </Link>
        <StarRating rating={service.rating} reviewCount={service.reviewCount} />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {service.durationLabel}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Price amount={service.price} currency={service.currency} size="sm" />
          <Button asChild size="sm" variant="outline">
            <Link href={`/services/${service.slug}/book`}>Book now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
