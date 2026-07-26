import type { AdCampaignStatus, PlacedAdCampaign } from "./types";

export const AD_STATUS_LABEL: Record<AdCampaignStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

// A campaign is only actually live if it's marked ACTIVE *and* its paid-for
// window hasn't lapsed — computed at read time rather than via a background
// job, since expiry is just a function of `endsAt` vs. now.
export function isCampaignLive(campaign: PlacedAdCampaign): boolean {
  return campaign.status === "ACTIVE" && new Date(campaign.endsAt).getTime() > Date.now();
}

// The effective status a viewer should see, correcting for lapsed campaigns
// whose `status` field hasn't been formally flipped to EXPIRED yet.
export function effectiveAdStatus(campaign: PlacedAdCampaign): AdCampaignStatus {
  if (campaign.status === "ACTIVE" && new Date(campaign.endsAt).getTime() <= Date.now()) return "EXPIRED";
  return campaign.status;
}
