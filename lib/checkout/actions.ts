"use server";

import { expressInternalFetch } from "@/lib/api/express";
import { ORDER_STATUS_DESCRIPTION, ORDER_STATUS_LABEL } from "./order-status";
import type { OrderStatus, PlacedOrder } from "./types";

export async function sendOrderStatusUpdateEmailAction(order: PlacedOrder, status: OrderStatus): Promise<boolean> {
  // Best-effort, same resilience contract as the confirmation email above.
  try {
    const result = await expressInternalFetch("/orders/send-status-update", {
      method: "POST",
      body: JSON.stringify({
        email: order.customerEmail,
        name: order.customerName,
        orderNumber: order.orderNumber,
        statusLabel: ORDER_STATUS_LABEL[status],
        statusDescription: ORDER_STATUS_DESCRIPTION[status],
      }),
    });
    return result.success;
  } catch {
    return false;
  }
}
