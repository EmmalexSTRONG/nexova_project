"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, PackageCheck, RefreshCw } from "lucide-react";
import { getSiteOrders } from "@/lib/admin/dashboard-data";
import { products } from "@/lib/data";
import { getStockStatus } from "@/lib/stock";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import type { PlacedOrder } from "@/lib/checkout/types";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminLoadingState } from "./admin-loading-state";

interface AdminNotification {
  id: string;
  icon: typeof Bell;
  title: string;
  description: string;
  timestamp: string;
  href: string;
}

function buildNotifications(orders: PlacedOrder[]): AdminNotification[] {
  const notifications: AdminNotification[] = [];

  for (const order of orders) {
    const shopNames = [...new Set(order.items.map((item) => item.shopName))].join(", ");
    notifications.push({
      id: `new-${order.orderNumber}`,
      icon: PackageCheck,
      title: `New order — ${order.orderNumber}`,
      description: `${order.customerName} ordered from ${shopNames} — GHS ${order.total.toFixed(2)}.`,
      timestamp: order.placedAt,
      href: "/admin/orders",
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
        description: `${product.shopName}: only ${product.stockLevel} left.`,
        timestamp: now,
        href: "/admin/inventory",
      });
    }
  }

  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function AdminNotificationsContent() {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);

  useEffect(() => {
    function load() {
      setOrders(getSiteOrders());
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">Orders, status changes, and stock alerts across every shop.</p>
      </div>

      {orders === undefined ? (
        <AdminLoadingState label="Loading notifications..." />
      ) : (
        (() => {
          const notifications = buildNotifications(orders);
          if (notifications.length === 0) {
            return <AdminEmptyState icon={Bell} title="You're all caught up" />;
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
