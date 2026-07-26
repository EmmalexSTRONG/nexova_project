import type { FulfillmentMethod, OrderStatus } from "./types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  ORDER_RECEIVED: "Order received",
  PAYMENT_CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  PACKING: "Packing",
  READY_FOR_PICKUP: "Ready for pickup",
  DISPATCHED: "Dispatched",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_DESCRIPTION: Record<OrderStatus, string> = {
  ORDER_RECEIVED: "We've received your order and it's being reviewed.",
  PAYMENT_CONFIRMED: "Your payment has been confirmed.",
  PROCESSING: "Your order is being prepared by the vendor.",
  PACKING: "Your items are being packed.",
  READY_FOR_PICKUP: "Your order is ready — head to the shop to collect it.",
  DISPATCHED: "Your order has left the vendor and is on its way to the courier.",
  OUT_FOR_DELIVERY: "Your order is out for delivery.",
  DELIVERED: "Your order has been delivered. Enjoy!",
  CANCELLED: "This order has been cancelled.",
};

// The two fulfillment methods branch after PACKING: pickup orders skip the
// courier-handoff steps, delivery orders skip the in-store pickup step.
export function getStatusSequence(fulfillment: FulfillmentMethod): OrderStatus[] {
  const base: OrderStatus[] = ["ORDER_RECEIVED", "PAYMENT_CONFIRMED", "PROCESSING", "PACKING"];
  if (fulfillment === "PICKUP") return [...base, "READY_FOR_PICKUP", "DELIVERED"];
  return [...base, "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"];
}

export function getNextStatus(current: OrderStatus, fulfillment: FulfillmentMethod): OrderStatus | null {
  const sequence = getStatusSequence(fulfillment);
  const index = sequence.indexOf(current);
  if (index === -1 || index === sequence.length - 1) return null;
  return sequence[index + 1] ?? null;
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "DELIVERED" || status === "CANCELLED";
}
