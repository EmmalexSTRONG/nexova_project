"use server";

import { expressInternalFetch } from "@/lib/api/express";
import type { PlacedBooking } from "./types";

export async function sendBookingConfirmationEmailAction(booking: PlacedBooking): Promise<boolean> {
  // Best-effort: a failed email must never block the confirmation UI.
  try {
    const result = await expressInternalFetch("/bookings/send-confirmation", {
      method: "POST",
      body: JSON.stringify({
        email: booking.customerEmail,
        name: booking.customerName,
        bookingNumber: booking.bookingNumber,
        serviceName: booking.serviceName,
        providerName: booking.providerName,
        scheduledDateLabel: new Date(`${booking.scheduledDate}T00:00:00`).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        scheduledTimeLabel: booking.scheduledTimeLabel,
        price: booking.price,
        currency: booking.currency,
      }),
    });
    return result.success;
  } catch {
    return false;
  }
}
