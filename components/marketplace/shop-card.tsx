import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import type { MockShop } from "@/lib/data";
import { shopIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";

export function ShopCard({ shop }: { shop: MockShop }) {
  return (
    <div className="flex h-full w-full flex-col items-center gap-3 rounded-lg border bg-card p-5 text-center transition-shadow hover:shadow-md">
      <ProductImage image={shop.image} seed={shop.seed} icon={shopIcon} alt={shop.name} className="h-16 w-16 rounded-full" />
      <div>
        <div className="flex items-center justify-center gap-1">
          <Link href={`/vendors/${shop.slug}`} className="font-display font-semibold hover:underline">
            {shop.name}
          </Link>
          {shop.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-success" />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{shop.tagline}</p>
      </div>
      <StarRating rating={shop.rating} />
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {shop.location.city} · {shop.productCount.toLocaleString()} products
      </div>
      <Button asChild size="sm" variant="outline" className="mt-1 w-full">
        <Link href={`/vendors/${shop.slug}`}>Visit shop</Link>
      </Button>
    </div>
  );
}
