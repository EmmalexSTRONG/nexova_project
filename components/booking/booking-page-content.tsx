"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MockService } from "@/lib/data";
import type { CheckoutPaymentMethod } from "@/lib/checkout/types";
import type { CheckoutContactOnlyInput } from "@/lib/checkout/validators";
import { generateBookingNumber, saveBooking, updateBooking } from "@/lib/booking/booking-store";
import type { PlacedBooking } from "@/lib/booking/types";
import { sendBookingConfirmationEmailAction } from "@/lib/booking/actions";
import { initializeFlutterwavePaymentAction, initializePaystackPaymentAction } from "@/lib/payments/actions";
import { CheckoutStepper, type StepDefinition } from "@/components/checkout/checkout-stepper";
import { BookingScheduleStep } from "./booking-schedule-step";
import { BookingDetailsStep } from "./booking-details-step";
import { BookingPaymentStep } from "./booking-payment-step";
import { BookingReviewStep } from "./booking-review-step";

const STEPS: StepDefinition[] = [
  { key: "schedule", label: "Schedule" },
  { key: "details", label: "Details" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

export function BookingPageContent({
  service,
  defaultName,
  defaultEmail,
}: {
  service: MockService;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [schedule, setSchedule] = useState({ date: "", timeSlot: "", notes: "" });
  const [contact, setContact] = useState<CheckoutContactOnlyInput | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const completedIndexes = STEPS.map((_, i) => i).filter((i) => i < stepIndex);

  async function handleConfirm() {
    if (!contact || !paymentMethod || !schedule.date || !schedule.timeSlot) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const bookingNumber = generateBookingNumber();
    const booking: PlacedBooking = {
      bookingNumber,
      placedAt: new Date().toISOString(),
      serviceSlug: service.slug,
      serviceName: service.name,
      providerName: service.providerName,
      providerPhone: service.phone,
      providerWhatsapp: service.whatsapp,
      providerEmail: service.email,
      price: service.price,
      currency: service.currency,
      scheduledDate: schedule.date,
      scheduledTimeLabel: schedule.timeSlot,
      customerName: contact.fullName,
      customerEmail: contact.email,
      customerPhone: contact.phone,
      notes: schedule.notes || undefined,
      paymentMethod,
      paymentStatus: "PENDING",
      status: "PENDING",
      statusHistory: [{ status: "PENDING", timestamp: new Date().toISOString() }],
      emailSent: false,
    };

    saveBooking(booking);

    if (paymentMethod === "CASH") {
      const emailSent = await sendBookingConfirmationEmailAction(booking);
      if (emailSent) updateBooking(bookingNumber, { emailSent: true });
      router.push(`/bookings/${bookingNumber}/confirmation`);
      return;
    }

    const returnPath = `/bookings/${bookingNumber}/confirmation`;

    if (paymentMethod === "PAYSTACK") {
      const result = await initializePaystackPaymentAction({
        email: contact.email,
        amountGhs: service.price,
        orderNumber: bookingNumber,
        returnPath,
      });
      if (!result) {
        setSubmitError("We couldn't start your Paystack payment. Please try again.");
        setIsSubmitting(false);
        return;
      }
      updateBooking(bookingNumber, { paymentReference: result.reference });
      window.location.href = result.authorizationUrl;
      return;
    }

    if (paymentMethod === "FLUTTERWAVE") {
      const result = await initializeFlutterwavePaymentAction({
        email: contact.email,
        name: contact.fullName,
        phone: contact.phone,
        amountGhs: service.price,
        orderNumber: bookingNumber,
        returnPath,
      });
      if (!result) {
        setSubmitError("We couldn't start your Flutterwave payment. Please try again.");
        setIsSubmitting(false);
        return;
      }
      updateBooking(bookingNumber, { paymentReference: result.txRef });
      window.location.href = result.paymentLink;
      return;
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="font-display text-xl font-bold">Book {service.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">with {service.providerName}</p>
      <div className="mt-4">
        <CheckoutStepper steps={STEPS} currentIndex={stepIndex} completedIndexes={completedIndexes} onStepClick={setStepIndex} />
      </div>

      <div className="mt-6 rounded-lg border bg-card p-5">
        {stepIndex === 0 && (
          <BookingScheduleStep
            defaultValues={schedule}
            onSubmit={(data) => {
              setSchedule(data);
              setStepIndex(1);
            }}
          />
        )}

        {stepIndex === 1 && (
          <BookingDetailsStep
            defaultValues={{
              fullName: contact?.fullName ?? defaultName ?? "",
              email: contact?.email ?? defaultEmail ?? "",
              phone: contact?.phone ?? "",
            }}
            onSubmit={(data) => {
              setContact(data);
              setStepIndex(2);
            }}
            onBack={() => setStepIndex(0)}
          />
        )}

        {stepIndex === 2 && (
          <BookingPaymentStep
            value={paymentMethod}
            onChange={setPaymentMethod}
            onContinue={() => setStepIndex(3)}
            onBack={() => setStepIndex(1)}
          />
        )}

        {stepIndex === 3 && contact && paymentMethod && (
          <BookingReviewStep
            service={service}
            schedule={schedule}
            contact={contact}
            paymentMethod={paymentMethod}
            onBack={() => setStepIndex(2)}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  );
}
