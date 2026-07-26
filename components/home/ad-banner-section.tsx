"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { getActiveCampaignsForPlacement } from "@/lib/advertising/placements";
import { AD_CAMPAIGNS_STORAGE_KEY } from "@/lib/advertising/ad-campaign-store";
import { LIVE_REFRESH_FAST_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { PlaceholderArt } from "@/components/shared/placeholder-art";
import type { PlacedAdCampaign } from "@/lib/advertising/types";

export function AdBannerSection() {
  const [banner, setBanner] = useState<PlacedAdCampaign | null | undefined>(undefined);

  // Campaign start/end is wall-clock-driven, so this needs the poll leg,
  // not just the storage-event leg, to pick up a campaign going live or
  // expiring while the homepage is already open.
  useLiveRefresh(
    () => setBanner(getActiveCampaignsForPlacement("HOMEPAGE_BANNER")[0] ?? null),
    [AD_CAMPAIGNS_STORAGE_KEY],
    LIVE_REFRESH_FAST_MS,
  );

  if (!banner) return null;

  return (
    <section className="border-b bg-card">
      <div className="container py-4">
        <Link
          href={banner.linkUrl}
          className="group flex items-center gap-4 overflow-hidden rounded-xl border bg-background p-3 transition-shadow hover:shadow-md sm:p-4"
        >
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
            {banner.imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={banner.imageDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <PlaceholderArt seed={banner.imageSeed} icon={Megaphone} className="h-full w-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="tag-notch inline-flex items-center bg-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-foreground">
              Sponsored
            </span>
            <p className="mt-1.5 truncate font-display text-base font-semibold sm:text-lg">{banner.title}</p>
            {banner.tagline && <p className="truncate text-sm text-muted-foreground">{banner.tagline}</p>}
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
