export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Great-circle (straight-line) distance — pure math, no network dependency.
// Used as the always-available baseline, and as the fallback when the
// Google Distance Matrix API (real road distance) can't be reached.
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export interface DeliveryEstimate {
  distanceKm: number;
  minMinutes: number;
  maxMinutes: number;
  label: string;
}

// Straight-line distance understates real road distance, so we pad it
// before converting to a driving-time estimate, then add fixed
// pack-and-dispatch overhead on top of pure travel time.
const ROAD_DISTANCE_FACTOR = 1.35;
const AVERAGE_SPEED_KMH = 28; // urban Ghana traffic, conservative
const PACKING_BUFFER_MINUTES = 25;

export function estimateDeliveryTime(distanceKm: number): DeliveryEstimate {
  const roadDistanceKm = distanceKm * ROAD_DISTANCE_FACTOR;
  const travelMinutes = (roadDistanceKm / AVERAGE_SPEED_KMH) * 60;

  const minMinutes = Math.round(PACKING_BUFFER_MINUTES + travelMinutes * 0.85);
  const maxMinutes = Math.round(PACKING_BUFFER_MINUTES + travelMinutes * 1.25);

  return { distanceKm, minMinutes, maxMinutes, label: formatMinuteRange(minMinutes, maxMinutes) };
}

function formatMinuteRange(minMinutes: number, maxMinutes: number): string {
  const toLabel = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes / 5) * 5}min`;
    const hours = minutes / 60;
    return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)}hr`;
  };
  return `${toLabel(minMinutes)}–${toLabel(maxMinutes)}`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
