import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import type { OrderStatus } from "@/lib/checkout/types";

const STATUS_VARIANT: Record<OrderStatus, BadgeProps["variant"]> = {
  ORDER_RECEIVED: "outline",
  PAYMENT_CONFIRMED: "secondary",
  PROCESSING: "secondary",
  PACKING: "secondary",
  READY_FOR_PICKUP: "default",
  DISPATCHED: "default",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}
