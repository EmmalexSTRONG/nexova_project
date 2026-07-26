"use client";

import { useState } from "react";
import { getProductBySlug } from "@/lib/data";
import { getActiveCampaignsForPlacement } from "@/lib/advertising/placements";
import { AD_CAMPAIGNS_STORAGE_KEY } from "@/lib/advertising/ad-campaign-store";
import { LIVE_REFRESH_FAST_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { ProductCard } from "@/components/marketplace/product-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import type { MockProduct } from "@/lib/data";

export function SponsoredProductsSection() {
  const [items, setItems] = useState<{ id: string; product: MockProduct }[] | undefined>(undefined);

  useLiveRefresh(
    () => {
      const campaigns = getActiveCampaignsForPlacement("SPONSORED_PRODUCT");
      const resolved = campaigns
        .map((campaign) => {
          const product = campaign.targetProductSlug ? getProductBySlug(campaign.targetProductSlug) : undefined;
          return product ? { id: campaign.id, product } : null;
        })
        .filter((item): item is { id: string; product: MockProduct } => item !== null);
      setItems(resolved);
    },
    [AD_CAMPAIGNS_STORAGE_KEY],
    LIVE_REFRESH_FAST_MS,
  );

  if (!items || items.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <SectionHeader eyebrow="Sponsored" title="Promoted by our vendors" description="Products vendors are actively promoting." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map(({ id, product }) => (
            <div key={id}>
              <Badge variant="secondary" className="mb-1.5">
                Sponsored
              </Badge>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
