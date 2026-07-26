"use client";

import { Image as ImageIcon, LayoutPanelLeft, Sparkles, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AD_PLACEMENTS, AD_PLACEMENT_DESCRIPTION, AD_PLACEMENT_LABEL, getAdPrice } from "@/lib/advertising/pricing";
import type { AdPlacement } from "@/lib/advertising/types";

const PLACEMENT_ICON: Record<AdPlacement, typeof ImageIcon> = {
  HOMEPAGE_BANNER: ImageIcon,
  SIDEBAR: LayoutPanelLeft,
  SPONSORED_PRODUCT: Sparkles,
  FEATURED_SHOP: Store,
};

export function AdPlacementStep({
  value,
  onChange,
  onContinue,
}: {
  value: AdPlacement | null;
  onChange: (placement: AdPlacement) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Where do you want to advertise?</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {AD_PLACEMENTS.map((placement) => {
          const Icon = PLACEMENT_ICON[placement];
          return (
            <button
              key={placement}
              type="button"
              onClick={() => onChange(placement)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:border-primary",
                value === placement && "border-primary bg-accent",
              )}
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{AD_PLACEMENT_LABEL[placement]}</span>
              <span className="text-xs text-muted-foreground">{AD_PLACEMENT_DESCRIPTION[placement]}</span>
              <span className="mt-1 text-xs font-medium text-primary">From GHS {getAdPrice(placement, "DAILY")}/day</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6">
        <Button disabled={!value} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
