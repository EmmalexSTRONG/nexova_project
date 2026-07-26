import { Badge, type BadgeProps } from "@/components/ui/badge";
import { BOOKING_STATUS_LABEL } from "@/lib/booking/booking-status";
import type { BookingStatus } from "@/lib/booking/types";

const STATUS_VARIANT: Record<BookingStatus, BadgeProps["variant"]> = {
  PENDING: "outline",
  CONFIRMED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{BOOKING_STATUS_LABEL[status]}</Badge>;
}
