"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { getAllOrders, ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/checkout/order-status-badge";

export function AccountOrdersContent({ customerEmail }: { customerEmail: string }) {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);

  useEffect(() => {
    const email = customerEmail.toLowerCase();
    function load() {
      setOrders(getAllOrders().filter((order) => order.customerEmail.toLowerCase() === email));
    }
    load();

    function handleStorage(event: StorageEvent) {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [customerEmail]);

  if (orders === undefined) {
    return <p className="text-sm text-muted-foreground">Loading your orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <PackageSearch className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">No orders yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">Orders you place will show up here for tracking.</p>
        <Button asChild size="sm">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border bg-card">
      {orders.map((order) => (
        <Link
          key={order.orderNumber}
          href={`/orders/${order.orderNumber}/track`}
          className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-accent/50"
        >
          <div>
            <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Date(order.placedAt).toLocaleDateString()} · {order.items.length} item
              {order.items.length === 1 ? "" : "s"} · {PAYMENT_METHOD_LABEL[order.paymentMethod]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Price amount={order.total} currency={order.currency} size="sm" />
            <OrderStatusBadge status={order.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
