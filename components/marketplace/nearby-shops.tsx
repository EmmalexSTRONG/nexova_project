"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, LocateFixed, MapPin } from "lucide-react";
import { shops } from "@/lib/data";
import { shopIcon } from "@/lib/icon-map";
import { formatDistance, haversineDistanceKm, type LatLng } from "@/lib/maps/geo";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";

type GeolocationState = "idle" | "locating" | "denied" | "unavailable" | "ready";

export function NearbyShops({
  referencePoint,
  excludeSlug,
  limit = 4,
}: {
  referencePoint?: LatLng;
  excludeSlug?: string;
  limit?: number;
}) {
  const [geoState, setGeoState] = useState<GeolocationState>(referencePoint ? "ready" : "idle");
  const [customerPoint, setCustomerPoint] = useState<LatLng | null>(referencePoint ?? null);

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

  if (geoState === "idle") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
          <LocateFixed className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium">See shops near you</p>
          <p className="mt-0.5 text-xs text-muted-foreground">We&apos;ll only use your location to sort this list.</p>
        </div>
        <Button size="sm" onClick={handleLocateMe}>
          Find shops near me
        </Button>
      </div>
    );
  }

  if (geoState === "locating") {
    return <p className="rounded-lg border bg-card py-10 text-center text-sm text-muted-foreground">Finding your location...</p>;
  }

  if (geoState === "denied" || geoState === "unavailable") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border bg-card py-10 text-center">
        <p className="text-sm font-medium">Couldn&apos;t access your location</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          {geoState === "denied"
            ? "Location access was denied. You can allow it in your browser settings and try again."
            : "Your browser doesn't support location access."}
        </p>
        <Button size="sm" variant="outline" onClick={handleLocateMe}>
          Try again
        </Button>
      </div>
    );
  }

  if (!customerPoint) return null;

  const nearby = shops
    .filter((shop) => shop.slug !== excludeSlug)
    .map((shop) => ({ shop, distanceKm: haversineDistanceKm(customerPoint, shop.location) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {nearby.map(({ shop, distanceKm }) => (
        <Link
          key={shop.slug}
          href={`/vendors/${shop.slug}`}
          className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center transition-shadow hover:shadow-md"
        >
          <ProductImage image={shop.image} seed={shop.seed} icon={shopIcon} alt={shop.name} className="h-14 w-14 rounded-full" />
          <div className="flex items-center gap-1">
            <span className="font-display text-sm font-semibold">{shop.name}</span>
            {shop.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-success" />}
          </div>
          <StarRating rating={shop.rating} />
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            <MapPin className="h-3.5 w-3.5" />
            {formatDistance(distanceKm)} away
          </span>
        </Link>
      ))}
    </div>
  );
}
