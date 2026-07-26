"use client";

import { Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { FulfillmentMethod } from "@/lib/checkout/types";

export function FulfillmentStep({
  value,
  onChange,
  onContinue,
}: {
  value: FulfillmentMethod | null;
  onChange: (method: FulfillmentMethod) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">How would you like to get your order?</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("DELIVERY")}
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:border-primary",
            value === "DELIVERY" && "border-primary bg-accent",
          )}
        >
          <Truck className="h-5 w-5 text-primary" />
          <span className="font-medium">Delivery</span>
          <span className="text-sm text-muted-foreground">
            We&apos;ll deliver to an address of your choice.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChange("PICKUP")}
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:border-primary",
            value === "PICKUP" && "border-primary bg-accent",
          )}
        >
          <Store className="h-5 w-5 text-primary" />
          <span className="font-medium">Pickup</span>
          <span className="text-sm text-muted-foreground">Collect your order directly from the vendor.</span>
        </button>
      </div>
      <Button className="mt-6" disabled={!value} onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
