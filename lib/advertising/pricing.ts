import type { AdPlacement, AdPlanDuration } from "./types";

export const AD_PLACEMENTS: AdPlacement[] = ["HOMEPAGE_BANNER", "SIDEBAR", "SPONSORED_PRODUCT", "FEATURED_SHOP"];

export const AD_DURATIONS: AdPlanDuration[] = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

export const AD_PLACEMENT_LABEL: Record<AdPlacement, string> = {
  HOMEPAGE_BANNER: "Homepage Banner",
  SIDEBAR: "Sidebar Ad",
  SPONSORED_PRODUCT: "Sponsored Product",
  FEATURED_SHOP: "Featured Shop",
};

export const AD_PLACEMENT_DESCRIPTION: Record<AdPlacement, string> = {
  HOMEPAGE_BANNER: "A large rotating banner on the Nexora homepage — maximum visibility for your shop.",
  SIDEBAR: "A compact ad shown alongside product pages across the marketplace.",
  SPONSORED_PRODUCT: "Boost one of your products into a \"Sponsored\" row on the homepage.",
  FEATURED_SHOP: "Pin your shop to the front of the Featured Shops section on the homepage.",
};

export const AD_DURATION_LABEL: Record<AdPlanDuration, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export const AD_DURATION_DAYS: Record<AdPlanDuration, number> = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
  YEARLY: 365,
};

// GHS per-day base rate per placement.
const AD_BASE_DAILY_RATE: Record<AdPlacement, number> = {
  HOMEPAGE_BANNER: 150,
  SIDEBAR: 40,
  SPONSORED_PRODUCT: 25,
  FEATURED_SHOP: 60,
};

// Longer commitments earn a per-day discount, same shape as typical ad-plan pricing.
const AD_DURATION_DISCOUNT: Record<AdPlanDuration, number> = {
  DAILY: 1,
  WEEKLY: 0.9,
  MONTHLY: 0.75,
  YEARLY: 0.55,
};

export function getAdPrice(placement: AdPlacement, duration: AdPlanDuration): number {
  const days = AD_DURATION_DAYS[duration];
  const dailyRate = AD_BASE_DAILY_RATE[placement] * AD_DURATION_DISCOUNT[duration];
  return Math.round(dailyRate * days);
}
