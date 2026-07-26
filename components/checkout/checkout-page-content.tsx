"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { useResolvedCartLines, useCartSubtotal } from "@/lib/cart/use-cart-lines";
import { getShopBySlug, applyCouponCode } from "@/lib/data";
import { estimateShipping } from "@/lib/shipping";
import { generateOrderNumber, saveOrder, updateOrder } from "@/lib/checkout/order-store";
import { initializeFlutterwavePaymentAction, initializePaystackPaymentAction } from "@/lib/payments/actions";
import { dispatchOrderNotificationAction } from "@/lib/notifications/actions";
import { getPushSubscription } from "@/lib/notifications/push-store";
import type { CheckoutPaymentMethod, FulfillmentMethod, PickupPoint, PlacedOrder } from "@/lib/checkout/types";
import type { CheckoutContactAddressInput } from "@/lib/checkout/validators";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import { CheckoutStepper, type StepDefinition } from "@/components/checkout/checkout-stepper";
import { FulfillmentStep } from "@/components/checkout/fulfillment-step";
import { DetailsStep } from "@/components/checkout/details-step";
import { PaymentStep } from "@/components/checkout/payment-step";
import { ReviewStep } from "@/components/checkout/review-step";

const STEPS: StepDefinition[] = [
  { key: "fulfillment", label: "Fulfillment" },
  { key: "details", label: "Details" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

export function CheckoutPageContent({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const { items, couponCode, shippingRegion, isLoaded, clearCart } = useCart();
  const resolvedItems = useResolvedCartLines(items);
  const subtotal = useCartSubtotal(resolvedItems);

  const [stepIndex, setStepIndex] = useState(0);
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod | null>(null);
  const [contact, setContact] = useState<CheckoutContactAddressInput | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);

  const pickupPoints = useMemo<PickupPoint[]>(() => {
    const seen = new Set<string>();
    const points: PickupPoint[] = [];
    for (const line of resolvedItems) {
      if (seen.has(line.product.shopSlug)) continue;
      seen.add(line.product.shopSlug);
      const shop = getShopBySlug(line.product.shopSlug);
      if (shop) {
        points.push({
          shopSlug: shop.slug,
          shopName: shop.name,
          addressLine: shop.location.addressLine,
          city: shop.location.city,
          region: shop.location.region,
          lat: shop.location.lat,
          lng: shop.location.lng,
        });
      }
    }
    return points;
  }, [resolvedItems]);

  const couponResult = couponCode ? applyCouponCode(couponCode, subtotal) : null;
  const discount = couponResult?.valid ? couponResult.discount : 0;

  const shippingEstimate = fulfillment === "DELIVERY" && contact?.region ? estimateShipping(contact.region) : null;
  const shippingCost = fulfillment === "PICKUP" ? 0 : couponResult?.freeShipping ? 0 : (shippingEstimate?.cost ?? 0);
  const shippingKnown = fulfillment === "PICKUP" || Boolean(shippingEstimate) || Boolean(couponResult?.freeShipping);
  const total = Math.max(0, subtotal - discount) + (shippingKnown ? shippingCost : 0);

  const completedIndexes = STEPS.map((_, i) => i).filter((i) => i < stepIndex);

  if (!isLoaded) {
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading checkout...</div>;
  }

  if (resolvedItems.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
          <ShoppingCart className="h-6 w-6" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add something to your cart before heading to checkout.
        </p>
        <Button asChild size="lg">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (!fulfillment || !contact || !paymentMethod) return;
    setIsPlacingOrder(true);
    setPaymentError(null);

    const orderNumber = generateOrderNumber();
    const order: PlacedOrder = {
      orderNumber,
      placedAt: new Date().toISOString(),
      customerName: contact.fullName,
      customerEmail: contact.email,
      customerPhone: contact.phone,
      fulfillment,
      shippingAddress:
        fulfillment === "DELIVERY"
          ? {
              fullName: contact.fullName,
              phone: contact.phone,
              email: contact.email,
              line1: contact.line1,
              line2: contact.line2,
              city: contact.city,
              region: contact.region,
              lat: customerCoords?.lat,
              lng: customerCoords?.lng,
            }
          : undefined,
      pickupPoints: fulfillment === "PICKUP" ? pickupPoints : undefined,
      paymentMethod,
      // Cash is settled in person on delivery/pickup, so it never moves past
      // PENDING here. Paystack/Flutterwave start PENDING and are flipped to
      // SUCCESSFUL/FAILED by the verify-on-return step on the confirmation page.
      paymentStatus: "PENDING",
      status: "ORDER_RECEIVED",
      statusHistory: [{ status: "ORDER_RECEIVED", timestamp: new Date().toISOString() }],
      items: resolvedItems.map((line) => ({
        productSlug: line.product.slug,
        name: line.product.name,
        shopSlug: line.product.shopSlug,
        shopName: line.product.shopName,
        quantity: line.quantity,
        unitPrice: line.product.price,
        currency: line.product.currency,
      })),
      subtotal,
      discount,
      couponCode: couponResult?.valid ? (couponCode ?? undefined) : undefined,
      shipping: shippingCost,
      total,
      currency: "GHS",
      emailSent: false,
    };

    saveOrder(order);

    const notified = await dispatchOrderNotificationAction(order, "ORDER_PLACED", getPushSubscription(order.customerEmail));
    if (notified) updateOrder(orderNumber, { emailSent: true });

    if (paymentMethod === "CASH") {
      clearCart();
      router.push(`/orders/${orderNumber}/confirmation`);
      return;
    }

    if (paymentMethod === "PAYSTACK") {
      const result = await initializePaystackPaymentAction({
        email: contact.email,
        amountGhs: total,
        orderNumber,
      });
      if (!result) {
        setPaymentError("We couldn't start your Paystack payment. Please try again.");
        setIsPlacingOrder(false);
        return;
      }
      updateOrder(orderNumber, { paymentReference: result.reference });
      window.location.href = result.authorizationUrl;
      return;
    }

    if (paymentMethod === "FLUTTERWAVE") {
      const result = await initializeFlutterwavePaymentAction({
        email: contact.email,
        name: contact.fullName,
        phone: contact.phone,
        amountGhs: total,
        orderNumber,
      });
      if (!result) {
        setPaymentError("We couldn't start your Flutterwave payment. Please try again.");
        setIsPlacingOrder(false);
        return;
      }
      updateOrder(orderNumber, { paymentReference: result.txRef });
      window.location.href = result.paymentLink;
      return;
    }
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-xl font-bold">Checkout</h1>
      <div className="mt-4">
        <CheckoutStepper
          steps={STEPS}
          currentIndex={stepIndex}
          completedIndexes={completedIndexes}
          onStepClick={setStepIndex}
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          {stepIndex === 0 && (
            <FulfillmentStep value={fulfillment} onChange={setFulfillment} onContinue={() => setStepIndex(1)} />
          )}

          {stepIndex === 1 && fulfillment && (
            <DetailsStep
              fulfillment={fulfillment}
              pickupPoints={pickupPoints}
              customerCoords={customerCoords}
              onLocate={setCustomerCoords}
              defaultValues={{
                fullName: contact?.fullName ?? defaultName ?? "",
                email: contact?.email ?? defaultEmail ?? "",
                phone: contact?.phone ?? "",
                line1: contact?.line1 ?? "",
                line2: contact?.line2 ?? "",
                city: contact?.city ?? "",
                region: contact?.region ?? shippingRegion ?? undefined,
              }}
              onSubmit={(data) => {
                setContact(data);
                setStepIndex(2);
              }}
              onBack={() => setStepIndex(0)}
            />
          )}

          {stepIndex === 2 && fulfillment && (
            <PaymentStep
              fulfillment={fulfillment}
              value={paymentMethod}
              onChange={setPaymentMethod}
              onContinue={() => setStepIndex(3)}
              onBack={() => setStepIndex(1)}
            />
          )}

          {stepIndex === 3 && fulfillment && contact && paymentMethod && (
            <ReviewStep
              resolvedItems={resolvedItems}
              fulfillment={fulfillment}
              contact={contact}
              pickupPoints={pickupPoints}
              paymentMethod={paymentMethod}
              subtotal={subtotal}
              discount={discount}
              shippingCost={shippingCost}
              shippingKnown={shippingKnown}
              total={total}
              couponCode={couponResult?.valid ? couponCode : null}
              onBack={() => setStepIndex(2)}
              onPlaceOrder={handlePlaceOrder}
              isPlacingOrder={isPlacingOrder}
              paymentError={paymentError}
            />
          )}
        </div>

        <aside className="h-fit rounded-lg border bg-card p-5">
          <h2 className="font-display text-sm font-semibold">Order summary</h2>
          <ul className="mt-3 space-y-2">
            {resolvedItems.map((line) => (
              <li key={line.productSlug} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {line.product.name} × {line.quantity}
                </span>
                <Price amount={line.product.price * line.quantity} size="sm" />
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>
                <Price amount={subtotal} size="sm" />
              </dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>-GHS {discount.toFixed(2)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shippingKnown ? (shippingCost === 0 ? "Free" : <Price amount={shippingCost} size="sm" />) : "—"}</dd>
            </div>
          </dl>
          <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <Price amount={total} size="lg" />
          </div>
        </aside>
      </div>
    </div>
  );
}
