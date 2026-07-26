"use client";

import { useEffect, useState } from "react";
import { getAdCampaignById, AD_CAMPAIGNS_STORAGE_KEY } from "./ad-campaign-store";
import type { PlacedAdCampaign } from "./types";

export function useAdCampaignLookup(id: string) {
  const [campaign, setCampaign] = useState<PlacedAdCampaign | null | undefined>(undefined);

  useEffect(() => {
    setCampaign(getAdCampaignById(id));

    function handleStorage(event: StorageEvent) {
      if (event.key === AD_CAMPAIGNS_STORAGE_KEY || event.key === null) {
        setCampaign(getAdCampaignById(id));
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [id]);

  return campaign;
}
