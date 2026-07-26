"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, PlusCircle } from "lucide-react";
import { getAdCampaignsByShop } from "@/lib/advertising/ad-campaign-store";
import { AD_STATUS_LABEL, effectiveAdStatus } from "@/lib/advertising/ad-status";
import { AD_DURATION_LABEL, AD_PLACEMENT_LABEL } from "@/lib/advertising/pricing";
import type { AdCampaignStatus, PlacedAdCampaign } from "@/lib/advertising/types";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_BADGE_VARIANT: Record<AdCampaignStatus, "success" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "success",
  PENDING_PAYMENT: "secondary",
  EXPIRED: "outline",
  CANCELLED: "destructive",
};

export function VendorAdvertisingContent({ shopSlug }: { shopSlug: string }) {
  const [campaigns, setCampaigns] = useState<PlacedAdCampaign[] | undefined>(undefined);

  useEffect(() => {
    setCampaigns(getAdCampaignsByShop(shopSlug));
  }, [shopSlug]);

  if (campaigns === undefined) {
    return <p className="text-sm text-muted-foreground">Loading campaigns...</p>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <Megaphone className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">No ad campaigns yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Buy a Homepage Banner, Sidebar Ad, Sponsored Product, or Featured Shop placement to reach more shoppers.
        </p>
        <Button asChild size="sm">
          <Link href="/vendor/advertising/new">
            <PlusCircle className="h-4 w-4" />
            Buy an ad
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => {
        const status = effectiveAdStatus(campaign);
        return (
          <div key={campaign.id} className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold">{campaign.id}</p>
                <p className="mt-0.5 text-sm font-medium">{campaign.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {AD_PLACEMENT_LABEL[campaign.placement]} · {AD_DURATION_LABEL[campaign.duration]}
                </p>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[status]}>{AD_STATUS_LABEL[status]}</Badge>
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">
                {status === "ACTIVE"
                  ? `Runs until ${new Date(campaign.endsAt).toLocaleDateString()}`
                  : new Date(campaign.createdAt).toLocaleDateString()}
              </span>
              <Price amount={campaign.amount} currency={campaign.currency} size="sm" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
