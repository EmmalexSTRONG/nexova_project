"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, PackageCheck, RefreshCw } from "lucide-react";
import { getVendorOrders } from "@/lib/vendor/dashboard-data";
import { getStockStatus } from "@/lib/stock";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import type { PlacedOrder } from "@/lib/checkout/types";
import type { MockProduct } from "@/lib/data";

interface VendorNotification {
  id: string;
  icon: typeof Bell;
  title: string;
  description: string;
  timestamp: string;
  href: string;
}

function buildNotifications(orders: PlacedOrder[], products: MockProduct[], shopSlug: string): VendorNotification[] {
  const notifications: VendorNotification[] = [];

  for (const order of orders) {
    notifications.push({
      id: `new-${order.orderNumber}`,
      icon: PackageCheck,
      title: `New order — ${order.orderNumber}`,
      description: `${order.customerName} placed an order for GHS ${order.total.toFixed(2)}.`,
      timestamp: order.placedAt,
      href: "/vendor/orders",
    });

    for (const event of order.statusHistory.slice(1)) {
      notifications.push({
        id: `status-${order.orderNumber}-${event.status}-${event.timestamp}`,
        icon: RefreshCw,
        title: `${order.orderNumber} → ${ORDER_STATUS_LABEL[event.status]}`,
        description: `Status updated for ${order.customerName}'s order.`,
        timestamp: event.timestamp,
        href: `/orders/${order.orderNumber}/track`,
      });
    }
  }

  const now = new Date().toISOString();
  for (const product of products) {
    const stock = getStockStatus(product);
    if (stock.purchasable && stock.tone === "sale") {
      notifications.push({
        id: `low-stock-${product.slug}`,
        icon: AlertTriangle,
        title: `Low stock — ${product.name}`,
        description: `Only ${product.stockLevel} left. Consider restocking soon.`,
        timestamp: now,
        href: "/vendor/inventory",
      });
    }
  }

  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function VendorNotificationsContent({ shopSlug, products }: { shopSlug: string; products: MockProduct[] }) {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);

  useEffect(() => {
    function load() {
      setOrders(getVendorOrders(shopSlug));
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [shopSlug]);

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">New orders, status changes, and stock alerts.</p>
      </div>

      {orders === undefined ? (
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      ) : (
        (() => {
          const notifications = buildNotifications(orders, products, shopSlug);
          if (notifications.length === 0) {
            return (
              <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                  <Bell className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium">You&apos;re all caught up</p>
                <p className="max-w-xs text-sm text-muted-foreground">New orders and alerts will show up here.</p>
              </div>
            );
          }
          return (
            <div className="divide-y rounded-lg border bg-card">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-accent/50"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                    <notification.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
}
