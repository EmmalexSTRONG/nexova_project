"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorApplicationLookup } from "@/lib/vendor/use-vendor-application-lookup";
import { updateVendorApplication, markVendorApplicationSubscribed } from "@/lib/vendor/vendor-application-store";
import { VENDOR_SUBSCRIPTION_PLANS, getVendorSubscriptionPlan } from "@/lib/vendor/subscription-plans";
import {
  generateSubscriptionTransactionReference,
  saveSubscriptionTransaction,
  updateSubscriptionTransaction,
} from "@/lib/vendor/subscription-transaction-store";
import {
  activateVendorSubscriptionAction,
  type ActivateVendorSubscriptionResult,
} from "@/lib/vendor/vendor-application-actions";
import { chargePaystackMobileMoneyAction, verifyPaystackPaymentAction } from "@/lib/payments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Price } from "@/components/shared/price";

type Phase = "plan-select" | "charging" | "pending" | "activating" | "success" | "failed";

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 30; // ~2 minutes

function isValidGhanaMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^(0\d{9}|233\d{9})$/.test(digits);
}

export function VendorSubscriptionContent({ applicationId }: { applicationId: string | undefined }) {
  const application = useVendorApplicationLookup(applicationId ?? "");

  const [planId, setPlanId] = useState<string>("growth");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("plan-select");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activation, setActivation] = useState<ActivateVendorSubscriptionResult | null>(null);
  const [paidAt, setPaidAt] = useState<string | null>(null);

  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  function handleFailure(reference: string, message: string) {
    updateSubscriptionTransaction(reference, { status: "FAILED" });
    if (application) updateVendorApplication(application.id, { paymentStatus: "FAILED" });
    if (!isMountedRef.current) return;
    setPhase("failed");
    setStatusMessage(message);
  }

  async function handleSuccess(reference: string) {
    if (!application) return;
    const now = new Date().toISOString();
    updateSubscriptionTransaction(reference, { status: "SUCCESSFUL", providerStatus: "success", paidAt: now });

    const plan = getVendorSubscriptionPlan(planId);
    markVendorApplicationSubscribed(application.id, {
      subscriptionPlanId: plan?.id ?? planId,
      subscriptionAmount: plan?.priceGhs ?? 0,
    });
    updateVendorApplication(application.id, { paymentStatus: "SUCCESSFUL" });

    if (!isMountedRef.current) return;
    setPaidAt(now);
    setPhase("activating");
    setStatusMessage("Payment confirmed — setting up your account...");

    const result = await activateVendorSubscriptionAction({
      ownerName: application.ownerName,
      email: application.email,
      phone: application.phone,
      businessName: application.businessName,
      planName: plan?.name ?? "Subscription",
      amountGhs: plan?.priceGhs ?? 0,
      reference,
      paidAt: now,
    });

    if (!isMountedRef.current) return;
    setActivation(result);
    setPhase("success");
  }

  async function pollForResult(reference: string, attempt = 0) {
    const result = await verifyPaystackPaymentAction(reference);
    if (!isMountedRef.current) return;

    if (result?.status === "SUCCESSFUL") {
      await handleSuccess(reference);
      return;
    }
    if (result?.status === "FAILED") {
      handleFailure(reference, "Your MTN Mobile Money payment was not completed. Please try again.");
      return;
    }
    if (attempt >= MAX_POLL_ATTEMPTS) {
      handleFailure(
        reference,
        "We didn't get confirmation in time. If you approved the prompt on your phone, check back shortly — otherwise, try again.",
      );
      return;
    }
    pollTimeoutRef.current = setTimeout(() => pollForResult(reference, attempt + 1), POLL_INTERVAL_MS);
  }

  async function handleCharge() {
    if (!application) return;
    if (!isValidGhanaMobile(phone)) {
      setPhoneError("Enter a valid MTN Mobile Money number, e.g. 0551234567.");
      return;
    }
    setPhoneError(null);
    const plan = getVendorSubscriptionPlan(planId);
    if (!plan) return;

    setPhase("charging");
    setStatusMessage(null);

    const reference = generateSubscriptionTransactionReference(application.id);
    const now = new Date().toISOString();
    saveSubscriptionTransaction({
      reference,
      vendorApplicationId: application.id,
      network: "MTN",
      phone,
      planId: plan.id,
      planName: plan.name,
      amount: plan.priceGhs,
      currency: "GHS",
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });

    updateVendorApplication(application.id, {
      subscriptionPlanId: plan.id,
      subscriptionAmount: plan.priceGhs,
      paymentMethod: "PAYSTACK",
      paymentReference: reference,
      paymentStatus: "PENDING",
    });

    const result = await chargePaystackMobileMoneyAction({
      email: application.email,
      amountGhs: plan.priceGhs,
      phone,
      reference,
    });
    if (!isMountedRef.current) return;

    if (!result) {
      handleFailure(reference, "We couldn't start your MTN Mobile Money payment. Please try again.");
      return;
    }
    if (result.status === "failed") {
      updateSubscriptionTransaction(reference, { providerStatus: result.status });
      handleFailure(reference, "Your MTN Mobile Money payment failed. Please try again.");
      return;
    }
    if (result.status === "success") {
      await handleSuccess(reference);
      return;
    }

    updateSubscriptionTransaction(reference, { providerStatus: result.status });
    setPhase("pending");
    setStatusMessage(result.displayText ?? "Approve the payment prompt on your phone to continue.");
    pollForResult(reference);
  }

  if (!applicationId) {
    return (
      <NoticeState
        title="No application selected"
        description="Start by submitting your vendor application."
        linkHref="/register/vendor"
        linkLabel="Become a vendor"
      />
    );
  }

  if (application === undefined) {
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading your application...</div>;
  }

  if (application === null) {
    return (
      <NoticeState
        title="We couldn't find that application"
        description="This may have been submitted on a different device or browser."
        linkHref="/register/vendor"
        linkLabel="Become a vendor"
      />
    );
  }

  if (application.status === "PENDING_VERIFICATION") {
    return (
      <NoticeState
        title="Verify your email first"
        description="Check your inbox for a verification link before choosing a subscription plan."
        linkHref="/register/vendor"
        linkLabel="Back to application"
      />
    );
  }

  if (application.status === "SUBSCRIBED" && phase === "plan-select") {
    return (
      <NoticeState
        title="Your subscription is active"
        description={`${application.shopName} is subscribed and active. Sign in to get started.`}
        linkHref="/login"
        linkLabel="Sign in"
      />
    );
  }

  const plan = getVendorSubscriptionPlan(planId);

  if (phase === "activating" || phase === "success") {
    return (
      <div className="container max-w-xl py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          {phase === "activating" ? (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
              <Loader2 className="h-6 w-6 animate-spin" />
            </span>
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
          )}
          <h1 className="font-display text-2xl font-semibold">
            {phase === "activating" ? "Confirming your payment..." : "Subscription active"}
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">{statusMessage}</p>
        </div>

        {phase === "success" && (
          <>
            <div className="mt-6 rounded-lg border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="font-medium">{plan?.name ?? "Subscription"} plan</span>
                <span className="text-base font-semibold">
                  <Price amount={plan?.priceGhs ?? 0} size="sm" />
                </span>
              </div>
              <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                Paid via MTN Mobile Money{paidAt ? ` · ${new Date(paidAt).toLocaleString()}` : ""}. A receipt and
                welcome email have been sent to {application.email}.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {activation?.signedIn ? (
                <Button asChild size="lg">
                  <Link href="/vendor/dashboard">Go to your dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-2xl font-bold tracking-tight">Choose a subscription plan</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {application.shopName} is verified — pick a plan and pay with MTN Mobile Money to activate your shop.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {VENDOR_SUBSCRIPTION_PLANS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setPlanId(option.id)}
            disabled={phase !== "plan-select"}
            className={cn(
              "relative flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60",
              planId === option.id && "border-primary bg-accent",
            )}
          >
            {option.highlighted && (
              <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                Most popular
              </span>
            )}
            <span className="font-display font-semibold">{option.name}</span>
            <span className="text-lg font-bold">
              <Price amount={option.priceGhs} size="sm" /> <span className="text-xs font-normal text-muted-foreground">/ month</span>
            </span>
            <span className="text-xs text-muted-foreground">{option.tagline}</span>
            <ul className="mt-1 space-y-1.5">
              {option.features.map((feature) => (
                <li key={feature} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold">Pay with MTN Mobile Money</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The only payment method we accept for subscriptions right now.
      </p>

      <div className="mt-3 max-w-sm space-y-2">
        <Label htmlFor="mtn-phone">MTN Mobile Money number</Label>
        <div className="relative">
          <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="mtn-phone"
            type="tel"
            placeholder="0551234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={phase !== "plan-select"}
            className="h-11 rounded-lg pl-9"
          />
        </div>
        {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
      </div>

      {phase === "failed" && statusMessage && (
        <Alert variant="destructive" className="mt-4 max-w-sm">
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      {(phase === "charging" || phase === "pending") && (
        <Alert className="mt-4 max-w-sm">
          <AlertDescription className="flex items-start gap-2">
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
            <span>
              {phase === "charging"
                ? "Starting your MTN Mobile Money payment..."
                : (statusMessage ?? "Waiting for you to approve the payment on your phone...")}
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Button
        size="lg"
        className="mt-6 w-full sm:w-auto"
        disabled={phase === "charging" || phase === "pending" || !phone}
        onClick={phase === "failed" ? () => setPhase("plan-select") : handleCharge}
      >
        {phase === "charging"
          ? "Starting payment..."
          : phase === "pending"
            ? "Waiting for approval..."
            : phase === "failed"
              ? "Try again"
              : "Pay & activate shop"}
      </Button>
    </div>
  );
}

function NoticeState({
  title,
  description,
  linkHref,
  linkLabel,
}: {
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button asChild size="lg">
        <Link href={linkHref}>{linkLabel}</Link>
      </Button>
    </div>
  );
}
