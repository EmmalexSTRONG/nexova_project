"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { getAllBookings, BOOKINGS_STORAGE_KEY } from "@/lib/booking/booking-store";
import type { PlacedBooking } from "@/lib/booking/types";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";

export function AccountBookingsContent({ customerEmail }: { customerEmail: string }) {
  const [bookings, setBookings] = useState<PlacedBooking[] | undefined>(undefined);

  useEffect(() => {
    const email = customerEmail.toLowerCase();
    function load() {
      setBookings(getAllBookings().filter((booking) => booking.customerEmail.toLowerCase() === email));
    }
    load();

    function handleStorage(event: StorageEvent) {
      if (event.key === BOOKINGS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [customerEmail]);

  if (bookings === undefined) {
    return <p className="text-sm text-muted-foreground">Loading your bookings...</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <CalendarClock className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">No bookings yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">Services you book will show up here.</p>
        <Button asChild size="sm">
          <Link href="/services">Browse services</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border bg-card">
      {bookings.map((booking) => {
        const scheduledDateLabel = new Date(`${booking.scheduledDate}T00:00:00`).toLocaleDateString();
        return (
          <Link
            key={booking.bookingNumber}
            href={`/bookings/${booking.bookingNumber}/confirmation`}
            className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-accent/50"
          >
            <div>
              <p className="text-sm font-semibold">{booking.serviceName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {scheduledDateLabel} at {booking.scheduledTimeLabel} · {booking.providerName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Price amount={booking.price} currency={booking.currency} size="sm" />
              <BookingStatusBadge status={booking.status} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
