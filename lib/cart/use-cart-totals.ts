"use client";

import { useMemo } from "react";
import { applyCouponCode } from "@/lib/data";
import { estimateShipping } from "@/lib/shipping";
import { useCart } from "./cart-context";
import { useResolvedCartLines, useCartSubtotal } from "./use-cart-lines";

export function useCartTotals() {
  const { items, couponCode, shippingRegion } = useCart();
  const resolvedItems = useResolvedCartLines(items);
  const subtotal = useCartSubtotal(resolvedItems);

  const couponResult = useMemo(
    () => (couponCode ? applyCouponCode(couponCode, subtotal) : null),
    [couponCode, subtotal],
  );
  const shippingEstimate = useMemo(
    () => (shippingRegion ? estimateShipping(shippingRegion) : null),
    [shippingRegion],
  );

  const discount = couponResult?.valid ? couponResult.discount : 0;
  const shippingKnown = Boolean(shippingEstimate) || Boolean(couponResult?.freeShipping);
  const shippingCost = couponResult?.freeShipping ? 0 : (shippingEstimate?.cost ?? 0);
  const total = Math.max(0, subtotal - discount) + (shippingKnown ? shippingCost : 0);

  return {
    resolvedItems,
    subtotal,
    couponResult,
    shippingEstimate,
    discount,
    shippingKnown,
    shippingCost,
    total,
  };
}
