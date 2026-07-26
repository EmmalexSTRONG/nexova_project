"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Bike, LocateFixed, MapPin, Star } from "lucide-react";
import { shops } from "@/lib/data";
import type { MockShop } from "@/lib/data";
import { shopIcon } from "@/lib/icon-map";
import { estimateDeliveryTime, formatDistance, haversineDistanceKm, type LatLng } from "@/lib/maps/geo";
import { PINNED_NEARBY_SHOPS_STORAGE_KEY, getPinnedShopSlugs } from "@/lib/admin/nearby-shops-store";
import { useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { ProductImage } from "@/components/shared/product-image";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";

type GeoState = "idle" | "locating" | "denied" | "unavailable" | "ready";

const DISPLAY_LIMIT = 8;

export function ShopsNearYouSection() {
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [customerPoint, setCustomerPoint] = useState<LatLng | null>(null);
  const [pinnedSlugs, setPinnedSlugs] = useState<Set<string>>(new Set());

  useLiveRefresh(() => setPinnedSlugs(new Set(getPinnedShopSlugs())), [PINNED_NEARBY_SHOPS_STORAGE_KEY]);

  function handleLocateMe() {
    if (!navigator.geolocation) {
      setGeoState("unavailable");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerPoint({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoState("ready");
      },
      () => setGeoState("denied"),
      { timeout: 8000 },
    );
  }

  const pinnedShops = shops.filter((shop) => pinnedSlugs.has(shop.slug));

  let display: Array<{ shop: MockShop; distanceKm?: number }>;
  if (customerPoint) {
    const withDistance = shops.map((shop) => ({ shop, distanceKm: haversineDistanceKm(customerPoint, shop.location) }));
    const pinned = withDistance.filter((entry) => pinnedSlugs.has(entry.shop.slug));
    const rest = withDistance
      .filter((entry) => !pinnedSlugs.has(entry.shop.slug))
      .sort((a, b) => a.distanceKm - b.distanceKm);
    display = [...pinned, ...rest].slice(0, DISPLAY_LIMIT);
  } else {
    display = pinnedShops.map((shop) => ({ shop }));
  }

  // Nothing to show yet: no pinned shops, and we haven't asked for location
  // (or the request is still in flight — show a real loading state rather
  // than falling through to an empty, unexplained grid).
  if (display.length === 0) {
    return (
      <section className="bg-card py-12 md:py-16">
        <div className="container">
          <SectionHeader eyebrow="Nearby" title="Shop near you" description="Find vendors close to your delivery address." />
          <div className="flex flex-col items-center gap-3 rounded-lg border bg-background py-10 text-center" aria-live="polite">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
              <LocateFixed className={geoState === "locating" ? "h-5 w-5 animate-pulse" : "h-5 w-5"} />
            </span>
            <div>
              <p className="text-sm font-medium">
                {geoState === "locating"
                  ? "Locating shops near you..."
                  : geoState === "denied"
                    ? "Couldn't access your location"
                    : geoState === "unavailable"
                      ? "Your browser doesn't support location access"
                      : "See shops near you"}
              </p>
              {geoState !== "locating" && (
                <p className="mt-0.5 text-xs text-muted-foreground">We&apos;ll only use your location to sort this list.</p>
              )}
            </div>
            {geoState !== "locating" && (
              <Button size="sm" onClick={handleLocateMe}>
                Find shops near me
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card py-12 md:py-16">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader eyebrow="Nearby" title="Shop near you" description="Vendors close to your delivery address." className="mb-0" />
          {!customerPoint && (
            <Button size="sm" variant="outline" onClick={handleLocateMe} className="gap-1.5">
              <LocateFixed className="h-3.5 w-3.5" />
              {geoState === "locating" ? "Locating..." : "Use my location"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-live="polite">
          {display.map(({ shop, distanceKm }) => {
            const delivery = distanceKm !== undefined ? estimateDeliveryTime(distanceKm) : undefined;
            const isPinned = pinnedSlugs.has(shop.slug);
            return (
              <Link
                key={shop.slug}
                href={`/vendors/${shop.slug}`}
                className="flex flex-col items-center gap-1.5 rounded-lg border bg-background p-4 text-center transition-shadow hover:shadow-md"
              >
                <div className="relative">
                  <ProductImage image={shop.image} seed={shop.seed} icon={shopIcon} alt={shop.name} className="h-14 w-14 rounded-full" />
                  {isPinned && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Star className="h-2.5 w-2.5" fill="currentColor" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-display text-sm font-semibold">{shop.name}</span>
                  {shop.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-success" />}
                </div>
                <span className="text-xs text-muted-foreground">{shop.productCount.toLocaleString()} products</span>
                {distanceKm !== undefined ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatDistance(distanceKm)} away
                  </span>
                ) : (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    Featured
                  </span>
                )}
                {delivery && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Bike className="h-3 w-3" />
                    Delivery in {delivery.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
