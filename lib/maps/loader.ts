"use client";

import { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];
const LOAD_TIMEOUT_MS = 6000;

export interface GoogleMapsStatus {
  isLoaded: boolean;
  hasFailed: boolean;
}

// Google only calls gm_authFailure once per script instance — a component
// that mounts *after* that first failure (e.g. navigating to a different
// page in the same SPA session) would otherwise never learn the key is bad,
// and would render a real <GoogleMap> that shows Google's own broken-map
// UI before failing again. This module-level flag + subscriber list lets
// every past and future useGoogleMapsStatus() call share one answer.
let knownAuthFailure = false;
const subscribers = new Set<() => void>();

function markAuthFailure() {
  if (knownAuthFailure) return;
  knownAuthFailure = true;
  subscribers.forEach((notify) => notify());
}

// Wraps @react-google-maps/api's loader with two extra failure signals it
// doesn't surface on its own:
//  - a timeout, for when the script's load/error events never fire
//  - window.gm_authFailure, Google's documented callback for a key that's
//    missing, invalid, or unbilled — the script itself loads fine (so
//    loadError stays null), but the map can't actually render
export function useGoogleMapsStatus(): GoogleMapsStatus {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "nexora-google-maps",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const [timedOut, setTimedOut] = useState(false);
  const [authFailed, setAuthFailed] = useState(knownAuthFailure);

  useEffect(() => {
    if (isLoaded || loadError) return;
    const timer = window.setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [isLoaded, loadError]);

  useEffect(() => {
    window.gm_authFailure = markAuthFailure;
    if (knownAuthFailure) {
      setAuthFailed(true);
      return;
    }
    const notify = () => setAuthFailed(true);
    subscribers.add(notify);
    return () => {
      subscribers.delete(notify);
    };
  }, []);

  return {
    isLoaded: isLoaded && !authFailed,
    hasFailed: Boolean(loadError) || authFailed || (timedOut && !isLoaded),
  };
}
