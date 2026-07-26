"use client";

import dynamic from "next/dynamic";
import type { MapPinInput } from "./location-map";

// Code-splits the Google Maps JS SDK out of the shared route bundle — pages
// that never render a map (most of the site) no longer pay to download and
// evaluate @react-google-maps/api. ssr: false is safe here since maps are
// inherently a browser-only concern (window.google, geolocation).
//
// Note: next/dynamic's `loading` render prop does NOT receive the wrapped
// component's own props (heightClassName/className), so this fallback uses
// a fixed reasonable height rather than trying to match every call site —
// it's only visible for the brief window before the chunk loads.
export const LocationMap = dynamic(() => import("./location-map").then((mod) => mod.LocationMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
});

export type { MapPinInput };
