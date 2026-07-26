import type { BookingStatus } from "./types";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_DESCRIPTION: Record<BookingStatus, string> = {
  PENDING: "We've received your booking request and are confirming it with the provider.",
  CONFIRMED: "Your booking is confirmed — the provider will see you at the scheduled time.",
  COMPLETED: "This booking has been completed.",
  CANCELLED: "This booking has been cancelled.",
};

// Available appointment slots offered at booking time — a fixed set rather
// than a real provider-availability calendar, since there's no live
// database this could be checked against.
export const BOOKING_TIME_SLOTS = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"] as const;
