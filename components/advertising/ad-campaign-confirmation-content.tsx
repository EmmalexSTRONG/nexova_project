"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Megaphone, XCircle } from "lucide-react";
import { useAdCampaignLookup } from "@/lib/advertising/use-ad-campaign-lookup";
import { updateAdCampaign, updateAdCampaignStatus } from "@/lib/advertising/ad-campaign-store";
import { AD_DURATION_LABEL, AD_PLACEMENT_LABEL } from "@/lib/advertising/pricing";
import { verifyFlutterwavePaymentAction, verifyPaystackPaymentAction } from "@/lib/payments/actions";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

export function AdCampaignConfirmationContent({ campaignId }: { campaignId: string }) {
  const campaign = useAdCampaignLookup(campaignId);
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!campaign || campaign.paymentStatus !== "PENDING") return;
    if (hasVerified.current) return;
    hasVerified.current = true;

    async function verify() {
      setIsVerifying(true);
      const result =
        campaign!.paymentMethod === "PAYSTACK"
          ? await verifyPaystackPaymentAction(searchParams.get("reference") ?? searchParams.get("trxref") ?? campaign!.paymentReference ?? "")
          : await verifyFlutterwavePaymentAction(searchParams.get("transaction_id") ?? campaign!.paymentReference ?? "");

      const paymentStatus = result?.status ?? "FAILED";
      updateAdCampaign(campaignId, { paymentStatus });

      if (paymentStatus === "SUCCESSFUL") {
        updateAdCampaignStatus(campaignId, "ACTIVE");
      }

      setIsVerifying(false);
    }

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign, campaignId]);

  if (campaign === undefined) {
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading your order...</div>;
  }

  if (campaign === null) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">We couldn&apos;t find that ad purchase</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This purchase may have been made on a different device or browser.
        </p>
        <Button asChild size="lg">
          <Link href="/vendor/advertising">Back to advertising</Link>
        </Button>
      </div>
    );
  }

  if (isVerifying || campaign.paymentStatus === "PENDING") {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Confirming your payment...</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Hold on while we confirm your {PAYMENT_METHOD_LABEL[campaign.paymentMethod]} payment for {campaign.id}.
        </p>
      </div>
    );
  }

  if (campaign.paymentStatus === "FAILED") {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-7 w-7" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Payment not completed</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t confirm payment for {campaign.id}. No charge was completed — you can return and try again.
        </p>
        <Button asChild size="lg">
          <Link href="/vendor/advertising/new">Back to advertising</Link>
        </Button>
      </div>
    );
  }

  const endsAtLabel = new Date(campaign.endsAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container max-w-2xl py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Ad campaign active</h1>
        <p className="text-sm text-muted-foreground">
          Thanks, {campaign.customerName.split(" ")[0]} — your {AD_PLACEMENT_LABEL[campaign.placement]} placement is live.
        </p>
        <p className="font-mono text-lg font-bold">{campaign.id}</p>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-5">
        <p className="flex items-center gap-2 font-medium">
          <Megaphone className="h-4 w-4 text-primary" />
          {campaign.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{campaign.shopName}</p>
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">
            {AD_PLACEMENT_LABEL[campaign.placement]} · {AD_DURATION_LABEL[campaign.duration]}
          </span>
          <span className="text-base font-semibold">
            <Price amount={campaign.amount} currency={campaign.currency} size="sm" />
          </span>
        </div>
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">Runs until {endsAtLabel}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/vendor/advertising">Manage advertising</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    </div>
  );
}
