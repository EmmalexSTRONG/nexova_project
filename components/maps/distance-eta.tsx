"use client";

import { useEffect, useState } from "react";
import { Clock, Route } from "lucide-react";
import { useGoogleMapsStatus } from "@/lib/maps/loader";
import { estimateDeliveryTime, formatDistance, haversineDistanceKm, type LatLng } from "@/lib/maps/geo";

interface RoadEstimate {
  distanceKm: number;
  durationLabel: string;
}

export function DistanceEta({ origin, destination, className }: { origin: LatLng; destination: LatLng; className?: string }) {
  const { isLoaded, hasFailed } = useGoogleMapsStatus();
  const [roadEstimate, setRoadEstimate] = useState<RoadEstimate | null>(null);
  const [roadEstimateFailed, setRoadEstimateFailed] = useState(false);

  useEffect(() => {
    if (!isLoaded || !window.google || roadEstimate || roadEstimateFailed) return;
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      { origins: [origin], destinations: [destination], travelMode: window.google.maps.TravelMode.DRIVING },
      (response, status) => {
        const element = response?.rows[0]?.elements[0];
        if (status === "OK" && element?.status === "OK" && element.distance && element.duration) {
          setRoadEstimate({ distanceKm: element.distance.value / 1000, durationLabel: element.duration.text });
        } else {
          setRoadEstimateFailed(true);
        }
      },
    );
    // origin/destination are plain lat/lng objects recreated per render by
    // callers — comparing by value here would require a deep-equality dep,
    // so we intentionally key off isLoaded/roadEstimate state instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, roadEstimate, roadEstimateFailed]);

  if (roadEstimate) {
    return (
      <span className={className}>
        <Route className="mr-1 inline h-3.5 w-3.5 text-primary" />
        {formatDistance(roadEstimate.distanceKm)} by road
        <span className="mx-1.5 text-muted-foreground">·</span>
        <Clock className="mr-1 inline h-3.5 w-3.5 text-primary" />
        Est. {roadEstimate.durationLabel}
      </span>
    );
  }

  // Fallback: straight-line distance, honestly labeled as an estimate rather
  // than presented as a real road distance/duration.
  const distanceKm = haversineDistanceKm(origin, destination);
  const estimate = estimateDeliveryTime(distanceKm);
  const mayStillRefine = !hasFailed && !roadEstimateFailed;

  return (
    <span className={className}>
      <Route className="mr-1 inline h-3.5 w-3.5 text-primary" />
      {formatDistance(distanceKm)} away (straight-line)
      <span className="mx-1.5 text-muted-foreground">·</span>
      <Clock className="mr-1 inline h-3.5 w-3.5 text-primary" />
      Est. delivery {estimate.label}
      {mayStillRefine && <span className="ml-1.5 text-muted-foreground">(refining...)</span>}
    </span>
  );
}
