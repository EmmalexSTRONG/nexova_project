"use client";

import { MapPin } from "lucide-react";
import { getCategoryIcon } from "@/lib/icon-map";
import type { ResolvedCartLine } from "@/lib/cart/use-cart-lines";
import type { CheckoutPaymentMethod, FulfillmentMethod, PickupPoint } from "@/lib/checkout/types";
import type { CheckoutContactAddressInput } from "@/lib/checkout/validators";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { ProductImage } from "@/components/shared/product-image";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ReviewStep({
  resolvedItems,
  fulfillment,
  contact,
  pickupPoints,
  paymentMethod,
  subtotal,
  discount,
  shippingCost,
  shippingKnown,
  total,
  couponCode,
  onBack,
  onPlaceOrder,
  isPlacingOrder,
  paymentError,
}: {
  resolvedItems: ResolvedCartLine[];
  fulfillment: FulfillmentMethod;
  contact: CheckoutContactAddressInput;
  pickupPoints: PickupPoint[];
  paymentMethod: CheckoutPaymentMethod;
  subtotal: number;
  discount: number;
  shippingCost: number;
  shippingKnown: boolean;
  total: number;
  couponCode: string | null;
  onBack: () => void;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  paymentError?: string | null;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Review your order</h2>

      <div className="mt-4 divide-y rounded-lg border">
        {resolvedItems.map(({ product, quantity }) => {
          const Icon = getCategoryIcon(product.categorySlug);
          return (
            <div key={product.slug} className="flex items-center gap-3 p-3">
              <ProductImage image={product.image} seed={product.seed} icon={Icon} alt={product.name} className="h-12 w-12 shrink-0 rounded-md" iconClassName="h-1/3 w-1/3" />
              <div className="flex-1">
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.shopName} · Qty {quantity}
                </p>
              </div>
              <Price amount={product.price * quantity} currency={product.currency} size="sm" />
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold">{fulfillment === "DELIVERY" ? "Delivery to" : "Pickup"}</h3>
          {fulfillment === "DELIVERY" ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {contact.fullName}
              <br />
              {contact.line1}
              {contact.line2 ? `, ${contact.line2}` : ""}
              <br />
              {contact.city}, {contact.region}
              <br />
              {contact.phone}
            </p>
          ) : (
            <div className="mt-1 space-y-2 text-sm text-muted-foreground">
              {pickupPoints.map((point) => (
                <p key={point.shopSlug} className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {point.shopName} — {point.addressLine}, {point.city}
                  </span>
                </p>
              ))}
              <p>Contact: {contact.fullName} · {contact.phone}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold">Payment</h3>
          <p className="mt-1 text-sm text-muted-foreground">{PAYMENT_METHOD_LABEL[paymentMethod]}</p>

          <h3 className="mt-4 text-sm font-semibold">Order total</h3>
          <dl className="mt-1 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>
                <Price amount={subtotal} size="sm" />
              </dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount {couponCode && `(${couponCode})`}</dt>
                <dd>-GHS {discount.toFixed(2)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shippingKnown ? (shippingCost === 0 ? "Free" : <Price amount={shippingCost} size="sm" />) : "—"}</dd>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
              <dt>Total</dt>
              <dd>
                <Price amount={total} size="sm" />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {paymentError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPlacingOrder}>
          Back
        </Button>
        <Button onClick={onPlaceOrder} disabled={isPlacingOrder}>
          {isPlacingOrder
            ? paymentMethod === "CASH"
              ? "Placing order..."
              : "Redirecting to payment..."
            : "Place order"}
        </Button>
      </div>
    </div>
  );
}
