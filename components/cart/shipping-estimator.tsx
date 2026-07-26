"use client";

import { GHANA_REGIONS, type GhanaRegion, type ShippingEstimate } from "@/lib/shipping";

export function ShippingEstimator({
  region,
  onRegionChange,
  estimate,
}: {
  region: GhanaRegion | "";
  onRegionChange: (region: GhanaRegion | "") => void;
  estimate: ShippingEstimate | null;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="font-display text-sm font-semibold">Estimate shipping</h2>
      <select
        value={region}
        onChange={(event) => onRegionChange(event.target.value as GhanaRegion | "")}
        className="mt-2 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
      >
        <option value="">Select your region</option>
        {GHANA_REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {estimate && (
        <p className="mt-2 text-xs text-muted-foreground">
          GHS {estimate.cost.toFixed(2)} · Arrives in {estimate.etaLabel}
        </p>
      )}
    </div>
  );
}
