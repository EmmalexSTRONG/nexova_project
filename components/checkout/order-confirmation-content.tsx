"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useOrderLookup } from "@/lib/checkout/use-order-lookup";
import { updateOrder, updateOrderStatus } from "@/lib/checkout/order-store";
import { verifyFlutterwavePaymentAction, verifyPaystackPaymentAction } from "@/lib/payments/actions";
import { dispatchOrderNotificationAction } from "@/lib/notifications/actions";
import { getPushSubscription } from "@/lib/notifications/push-store";
import { useCart } from "@/lib/cart/cart-context";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PushNotificationToggle } from "@/components/notifications/push-notification-toggle";

export function OrderConfirmationContent({ orderNumber }: { orderNumber: string }) {
  const order = useOrderLookup(orderNumber);
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [isVerifying, setIsVerifying] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!order || order.paymentStatus !== "PENDING" || order.paymentMethod === "CASH") return;
    if (hasVerified.current) return;
    hasVerified.current = true;

    async function verify() {
      setIsVerifying(true);
      const result =
        order!.paymentMethod === "PAYSTACK"
          ? await verifyPaystackPaymentAction(searchParams.get("reference") ?? searchParams.get("trxref") ?? order!.paymentReference ?? "")
          : await verifyFlutterwavePaymentAction(searchParams.get("transaction_id") ?? order!.paymentReference ?? "");

      const paymentStatus = result?.status ?? "FAILED";
      updateOrder(orderNumber, { paymentStatus });

      if (paymentStatus === "SUCCESSFUL") {
        clearCart();
        const updatedOrder = order!.status === "ORDER_RECEIVED" ? updateOrderStatus(orderNumber, "PAYMENT_CONFIRMED") : order;
        const notified = await dispatchOrderNotificationAction(
          { ...updatedOrder!, paymentStatus },
          "PAYMENT_SUCCESSFUL",
          getPushSubscription(order!.customerEmail),
        );
        if (notified) updateOrder(orderNumber, { emailSent: true });
      }

      setIsVerifying(false);
    }

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderNumber]);

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

  const isOnlinePayment = order.paymentMethod === "PAYSTACK" || order.paymentMethod === "FLUTTERWAVE";

  if (isOnlinePayment && (isVerifying || order.paymentStatus === "PENDING")) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Confirming your payment...</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Hold on while we confirm your {PAYMENT_METHOD_LABEL[order.paymentMethod]} payment with your order{" "}
          {order.orderNumber}.
        </p>
      </div>
    );
  }

  if (isOnlinePayment && order.paymentStatus === "FAILED") {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-7 w-7" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Payment not completed</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t confirm payment for order {order.orderNumber}. No charge was completed — you can return
          to checkout and try again.
        </p>
        <Button asChild size="lg">
          <Link href="/checkout">Back to checkout</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Order confirmed</h1>
        <p className="text-sm text-muted-foreground">
          Thanks, {order.customerName.split(" ")[0]} — your order has been placed.
        </p>
        <p className="font-mono text-lg font-bold">{order.orderNumber}</p>
      </div>

      {!order.emailSent && (
        <Alert className="mt-6">
          <AlertDescription>
            We couldn&apos;t send a confirmation email right now, but your order is confirmed — keep this
            order number for your records.
          </AlertDescription>
        </Alert>
      )}
      {order.emailSent && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          A confirmation email has been sent to {order.customerEmail}.
        </p>
      )}

      <div className="mt-6 rounded-lg border bg-card p-5">
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.productSlug} className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <Price amount={item.unitPrice * item.quantity} currency={item.currency} size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">
            {order.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"} · {PAYMENT_METHOD_LABEL[order.paymentMethod]}
          </span>
          <span className="text-base font-semibold">
            <Price amount={order.total} currency={order.currency} size="sm" />
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={`/orders/${order.orderNumber}/track`}>Track order</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/orders/${order.orderNumber}/invoice`}>View invoice</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/orders/${order.orderNumber}/receipt`}>View receipt</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>

      <div className="mt-6 flex justify-center">
        <PushNotificationToggle email={order.customerEmail} />
      </div>
    </div>
  );
}
