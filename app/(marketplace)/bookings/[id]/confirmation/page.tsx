import type { Metadata } from "next";
import { BookingConfirmationContent } from "@/components/booking/booking-confirmation-content";

export const metadata: Metadata = {
  title: "Booking confirmed — Nexora",
};

export default async function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingConfirmationContent bookingNumber={id} />;
}
