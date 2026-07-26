import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { BookingStatus, PlacedBooking } from "./types";

export const BOOKINGS_STORAGE_KEY = "nexora:bookings:v1";
const store = createRecordStore<PlacedBooking>(BOOKINGS_STORAGE_KEY);

export function generateBookingNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BKG-${datePart}-${randomPart}`;
}

export function saveBooking(booking: PlacedBooking): void {
  const bookings = store.readAll();
  bookings[booking.bookingNumber] = booking;
  store.writeAll(bookings);
}

export function getBookingByNumber(bookingNumber: string): PlacedBooking | null {
  return store.readAll()[bookingNumber] ?? null;
}

export function updateBooking(bookingNumber: string, patch: Partial<PlacedBooking>): void {
  const bookings = store.readAll();
  const existing = bookings[bookingNumber];
  if (!existing) return;
  bookings[bookingNumber] = { ...existing, ...patch };
  store.writeAll(bookings);
}

export function getAllBookings(): PlacedBooking[] {
  return Object.values(store.readAll()).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  );
}

export function updateBookingStatus(bookingNumber: string, status: BookingStatus, note?: string): PlacedBooking | null {
  const bookings = store.readAll();
  const existing = bookings[bookingNumber];
  if (!existing) return null;

  const event = { status, timestamp: new Date().toISOString(), note };
  const updated: PlacedBooking = { ...existing, status, statusHistory: [...existing.statusHistory, event] };
  bookings[bookingNumber] = updated;
  store.writeAll(bookings);
  return updated;
}
