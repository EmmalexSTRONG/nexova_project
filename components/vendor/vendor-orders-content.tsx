"use client";

import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/checkout/order-store";
import { sendOrderStatusUpdateEmailAction } from "@/lib/checkout/actions";
import { getNextStatus, isTerminalStatus, ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import { dispatchOrderNotificationAction, type NotificationEvent } from "@/lib/notifications/actions";
import { getPushSubscription } from "@/lib/notifications/push-store";
import type { OrderStatus, PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/checkout/order-status-badge";

// Only the statuses the user explicitly asked to notify on (Item Shipped,
// Delivered, Cancelled) go through the new multi-channel dispatcher.
// Other status changes keep the original email-only notice so "notify
// whenever status changes" still holds without duplicating sends for the
// five explicitly-specified events.
const STATUS_TO_EVENT: Partial<Record<OrderStatus, NotificationEvent>> = {
  DISPATCHED: "ITEM_SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

async function notifyForStatus(order: PlacedOrder, status: OrderStatus) {
  const event = STATUS_TO_EVENT[status];
  if (!event) {
    await sendOrderStatusUpdateEmailAction(order, status);
    return;
  }

  const pushSubscription = getPushSubscription(order.customerEmail);
  await dispatchOrderNotificationAction(order, event, pushSubscription);
  if (event === "DELIVERED") {
    await dispatchOrderNotificationAction(order, "POST_DELIVERY_THANK_YOU", pushSubscription);
  }
}

export function VendorOrdersContent({ shopSlug }: { shopSlug: string }) {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopSlug]);

  function refresh() {
    setOrders(getAllOrders().filter((order) => order.items.some((item) => item.shopSlug === shopSlug)));
  }

  async function handleAdvance(order: PlacedOrder) {
    const next = getNextStatus(order.status, order.fulfillment);
    if (!next) return;
    setPendingOrderNumber(order.orderNumber);
    const updated = updateOrderStatus(order.orderNumber, next);
    refresh();
    if (updated) await notifyForStatus(updated, next);
    setPendingOrderNumber(null);
  }

  async function handleCancel(order: PlacedOrder) {
    setPendingOrderNumber(order.orderNumber);
    const updated = updateOrderStatus(order.orderNumber, "CANCELLED");
    refresh();
    if (updated) await notifyForStatus(updated, "CANCELLED");
    setPendingOrderNumber(null);
  }

  if (orders === undefined) {
    return <p className="text-sm text-muted-foreground">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <PackageSearch className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">No orders yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Orders containing your products will show up here as customers check out.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const shopItems = order.items.filter((item) => item.shopSlug === shopSlug);
        const shopSubtotal = shopItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const next = getNextStatus(order.status, order.fulfillment);
        const terminal = isTerminalStatus(order.status);
        const isPending = pendingOrderNumber === order.orderNumber;

        return (
          <div key={order.orderNumber} className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {order.customerName} · {new Date(order.placedAt).toLocaleString()} ·{" "}
                  {order.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <ul className="mt-3 space-y-1">
              {shopItems.map((item) => (
                <li key={item.productSlug} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <Price amount={item.unitPrice * item.quantity} currency={item.currency} size="sm" />
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t pt-2 text-sm font-medium">
              <span>Your items subtotal</span>
              <Price amount={shopSubtotal} currency={order.currency} size="sm" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {next && (
                <Button size="sm" disabled={isPending} onClick={() => handleAdvance(order)}>
                  {isPending ? "Updating..." : `Advance to ${ORDER_STATUS_LABEL[next]}`}
                </Button>
              )}
              {!terminal && (
                <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleCancel(order)}>
                  Cancel order
                </Button>
              )}
              {terminal && <p className="self-center text-xs text-muted-foreground">No further action needed.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
