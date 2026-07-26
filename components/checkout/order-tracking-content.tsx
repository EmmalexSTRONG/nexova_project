"use client";

import Link from "next/link";
import { useOrderLookup } from "@/lib/checkout/use-order-lookup";
import { ORDER_STATUS_DESCRIPTION, ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import { getShopBySlug } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { OrderStatusTimeline } from "@/components/checkout/order-status-timeline";
import { OrderStatusBadge } from "@/components/checkout/order-status-badge";
import { LocationMap } from "@/components/maps/location-map-dynamic";
import { DistanceEta } from "@/components/maps/distance-eta";

export function OrderTrackingContent({ orderNumber }: { orderNumber: string }) {
  const order = useOrderLookup(orderNumber);

  if (order === undefined) {
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading your order...</div>;
  }

  if (order === null) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">We couldn&apos;t find that order</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This order may have been placed on a different device or browser.
        </p>
        <Button asChild size="lg">
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    );
  }

  const sellerShop = order.items[0] ? getShopBySlug(order.items[0].shopSlug) : undefined;
  const customerLat = order.shippingAddress?.lat;
  const customerLng = order.shippingAddress?.lng;
  const showRouteMap = order.fulfillment === "DELIVERY" && sellerShop && customerLat !== undefined && customerLng !== undefined;

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Track order</p>
          <h1 className="font-mono text-lg font-bold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ORDER_STATUS_DESCRIPTION[order.status]}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {showRouteMap && (
        <div className="mt-6 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">
            {order.status === "DISPATCHED" || order.status === "OUT_FOR_DELIVERY"
              ? "Your order is on its way"
              : "Delivery route"}
          </h2>
          <LocationMap
            seller={{ lat: sellerShop!.location.lat, lng: sellerShop!.location.lng, label: sellerShop!.name }}
            customer={{ lat: customerLat!, lng: customerLng!, label: "Delivery address" }}
            heightClassName="h-56"
            className="mt-3"
          />
          <DistanceEta
            origin={{ lat: sellerShop!.location.lat, lng: sellerShop!.location.lng }}
            destination={{ lat: customerLat!, lng: customerLng! }}
            className="mt-3 block text-xs"
          />
        </div>
      )}

      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="mb-6 font-display text-sm font-semibold">{ORDER_STATUS_LABEL[order.status]}</h2>
        <OrderStatusTimeline order={order} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/orders/${order.orderNumber}/confirmation`}>Order summary</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/orders/${order.orderNumber}/invoice`}>View invoice</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/account/orders">All orders</Link>
        </Button>
      </div>
    </div>
  );
}
