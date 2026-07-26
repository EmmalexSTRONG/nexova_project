"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import { AD_DURATIONS, AD_DURATION_LABEL, AD_PLACEMENT_LABEL, getAdPrice } from "@/lib/advertising/pricing";
import type { AdPlacement, AdPlanDuration } from "@/lib/advertising/types";

export function AdPlanStep({
  placement,
  value,
  onChange,
  onContinue,
  onBack,
}: {
  placement: AdPlacement;
  value: AdPlanDuration | null;
  onChange: (duration: AdPlanDuration) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Choose a plan</h2>
      <p className="mt-1 text-sm text-muted-foreground">{AD_PLACEMENT_LABEL[placement]} pricing.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {AD_DURATIONS.map((duration) => {
          const price = getAdPrice(placement, duration);
          return (
            <button
              key={duration}
              type="button"
              onClick={() => onChange(duration)}
              className={cn(
                "flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:border-primary",
                value === duration && "border-primary bg-accent",
              )}
            >
              <span className="font-medium">{AD_DURATION_LABEL[duration]}</span>
              <Price amount={price} size="sm" />
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!value} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
