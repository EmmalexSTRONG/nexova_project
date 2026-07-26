import { getAllAdCampaigns } from "./ad-campaign-store";
import { isCampaignLive } from "./ad-status";
import type { AdPlacement, PlacedAdCampaign } from "./types";

// Most-recently-started campaign shown first — a simple, predictable
// rotation strategy given there's no ad-serving/impression-tracking backend.
export function getActiveCampaignsForPlacement(placement: AdPlacement): PlacedAdCampaign[] {
  return getAllAdCampaigns()
    .filter((campaign) => campaign.placement === placement && isCampaignLive(campaign))
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export function getFeaturedShopSlugsInOrder(): string[] {
  return getActiveCampaignsForPlacement("FEATURED_SHOP").map((campaign) => campaign.shopSlug);
}
