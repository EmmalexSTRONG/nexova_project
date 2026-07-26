"use client";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AD_DURATION_LABEL, AD_PLACEMENT_LABEL, getAdPrice } from "@/lib/advertising/pricing";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import type { AdPlacement, AdPlanDuration } from "@/lib/advertising/types";
import type { CheckoutPaymentMethod } from "@/lib/checkout/types";
import type { CheckoutContactOnlyInput } from "@/lib/checkout/validators";
import type { AdCreativeValues } from "./ad-creative-step";

export function AdReviewStep({
  placement,
  duration,
  creative,
  contact,
  paymentMethod,
  onBack,
  onConfirm,
  isSubmitting,
  submitError,
}: {
  placement: AdPlacement;
  duration: AdPlanDuration;
  creative: AdCreativeValues;
  contact: CheckoutContactOnlyInput;
  paymentMethod: CheckoutPaymentMethod;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const price = getAdPrice(placement, duration);

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Review your purchase</h2>

      <dl className="mt-4 space-y-3 rounded-lg border bg-card p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Placement</dt>
          <dd className="font-medium">{AD_PLACEMENT_LABEL[placement]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-medium">{AD_DURATION_LABEL[duration]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Title</dt>
          <dd className="font-medium">{creative.title}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Contact</dt>
          <dd className="text-right font-medium">
            {contact.fullName}
            <br />
            <span className="font-normal text-muted-foreground">{contact.email}</span>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Payment method</dt>
          <dd className="font-medium">{PAYMENT_METHOD_LABEL[paymentMethod]}</dd>
        </div>
        <div className="flex justify-between border-t pt-3 text-base">
          <dt className="font-semibold">Total</dt>
          <dd>
            <Price amount={price} size="md" />
          </dd>
        </div>
      </dl>

      {submitError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : `Purchase for GHS ${price.toLocaleString()}`}
        </Button>
      </div>
    </div>
  );
}
