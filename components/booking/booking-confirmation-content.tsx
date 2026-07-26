"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useBookingLookup } from "@/lib/booking/use-booking-lookup";
import { updateBooking, updateBookingStatus } from "@/lib/booking/booking-store";
import { sendBookingConfirmationEmailAction } from "@/lib/booking/actions";
import { verifyFlutterwavePaymentAction, verifyPaystackPaymentAction } from "@/lib/payments/actions";
import { BOOKING_STATUS_DESCRIPTION } from "@/lib/booking/booking-status";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContactLinks } from "@/components/marketplace/contact-links";

export function BookingConfirmationContent({ bookingNumber }: { bookingNumber: string }) {
  const booking = useBookingLookup(bookingNumber);
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!booking || booking.paymentStatus !== "PENDING" || booking.paymentMethod === "CASH") return;
    if (hasVerified.current) return;
    hasVerified.current = true;

    async function verify() {
      setIsVerifying(true);
      const result =
        booking!.paymentMethod === "PAYSTACK"
          ? await verifyPaystackPaymentAction(searchParams.get("reference") ?? searchParams.get("trxref") ?? booking!.paymentReference ?? "")
          : await verifyFlutterwavePaymentAction(searchParams.get("transaction_id") ?? booking!.paymentReference ?? "");

      const paymentStatus = result?.status ?? "FAILED";
      updateBooking(bookingNumber, { paymentStatus });

      if (paymentStatus === "SUCCESSFUL") {
        const emailSent = await sendBookingConfirmationEmailAction({ ...booking!, paymentStatus });
        if (emailSent) updateBooking(bookingNumber, { emailSent: true });
        updateBookingStatus(bookingNumber, "CONFIRMED");
      }

      setIsVerifying(false);
    }

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, bookingNumber]);

  if (booking === undefined) {
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading your booking...</div>;
  }

  if (booking === null) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">We couldn&apos;t find that booking</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This booking may have been made on a different device or browser.
        </p>
        <Button asChild size="lg">
          <Link href="/services">Browse services</Link>
        </Button>
      </div>
    );
  }

  const isOnlinePayment = booking.paymentMethod === "PAYSTACK" || booking.paymentMethod === "FLUTTERWAVE";

  if (isOnlinePayment && (isVerifying || booking.paymentStatus === "PENDING")) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Confirming your payment...</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Hold on while we confirm your {PAYMENT_METHOD_LABEL[booking.paymentMethod]} payment for booking{" "}
          {booking.bookingNumber}.
        </p>
      </div>
    );
  }

  if (isOnlinePayment && booking.paymentStatus === "FAILED") {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-7 w-7" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Payment not completed</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t confirm payment for booking {booking.bookingNumber}. No charge was completed — you can
          return and try again.
        </p>
        <Button asChild size="lg">
          <Link href={`/services/${booking.serviceSlug}/book`}>Back to booking</Link>
        </Button>
      </div>
    );
  }

  const scheduledDateLabel = new Date(`${booking.scheduledDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
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
        <h1 className="font-display text-2xl font-semibold">Booking confirmed</h1>
        <p className="text-sm text-muted-foreground">
          Thanks, {booking.customerName.split(" ")[0]} — {BOOKING_STATUS_DESCRIPTION[booking.status]}
        </p>
        <p className="font-mono text-lg font-bold">{booking.bookingNumber}</p>
      </div>

      {!booking.emailSent && (
        <Alert className="mt-6">
          <AlertDescription>
            We couldn&apos;t send a confirmation email right now, but your booking is confirmed — keep this booking
            number for your records.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 rounded-lg border bg-card p-5">
        <p className="font-medium">{booking.serviceName}</p>
        <p className="text-sm text-muted-foreground">{booking.providerName}</p>
        <div className="mt-3 flex items-center gap-2 border-t pt-3 text-sm">
          <CalendarCheck className="h-4 w-4 text-primary" />
          {scheduledDateLabel} at {booking.scheduledTimeLabel}
        </div>
        {booking.notes && <p className="mt-2 text-xs text-muted-foreground">&ldquo;{booking.notes}&rdquo;</p>}
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">{PAYMENT_METHOD_LABEL[booking.paymentMethod]}</span>
          <span className="text-base font-semibold">
            <Price amount={booking.price} currency={booking.currency} size="sm" />
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-5">
        <h2 className="font-display text-sm font-semibold">Need to reach {booking.providerName}?</h2>
        <p className="mt-1 text-xs text-muted-foreground">Contact them directly about your appointment.</p>
        <div className="mt-3">
          <ContactLinks phone={booking.providerPhone} whatsapp={booking.providerWhatsapp} email={booking.providerEmail} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/account/bookings">My bookings</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/services">Browse more services</Link>
        </Button>
      </div>
    </div>
  );
}
