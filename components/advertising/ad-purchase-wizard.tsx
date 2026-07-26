"use client";

import { useState } from "react";
import type { CheckoutPaymentMethod } from "@/lib/checkout/types";
import type { CheckoutContactOnlyInput } from "@/lib/checkout/validators";
import { generateAdCampaignId, saveAdCampaign, updateAdCampaign } from "@/lib/advertising/ad-campaign-store";
import { getAdPrice, AD_DURATION_DAYS } from "@/lib/advertising/pricing";
import type { AdPlacement, AdPlanDuration, PlacedAdCampaign } from "@/lib/advertising/types";
import { initializeFlutterwavePaymentAction, initializePaystackPaymentAction } from "@/lib/payments/actions";
import { CheckoutStepper, type StepDefinition } from "@/components/checkout/checkout-stepper";
import { BookingDetailsStep } from "@/components/booking/booking-details-step";
import { AdPlacementStep } from "./ad-placement-step";
import { AdPlanStep } from "./ad-plan-step";
import { AdCreativeStep, type AdCreativeValues } from "./ad-creative-step";
import { AdPaymentStep } from "./ad-payment-step";
import { AdReviewStep } from "./ad-review-step";

const STEPS: StepDefinition[] = [
  { key: "placement", label: "Placement" },
  { key: "plan", label: "Plan" },
  { key: "creative", label: "Creative" },
  { key: "details", label: "Details" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

export function AdPurchaseWizard({
  shopSlug,
  shopName,
  defaultName,
  defaultEmail,
}: {
  shopSlug: string;
  shopName: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [placement, setPlacement] = useState<AdPlacement | null>(null);
  const [duration, setDuration] = useState<AdPlanDuration | null>(null);
  const [creative, setCreative] = useState<AdCreativeValues>({
    title: "",
    tagline: "",
    linkUrl: "",
  });
  const [contact, setContact] = useState<CheckoutContactOnlyInput | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const completedIndexes = STEPS.map((_, i) => i).filter((i) => i < stepIndex);

  async function handleConfirm() {
    if (!placement || !duration || !contact || !paymentMethod) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const id = generateAdCampaignId();
    const now = new Date();
    const endsAt = new Date(now.getTime() + AD_DURATION_DAYS[duration] * 24 * 60 * 60 * 1000);
    const amount = getAdPrice(placement, duration);
    const fallbackLinkUrl =
      placement === "SPONSORED_PRODUCT" && creative.targetProductSlug
        ? `/products/${creative.targetProductSlug}`
        : `/vendors/${shopSlug}`;

    const campaign: PlacedAdCampaign = {
      id,
      placement,
      duration,
      shopSlug,
      shopName,
      targetProductSlug: creative.targetProductSlug,
      targetProductName: creative.targetProductName,
      title: creative.title,
      tagline: creative.tagline,
      linkUrl: creative.linkUrl.trim() || fallbackLinkUrl,
      imageDataUrl: creative.imageDataUrl,
      imageSeed: Math.floor(Math.random() * 1000),
      createdAt: now.toISOString(),
      startsAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      amount,
      currency: "GHS",
      customerName: contact.fullName,
      customerEmail: contact.email,
      customerPhone: contact.phone,
      paymentMethod,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
      statusHistory: [{ status: "PENDING_PAYMENT", timestamp: now.toISOString() }],
    };

    saveAdCampaign(campaign);

    const returnPath = `/advertising/${id}/confirmation`;

    if (paymentMethod === "PAYSTACK") {
      const result = await initializePaystackPaymentAction({
        email: contact.email,
        amountGhs: amount,
        orderNumber: id,
        returnPath,
      });
      if (!result) {
        setSubmitError("We couldn't start your Paystack payment. Please try again.");
        setIsSubmitting(false);
        return;
      }
      updateAdCampaign(id, { paymentReference: result.reference });
      window.location.href = result.authorizationUrl;
      return;
    }

    if (paymentMethod === "FLUTTERWAVE") {
      const result = await initializeFlutterwavePaymentAction({
        email: contact.email,
        name: contact.fullName,
        phone: contact.phone,
        amountGhs: amount,
        orderNumber: id,
        returnPath,
      });
      if (!result) {
        setSubmitError("We couldn't start your Flutterwave payment. Please try again.");
        setIsSubmitting(false);
        return;
      }
      updateAdCampaign(id, { paymentReference: result.txRef });
      window.location.href = result.paymentLink;
      return;
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="font-display text-xl font-bold">Buy an ad for {shopName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Reach more shoppers with a paid placement.</p>
      <div className="mt-4">
        <CheckoutStepper steps={STEPS} currentIndex={stepIndex} completedIndexes={completedIndexes} onStepClick={setStepIndex} />
      </div>

      <div className="mt-6 rounded-lg border bg-card p-5">
        {stepIndex === 0 && (
          <AdPlacementStep value={placement} onChange={setPlacement} onContinue={() => setStepIndex(1)} />
        )}

        {stepIndex === 1 && placement && (
          <AdPlanStep
            placement={placement}
            value={duration}
            onChange={setDuration}
            onContinue={() => setStepIndex(2)}
            onBack={() => setStepIndex(0)}
          />
        )}

        {stepIndex === 2 && placement && (
          <AdCreativeStep
            placement={placement}
            shopSlug={shopSlug}
            values={creative}
            onChange={setCreative}
            onContinue={() => setStepIndex(3)}
            onBack={() => setStepIndex(1)}
          />
        )}

        {stepIndex === 3 && (
          <BookingDetailsStep
            description="We'll send your ad purchase receipt to these details."
            defaultValues={{
              fullName: contact?.fullName ?? defaultName ?? "",
              email: contact?.email ?? defaultEmail ?? "",
              phone: contact?.phone ?? "",
            }}
            onSubmit={(data) => {
              setContact(data);
              setStepIndex(4);
            }}
            onBack={() => setStepIndex(2)}
          />
        )}

        {stepIndex === 4 && (
          <AdPaymentStep
            value={paymentMethod}
            onChange={setPaymentMethod}
            onContinue={() => setStepIndex(5)}
            onBack={() => setStepIndex(3)}
          />
        )}

        {stepIndex === 5 && placement && duration && contact && paymentMethod && (
          <AdReviewStep
            placement={placement}
            duration={duration}
            creative={creative}
            contact={contact}
            paymentMethod={paymentMethod}
            onBack={() => setStepIndex(4)}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  );
}
