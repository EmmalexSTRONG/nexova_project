import type { CheckoutPaymentMethod, PaymentStatus } from "@/lib/checkout/types";

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface BookingStatusEvent {
  status: BookingStatus;
  timestamp: string;
  note?: string;
}

export interface PlacedBooking {
  bookingNumber: string;
  placedAt: string;
  serviceSlug: string;
  serviceName: string;
  providerName: string;
  providerPhone: string;
  providerWhatsapp: string;
  providerEmail: string;
  price: number;
  currency: string;
  // ISO date, e.g. "2026-07-20"
  scheduledDate: string;
  scheduledTimeLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  paymentMethod: CheckoutPaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  status: BookingStatus;
  statusHistory: BookingStatusEvent[];
  emailSent: boolean;
}
