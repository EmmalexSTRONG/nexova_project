"use server";

import { expressInternalFetch } from "@/lib/api/express";
import type { PlacedOrder } from "@/lib/checkout/types";
import type { StoredPushSubscription } from "./types";

export type NotificationEvent =
  | "ORDER_PLACED"
  | "PAYMENT_SUCCESSFUL"
  | "ITEM_SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "POST_DELIVERY_THANK_YOU";

// Best-effort, same resilience contract as every other notification action
// in this project: a failure here (or the API being unreachable) must never
// block the calling UI flow.
export async function dispatchOrderNotificationAction(
  order: PlacedOrder,
  event: NotificationEvent,
  pushSubscription?: StoredPushSubscription | null,
): Promise<boolean> {
  try {
    const result = await expressInternalFetch("/notifications/dispatch", {
      method: "POST",
      body: JSON.stringify({
        event,
        order: { orderNumber: order.orderNumber, total: order.total, currency: order.currency },
        customer: { name: order.customerName, email: order.customerEmail, phone: order.customerPhone },
        pushSubscription: pushSubscription ?? undefined,
      }),
    });
    return result.success;
  } catch {
    return false;
  }
}
