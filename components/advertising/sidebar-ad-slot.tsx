"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getActiveCampaignsForPlacement } from "@/lib/advertising/placements";
import { PlaceholderArt } from "@/components/shared/placeholder-art";
import type { PlacedAdCampaign } from "@/lib/advertising/types";

export function SidebarAdSlot() {
  const [ad, setAd] = useState<PlacedAdCampaign | null | undefined>(undefined);

  useEffect(() => {
    const campaigns = getActiveCampaignsForPlacement("SIDEBAR");
    setAd(campaigns[0] ?? null);
  }, []);

  if (!ad) return null;

  return (
    <Link href={ad.linkUrl} className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <div className="h-28 w-full">
        {ad.imageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.imageDataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <PlaceholderArt seed={ad.imageSeed} icon={Megaphone} className="h-full w-full" />
        )}
      </div>
      <div className="p-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ad</span>
        <p className="mt-1 truncate text-sm font-semibold group-hover:text-primary">{ad.title}</p>
        {ad.tagline && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{ad.tagline}</p>}
      </div>
    </Link>
  );
}
