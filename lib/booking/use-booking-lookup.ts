"use client";

import { useEffect, useState } from "react";
import { getBookingByNumber, BOOKINGS_STORAGE_KEY } from "./booking-store";
import type { PlacedBooking } from "./types";

export function useBookingLookup(bookingNumber: string) {
  const [booking, setBooking] = useState<PlacedBooking | null | undefined>(undefined);

  useEffect(() => {
    setBooking(getBookingByNumber(bookingNumber));

    function handleStorage(event: StorageEvent) {
      if (event.key === BOOKINGS_STORAGE_KEY || event.key === null) {
        setBooking(getBookingByNumber(bookingNumber));
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [bookingNumber]);

  return booking;
}
