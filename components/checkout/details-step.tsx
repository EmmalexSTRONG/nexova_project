"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocateFixed, MapPin } from "lucide-react";
import {
  checkoutContactAddressSchema,
  checkoutContactOnlySchema,
  type CheckoutContactAddressInput,
} from "@/lib/checkout/validators";
import type { FulfillmentMethod, PickupPoint } from "@/lib/checkout/types";
import { GHANA_REGIONS, estimateShipping, type GhanaRegion } from "@/lib/shipping";
import { DistanceEta } from "@/components/maps/distance-eta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DetailsStep({
  fulfillment,
  pickupPoints,
  customerCoords,
  onLocate,
  defaultValues,
  onSubmit,
  onBack,
}: {
  fulfillment: FulfillmentMethod;
  pickupPoints: PickupPoint[];
  customerCoords: { lat: number; lng: number } | null;
  onLocate: (coords: { lat: number; lng: number }) => void;
  defaultValues: Partial<CheckoutContactAddressInput>;
  onSubmit: (data: CheckoutContactAddressInput) => void;
  onBack: () => void;
}) {
  const schema = fulfillment === "DELIVERY" ? checkoutContactAddressSchema : checkoutContactOnlySchema;
  const [locateError, setLocateError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutContactAddressInput>({
    resolver: zodResolver(schema as typeof checkoutContactAddressSchema),
    defaultValues,
  });

  const region = watch("region") as GhanaRegion | undefined;
  const estimate = fulfillment === "DELIVERY" && region ? estimateShipping(region) : null;

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support location access.");
      return;
    }
    setLocateError(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setLocateError("Location access was denied — you can still enter your address manually.");
        setIsLocating(false);
      },
      { timeout: 8000 },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="font-display text-lg font-semibold">
        {fulfillment === "DELIVERY" ? "Delivery details" : "Contact details"}
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="+233501234567" {...register("phone")} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      {fulfillment === "DELIVERY" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="line1">Address line 1</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs" onClick={handleUseMyLocation} disabled={isLocating}>
                <LocateFixed className="h-3.5 w-3.5" />
                {isLocating ? "Locating..." : customerCoords ? "Location captured" : "Use my current location"}
              </Button>
            </div>
            <Input id="line1" {...register("line1")} />
            {errors.line1 && <p className="text-sm text-destructive">{errors.line1.message}</p>}
            {locateError && <p className="text-xs text-destructive">{locateError}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="line2">Address line 2 (optional)</Label>
            <Input id="line2" {...register("line2")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City / town</Label>
            <Input id="city" {...register("city")} />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <select
              id="region"
              {...register("region")}
              defaultValue=""
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="" disabled>
                Select region
              </option>
              {GHANA_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
          </div>
          {estimate && (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Estimated delivery: GHS {estimate.cost.toFixed(2)} · {estimate.etaLabel}
            </p>
          )}
          {customerCoords && (
            <div className="space-y-1.5 sm:col-span-2">
              <p className="text-xs font-medium">Distance from you</p>
              {pickupPoints.map((point) => (
                <div key={point.shopSlug} className="rounded-md border p-2.5 text-xs">
                  <p className="font-medium">{point.shopName}</p>
                  <DistanceEta origin={customerCoords} destination={{ lat: point.lat, lng: point.lng }} className="mt-1 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">Pickup locations</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Your order includes items from {pickupPoints.length}{" "}
            {pickupPoints.length === 1 ? "shop" : "shops"} — you&apos;ll collect from each location below.
          </p>
          <div className="mt-3 space-y-2">
            {pickupPoints.map((point) => (
              <div key={point.shopSlug} className="flex items-start gap-2 rounded-md border p-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{point.shopName}</p>
                  <p className="text-muted-foreground">
                    {point.addressLine}, {point.city}, {point.region}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
