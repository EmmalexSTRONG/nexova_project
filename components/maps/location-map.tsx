"use client";

import { useCallback, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin, Navigation } from "lucide-react";
import { useGoogleMapsStatus } from "@/lib/maps/loader";
import { formatDistance, haversineDistanceKm, type LatLng } from "@/lib/maps/geo";
import { cn } from "@/lib/utils";

export interface MapPinInput extends LatLng {
  label: string;
}

export function LocationMap({
  seller,
  customer,
  showRoute = true,
  heightClassName = "h-64",
  className,
}: {
  seller: MapPinInput;
  customer?: MapPinInput;
  showRoute?: boolean;
  heightClassName?: string;
  className?: string;
}) {
  const { isLoaded, hasFailed } = useGoogleMapsStatus();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsFailed, setDirectionsFailed] = useState(false);

  const requestDirections = useCallback(() => {
    if (!customer || !showRoute || directions || directionsFailed || !window.google) return;
    const service = new window.google.maps.DirectionsService();
    service.route(
      { origin: seller, destination: customer, travelMode: window.google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === "OK" && result) setDirections(result);
        else setDirectionsFailed(true);
      },
    );
  }, [customer, showRoute, seller, directions, directionsFailed]);

  if (hasFailed) {
    return <StaticFallbackMap seller={seller} customer={customer} heightClassName={heightClassName} className={className} />;
  }

  if (!isLoaded) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground", heightClassName, className)}>
        Loading map...
      </div>
    );
  }

  const center = customer ? { lat: (seller.lat + customer.lat) / 2, lng: (seller.lng + customer.lng) / 2 } : seller;

  return (
    <div className={cn("overflow-hidden rounded-lg border", heightClassName, className)}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={customer ? 11 : 14}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
        onLoad={(map) => {
          if (customer) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(seller);
            bounds.extend(customer);
            map.fitBounds(bounds, 48);
          }
          requestDirections();
        }}
      >
        <Marker position={seller} label={{ text: "S", color: "#fff" }} title={seller.label} />
        {customer && <Marker position={customer} label={{ text: "C", color: "#fff" }} title={customer.label} />}
        {directions && (
          <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: "#c2661a", strokeWeight: 4 } }} />
        )}
      </GoogleMap>
    </div>
  );
}

// Rendered when the Google Maps script can't load (no internet, invalid/missing
// key) — a simple proportional pin diagram rather than a blank error box, so
// the seller/customer relationship and straight-line distance are still visible.
function StaticFallbackMap({
  seller,
  customer,
  heightClassName,
  className,
}: {
  seller: MapPinInput;
  customer?: MapPinInput;
  heightClassName: string;
  className?: string;
}) {
  const pins = customer ? [seller, customer] : [seller];
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const padding = 0.15;
  const latSpan = Math.max(Math.max(...lats) - Math.min(...lats), 0.01);
  const lngSpan = Math.max(Math.max(...lngs) - Math.min(...lngs), 0.01);
  const minLat = Math.min(...lats) - latSpan * padding;
  const maxLat = Math.max(...lats) + latSpan * padding;
  const minLng = Math.min(...lngs) - lngSpan * padding;
  const maxLng = Math.max(...lngs) + lngSpan * padding;

  const project = (p: LatLng) => ({
    left: `${((p.lng - minLng) / (maxLng - minLng)) * 100}%`,
    top: `${(1 - (p.lat - minLat) / (maxLat - minLat)) * 100}%`,
  });

  const sellerPos = project(seller);
  const customerPos = customer ? project(customer) : null;
  const distanceKm = customer ? haversineDistanceKm(seller, customer) : null;

  return (
    <div className={cn("relative overflow-hidden rounded-lg border bg-[radial-gradient(circle,_hsl(var(--border))_1px,_transparent_1px)] [background-size:16px_16px]", heightClassName, className)}>
      {customerPos && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <line
            x1={sellerPos.left}
            y1={sellerPos.top}
            x2={customerPos.left}
            y2={customerPos.top}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeDasharray="6 5"
          />
        </svg>
      )}

      <Pin position={sellerPos} label={seller.label} icon={MapPin} />
      {customer && customerPos && <Pin position={customerPos} label={customer.label} icon={Navigation} />}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-md bg-background/90 px-2.5 py-1.5 text-xs backdrop-blur">
        <span className="text-muted-foreground">Map preview unavailable</span>
        {distanceKm !== null && <span className="font-medium">{formatDistance(distanceKm)} apart</span>}
      </div>
    </div>
  );
}

function Pin({ position, label, icon: Icon }: { position: { left: string; top: string }; label: string; icon: typeof MapPin }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-full" style={position}>
      <div className="flex flex-col items-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="mt-1 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">{label}</span>
      </div>
    </div>
  );
}
