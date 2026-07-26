"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { useResolvedCartLines } from "@/lib/cart/use-cart-lines";
import { useCartTotals } from "@/lib/cart/use-cart-totals";
import { Button } from "@/components/ui/button";
import { CartLineItemRow } from "@/components/cart/cart-line-item-row";
import { SavedForLaterRow } from "@/components/cart/saved-for-later-row";
import { CouponForm } from "@/components/cart/coupon-form";
import { ShippingEstimator } from "@/components/cart/shipping-estimator";
import { OrderSummary } from "@/components/cart/order-summary";

export function CartPageContent() {
  const { items, savedForLater, itemCount, isLoaded, setCouponCode, shippingRegion, setShippingRegion } = useCart();
  const resolvedSaved = useResolvedCartLines(savedForLater);
  const { resolvedItems, subtotal, couponResult, shippingEstimate, discount, shippingKnown, shippingCost, total } =
    useCartTotals();

  if (!isLoaded) {
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading your cart...</div>;
  }

  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
          <ShoppingCart className="h-6 w-6" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Browse the marketplace and add something you like — it&apos;ll show up here.
        </p>
        <Button asChild size="lg">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section>
          <h1 className="font-display text-xl font-bold">
            Shopping cart <span className="font-normal text-muted-foreground">({itemCount} items)</span>
          </h1>
          <div className="mt-4 rounded-lg border bg-card px-5">
            {resolvedItems.length > 0 ? (
              resolvedItems.map((line) => <CartLineItemRow key={line.productSlug} line={line} />)
            ) : (
              <p className="py-6 text-sm text-muted-foreground">
                Your cart is empty — check your saved items below.
              </p>
            )}
          </div>
        </section>

        {resolvedSaved.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold">
              Saved for later <span className="font-normal text-muted-foreground">({resolvedSaved.length})</span>
            </h2>
            <div className="mt-4 rounded-lg border bg-card px-5">
              {resolvedSaved.map((line) => (
                <SavedForLaterRow key={line.productSlug} line={line} />
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-4">
        <CouponForm
          subtotal={subtotal}
          appliedCoupon={couponResult}
          onApply={setCouponCode}
          onRemove={() => setCouponCode(null)}
        />
        <ShippingEstimator
          region={shippingRegion ?? ""}
          onRegionChange={(region) => setShippingRegion(region || null)}
          estimate={shippingEstimate}
        />
        <OrderSummary
          subtotal={subtotal}
          discount={discount}
          shipping={shippingCost}
          shippingKnown={shippingKnown}
          total={total}
          itemCount={resolvedItems.length}
        />
      </aside>
    </div>
  );
}
