"use client";

import { MapPin } from "lucide-react";
import type { MockService } from "@/lib/data";
import type { CheckoutPaymentMethod } from "@/lib/checkout/types";
import type { CheckoutContactOnlyInput } from "@/lib/checkout/validators";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

export function BookingReviewStep({
  service,
  schedule,
  contact,
  paymentMethod,
  onBack,
  onConfirm,
  isSubmitting,
  submitError,
}: {
  service: MockService;
  schedule: { date: string; timeSlot: string; notes: string };
  contact: CheckoutContactOnlyInput;
  paymentMethod: CheckoutPaymentMethod;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}) {
  const scheduledDateLabel = new Date(`${schedule.date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Review your booking</h2>

      <div className="mt-4 rounded-lg border p-4">
        <p className="font-medium">{service.name}</p>
        <p className="text-sm text-muted-foreground">{service.providerName}</p>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <Price amount={service.price} currency={service.currency} size="lg" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <MapPin className="h-3.5 w-3.5" />
            Appointment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {scheduledDateLabel}
            <br />
            {schedule.timeSlot}
          </p>
          {schedule.notes && <p className="mt-2 text-xs text-muted-foreground">&ldquo;{schedule.notes}&rdquo;</p>}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold">Contact</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {contact.fullName}
            <br />
            {contact.phone}
            <br />
            {contact.email}
          </p>
          <h3 className="mt-3 text-sm font-semibold">Payment</h3>
          <p className="mt-1 text-sm text-muted-foreground">{PAYMENT_METHOD_LABEL[paymentMethod]}</p>
        </div>
      </div>

      {submitError && <p className="mt-4 text-sm text-destructive">{submitError}</p>}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Confirming..." : "Confirm booking"}
        </Button>
      </div>
    </div>
  );
}
